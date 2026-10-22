import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { badRequest, forbidden, notFound } from "@/server/errors";
import { canChangeRole, canManageMember, nextStatus, type Actor } from "@/server/auth/policy";
import { revokeUserSessions } from "@/server/auth/session";
import type { memberActionSchema, memberListQuerySchema } from "@/lib/validation";

export const PAGE_SIZE = 25;

// Listeleme çıktısında parola hash'i vb. asla seçilmez (açık select).
const listSelect = {
  id: true, username: true, displayName: true, email: true, role: true, status: true,
  studentNumber: true, department: true, createdAt: true, joinedAt: true, lastLoginAt: true,
} satisfies Prisma.UserSelect;

export async function listMembers(query: z.output<typeof memberListQuerySchema>) {
  const where: Prisma.UserWhereInput = {};
  if (query.status) where.status = query.status;
  if (query.role) where.role = query.role;
  if (query.q) {
    const q = query.q;
    where.OR = [
      { username: { contains: q, mode: "insensitive" } },
      { displayName: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { studentNumber: { contains: q, mode: "insensitive" } },
    ];
  }
  const [total, items] = await Promise.all([
    db.user.count({ where }),
    db.user.findMany({
      where,
      select: listSelect,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip: (query.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  return { total, page: query.page, pageSize: PAGE_SIZE, items };
}

export async function getMemberDetail(id: string) {
  const user = await db.user.findUnique({
    where: { id },
    select: {
      ...listSelect,
      applicationNote: true, reviewNote: true, reviewedAt: true,
      reviewedBy: { select: { id: true, username: true, displayName: true } },
      invitation: { select: { id: true, label: true, codePrefix: true } },
      _count: { select: { sessions: true } },
    },
  });
  if (!user) throw notFound("Üye bulunamadı.");
  const activity = await db.auditLog.findMany({
    where: { OR: [{ targetType: "User", targetId: id }, { actorId: id }] },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, action: true, createdAt: true, meta: true, actor: { select: { username: true } } },
  });
  return { user, activity };
}

type Action = z.output<typeof memberActionSchema>;

export async function applyMemberAction(actor: Actor, targetId: string, input: Action, ip: string) {
  const target = await db.user.findUnique({ where: { id: targetId }, select: { id: true, role: true, status: true, joinedAt: true } });
  if (!target) throw notFound("Üye bulunamadı.");
  if (!canManageMember(actor, target)) throw forbidden("Bu üyeyi yönetme yetkin yok.");

  if (input.action === "role") {
    if (!canChangeRole(actor, target, input.role)) throw forbidden("Bu rolü atama yetkin yok.");
    if (target.role === input.role) return;
    await db.$transaction(async (tx) => {
      await tx.user.update({ where: { id: target.id }, data: { role: input.role } });
      await audit({ actorId: actor.id, action: "member.role", targetType: "User", targetId: target.id, meta: { from: target.role, to: input.role }, ip }, tx);
    });
    // Rol değişince açık oturumlar düşer: yeni yetkiler temiz bir girişle başlar.
    await revokeUserSessions(target.id);
    return;
  }

  const to = nextStatus(target.status, input.action);
  if (!to) throw badRequest(`Bu üye için "${input.action}" işlemi şu durumda uygulanamaz (${target.status}).`, "INVALID_TRANSITION");
  const note = "note" in input ? input.note ?? null : null;
  const now = new Date();
  const data: Prisma.UserUpdateInput = { status: to };
  if (input.action === "approve" || input.action === "reject") {
    Object.assign(data, { reviewNote: note, reviewedAt: now, reviewedBy: { connect: { id: actor.id } } });
  }
  if (input.action === "approve" && !target.joinedAt) data.joinedAt = now;

  await db.$transaction(async (tx) => {
    // Durum koşullu güncelleme: eşzamanlı iki admin işleminde yalnız biri geçerli olur.
    const res = await tx.user.updateMany({ where: { id: target.id, status: target.status }, data: { status: to } });
    if (res.count !== 1) throw badRequest("Üyenin durumu başka bir işlemle değişti; sayfayı yenile.", "STALE");
    await tx.user.update({ where: { id: target.id }, data });
    await audit({ actorId: actor.id, action: `member.${input.action}`, targetType: "User", targetId: target.id, meta: { from: target.status, to, note }, ip }, tx);
  });
  if (to !== "ACTIVE") await revokeUserSessions(target.id);
}

export async function adminDashboardStats(timezone: string) {
  const since30 = new Date(Date.now() - 30 * 86_400_000);
  const [byStatus, byRole, activeRecently, recent, pendingList, sessions] = await Promise.all([
    db.user.groupBy({ by: ["status"], _count: { _all: true } }),
    db.user.groupBy({ by: ["role"], where: { status: "ACTIVE" }, _count: { _all: true } }),
    db.user.count({ where: { status: "ACTIVE", lastLoginAt: { gte: since30 } } }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, action: true, createdAt: true, targetType: true, targetId: true, actor: { select: { username: true } } },
    }),
    db.user.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 5,
      select: { id: true, username: true, displayName: true, createdAt: true, department: true },
    }),
    db.session.count({ where: { expiresAt: { gt: new Date() } } }),
  ]);
  const status = Object.fromEntries(byStatus.map((r) => [r.status, r._count._all])) as Record<string, number>;
  const roles = Object.fromEntries(byRole.map((r) => [r.role, r._count._all])) as Record<string, number>;
  return {
    timezone,
    members: {
      active: status.ACTIVE ?? 0,
      pending: status.PENDING ?? 0,
      disabled: status.DISABLED ?? 0,
      rejected: status.REJECTED ?? 0,
      activeLast30Days: activeRecently,
    },
    roles,
    openSessions: sessions,
    recent,
    pendingList,
  };
}
