// Çalışma arkadaşı ilanları, çalışma grupları ve teşekkür notları. İletişim platform içinde kalır:
// telefon, e-posta, sosyal medya kullanıcı adı ve dış bağlantı içeren metin reddedilir. Yanıtlar yalnız ilan sahibi,
// yanıtı yazan ve personel tarafından görülür. Üç bağımsız bildirim ilanı otomatik gizler.
import { z } from "zod";
import { db } from "@/server/db";
import { badRequest, conflict, forbidden, notFound, tooMany } from "@/server/errors";
import { isStaff, type Actor } from "@/server/auth/policy";
import { LIMITS, hit } from "@/server/rate-limit";
import { notify } from "@/server/classroom/notifications";

const CONTACT = [/\b[\w.+-]+@[\w-]+\.[\w.]+\b/, /(\+?\d[\s-]?){10,}/, /https?:\/\/|www\./i, /(^|\s)@[a-z0-9_.]{3,}/i, /\b(whats ?app|telegram|discord|instagram|insta|snap(chat)?|tiktok)\b/i];
export function hasContact(text: string) {
  return CONTACT.some((r) => r.test(text));
}
function clean(text: string) {
  if (hasContact(text)) throw badRequest("İletişim bilgisi ya da dış bağlantı paylaşma; görüşme platform içinde kalır.", "CONTACT_INFO");
  return text;
}
function limit(actor: Actor, key: string) {
  const [max, win] = LIMITS.postPerUser;
  const r = hit(`${key}:${actor.id}`, max, win);
  if (!r.ok) throw tooMany(r.retryAfterSec);
}

export const postSchema = z.object({ topic: z.string().trim().min(3).max(120), body: z.string().trim().min(10).max(1000), skill: z.string().max(40).nullable().default(null) });

export async function listPosts(actor: Actor) {
  const staff = isStaff(actor.role);
  const now = new Date();
  const rows = await db.buddyPost.findMany({
    where: { OR: [{ status: "OPEN", expiresAt: { gt: now } }, { userId: actor.id, status: { not: "HIDDEN" } }, ...(staff ? [{ status: "HIDDEN" }] : [])] },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { id: true, displayName: true } }, replies: { where: { hiddenAt: null }, orderBy: { createdAt: "asc" }, include: { user: { select: { id: true, displayName: true } } } } },
  });
  return rows.map((p) => ({
    id: p.id, topic: p.topic, body: p.body, skill: p.skill, status: p.status, flags: staff ? p.flags : undefined,
    createdAt: p.createdAt.toISOString(), expiresAt: p.expiresAt.toISOString(), author: p.user.displayName, authorId: p.user.id, mine: p.userId === actor.id,
    // Yanıtlar: ilan sahibi ve personel hepsini, diğerleri yalnız kendi yanıtlarını görür.
    replies: p.replies.filter((r) => staff || p.userId === actor.id || r.userId === actor.id).map((r) => ({ id: r.id, body: r.body, author: r.user.displayName, authorId: r.user.id, mine: r.userId === actor.id, createdAt: r.createdAt.toISOString() })),
    replyCount: p.replies.length,
  }));
}

export async function createPost(actor: Actor, input: z.output<typeof postSchema>) {
  limit(actor, "buddy");
  if ((await db.buddyPost.count({ where: { userId: actor.id, status: "OPEN", expiresAt: { gt: new Date() } } })) >= 3) throw conflict("Aynı anda en fazla 3 açık ilanın olabilir.");
  return db.buddyPost.create({ data: { userId: actor.id, topic: clean(input.topic), body: clean(input.body), skill: input.skill, expiresAt: new Date(Date.now() + 14 * 86_400_000) } });
}

export async function replyPost(actor: Actor, postId: string, body: string) {
  limit(actor, "buddy-reply");
  const text = clean(z.string().trim().min(2).max(1000).parse(body));
  return db.$transaction(async (tx) => {
    const p = await tx.buddyPost.findUnique({ where: { id: postId } });
    if (!p || p.status !== "OPEN") throw notFound("İlan kapalı ya da bulunamadı.");
    const r = await tx.buddyReply.create({ data: { postId, userId: actor.id, body: text } });
    if (p.userId !== actor.id) await notify(tx, [p.userId], { type: "SYSTEM", title: `Çalışma ilanına yanıt: ${p.topic}`, body: text.slice(0, 160), link: "/study/buddies" });
    return r;
  });
}

