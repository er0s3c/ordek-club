// Çalışma merkezi: süreli çalışma oturumları, hedef tarih planlayıcısı, kişisel tekrar kartları, kişisel terim listesi
// ve hata defteri. Yalnız süre geçirmek XP ya da seri üretmez: oturum sonunda değerlendirme yazılır ve oturum
// süresinde doğrulanmış bir çalışma (ders, quiz, tekrar, lab…) varsa küçük bir ödül verilir.
import { z } from "zod";
import { db } from "@/server/db";
import { badRequest, conflict, notFound } from "@/server/errors";
import { type Actor } from "@/server/auth/policy";
import { getSettings } from "@/server/settings";
import { dayKey } from "@/server/xp/time";
import { award } from "@/server/xp/engine";
import { recordLearning } from "@/server/learning/events";
import { civilDay } from "@/server/learning/service";
import { nextReview, shiftDay } from "@/server/learning/calendar";
import { TERMS } from "@/lib/academy-terms";
import type { QuizQuestion } from "@/server/academy/content";

const STALE_MS = 2 * 3600_000;

export const startSchema = z.object({
  minutes: z.union([z.literal(15), z.literal(25), z.literal(45)]),
  topic: z.string().trim().min(2, "Ne çalışacağını kısaca yaz.").max(140),
  lessonSlug: z.string().regex(/^[a-z0-9-]{1,40}$/).nullable().default(null),
});

export async function activeSession(userId: string) {
  const s = await db.studySession.findFirst({ where: { userId, status: "ACTIVE" }, orderBy: { startedAt: "desc" } });
  if (s && Date.now() > s.endsAt.getTime() + STALE_MS) {
    await db.studySession.update({ where: { id: s.id }, data: { status: "ABANDONED", endedAt: new Date() } });
    return null;
  }
  return s;
}

export async function startSession(actor: Actor, input: z.output<typeof startSchema>) {
  if (await activeSession(actor.id)) throw conflict("Zaten devam eden bir çalışma oturumun var.");
  if (input.lessonSlug && !(await db.lesson.findFirst({ where: { slug: input.lessonSlug, archivedAt: null } }))) throw badRequest("Ders bulunamadı.");
  const now = new Date();
  return db.studySession.create({ data: { userId: actor.id, minutes: input.minutes, topic: input.topic, lessonSlug: input.lessonSlug, startedAt: now, endsAt: new Date(now.getTime() + input.minutes * 60_000) } });
}

export const finishSchema = z.object({
  reflection: z.string().trim().min(20, "Ne öğrendiğini en az bir cümleyle yaz.").max(2000),
  understood: z.number().int().min(1).max(5),
  nextStep: z.string().trim().max(300).default(""),
});

