// Etkinlik işleri: kısa süreli kod/QR ile katılım doğrulaması, bekleme listesi, etkinlik sonrası geri bildirim,
// kulüp etkinlik takvimi ve iCal dışa aktarma. Katılım öğrenme başarımından ayrı tutulur (XP/seri üretmez).
import { z } from "zod";
import QRCode from "qrcode";
import { db } from "@/server/db";
import { env } from "@/server/env";
import { badRequest, conflict, forbidden, notFound, tooMany } from "@/server/errors";
import { canManageClassroom, isAdmin, type Actor } from "@/server/auth/policy";
import { LIMITS, hit } from "@/server/rate-limit";
import { randomCode, sha256 } from "@/server/codes";
import { notify } from "@/server/classroom/notifications";

const CODE_TTL_MIN = 5;
export const normalizeCheckIn = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, "");

async function editableEvent(actor: Actor, id: string) {
  const g = await db.classGroup.findUnique({ where: { id } });
  if (!g || g.kind !== "EVENT" || g.archivedAt) throw notFound("Etkinlik bulunamadı.");
  if (!canManageClassroom(actor) || (!isAdmin(actor.role) && g.createdById !== actor.id)) throw forbidden();
  return g;
}

// Kod 5 dakika geçerlidir; yalnız SHA-256 özeti saklanır. QR, kodu içeren uygulama içi bağlantıdır.
export async function openCheckIn(actor: Actor, id: string, minutes = CODE_TTL_MIN) {
  await editableEvent(actor, id);
  const code = randomCode(6);
  const expiresAt = new Date(Date.now() + Math.min(30, Math.max(1, minutes)) * 60_000);
  await db.classGroup.update({ where: { id }, data: { checkInCodeHash: sha256(code), checkInExpiresAt: expiresAt } });
  const url = `${env().APP_URL.replace(/\/$/, "")}/groups/${id}?checkin=${code}`;
  return { code, expiresAt: expiresAt.toISOString(), qr: await QRCode.toDataURL(url, { margin: 1, width: 320 }) };
}

export async function closeCheckIn(actor: Actor, id: string) {
  await editableEvent(actor, id);
  await db.classGroup.update({ where: { id }, data: { checkInCodeHash: null, checkInExpiresAt: null } });
}

export async function checkIn(actor: Actor, id: string, raw: string) {
  const [max, win] = LIMITS.checkInPerUser;
  const r = hit(`checkin:${actor.id}`, max, win);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const g = await db.classGroup.findUnique({ where: { id } });
  if (!g || g.kind !== "EVENT" || g.archivedAt) throw notFound("Etkinlik bulunamadı.");
  if (!g.checkInCodeHash || !g.checkInExpiresAt || g.checkInExpiresAt < new Date()) throw conflict("Katılım kodu şu an açık değil.");
  if (sha256(normalizeCheckIn(raw)) !== g.checkInCodeHash) throw badRequest("Kod hatalı.", "BAD_CODE");
  await db.eventCheckIn.createMany({ data: [{ groupId: id, userId: actor.id, method: "CODE" }], skipDuplicates: true });
}

export async function manualCheckIn(actor: Actor, id: string, username: string) {
  await editableEvent(actor, id);
  const u = await db.user.findFirst({ where: { username: username.toLowerCase(), status: "ACTIVE" }, select: { id: true } });
  if (!u) throw notFound("Kullanıcı bulunamadı.");
  await db.eventCheckIn.createMany({ data: [{ groupId: id, userId: u.id, method: "MANUAL" }], skipDuplicates: true });
}

export async function attendance(actor: Actor, id: string) {
  await editableEvent(actor, id);
  const rows = await db.eventCheckIn.findMany({ where: { groupId: id }, orderBy: { at: "asc" }, include: { user: { select: { displayName: true, username: true } } } });
  return rows.map((r) => ({ name: r.user.displayName, username: r.user.username, method: r.method, at: r.at.toISOString() }));
}

// Bekleme listesi: dolu etkinlikte sıraya girilir; bir yer açılınca sıradaki kişiye bildirim gider.
export async function joinWaitlist(actor: Actor, id: string, join: boolean) {
  const g = await db.classGroup.findUnique({ where: { id }, include: { _count: { select: { members: true } } } });
  if (!g || g.kind !== "EVENT" || !g.selfJoin || g.archivedAt) throw notFound("Etkinlik bulunamadı.");
  if (!join) { await db.eventWaitlist.deleteMany({ where: { groupId: id, userId: actor.id } }); return; }
  if (g.capacity === null || g._count.members < g.capacity) throw conflict("Etkinlikte yer var; doğrudan kaydolabilirsin.");
  await db.eventWaitlist.createMany({ data: [{ groupId: id, userId: actor.id }], skipDuplicates: true });
}

