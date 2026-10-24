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
});

export async function createAnnouncement(actor: Actor, input: z.output<typeof announcementSchema>, ip: string) {
  if (!canManageClassroom(actor)) throw forbidden("Duyuruları eğitmen ve yöneticiler yazar.");
  return db.$transaction(async (tx) => {
    const a = await tx.announcement.create({ data: { ...input, createdById: actor.id } });
    const recipients = (await activeUserIds({ students: input.audience === "ALL", staff: true })).filter((id) => id !== actor.id);
    await notify(tx, recipients, { type: "ANNOUNCEMENT", title: input.title, body: input.body.replace(/[#*_`>[\]]/g, "").slice(0, 200), link: "/announcements" });
    await audit({ actorId: actor.id, action: "announcement.create", targetType: "Announcement", targetId: a.id, meta: { title: a.title, audience: a.audience, recipients: recipients.length }, ip }, tx);
    return a;
  });
}

export function visibleAnnouncementsWhere(actor: Actor, now = new Date()): Prisma.AnnouncementWhereInput {
  return {
    ...(isStaff(actor.role) ? {} : { audience: "ALL" }),
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