export async function finishSession(actor: Actor, id: string, input: z.output<typeof finishSchema>, now = new Date()) {
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "StudySession" WHERE id = ${id} FOR UPDATE`;
    const s = await tx.studySession.findFirst({ where: { id, userId: actor.id } });
    if (!s) throw notFound();
    if (s.status !== "ACTIVE") throw conflict("Bu oturum zaten kapandı.");
    if (now.getTime() < s.endsAt.getTime() - 60_000) throw conflict("Süre dolmadan değerlendirme yapılamaz. Erken bitirmek istiyorsan oturumu sonlandır.");
    await tx.studySession.update({ where: { id }, data: { status: "DONE", endedAt: now, reflection: input.reflection, selfCheck: { understood: input.understood, nextStep: input.nextStep } } });
    // Doğrulanmış çalışma: oturum penceresinde kaydedilmiş öğrenme olayı (çalışma oturumunun kendisi hariç).
    const verified = await tx.learningEvent.count({ where: { userId: actor.id, kind: { not: "study" }, createdAt: { gte: s.startedAt, lte: now } } });
    let xp = 0;
    if (verified > 0) {
      await recordLearning(tx, actor.id, `study:${id}`, "study", now);
      xp = await award(tx, { userId: actor.id, ruleKey: "study.reflect", key: `study:${actor.id}:${id}`, source: "TASK", reason: `Çalışma oturumu: ${s.topic}`, refType: "StudySession", refId: id });
    }
    return { verified, xp };
  });
}

export async function abandonSession(actor: Actor, id: string) {
  const r = await db.studySession.updateMany({ where: { id, userId: actor.id, status: "ACTIVE" }, data: { status: "ABANDONED", endedAt: new Date() } });
  if (!r.count) throw notFound();
}

export async function studyOverview(actor: Actor) {
  const { timezone } = await getSettings();
  const today = dayKey(new Date(), timezone);
  const [active, recent, goal, cards, terms, totals] = await Promise.all([
    activeSession(actor.id),
    db.studySession.findMany({ where: { userId: actor.id, status: { not: "ACTIVE" } }, orderBy: { startedAt: "desc" }, take: 10 }),
    db.studyGoal.findUnique({ where: { userId: actor.id } }),
    db.personalCard.findMany({ where: { userId: actor.id, closed: false }, orderBy: { dueAt: "asc" }, take: 50 }),
    db.savedTerm.findMany({ where: { userId: actor.id }, orderBy: { createdAt: "desc" } }),
    db.studySession.aggregate({ where: { userId: actor.id, status: "DONE", startedAt: { gte: new Date(`${shiftDay(today, -6)}T00:00:00Z`) } }, _sum: { minutes: true }, _count: true }),
  ]);
  return { today, active, recent, goal: goal ? { ...goal, plan: await goalPlan(actor.id, goal.targetDay, goal.trackKeys, today) } : null, cards, terms: terms.map((t) => TERMS.find((x) => x.id === t.termId)).filter(Boolean), week: { minutes: totals._sum.minutes ?? 0, sessions: totals._count } };
}

// Hedef tarih planlayıcısı: seçilen yollardaki kalan dersler hedef tarihe kadar haftalara bölünür.
export const goalSchema = z.object({ title: z.string().trim().min(2).max(120), targetDay: civilDay, trackKeys: z.array(z.string().regex(/^[a-z0-9-]{1,40}$/)).max(10).default([]) });

export async function saveGoal(actor: Actor, input: z.output<typeof goalSchema>) {
  const { timezone } = await getSettings();
  if (input.targetDay <= dayKey(new Date(), timezone)) throw badRequest("Hedef tarih ileride olmalı.");
  return db.studyGoal.upsert({ where: { userId: actor.id }, create: { userId: actor.id, ...input }, update: input });
}

export async function goalPlan(userId: string, targetDay: string, trackKeys: string[], today: string) {
  const lessons = await db.lesson.findMany({
    where: { archivedAt: null, track: { archivedAt: null, ...(trackKeys.length ? { key: { in: trackKeys } } : { kind: { not: "PROGRAM" } }) }, progress: { none: { userId, status: "COMPLETED" } } },
    orderBy: [{ track: { position: "asc" } }, { position: "asc" }],
    select: { slug: true, title: true, minutes: true, track: { select: { code: true } } },
    take: 400,
  });
  const days = Math.max(1, Math.round((Date.parse(`${targetDay}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86_400_000));
  const weeks = Math.max(1, Math.ceil(days / 7));
  const perWeek = Math.ceil(lessons.length / weeks);
  const minutes = lessons.reduce((a, l) => a + l.minutes, 0);
  return {
    remaining: lessons.length, minutes, days, weeks, perWeek, perDayMinutes: Math.ceil(minutes / days),
    realistic: minutes / days <= 90,
    weekly: Array.from({ length: Math.min(weeks, 12) }, (_, i) => ({ week: i + 1, startsOn: shiftDay(today, i * 7), lessons: lessons.slice(i * perWeek, (i + 1) * perWeek) })).filter((w) => w.lessons.length),
  };
}

// Kişisel tekrar kartı (not ya da terimden); aralıklı tekrar mevcut 3/10/30 gün kuralını kullanır.
export const cardSchema = z.object({ front: z.string().trim().min(2).max(300), back: z.string().trim().min(1).max(1000), source: z.enum(["NOTE", "TERM"]).default("NOTE"), ref: z.string().max(80).default("") });

export async function createCard(actor: Actor, input: z.output<typeof cardSchema>) {
  if ((await db.personalCard.count({ where: { userId: actor.id, closed: false } })) >= 300) throw conflict("En fazla 300 açık kartın olabilir.");
  return db.personalCard.create({ data: { userId: actor.id, ...input } });
}

export async function reviewCard(actor: Actor, id: string, remembered: boolean) {
  const card = await db.personalCard.findFirst({ where: { id, userId: actor.id } });
  if (!card) throw notFound();
  return db.personalCard.update({ where: { id }, data: nextReview(remembered, card.consecutive, new Date()) });
}

export async function deleteCard(actor: Actor, id: string) {
  await db.personalCard.deleteMany({ where: { id, userId: actor.id } });
}

export async function saveTerm(actor: Actor, termId: string, saved = true) {
  if (!TERMS.some((t) => t.id === termId)) throw notFound();
  if (saved) await db.savedTerm.createMany({ data: [{ userId: actor.id, termId }], skipDuplicates: true });
  else await db.savedTerm.deleteMany({ where: { userId: actor.id, termId } });
}

// Hata defteri: quizlerde yanlış yapılan sorular, doğru cevap ve açıklamasıyla.
export async function mistakeBook(actor: Actor) {
  const cards = await db.reviewCard.findMany({ where: { userId: actor.id, lesson: { archivedAt: null } }, orderBy: { updatedAt: "desc" }, take: 100, include: { lesson: { select: { slug: true, title: true } } } });
  return cards.map((c) => {
    const q = c.question as unknown as QuizQuestion;
    const correct = q.kind === "truefalse" ? (q.answer ? "Doğru" : "Yanlış") : q.options[q.answer] ?? "";
    return { id: c.id, lesson: c.lesson, text: q.text, correct, explanation: q.explanation, closed: c.closed, dueAt: c.dueAt.toISOString() };
  });
}
