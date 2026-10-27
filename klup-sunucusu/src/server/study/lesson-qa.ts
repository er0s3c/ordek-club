// Ders içi soru alanı ve ders değerlendirmesi. Sorular ders bölümüne (başlık çapası) bağlanır;
// öğretmen yanıtı aynı dersi çalışan herkese görünür. Gizlenen sorular yalnız personele ve sorana görünür.
import { z } from "zod";
import { db } from "@/server/db";
import { badRequest, forbidden, notFound, tooMany } from "@/server/errors";
import { isStaff, type Actor } from "@/server/auth/policy";
import { LIMITS, hit } from "@/server/rate-limit";
import { notify } from "@/server/classroom/notifications";

async function lessonId(slug: string) {
  const l = await db.lesson.findFirst({ where: { slug, archivedAt: null, track: { archivedAt: null } }, select: { id: true, title: true } });
  if (!l) throw notFound();
  return l;
}

export async function listQuestions(actor: Actor, slug: string) {
  const l = await lessonId(slug);
  const staff = isStaff(actor.role);
  const rows = await db.lessonQuestion.findMany({
    where: { lessonId: l.id, ...(staff ? {} : { OR: [{ status: { not: "HIDDEN" } }, { userId: actor.id }] }) },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { displayName: true } }, answers: { orderBy: [{ accepted: "desc" }, { createdAt: "asc" }], include: { user: { select: { displayName: true } } } } },
  });
  return rows.map((q) => ({
    id: q.id, sectionId: q.sectionId, body: q.body, status: q.status, createdAt: q.createdAt.toISOString(), author: q.user.displayName, mine: q.userId === actor.id,
    answers: q.answers.map((a) => ({ id: a.id, body: a.body, staff: a.staff, accepted: a.accepted, author: a.user.displayName, mine: a.userId === actor.id, createdAt: a.createdAt.toISOString() })),
  }));
}

export const askSchema = z.object({ sectionId: z.string().regex(/^[a-z0-9-]{0,60}$/).default(""), body: z.string().trim().min(8, "Sorunu biraz daha aç.").max(2000) });

export async function askQuestion(actor: Actor, slug: string, input: z.output<typeof askSchema>) {
  const [max, win] = LIMITS.postPerUser;
  const r = hit(`lq:${actor.id}`, max, win);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const l = await lessonId(slug);
  return db.lessonQuestion.create({ data: { lessonId: l.id, userId: actor.id, sectionId: input.sectionId, body: input.body } });
}

export const answerSchema = z.object({ body: z.string().trim().min(2).max(3000) });

export async function answerQuestion(actor: Actor, questionId: string, input: z.output<typeof answerSchema>) {
  const staff = isStaff(actor.role);
  return db.$transaction(async (tx) => {
    const q = await tx.lessonQuestion.findUnique({ where: { id: questionId }, include: { lesson: { select: { slug: true, title: true } } } });
    if (!q || (q.status === "HIDDEN" && !staff)) throw notFound();
    const a = await tx.lessonAnswer.create({ data: { questionId, userId: actor.id, body: input.body, staff, accepted: staff } });
    if (staff) await tx.lessonQuestion.update({ where: { id: questionId }, data: { status: "ANSWERED" } });
    if (q.userId !== actor.id)
      await notify(tx, [q.userId], { type: "SYSTEM", title: staff ? `Sorun yanıtlandı: ${q.lesson.title}` : `Soruna bir yanıt geldi: ${q.lesson.title}`, body: input.body.slice(0, 200), link: `/academy/lesson/${q.lesson.slug}#sorular` });
    return a;
  });
}

export const moderateSchema = z.object({ action: z.enum(["hide", "show", "resolve", "accept"]), answerId: z.string().optional() });

export async function moderateQuestion(actor: Actor, questionId: string, input: z.output<typeof moderateSchema>) {
  const q = await db.lessonQuestion.findUnique({ where: { id: questionId } });
  if (!q) throw notFound();
  const staff = isStaff(actor.role);
  if (input.action === "resolve" || input.action === "accept") {
    if (!staff && q.userId !== actor.id) throw forbidden("Yalnız soran kişi ya da öğretmen çözüldü olarak işaretleyebilir.");
    if (input.action === "accept") {
      if (!input.answerId) throw badRequest("Yanıt seçilmedi.");
      await db.lessonAnswer.updateMany({ where: { id: input.answerId, questionId }, data: { accepted: true } });
    }
    return db.lessonQuestion.update({ where: { id: questionId }, data: { status: "ANSWERED" } });
  }
  if (!staff) throw forbidden();
  return db.lessonQuestion.update({ where: { id: questionId }, data: { status: input.action === "hide" ? "HIDDEN" : "OPEN" } });
}

// Ders değerlendirmesi (1–5), isteğe bağlı yorum ve "en belirsiz nokta".
export const feedbackSchema = z.object({ rating: z.number().int().min(1).max(5).nullable(), comment: z.string().trim().max(1000).default(""), unclear: z.string().trim().max(500).default("") });

export async function saveFeedback(actor: Actor, slug: string, input: z.output<typeof feedbackSchema>) {
  const l = await lessonId(slug);
  return db.lessonFeedback.upsert({ where: { userId_lessonId: { userId: actor.id, lessonId: l.id } }, create: { userId: actor.id, lessonId: l.id, ...input }, update: input });
}

export async function myFeedback(actor: Actor, slug: string) {
  const l = await lessonId(slug);
  return db.lessonFeedback.findUnique({ where: { userId_lessonId: { userId: actor.id, lessonId: l.id } }, select: { rating: true, comment: true, unclear: true } });
}

// Son okunan bölüm: "kaldığın yerden devam" bağlantısı buraya gider.
export async function saveSection(actor: Actor, slug: string, sectionId: string) {
  if (!/^[a-z0-9-]{0,60}$/.test(sectionId)) throw badRequest("Geçersiz bölüm.");
  const l = await lessonId(slug);
  await db.lessonPersonal.upsert({ where: { userId_lessonId: { userId: actor.id, lessonId: l.id } }, create: { userId: actor.id, lessonId: l.id, lastSection: sectionId }, update: { lastSection: sectionId } });
}
