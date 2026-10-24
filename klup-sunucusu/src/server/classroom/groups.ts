// Sınıflar (şube) ve etkinlikler: görev ve dosyalar bir gruba hedeflenebilir.
// Sınıf üyelerini personel belirler; etkinliğe "kendi kaydı açık" ise öğrenci kendisi katılır/ayrılır.
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { badRequest, conflict, forbidden, notFound } from "@/server/errors";
import { canManageClassroom, isAdmin, isStaff, type Actor } from "@/server/auth/policy";

export const groupInputSchema = z
  .object({
    kind: z.enum(["CLASS", "EVENT"]).default("CLASS"),
    name: z.string().trim().min(2).max(100),
    description: z.string().max(5_000).default(""),
    startsAt: z.coerce.date().nullable().default(null),
    endsAt: z.coerce.date().nullable().default(null),
    location: z.string().trim().max(200).default(""),
    selfJoin: z.boolean().default(false),
    capacity: z.number().int().min(1).max(10_000).nullable().default(null),
  })
  .superRefine((v, ctx) => {
    if (v.startsAt && v.endsAt && v.endsAt <= v.startsAt) ctx.addIssue({ code: "custom", path: ["endsAt"], message: "Bitiş, başlangıçtan sonra olmalı." });
    if (v.kind === "CLASS" && v.selfJoin) ctx.addIssue({ code: "custom", path: ["selfJoin"], message: "Sınıfa öğrenci kendisi katılamaz; üyeleri sen ekle." });
  });
export type GroupInput = z.output<typeof groupInputSchema>;

function requireStaff(actor: Actor) {
  if (!canManageClassroom(actor)) throw forbidden("Sınıf ve etkinlik yönetimi eğitmen ve yöneticilere açıktır.");
}

const canEditGroup = (actor: Actor, g: { createdById: string | null }) => canManageClassroom(actor) && (isAdmin(actor.role) || g.createdById === actor.id);

async function loadEditable(actor: Actor, id: string) {
  requireStaff(actor);
  const g = await db.classGroup.findUnique({ where: { id } });
  if (!g || g.archivedAt) throw notFound("Grup bulunamadı.");
  if (!canEditGroup(actor, g)) throw forbidden("Bu grubu yalnızca oluşturan eğitmen ya da yöneticiler düzenleyebilir.");
  return g;
}

export async function createGroup(actor: Actor, input: GroupInput, ip: string) {
  requireStaff(actor);
  return db.$transaction(async (tx) => {
    const g = await tx.classGroup.create({ data: { ...input, createdById: actor.id } });
    await audit({ actorId: actor.id, action: "group.create", targetType: "ClassGroup", targetId: g.id, meta: { name: g.name, kind: g.kind }, ip }, tx);
    return g;
  });
}

export async function updateGroup(actor: Actor, id: string, input: GroupInput, ip: string) {
  const g = await loadEditable(actor, id);
  if (g.kind !== input.kind) throw badRequest("Grup türü sonradan değiştirilemez.", "KIND_FIXED");
  await db.$transaction(async (tx) => {
    await tx.classGroup.update({ where: { id }, data: input });
    await audit({ actorId: actor.id, action: "group.update", targetType: "ClassGroup", targetId: id, meta: { name: input.name }, ip }, tx);
  });
}

// Arşivlenen grup listelerden çıkar; ona hedeflenmiş görev ve dosyalar üyelerine görünür kalmaz.
export async function archiveGroup(actor: Actor, id: string, ip: string) {
  await loadEditable(actor, id);
  await db.$transaction(async (tx) => {
    await tx.classGroup.update({ where: { id }, data: { archivedAt: new Date() } });
    await audit({ actorId: actor.id, action: "group.archive", targetType: "ClassGroup", targetId: id, ip }, tx);
  });
}

// Üye listesini kullanıcı adlarıyla tümden belirler (yalnız aktif öğrenciler).
export async function setGroupMembers(actor: Actor, id: string, usernames: string[], ip: string) {
  const g = await loadEditable(actor, id);
  const names = [...new Set(usernames.map((u) => u.trim().toLowerCase()).filter(Boolean))];
  if (names.length > 2000) throw badRequest("En fazla 2000 üye.", "TOO_MANY");
  const users = await db.user.findMany({ where: { username: { in: names }, status: "ACTIVE", role: "STUDENT" }, select: { id: true, username: true } });
  const missing = names.filter((n) => !users.some((u) => u.username === n));
  if (missing.length) throw badRequest(`Aktif öğrenci bulunamadı: ${missing.slice(0, 5).join(", ")}`, "BAD_MEMBERS");
  if (g.capacity !== null && users.length > g.capacity) throw badRequest(`Kapasite ${g.capacity} kişi.`, "OVER_CAPACITY");
  await db.$transaction(async (tx) => {
    await tx.classGroupMember.deleteMany({ where: { groupId: id, userId: { notIn: users.map((u) => u.id) } } });
    await tx.classGroupMember.createMany({ data: users.map((u) => ({ groupId: id, userId: u.id })), skipDuplicates: true });
    await audit({ actorId: actor.id, action: "group.members", targetType: "ClassGroup", targetId: id, meta: { count: users.length }, ip }, tx);
  });
  return users.length;
}

