// Öğretmen içerik merkezi: içerik onay adımları (yazar, teknik, dil), soru kalite analizi, ders geri bildirimi
// özeti, içerik değişiklik notları ve kavram yanılgısı kütüphanesi.
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { badRequest, forbidden, notFound } from "@/server/errors";
import { canManageAcademy, canManageClassroom, isAdmin, type Actor } from "@/server/auth/policy";
import type { QuizQuestion } from "@/server/academy/content";

export const STAGES = ["AUTHOR", "TECH", "LANGUAGE"] as const;
export const STAGE_LABEL: Record<(typeof STAGES)[number], string> = { AUTHOR: "Yazar", TECH: "Teknik inceleme", LANGUAGE: "Dil incelemesi" };

// Her ders için güncel içerik sürümündeki (contentHash) son aşama kararları. Üç aşama da "APPROVED" ise yayına hazır.
export async function contentStatus() {
  const [lessons, reviews, changes] = await Promise.all([
    db.lesson.findMany({ where: { archivedAt: null, track: { archivedAt: null } }, orderBy: [{ track: { position: "asc" } }, { position: "asc" }], select: { id: true, slug: true, title: true, contentHash: true, updatedAt: true, track: { select: { code: true, title: true } } } }),
    db.contentReview.findMany({ orderBy: { createdAt: "asc" }, include: { reviewer: { select: { displayName: true } } } }),
    db.lessonChange.findMany({ where: { createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) } }, orderBy: { createdAt: "desc" }, include: { lesson: { select: { slug: true, title: true } } } }),
  ]);
  const rows = lessons.map((l) => {
    const mine = reviews.filter((r) => r.lessonId === l.id && r.contentHash === l.contentHash);
    const stages = Object.fromEntries(STAGES.map((s) => { const last = mine.filter((r) => r.stage === s).at(-1); return [s, last ? { decision: last.decision, note: last.note, by: last.reviewer?.displayName ?? "—", at: last.createdAt.toISOString() } : null]; })) as Record<(typeof STAGES)[number], { decision: string; note: string; by: string; at: string } | null>;
    const staleReview = reviews.some((r) => r.lessonId === l.id && r.contentHash !== l.contentHash);
    return { id: l.id, slug: l.slug, title: l.title, track: l.track.code, trackTitle: l.track.title, stages, ready: STAGES.every((s) => stages[s]?.decision === "APPROVED"), changedSinceReview: staleReview && !mine.length };
  });
  return { rows, changes: changes.map((c) => ({ id: c.id, slug: c.lesson.slug, title: c.lesson.title, oldTitle: c.oldTitle, at: c.createdAt.toISOString() })) };
}

export const reviewSchema = z.object({ slug: z.string().regex(/^[a-z0-9-]{1,40}$/), stage: z.enum(STAGES), decision: z.enum(["APPROVED", "CHANGES"]), note: z.string().trim().max(2000).default("") });

export async function saveContentReview(actor: Actor, input: z.output<typeof reviewSchema>, ip: string) {
  if (!canManageClassroom(actor)) throw forbidden();
  if (input.decision === "CHANGES" && input.note.length < 5) throw badRequest("Değişiklik isterken ne değişmesi gerektiğini yaz.");
  const l = await db.lesson.findFirst({ where: { slug: input.slug, archivedAt: null }, select: { id: true, contentHash: true } });
  if (!l) throw notFound();
  // Yazar ile teknik inceleyen aynı kişi olamaz (bağımsız inceleme).
  if (input.stage === "TECH") {
    const author = await db.contentReview.findFirst({ where: { lessonId: l.id, contentHash: l.contentHash, stage: "AUTHOR", decision: "APPROVED" }, orderBy: { createdAt: "desc" } });
    if (author?.reviewerId === actor.id && !isAdmin(actor.role)) throw badRequest("Teknik incelemeyi yazardan farklı biri yapmalı.");
  }
  const r = await db.contentReview.create({ data: { lessonId: l.id, contentHash: l.contentHash, stage: input.stage, decision: input.decision, note: input.note, reviewerId: actor.id } });
  await audit({ actorId: actor.id, action: "content.review", targetType: "Lesson", targetId: l.id, meta: { stage: input.stage, decision: input.decision }, ip });
  return r;
}

