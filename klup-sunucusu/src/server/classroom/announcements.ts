// Duyurular: personel yazar, hedef kitleye (herkes ya da yalnız personel) uygulama içi bildirim gider.
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { forbidden, notFound } from "@/server/errors";
import { canManageClassroom, isAdmin, isStaff, type Actor } from "@/server/auth/policy";
import { activeUserIds, notify } from "./notifications";

export const announcementSchema = z.object({
  title: z.string().trim().min(3).max(140),
  body: z.string().max(10_000).default(""),
  audience: z.enum(["ALL", "STAFF"]).default("ALL"),
  pinned: z.boolean().default(false),
  expiresAt: z.coerce.date().nullable().default(null),
  publishAt: z.coerce.date().nullable().default(null),
});

export async function createAnnouncement(actor: Actor, input: Omit<z.output<typeof announcementSchema>, "publishAt"> & { publishAt?: Date | null }, ip: string) {
  if (!canManageClassroom(actor)) throw forbidden("Duyuruları eğitmen ve yöneticiler yazar.");
  return db.$transaction(async (tx) => {
    const scheduled = !!input.publishAt && input.publishAt.getTime() > Date.now() + 60_000;
    const a = await tx.announcement.create({ data: { ...input, publishAt: input.publishAt ?? new Date(), notifiedAt: scheduled ? null : new Date(), createdById: actor.id } });
    // Planlı duyuru: bildirim yayın zamanında arka plan işinden gider (publishScheduledAnnouncements).
    if (scheduled) {
      await audit({ actorId: actor.id, action: "announcement.schedule", targetType: "Announcement", targetId: a.id, meta: { title: a.title, publishAt: a.publishAt.toISOString() }, ip }, tx);
      return a;
    }
    const recipients = (await activeUserIds({ students: input.audience === "ALL", staff: true })).filter((id) => id !== actor.id);
    await notify(tx, recipients, { type: "ANNOUNCEMENT", title: input.title, body: input.body.replace(/[#*_`>[\]]/g, "").slice(0, 200), link: "/announcements" });
    await audit({ actorId: actor.id, action: "announcement.create", targetType: "Announcement", targetId: a.id, meta: { title: a.title, audience: a.audience, recipients: recipients.length }, ip }, tx);
    return a;
  });
}

export function visibleAnnouncementsWhere(actor: Actor, now = new Date()): Prisma.AnnouncementWhereInput {
  return {
    // Planlı duyuru yayın zamanına kadar yalnız personele görünür.
    ...(isStaff(actor.role) ? {} : { audience: "ALL", publishAt: { lte: now } }),
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  };
}

export function listAnnouncements(actor: Actor, take = 50) {
  return db.announcement.findMany({
    where: visibleAnnouncementsWhere(actor),
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take,
    include: { createdBy: { select: { displayName: true } } },
  });
}

export async function deleteAnnouncement(actor: Actor, id: string, ip: string) {
  const a = await db.announcement.findUnique({ where: { id } });
  if (!a) throw notFound("Duyuru bulunamadı.");
  if (!(isAdmin(actor.role) || (isStaff(actor.role) && a.createdById === actor.id))) throw forbidden("Bu duyuruyu silemezsin.");
  await db.$transaction(async (tx) => {
    await tx.announcement.delete({ where: { id } });
    await audit({ actorId: actor.id, action: "announcement.delete", targetType: "Announcement", targetId: id, meta: { title: a.title }, ip }, tx);
  });
}

// Zamanı gelen planlı duyuruların bildirimlerini bir kez gönderir (server.ts dakikalık iş).
export async function publishScheduledAnnouncements(now = new Date()) {
  const due = await db.announcement.findMany({ where: { notifiedAt: null, publishAt: { lte: now } }, take: 20 });
  for (const a of due) {
    await db.$transaction(async (tx) => {
      const claimed = await tx.announcement.updateMany({ where: { id: a.id, notifiedAt: null }, data: { notifiedAt: now } });
      if (!claimed.count) return;
      const recipients = (await activeUserIds({ students: a.audience === "ALL", staff: true })).filter((id) => id !== a.createdById);
      await notify(tx, recipients, { type: "ANNOUNCEMENT", title: a.title, body: a.body.replace(/[#*_`>[\]]/g, "").slice(0, 200), link: `/announcements#a-${a.id}` });
    });
  }
}

// Okunma: duyurular sayfası açıldığında görünen duyurular okundu sayılır; personel okunma oranını görür.
export async function markAnnouncementsRead(userId: string, ids: string[]) {
  if (ids.length) await db.announcementRead.createMany({ data: ids.map((announcementId) => ({ announcementId, userId })), skipDuplicates: true });
}

export async function readRates(ids: string[]) {
  if (!ids.length) return new Map<string, { read: number; total: number }>();
  const [rows, all, students] = await Promise.all([
    db.announcementRead.groupBy({ by: ["announcementId"], where: { announcementId: { in: ids } }, _count: true }),
    db.announcement.findMany({ where: { id: { in: ids } }, select: { id: true, audience: true } }),
    db.user.count({ where: { status: "ACTIVE" } }),
  ]);
  const staff = await db.user.count({ where: { status: "ACTIVE", role: { not: "STUDENT" } } });
  return new Map(all.map((a) => [a.id, { read: rows.find((r) => r.announcementId === a.id)?._count ?? 0, total: a.audience === "ALL" ? students : staff }]));
}
