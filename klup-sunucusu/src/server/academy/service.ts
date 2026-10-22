// Akademi okuma ve ilerleme işlemleri. Arşivlenmiş yol/ders öğrenciye görünmez.
// Quiz doğru cevapları hiçbir zaman istemciye gönderilmez; puanlama sunucuda yapılır.
import type { LessonKind, ProgressStatus, TrackKind } from "@prisma/client";
import { db } from "@/server/db";
import { badRequest, forbidden, notFound, tooMany } from "@/server/errors";
import { canManageAcademy, canUseAcademy, type Actor } from "@/server/auth/policy";
import { hit } from "@/server/rate-limit";
import type { QuizQuestion, Villain } from "./content";

export type PublicQuestion = { kind: "choice"; text: string; options: string[] } | { kind: "truefalse"; text: string };
export type QuizAnswer = number | boolean | null;
export type QuestionResult = { correct: boolean; explanation: string };

function requireMember(actor: Actor) {
  if (!canUseAcademy(actor)) throw forbidden();
}

const villainOf = (v: unknown) => (v && typeof v === "object" ? (v as Villain) : null);

// ── Puanlama (saf fonksiyon, birim testlenir) ───────────────────────────────
export function gradeQuiz(questions: QuizQuestion[], answers: QuizAnswer[], passPercent: number) {
  if (answers.length !== questions.length) throw badRequest("Her soru için bir cevap gönderilmeli.", "ANSWER_COUNT");
  const results: QuestionResult[] = questions.map((q, i) => {
    const a = answers[i];
    const correct = q.kind === "choice" ? typeof a === "number" && a === q.answer : typeof a === "boolean" && a === q.answer;
    return { correct, explanation: q.explanation };
  });
  const correct = results.filter((r) => r.correct).length;
  const score = questions.length ? Math.round((correct / questions.length) * 100) : 0;
  return { results, correct, total: questions.length, score, passed: score >= passPercent };
}

export const publicQuestions = (qs: QuizQuestion[]): PublicQuestion[] =>
  qs.map((q) => (q.kind === "choice" ? { kind: "choice", text: q.text, options: q.options } : { kind: "truefalse", text: q.text }));

// ── Listeleme ───────────────────────────────────────────────────────────────
export type TrackCard = {
  key: string;
  code: string;
  kind: TrackKind;
  title: string;
  summary: string;
  villain: Villain | null;
  lessons: number;
  completed: number;
  minutes: number;
};

export async function listTracks(actor: Actor): Promise<TrackCard[]> {
  requireMember(actor);
  const tracks = await db.track.findMany({
    where: { archivedAt: null },
    orderBy: { position: "asc" },
    include: { lessons: { where: { archivedAt: null }, select: { id: true, minutes: true } } },
  });
  const done = await db.lessonProgress.groupBy({
    by: ["lessonId"],
    where: { userId: actor.id, status: "COMPLETED", lesson: { archivedAt: null } },
  });
  const doneSet = new Set(done.map((d) => d.lessonId));
  return tracks.map((t) => ({
    key: t.key,
    code: t.code,
    kind: t.kind,
    title: t.title,
    summary: t.summary,
    villain: villainOf(t.villain),
    lessons: t.lessons.length,
    completed: t.lessons.filter((l) => doneSet.has(l.id)).length,
    minutes: t.lessons.reduce((a, l) => a + l.minutes, 0),
  }));
}

export type LessonRow = { slug: string; title: string; kind: LessonKind; minutes: number; status: ProgressStatus | null };

export async function getTrack(actor: Actor, key: string) {
  requireMember(actor);
  const t = await db.track.findFirst({
    where: { key, archivedAt: null },
    include: {
      lessons: {
        where: { archivedAt: null },
        orderBy: { position: "asc" },
        select: { id: true, slug: true, title: true, kind: true, minutes: true, progress: { where: { userId: actor.id }, select: { status: true } } },
      },
    },
  });
  if (!t) throw notFound("Yol bulunamadı.");
  const lessons: LessonRow[] = t.lessons.map((l) => ({ slug: l.slug, title: l.title, kind: l.kind, minutes: l.minutes, status: l.progress[0]?.status ?? null }));
  return { key: t.key, code: t.code, kind: t.kind, title: t.title, summary: t.summary, villain: villainOf(t.villain), lessons };
}

// ── Ders ────────────────────────────────────────────────────────────────────
async function findLesson(slug: string) {
  const l = await db.lesson.findFirst({ where: { slug, archivedAt: null, track: { archivedAt: null } }, include: { track: true } });
  if (!l) throw notFound("Ders bulunamadı.");
  return l;
}