export async function notifyWaitlist(groupId: string) {
  const g = await db.classGroup.findUnique({ where: { id: groupId }, include: { _count: { select: { members: true } } } });
  if (!g || g.capacity === null || g._count.members >= g.capacity) return;
  const next = await db.eventWaitlist.findFirst({ where: { groupId, notifiedAt: null }, orderBy: { createdAt: "asc" } });
  if (!next) return;
  await db.$transaction(async (tx) => {
    await tx.eventWaitlist.update({ where: { groupId_userId: { groupId, userId: next.userId } }, data: { notifiedAt: new Date() } });
    await notify(tx, [next.userId], { type: "SYSTEM", title: `Yer açıldı: ${g.name}`, body: "Bekleme listesindeydin; şimdi kaydolabilirsin. Yer ilk kaydolan kişiye verilir.", link: `/groups/${groupId}` });
  });
}

export const feedbackSchema = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().max(1000).default("") });
export async function eventFeedback(actor: Actor, id: string, input: z.output<typeof feedbackSchema>) {
  const g = await db.classGroup.findUnique({ where: { id }, include: { members: { where: { userId: actor.id } }, checkIns: { where: { userId: actor.id } } } });
  if (!g || g.kind !== "EVENT") throw notFound();
  if (!g.members.length && !g.checkIns.length) throw forbidden("Yalnız katılanlar geri bildirim verebilir.");
  const end = g.endsAt ?? g.startsAt;
  if (!end || end > new Date()) throw conflict("Geri bildirim etkinlik bittikten sonra açılır.");
  await db.eventFeedback.upsert({ where: { groupId_userId: { groupId: id, userId: actor.id } }, create: { groupId: id, userId: actor.id, ...input }, update: input });
}

// Kulüp etkinlik takvimi ve kişinin katılım geçmişi
export async function eventCalendar(userId: string, from = new Date(Date.now() - 30 * 86_400_000)) {
  const [events, mine] = await Promise.all([
    db.classGroup.findMany({ where: { kind: "EVENT", archivedAt: null, startsAt: { gte: from } }, orderBy: { startsAt: "asc" }, take: 100, select: { id: true, name: true, startsAt: true, endsAt: true, location: true, capacity: true, selfJoin: true, _count: { select: { members: true } }, members: { where: { userId }, select: { userId: true } } } }),
    db.eventCheckIn.findMany({ where: { userId }, orderBy: { at: "desc" }, include: { group: { select: { id: true, name: true, startsAt: true } } } }),
  ]);
  return {
    events: events.map((e) => ({ id: e.id, name: e.name, startsAt: e.startsAt?.toISOString() ?? null, endsAt: e.endsAt?.toISOString() ?? null, location: e.location, capacity: e.capacity, members: e._count.members, joined: e.members.length > 0, selfJoin: e.selfJoin })),
    history: mine.map((m) => ({ id: m.group.id, name: m.group.name, at: m.at.toISOString(), method: m.method })),
  };
}

const ics = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\r?\n/g, "\\n");
const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
export async function eventsIcs(clubName: string) {
  const events = await db.classGroup.findMany({ where: { kind: "EVENT", archivedAt: null, startsAt: { not: null, gte: new Date(Date.now() - 90 * 86_400_000) } }, orderBy: { startsAt: "asc" }, take: 300 });
  const host = new URL(env().APP_URL).host;
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//${ics(clubName)}//Etkinlikler//TR`, "CALSCALE:GREGORIAN", `X-WR-CALNAME:${ics(clubName)} etkinlikleri`];
  for (const e of events) {
    const start = e.startsAt!;
    const end = e.endsAt ?? new Date(start.getTime() + 2 * 3600_000);
    lines.push("BEGIN:VEVENT", `UID:${e.id}@${host}`, `DTSTAMP:${icsDate(e.updatedAt)}`, `DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`, `SUMMARY:${ics(e.name)}`, ...(e.location ? [`LOCATION:${ics(e.location)}`] : []), ...(e.description ? [`DESCRIPTION:${ics(e.description.slice(0, 1000))}`] : []), `URL:${env().APP_URL.replace(/\/$/, "")}/groups/${e.id}`, "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