// Soru kalite analizi: her quiz sorusunda seçeneklerin dağılımı ve doğru oranı. Az yanıtta "yetersiz veri".
export const MIN_ANSWERS = 10;
export async function questionAnalytics(trackKey?: string) {
  const lessons = await db.lesson.findMany({ where: { archivedAt: null, kind: "QUIZ", ...(trackKey ? { track: { key: trackKey } } : {}) }, select: { id: true, slug: true, title: true, quiz: true, track: { select: { code: true } } }, orderBy: [{ track: { position: "asc" } }, { position: "asc" }] });
  const attempts = await db.quizAttempt.findMany({ where: { lessonId: { in: lessons.map((l) => l.id) } }, select: { lessonId: true, userId: true, answers: true, createdAt: true }, orderBy: { createdAt: "asc" } });
  return lessons.map((l) => {
    const qs = (l.quiz as unknown as QuizQuestion[] | null) ?? [];
    // Kişi başına ilk deneme: tekrar denemeler doğru cevabı ezberlemeyi ölçer, soru kalitesini değil.
    const firsts = new Map<string, unknown[]>();
    for (const a of attempts) if (a.lessonId === l.id && !firsts.has(a.userId)) firsts.set(a.userId, a.answers as unknown[]);
    const answers = [...firsts.values()];
    return {
      slug: l.slug, title: l.title, track: l.track.code, respondents: answers.length,
      questions: qs.map((q, i) => {
        const options = q.kind === "choice" ? q.options : ["Doğru", "Yanlış"];
        const correctIndex = q.kind === "choice" ? q.answer : q.answer ? 0 : 1;
        const counts = options.map(() => 0);
        let total = 0;
        for (const a of answers) {
          const v = a[i];
          const idx = q.kind === "truefalse" ? (v === true ? 0 : v === false ? 1 : -1) : typeof v === "number" ? v : -1;
          if (idx >= 0 && idx < counts.length) { counts[idx]!++; total++; }
        }
        const wrong = counts.map((c, k) => ({ k, c })).filter((x) => x.k !== correctIndex).sort((a, b) => b.c - a.c)[0];
        return { text: q.text, options, correctIndex, counts, total, enough: total >= MIN_ANSWERS, correctPct: total ? Math.round((counts[correctIndex]! / total) * 100) : null, topDistractor: wrong && wrong.c > 0 ? { option: options[wrong.k]!, pct: Math.round((wrong.c / Math.max(1, total)) * 100) } : null };
      }),
    };
  });
}

// Ders geri bildirimi özeti: ortalama puan ve isimsiz "en belirsiz nokta" listesi.
export async function feedbackSummary() {
  const rows = await db.lessonFeedback.findMany({ include: { lesson: { select: { slug: true, title: true, track: { select: { code: true } } } } }, orderBy: { updatedAt: "desc" }, take: 2000 });
  const by = new Map<string, { slug: string; title: string; track: string; ratings: number[]; unclear: string[]; comments: string[] }>();
  for (const r of rows) {
    const e = by.get(r.lessonId) ?? { slug: r.lesson.slug, title: r.lesson.title, track: r.lesson.track.code, ratings: [], unclear: [], comments: [] };
    if (r.rating) e.ratings.push(r.rating);
    if (r.unclear) e.unclear.push(r.unclear);
    if (r.comment) e.comments.push(r.comment);
    by.set(r.lessonId, e);
  }
  return [...by.values()].map((e) => ({ ...e, avg: e.ratings.length ? Math.round((e.ratings.reduce((a, b) => a + b, 0) / e.ratings.length) * 10) / 10 : null, count: e.ratings.length })).sort((a, b) => (a.avg ?? 9) - (b.avg ?? 9));
}

// Kavram yanılgısı kütüphanesi
export const misconceptionSchema = z.object({ title: z.string().trim().min(3).max(120), belief: z.string().trim().min(3).max(500), explanation: z.string().trim().min(3).max(2000), skills: z.array(z.string().max(30)).max(8).default([]), lessonSlugs: z.array(z.string().regex(/^[a-z0-9-]{1,40}$/)).max(20).default([]) });
export const listMisconceptions = () => db.misconception.findMany({ orderBy: { updatedAt: "desc" }, include: { author: { select: { displayName: true } } } });
export async function createMisconception(actor: Actor, input: z.output<typeof misconceptionSchema>) {
  if (!canManageClassroom(actor)) throw forbidden();
  return db.misconception.create({ data: { ...input, authorId: actor.id } });
}
export async function deleteMisconception(actor: Actor, id: string) {
  const m = await db.misconception.findUnique({ where: { id } });
  if (!m) throw notFound();
  if (m.authorId !== actor.id && !canManageAcademy(actor)) throw forbidden();
  await db.misconception.delete({ where: { id } });
}
