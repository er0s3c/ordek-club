import { activitiesSchema } from "@/lib/academy-activities";
import { activityHash } from "./activities";
import { seedReviews } from "@/server/learning/service";
// Akademi okuma ve ilerleme işlemleri. Arşivlenmiş yol/ders öğrenciye görünmez.
// Quiz doğru cevapları hiçbir zaman istemciye gönderilmez; puanlama sunucuda yapılır.
import { Prisma, type LessonKind, type ProgressStatus, type TrackKind } from "@prisma/client";
import { db } from "@/server/db";
import { badRequest, forbidden, notFound, tooMany } from "@/server/errors";
import { canManageAcademy, canUseAcademy, type Actor } from "@/server/auth/policy";
import { hit } from "@/server/rate-limit";
import type { QuizQuestion, Villain } from "./content";
import { gradeMission, gradeStep, missionClosing, publicMission, solutionOf, type Mission, type StepAnswer } from "./missions";
import { availableImages, portraitUrl } from "./images";
import { onLessonCompleted, onMissionCompleted, onQuizAttempt, XP_TX } from "@/server/xp/engine";
import { evaluateBadges } from "@/server/xp/badges";
import { readStoredTranslation } from "./translation";
import { trackText, villainText } from "./content-i18n";

export type ContentLang = "tr" | "en";

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

export async function listTracks(actor: Actor, lang: ContentLang = "tr"): Promise<TrackCard[]> {
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
    ...trackText(t.key, t.title, t.summary, lang),
    villain: villainText(villainOf(t.villain), lang),
    lessons: t.lessons.length,
    completed: t.lessons.filter((l) => doneSet.has(l.id)).length,
    minutes: t.lessons.reduce((a, l) => a + l.minutes, 0),
  }));
}

export type LessonRow = { slug: string; title: string; kind: LessonKind; minutes: number; status: ProgressStatus | null };

export async function getTrack(actor: Actor, key: string, lang: ContentLang = "tr") {
  requireMember(actor);
  const t = await db.track.findFirst({
    where: { key, archivedAt: null },
    include: {
      lessons: {
        where: { archivedAt: null },
        orderBy: { position: "asc" },
        select: { id: true, slug: true, title: true, kind: true, minutes: true, progress: { where: { userId: actor.id }, select: { status: true } }, translations: { where: { locale: lang }, select: { title: true } } },
      },
    },
  });
  if (!t) throw notFound("Yol bulunamadı.");
  const lessons: LessonRow[] = t.lessons.map((l) => ({ slug: l.slug, title: l.translations[0]?.title ?? l.title, kind: l.kind, minutes: l.minutes, status: l.progress[0]?.status ?? null }));
  return { key: t.key, code: t.code, kind: t.kind, ...trackText(t.key, t.title, t.summary, lang), villain: villainText(villainOf(t.villain), lang), lessons };
}

// ── Ders ────────────────────────────────────────────────────────────────────
async function findLesson(slug: string) {
  const l = await db.lesson.findFirst({ where: { slug, archivedAt: null, track: { archivedAt: null } }, include: { track: true, translations: { where: { locale: "en" } } } });
  if (!l) throw notFound("Ders bulunamadı.");
  return l;
}

// Gösterilecek içerik: İngilizce istenmiş ve çeviri varsa çeviri. Çevrilen quiz/görevler özgünle aynı
// yapıdadır (importer denetler); bu yüzden puanlama dilden bağımsızdır, yalnız metinler değişir.
function localized(l: Awaited<ReturnType<typeof findLesson>>, lang: ContentLang) {
  const tr = lang === "en" ? l.translations[0] : undefined;
  const stored = tr ? readStoredTranslation(tr.activities) : null;
  return {
    lang: tr ? ("en" as const) : ("tr" as const),
    reviewed: stored?.reviewed ?? true,
    title: tr?.title ?? l.title,
    goals: tr?.goals ?? l.goals,
    body: tr?.body ?? l.body,
    quiz: (stored?.quiz ?? l.quiz) as unknown as QuizQuestion[] | null,
    missions: (stored?.missions ?? l.missions) as unknown as Mission[] | null,
  };
}