// Öğrenci kendi kaydı: yalnız kaydı açık, bitmemiş, arşivlenmemiş etkinlik; kapasite transaction içinde kilitle kontrol edilir.
export async function joinEvent(actor: Actor, id: string) {
  if (isStaff(actor.role)) throw badRequest("Personel etkinliklere kayıt olmaz.", "STAFF");
  await db.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "ClassGroup" WHERE id = ${id} FOR UPDATE`;
    if (!rows.length) throw notFound("Etkinlik bulunamadı.");
    const g = await tx.classGroup.findUniqueOrThrow({ where: { id }, include: { _count: { select: { members: true } } } });
    if (g.archivedAt || g.kind !== "EVENT" || !g.selfJoin) throw notFound("Etkinlik bulunamadı.");
    if (g.endsAt && g.endsAt < new Date()) throw conflict("Etkinlik sona erdi.", "ENDED");
    const already = await tx.classGroupMember.findUnique({ where: { groupId_userId: { groupId: id, userId: actor.id } } });
    if (already) return;
    if (g.capacity !== null && g._count.members >= g.capacity) throw conflict("Etkinlik dolu.", "FULL");
    await tx.classGroupMember.create({ data: { groupId: id, userId: actor.id } });
  });
}

export async function leaveEvent(actor: Actor, id: string) {
  const g = await db.classGroup.findUnique({ where: { id } });
  if (!g || g.kind !== "EVENT" || !g.selfJoin) throw notFound("Etkinlik bulunamadı.");
  await db.classGroupMember.deleteMany({ where: { groupId: id, userId: actor.id } });
}

// ── Okuma ───────────────────────────────────────────────────────────────────
const joinableWhere = (now: Date): Prisma.ClassGroupWhereInput => ({ kind: "EVENT", selfJoin: true, OR: [{ endsAt: null }, { endsAt: { gt: now } }] });

export async function listGroups(actor: Actor, now = new Date()) {
  const where: Prisma.ClassGroupWhereInput = isStaff(actor.role)
    ? { archivedAt: null }
    : { archivedAt: null, OR: [{ members: { some: { userId: actor.id } } }, joinableWhere(now)] };
  const rows = await db.classGroup.findMany({
    where,
    orderBy: [{ kind: "asc" }, { startsAt: { sort: "asc", nulls: "last" } }, { name: "asc" }],
    take: 300,
    include: { _count: { select: { members: true } }, members: { where: { userId: actor.id }, select: { userId: true } }, createdBy: { select: { displayName: true } } },
  });
  return rows.map(({ members, ...g }) => ({ ...g, isMember: members.length > 0, canEdit: canEditGroup(actor, g) }));
}

export async function getGroup(actor: Actor, id: string, now = new Date()) {
  const staff = isStaff(actor.role);
  const g = await db.classGroup.findFirst({
    where: staff ? { id, archivedAt: null } : { id, archivedAt: null, OR: [{ members: { some: { userId: actor.id } } }, joinableWhere(now)] },
    include: {
      _count: { select: { members: true } },
      createdBy: { select: { displayName: true } },
      // Üye listesi yalnız personele; öğrenci yalnız sayıyı ve kendi üyeliğini görür.
      members: staff
        ? { orderBy: { joinedAt: "asc" }, include: { user: { select: { username: true, displayName: true } } } }
        : { where: { userId: actor.id }, include: { user: { select: { username: true, displayName: true } } } },
    },
  });
  if (!g) throw notFound("Grup bulunamadı.");
  const isMember = g.members.some((m) => m.userId === actor.id);
  return { ...g, isMember, canEdit: canEditGroup(actor, g) };
}

export const groupMemberIds = async (groupId: string) =>
  (await db.classGroupMember.findMany({ where: { groupId, user: { status: "ACTIVE" } }, select: { userId: true } })).map((m) => m.userId);

// Görev/dosya formlarındaki seçim listesi.
export const groupOptions = () =>
  db.classGroup.findMany({ where: { archivedAt: null }, orderBy: [{ kind: "asc" }, { name: "asc" }], select: { id: true, name: true, kind: true, _count: { select: { members: true } } } });
