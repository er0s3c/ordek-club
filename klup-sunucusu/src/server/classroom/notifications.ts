// Bildirimler: uygulama içi kayıt + (SMTP varsa ve kişi kapatmadıysa) e-posta kuyruğu.
// Bağlantılar yalnız uygulama içi yollar olabilir; e-postada APP_URL ile tam adrese çevrilir.
import type { NotificationType, Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { env } from "@/server/env";
import type { Actor } from "@/server/auth/policy";
import { enqueueMail, mailEnabled } from "@/server/mail/outbox";
import { translateFor } from "@/i18n/catalog";
import { isLocale, type Locale } from "@/i18n/locale";

type Tx = Prisma.TransactionClient | typeof db;

export async function notify(tx: Tx, userIds: string[], n: { type: NotificationType; title: string; body?: string; link?: string }) {
  const ids = [...new Set(userIds)];
  if (!ids.length) return 0;
  const link = n.link && /^\/[a-z0-9/_\-?=&.#]*$/i.test(n.link) ? n.link : null;
  const title = n.title.slice(0, 160);
  const body = (n.body ?? "").slice(0, 400);
  const r = await tx.notification.createMany({ data: ids.map((userId) => ({ userId, type: n.type, title, body, link })) });
  if (mailEnabled()) {
    const to = await tx.user.findMany({ where: { id: { in: ids }, status: "ACTIVE", emailNotifications: true }, select: { email: true, learningPreference: { select: { locale: true } } } });
    const app = env().APP_URL.replace(/\/$/, "");
    // Bildirim Türkçe saklanır; e-posta alıcının kayıtlı diline çevrilir (seçmemişse Türkçe).
    const mail = (l: Locale) => {
      const tr = (s: string) => translateFor(l, s);
      const subject = tr(title);
      return { subject, text: [subject, body ? tr(body) : "", link ? `${tr("Aç:")} ${app}${link}` : "", "", `${tr("E-posta bildirimlerini kapatmak için:")} ${app}/account`].filter((x, i) => x || i > 2).join("\n") };
    };
    const byLocale = { tr: mail("tr"), en: mail("en") };
    await enqueueMail(tx, to.map((u) => ({ to: u.email, ...byLocale[isLocale(u.learningPreference?.locale) ? u.learningPreference.locale : "tr"] })));
  }
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