// Dersi getirir ve görüntülemeyi kaydeder (ilk görüntüleme STARTED; tamamlanmış ders geri düşmez).
export async function openLesson(actor: Actor, slug: string, lang: ContentLang = "tr") {
  requireMember(actor);
  const l = await findLesson(slug);
  const c = localized(l, lang);
  const now = new Date();
  const progress = await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: actor.id, lessonId: l.id } },
    create: { userId: actor.id, lessonId: l.id },
    update: { lastViewAt: now },
  });
  const siblings = await db.lesson.findMany({
    where: { trackId: l.trackId, archivedAt: null },
    orderBy: { position: "asc" },
    select: { slug: true, title: true, translations: { where: { locale: lang }, select: { title: true } } },
  }).then((rows) => rows.map((r) => ({ slug: r.slug, title: r.translations[0]?.title ?? r.title })));
  const i = siblings.findIndex((s) => s.slug === l.slug);
  const missions = c.missions ?? [];
  const solved = missions.length ? await solvedMissions(actor.id, l.id) : new Set<string>();
  const trackDone = await db.lessonProgress.count({ where: { userId: actor.id, status: "COMPLETED", lesson: { trackId: l.trackId, archivedAt: null } } });
  const lastAttempt =
    l.kind === "QUIZ"
      ? await db.quizAttempt.findFirst({ where: { userId: actor.id, lessonId: l.id }, orderBy: { createdAt: "desc" }, select: { score: true, passed: true, createdAt: true } })
      : null;
  return {
    slug: l.slug,
    kind: l.kind,
    lang: c.lang,
    reviewed: c.reviewed,
    title: c.title,
    minutes: l.minutes,
    goals: c.goals,
    body: c.body,
    passPercent: l.passPercent,
    questions: c.quiz ? publicQuestions(c.quiz) : null,
    // Çözülen görevin kapanışı (özet + sonraki merak) yalnızca çözümden sonra gönderilir.
    missions: missions.map((m) => ({ ...publicMission(m), solved: solved.has(m.id), closing: solved.has(m.id) ? closingOf(m, l.track.villain) : null })),
    track: { key: l.track.key, code: l.track.code, title: trackText(l.track.key, l.track.title, l.track.summary, lang).title, villain: villainText(villainOf(l.track.villain), lang) },
    index: i,
    count: siblings.length,
    trackDone,
    prev: siblings[i - 1] ?? null,
    next: siblings[i + 1] ?? null,
    status: progress.status,
    lastAttempt,
  };
}

// Bir ders açıldıktan en az bu kadar sonra tamamlanabilir (XP için "aç-kapat" suistimaline karşı).
export const MIN_READ_MS = 15_000;

export async function completeLesson(actor: Actor, slug: string) {
  requireMember(actor);
  const l = await findLesson(slug);
  if (l.kind === "QUIZ") throw badRequest("Quiz, geçme notuna ulaşınca kendiliğinden tamamlanır.", "QUIZ_COMPLETE");
  // Görevli derste "bekle-tıkla" yolu yok: ders, görev(ler) sunucuda doğrulanınca kendiliğinden tamamlanır.
  if (l.missions) throw badRequest("Önce görevi çöz; ders kendiliğinden tamamlanır.", "MISSION_PENDING");
  const now = new Date();
  const xp = await db.$transaction(async (tx) => {
    const p = await tx.lessonProgress.findUnique({ where: { userId_lessonId: { userId: actor.id, lessonId: l.id } } });
    if (!p) throw badRequest("Önce dersi aç.", "NOT_OPENED");
    if (p.status === "COMPLETED") return 0;
    const activities = activitiesSchema.parse(l.activities ?? []);
    if (activities.length) {
      const solutions = await tx.activitySolution.findMany({ where: { userId: actor.id, lessonId: l.id, contentHash: activityHash(activities) }, select: { activityId: true } });
      if (activities.some(a => !solutions.some(s => s.activityId === a.id))) throw badRequest("Önce ders etkinliklerini tamamla.", "ACTIVITY_PENDING");
    }
    if (now.getTime() - p.startedAt.getTime() < MIN_READ_MS) throw badRequest("Sayfayı okumak için biraz daha zaman ayır.", "TOO_FAST");
    await tx.lessonProgress.update({ where: { id: p.id }, data: { status: "COMPLETED", completedAt: now, lastViewAt: now } });
    return onLessonCompleted(tx, actor.id, l);
  }, XP_TX);
  const badges = await evaluateBadges(actor.id);
  return { status: "COMPLETED" as const, xp, badges };
}