export async function moderatePost(actor: Actor, postId: string, action: "close" | "flag" | "hide" | "show") {
  const p = await db.buddyPost.findUnique({ where: { id: postId } });
  if (!p) throw notFound();
  const staff = isStaff(actor.role);
  if (action === "close") {
    if (p.userId !== actor.id && !staff) throw forbidden();
    return db.buddyPost.update({ where: { id: postId }, data: { status: "CLOSED" } });
  }
  if (action === "flag") {
    if (p.userId === actor.id) throw badRequest("Kendi ilanını bildiremezsin.");
    const r = hit(`buddy-flag:${actor.id}:${postId}`, 1, 30 * 86_400_000);
    if (!r.ok) return p;
    return db.buddyPost.update({ where: { id: postId }, data: { flags: { increment: 1 }, ...(p.flags + 1 >= 3 ? { status: "HIDDEN" } : {}) } });
  }
  if (!staff) throw forbidden();
  return db.buddyPost.update({ where: { id: postId }, data: { status: action === "hide" ? "HIDDEN" : "OPEN", ...(action === "show" ? { flags: 0 } : {}) } });
}

// ── çalışma grupları: 2–5 kişi, ortak plan metni, üyelerin bu haftaki tamamlanan çalışmaları ──
export const circleSchema = z.object({ name: z.string().trim().min(3).max(60), topic: z.string().trim().max(140).default("") });
const MAX_CIRCLE = 5;

export async function listCircles(actor: Actor) {
  const rows = await db.studyCircle.findMany({ orderBy: { createdAt: "desc" }, take: 60, include: { members: { include: { user: { select: { id: true, displayName: true } } } } } });
  const since = new Date(Date.now() - 7 * 86_400_000);
  const ids = [...new Set(rows.flatMap((c) => c.members.map((m) => m.userId)))];
  const counts = ids.length ? await db.learningEvent.groupBy({ by: ["userId"], where: { userId: { in: ids }, createdAt: { gte: since } }, _count: true }) : [];
  const week = new Map(counts.map((c) => [c.userId, c._count]));
  return rows
    .map((c) => {
      const member = c.members.some((m) => m.userId === actor.id);
      return { id: c.id, name: c.name, topic: c.topic, plan: member ? c.plan : "", member, owner: c.ownerId === actor.id, full: c.members.length >= MAX_CIRCLE, members: c.members.map((m) => ({ id: m.user.id, name: m.user.displayName, week: member ? week.get(m.userId) ?? 0 : null })) };
    })
    .filter((c) => c.member || !c.full);
}

export async function createCircle(actor: Actor, input: z.output<typeof circleSchema>) {
  if ((await db.studyCircleMember.count({ where: { userId: actor.id } })) >= 3) throw conflict("En fazla 3 çalışma grubunda olabilirsin.");
  return db.studyCircle.create({ data: { name: clean(input.name), topic: clean(input.topic), ownerId: actor.id, members: { create: { userId: actor.id } } } });
}

export async function joinCircle(actor: Actor, id: string, join: boolean) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "StudyCircle" WHERE id = ${id} FOR UPDATE`;
    const c = await tx.studyCircle.findUnique({ where: { id }, include: { members: true } });
    if (!c) throw notFound();
    if (!join) {
      await tx.studyCircleMember.deleteMany({ where: { circleId: id, userId: actor.id } });
      if (c.members.length <= 1) await tx.studyCircle.delete({ where: { id } });
      return;
    }
    if (c.members.some((m) => m.userId === actor.id)) return;
    if (c.members.length >= MAX_CIRCLE) throw conflict("Grup dolu (en fazla 5 kişi).");
    if ((await tx.studyCircleMember.count({ where: { userId: actor.id } })) >= 3) throw conflict("En fazla 3 çalışma grubunda olabilirsin.");
    await tx.studyCircleMember.create({ data: { circleId: id, userId: actor.id } });
  });
}

export async function savePlan(actor: Actor, id: string, plan: string) {
  const text = clean(z.string().max(3000).parse(plan));
  const m = await db.studyCircleMember.findUnique({ where: { circleId_userId: { circleId: id, userId: actor.id } } });
  if (!m) throw forbidden("Yalnız grup üyeleri planı düzenler.");
  await db.studyCircle.update({ where: { id }, data: { plan: text } });
}

// Teşekkür notu: XP üretmez; profilde "yardımlaşma" sayacı olarak görünür.
export const thanksSchema = z.object({ toId: z.string().min(1).max(40), context: z.string().regex(/^(answer|buddy|reply|review):[a-z0-9]{1,40}$/), message: z.string().trim().max(200).default("") });

export async function thank(actor: Actor, input: z.output<typeof thanksSchema>) {
  if (input.toId === actor.id) throw badRequest("Kendine teşekkür edemezsin.");
  const to = await db.user.findFirst({ where: { id: input.toId, status: "ACTIVE" }, select: { id: true } });
  if (!to) throw notFound();
  return db.$transaction(async (tx) => {
    const r = await tx.thanks.createMany({ data: [{ fromId: actor.id, toId: input.toId, context: input.context, message: clean(input.message) }], skipDuplicates: true });
    if (r.count) await notify(tx, [input.toId], { type: "SYSTEM", title: "Biri sana teşekkür etti", body: input.message || "Yardımın için teşekkürler!", link: "/study/buddies" });
    return r.count > 0;
  });
}

export const thanksCount = (userId: string) => db.thanks.count({ where: { toId: userId } });