// Dersi getirir ve görüntülemeyi kaydeder (ilk görüntüleme STARTED; tamamlanmış ders geri düşmez).
export async function openLesson(actor: Actor, slug: string) {
  requireMember(actor);
  const l = await findLesson(slug);
  const now = new Date();
  const progress = await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: actor.id, lessonId: l.id } },
    create: { userId: actor.id, lessonId: l.id },
    update: { lastViewAt: now },
  });
  const siblings = await db.lesson.findMany({
    where: { trackId: l.trackId, archivedAt: null },
    orderBy: { position: "asc" },
    select: { slug: true, title: true },
  });
  const i = siblings.findIndex((s) => s.slug === l.slug);
  const lastAttempt =
    l.kind === "QUIZ"
      ? await db.quizAttempt.findFirst({ where: { userId: actor.id, lessonId: l.id }, orderBy: { createdAt: "desc" }, select: { score: true, passed: true, createdAt: true } })
      : null;
  return {
    slug: l.slug,
    kind: l.kind,
    title: l.title,
    minutes: l.minutes,
    goals: l.goals,
    body: l.body,
    passPercent: l.passPercent,
    questions: l.quiz ? publicQuestions(l.quiz as unknown as QuizQuestion[]) : null,
    track: { key: l.track.key, code: l.track.code, title: l.track.title, villain: villainOf(l.track.villain) },
    index: i,
    count: siblings.length,
    prev: siblings[i - 1] ?? null,
    next: siblings[i + 1] ?? null,
    status: progress.status,
    lastAttempt,
  };
}

export async function completeLesson(actor: Actor, slug: string) {
  requireMember(actor);
  const l = await findLesson(slug);
  if (l.kind === "QUIZ") throw badRequest("Quiz, geçme notuna ulaşınca kendiliğinden tamamlanır.", "QUIZ_COMPLETE");
  const now = new Date();
  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: actor.id, lessonId: l.id } },
    create: { userId: actor.id, lessonId: l.id, status: "COMPLETED", completedAt: now },
    update: { status: "COMPLETED", completedAt: now, lastViewAt: now },
  });
  return { status: "COMPLETED" as const };
}

export async function submitQuiz(actor: Actor, slug: string, answers: QuizAnswer[]) {
  requireMember(actor);
  const r = hit(`quiz:${actor.id}`, 20, 10 * 60_000);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const l = await findLesson(slug);
  if (l.kind !== "QUIZ" || !l.quiz) throw badRequest("Bu sayfa bir quiz değil.", "NOT_QUIZ");
  const g = gradeQuiz(l.quiz as unknown as QuizQuestion[], answers, l.passPercent ?? 70);
  const now = new Date();
  await db.$transaction(async (tx) => {
    await tx.quizAttempt.create({ data: { userId: actor.id, lessonId: l.id, answers, correct: g.correct, total: g.total, score: g.score, passed: g.passed } });
    await tx.lessonProgress.upsert({
      where: { userId_lessonId: { userId: actor.id, lessonId: l.id } },
      create: { userId: actor.id, lessonId: l.id, ...(g.passed ? { status: "COMPLETED", completedAt: now } : {}) },
      // Geçilmiş bir quiz sonradan düşük puanla "tamamlanmamış"a dönmez.
      update: { lastViewAt: now, ...(g.passed ? { status: "COMPLETED", completedAt: now } : {}) },
    });
  });
  return g;
}

// Panel için: kaldığın yer. Önce yarım kalan en son ders; yoksa müfredat sırasında tamamlanmamış ilk ders.
export async function continueTarget(actor: Actor) {
  requireMember(actor);
  const open = await db.lessonProgress.findFirst({
    where: { userId: actor.id, status: "STARTED", lesson: { archivedAt: null, track: { archivedAt: null } } },
    orderBy: { lastViewAt: "desc" },
    select: { lesson: { select: { slug: true, title: true, track: { select: { code: true } } } } },
  });
  if (open) return { ...open.lesson, resume: true };
  const next = await db.lesson.findFirst({
    where: { archivedAt: null, track: { archivedAt: null }, progress: { none: { userId: actor.id, status: "COMPLETED" } } },
    orderBy: [{ track: { position: "asc" } }, { position: "asc" }],
    select: { slug: true, title: true, track: { select: { code: true } } },
  });
  return next ? { ...next, resume: false } : null;
}

export async function progressSummary(actor: Actor) {
  requireMember(actor);
  const [total, completed] = await Promise.all([
    db.lesson.count({ where: { archivedAt: null, track: { archivedAt: null } } }),
    db.lessonProgress.count({ where: { userId: actor.id, status: "COMPLETED", lesson: { archivedAt: null, track: { archivedAt: null } } } }),
  ]);
  return { total, completed };
}

// ── Yönetim: yol başına katılım ─────────────────────────────────────────────
export async function academyStats(actor: Actor) {
  if (!canManageAcademy(actor)) throw forbidden();
  const tracks = await db.track.findMany({
    where: { archivedAt: null },
    orderBy: { position: "asc" },
    select: { key: true, code: true, title: true, lessons: { where: { archivedAt: null }, select: { id: true } } },
  });
  const rows = await db.lessonProgress.findMany({
    where: { lesson: { archivedAt: null } },
    select: { userId: true, status: true, lesson: { select: { trackId: true, track: { select: { key: true } } } } },
  });
  const lastImport = await db.auditLog.findFirst({ where: { action: "academy.import" }, orderBy: { createdAt: "desc" }, select: { createdAt: true, meta: true } });
  return {
    lastImport,
    tracks: tracks.map((t) => {
      const mine = rows.filter((r) => r.lesson.track.key === t.key);
      const learners = new Set(mine.map((r) => r.userId));
      const perUser = new Map<string, number>();
      for (const r of mine) if (r.status === "COMPLETED") perUser.set(r.userId, (perUser.get(r.userId) ?? 0) + 1);
      const finished = [...perUser.values()].filter((n) => t.lessons.length > 0 && n >= t.lessons.length).length;
      return { key: t.key, code: t.code, title: t.title, lessons: t.lessons.length, learners: learners.size, finished };
    }),
  };
}