export async function submitQuiz(actor: Actor, slug: string, answers: QuizAnswer[], confidence: (boolean | null)[] = [], lang: ContentLang = "tr") {
  requireMember(actor);
  const r = hit(`quiz:${actor.id}`, 20, 10 * 60_000);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const l = await findLesson(slug);
  if (l.kind !== "QUIZ" || !l.quiz) throw badRequest("Bu sayfa bir quiz değil.", "NOT_QUIZ");
  const g = gradeQuiz(localized(l, lang).quiz ?? (l.quiz as unknown as QuizQuestion[]), answers, l.passPercent ?? 70);
  const now = new Date();
  const xp = await db.$transaction(async (tx) => {
    await tx.quizAttempt.create({ data: { userId: actor.id, lessonId: l.id, answers, correct: g.correct, total: g.total, score: g.score, passed: g.passed, ...(confidence.length ? { confidence } : {}) } });
    const prev = await tx.lessonProgress.findUnique({ where: { userId_lessonId: { userId: actor.id, lessonId: l.id } }, select: { status: true } });
    await tx.lessonProgress.upsert({
      where: { userId_lessonId: { userId: actor.id, lessonId: l.id } },
      create: { userId: actor.id, lessonId: l.id, ...(g.passed ? { status: "COMPLETED", completedAt: now } : {}) },
      // Geçilmiş bir quiz sonradan düşük puanla "tamamlanmamış"a dönmez; tamamlanma tarihi de ilk geçişte kalır.
      update: { lastViewAt: now, ...(g.passed && prev?.status !== "COMPLETED" ? { status: "COMPLETED", completedAt: now } : {}) },
    });
    // "Tahmin ettim" denip doğru bilinen sorular da tekrar kartına girer (güven işareti).
    await seedReviews(tx, actor.id, l.id, l.quiz as unknown as QuizQuestion[], g.results.map((r, i) => ({ correct: r.correct && confidence[i] !== false })));
    return onQuizAttempt(tx, actor.id, l, g.passed);
  }, XP_TX);
  const badges = g.passed ? await evaluateBadges(actor.id) : [];
  return { ...g, xp, badges };
}

// ── Mini görevler ────────────────────────────────────────────────────────────
// Durum sunucuda: her adım kontrolü ve tamamlama MissionAttempt satırıdır (ilerlemenin tek kaynağı, XP'nin değil).

// Kapanış kartı: ifşa + kurallar + bölümün kötü adam portresi (dosyası hazırsa; yoksa kart görselsiz çizilir).
const closingOf = (m: Mission, villain: unknown) => {
  const v = villainOf(villain);
  return { ...missionClosing(m), portrait: v ? portraitUrl(v.id, availableImages()) : null, villain: v?.ad ?? null };
};

async function solvedMissions(userId: string, lessonId: string) {
  const rows = await db.missionAttempt.findMany({ where: { userId, lessonId, step: null, correct: true }, select: { missionId: true }, distinct: ["missionId"] });
  return new Set(rows.map((r) => r.missionId));
}

async function findMission(slug: string, missionId: string, lang: ContentLang = "tr") {
  const l = await findLesson(slug);
  const m = (localized(l, lang).missions ?? []).find((x) => x.id === missionId);
  if (!m) throw notFound("Görev bulunamadı.");
  return { l, m };
}

// Adım kontrolü: doğru/yanlış ve o seçeneğe özgü geri bildirim. Durumsuz puanlama, hız sınırlı; deneme kaydedilir.
// Aynı adımda 2. yanlıştan sonra çözümlü örnek açılır (learning-scientist, şart 2).
export async function checkMissionStep(actor: Actor, slug: string, missionId: string, step: number, answer: StepAnswer, hintsUsed: number, lang: ContentLang = "tr") {
  requireMember(actor);
  const r = hit(`mission:${actor.id}`, 60, 10 * 60_000);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const { l, m } = await findMission(slug, missionId, lang);
  const s = m.adimlar[step];
  if (!s) throw badRequest("Geçersiz adım.", "BAD_STEP");
  const g = gradeStep(s, answer);
  await db.missionAttempt.create({ data: { userId: actor.id, lessonId: l.id, missionId, step, choice: answer ?? [], correct: g.correct, hintsUsed } });
  let solution: string | null = null;
  if (!g.correct) {
    const wrong = await db.missionAttempt.count({ where: { userId: actor.id, lessonId: l.id, missionId, step, correct: false } });
    if (wrong >= 2) solution = solutionOf(s);
  }
  return { ...g, solution };
}

