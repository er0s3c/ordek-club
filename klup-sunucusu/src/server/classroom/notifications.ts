// Uygulama içi bildirimler (e-posta yok; Faz 6). Bağlantılar yalnız uygulama içi yollar olabilir.
import type { NotificationType, Prisma } from "@prisma/client";
import { db } from "@/server/db";
import type { Actor } from "@/server/auth/policy";

type Tx = Prisma.TransactionClient | typeof db;

export async function notify(tx: Tx, userIds: string[], n: { type: NotificationType; title: string; body?: string; link?: string }) {
  const ids = [...new Set(userIds)];
  if (!ids.length) return 0;
  const link = n.link && /^\/[a-z0-9/_\-?=&.]*$/i.test(n.link) ? n.link : null;
  const r = await tx.notification.createMany({
    data: ids.map((userId) => ({ userId, type: n.type, title: n.title.slice(0, 160), body: (n.body ?? "").slice(0, 400), link })),
  });
  return r.count;
}

export const unreadCount = (userId: string) => db.notification.count({ where: { userId, readAt: null } });

export function listNotifications(actor: Actor) {
  return db.notification.findMany({ where: { userId: actor.id }, orderBy: { createdAt: "desc" }, take: 100 });
}

// Kişi yalnız KENDİ bildirimlerini okundu yapabilir (id listesi ya da hepsi).
export async function markRead(actor: Actor, ids: string[] | "all") {
  const r = await db.notification.updateMany({
    where: { userId: actor.id, readAt: null, ...(ids === "all" ? {} : { id: { in: ids } }) },
    data: { readAt: new Date() },
  });
  return r.count;
}

// Aktif öğrenciler (ve isteğe bağlı personel) — duyuru/görev bildirimi alıcıları.
export async function activeUserIds(opts: { students?: boolean; staff?: boolean }) {
  const roles = [...(opts.students ? (["STUDENT"] as const) : []), ...(opts.staff ? (["OWNER", "ADMIN", "INSTRUCTOR"] as const) : [])];
  return (await db.user.findMany({ where: { status: "ACTIVE", role: { in: roles } }, select: { id: true } })).map((u) => u.id);
}