// Görevi tamamla: istemcinin "doğru" demesine güvenilmez, bütün cevaplar işlem içinde yeniden puanlanır.
// XP ders kimliği + görev id'siyle idempotent; kural kapalıysa XP 0 olur ama ders yine tamamlanır.
export async function completeMission(actor: Actor, slug: string, missionId: string, answers: StepAnswer[], hintsUsed: number, lang: ContentLang = "tr") {
  requireMember(actor);
  const r = hit(`mission:${actor.id}`, 60, 10 * 60_000);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const { l, m } = await findMission(slug, missionId, lang);
  if (answers.length !== m.adimlar.length) throw badRequest("Her adım için bir cevap gönderilmeli.", "ANSWER_COUNT");
  if (!gradeMission(m, answers)) throw badRequest("Görev henüz çözülmedi.", "MISSION_PENDING");
  const all = (l.missions as unknown as Mission[]).map((x) => x.id);
  const now = new Date();
  const out = await db.$transaction(async (tx) => {
    const already = await tx.missionAttempt.count({ where: { userId: actor.id, lessonId: l.id, missionId, step: null, correct: true } });
    const firstTry = (await tx.missionAttempt.count({ where: { userId: actor.id, lessonId: l.id, missionId, correct: false } })) === 0;
    await tx.missionAttempt.create({ data: { userId: actor.id, lessonId: l.id, missionId, step: null, choice: answers.map((a) => a ?? []), correct: true, hintsUsed } });
    const solvedRows = await tx.missionAttempt.findMany({ where: { userId: actor.id, lessonId: l.id, step: null, correct: true }, select: { missionId: true }, distinct: ["missionId"] });
    const lessonDone = all.every((id) => solvedRows.some((x) => x.missionId === id));
    const prev = await tx.lessonProgress.findUnique({ where: { userId_lessonId: { userId: actor.id, lessonId: l.id } }, select: { status: true } });
    await tx.lessonProgress.upsert({
      where: { userId_lessonId: { userId: actor.id, lessonId: l.id } },
      create: { userId: actor.id, lessonId: l.id, ...(lessonDone ? { status: "COMPLETED", completedAt: now } : {}) },
      update: { lastViewAt: now, ...(lessonDone && prev?.status !== "COMPLETED" ? { status: "COMPLETED", completedAt: now } : {}) },
    });
    const xp = await onMissionCompleted(tx, actor.id, l, missionId, lessonDone && prev?.status !== "COMPLETED");
    return { xp, alreadySolved: already > 0, firstTry, lessonDone };
  }, XP_TX);
  const badges = out.xp > 0 ? await evaluateBadges(actor.id) : [];
  return { ...out, badges, closing: closingOf(m, l.track.villain) };
}

// Studio için: sunuma eklenebilecek mini görevler (yalnız kodlar ve başlıklar; cevap anahtarı yok).
export async function missionOptions() {
  const rows = await db.lesson.findMany({
    where: { archivedAt: null, track: { archivedAt: null }, NOT: { missions: { equals: Prisma.DbNull } } },
    orderBy: [{ track: { position: "asc" } }, { position: "asc" }],
    select: { slug: true, missions: true, track: { select: { code: true } } },
  });
  return rows.flatMap((l) => ((l.missions as unknown as Mission[] | null) ?? []).map((m) => ({ lesson: l.slug, mission: m.id, title: `${l.track.code} · ${m.baslik}` })));
}

// İlk görev (07 Adım 1): yeni öğrenci broşüre değil, 3 dakikalık görevle başlar. Slug kodda sabit (P2: akademi.yaml'a taşı);
// ders yoksa ya da arşivlendiyse null döner ve panel continueTarget'a düşer.
export const FIRST_MISSION_SLUG = "m01-05";

export async function firstMission(actor: Actor, lang: ContentLang = "tr") {
  requireMember(actor);
  const l = await db.lesson.findFirst({
    where: { slug: FIRST_MISSION_SLUG, archivedAt: null, track: { archivedAt: null } },
    select: { slug: true, title: true, minutes: true, missions: true, translations: { where: { locale: lang }, select: { title: true } } },
  });
  return l?.missions ? { slug: l.slug, title: l.translations[0]?.title ?? l.title, minutes: l.minutes } : null;
}

// Panel için: kaldığın yer. Önce yarım kalan en son ders; yoksa müfredat sırasında tamamlanmamış ilk ders.
// PROGRAM yolu (akademi tanıtımı) "devam et" hedefi olmaz: yeni öğrenci broşüre değil ilk derse gitmeli.
export async function continueTarget(actor: Actor, lang: ContentLang = "tr") {
  requireMember(actor);
  const select = { slug: true, title: true, track: { select: { code: true } }, translations: { where: { locale: lang }, select: { title: true } } } as const;
  const shape = (l: { slug: string; title: string; track: { code: string }; translations: { title: string }[] }) => ({ slug: l.slug, title: l.translations[0]?.title ?? l.title, track: l.track });
  const open = await db.lessonProgress.findFirst({
    where: { userId: actor.id, status: "STARTED", lesson: { archivedAt: null, track: { archivedAt: null, kind: { not: "PROGRAM" } } } },
    orderBy: { lastViewAt: "desc" },
    select: { lesson: { select } },
  });
  if (open) return { ...shape(open.lesson), resume: true };
  const next = await db.lesson.findFirst({
    where: { archivedAt: null, track: { archivedAt: null, kind: { not: "PROGRAM" } }, progress: { none: { userId: actor.id, status: "COMPLETED" } } },
    orderBy: [{ track: { position: "asc" } }, { position: "asc" }],
    select,
  });
  return next ? { ...shape(next), resume: false } : null;
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
