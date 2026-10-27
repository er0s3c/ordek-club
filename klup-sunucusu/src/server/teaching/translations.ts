// Ders çevirisi incelemesi: TR/EN yan yana karşılaştırma, dil/teknik onayı ve reddedilen çevirilerin
// gerekçesi. Karar LessonTranslation JSON'unda tutulur (bkz. TranslationReview); içerik değişmediği sürece
// academy-import onu korur, İngilizce metin değişince onay düşer ve çeviri yeniden kuyruğa girer.
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { badRequest, forbidden, notFound } from "@/server/errors";
import { canManageClassroom, type Actor } from "@/server/auth/policy";
import { readStoredTranslation, type TranslationReview } from "@/server/academy/translation";
import { lineDiff, wordCount } from "@/lib/text";

export const REVIEW_STAGES = ["TECH", "LANGUAGE"] as const;
export const STAGE_LABEL: Record<(typeof REVIEW_STAGES)[number], string> = { TECH: "Teknik inceleme", LANGUAGE: "Dil incelemesi" };

export type TranslationRow = {
  slug: string;
  title: string;
  track: string;
  trackTitle: string;
  status: "missing" | "draft" | "reviewed";
  review: TranslationReview | null;
  // İngilizce taraf
  enTitle: string | null;
  enWords: number;
  trWords: number;
  goals: { tr: number; en: number };
  quiz: { tr: number; en: number } | null;
  missions: { tr: number; en: number } | null;
  // Fark: değişen satır sayısı (TR → EN yapısal karşılaştırma değil, uzunluk/başlık sapması için)
  changedLines: number;
  missingSections: string[];
  bodyHashChanged: boolean;
};

const headingOf = (markdown: string, level: number) =>
  [...markdown.matchAll(new RegExp(`^${"#".repeat(level)} (.+)$`, "gm"))].map((m) => m[1]!.trim());

// TR ve EN gövdenin yapısal karşılaştırması: başlık sayısı, tablo satırı, kod bloğu, çizgi roman ayracı.
// Metin farkı anlam denetimi değildir; burada amaç "çeviri geride kalmış mı" sinyali vermek.
function structuralDrift(tr: string, en: string) {
  const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;
  const rows: { label: string; tr: number; en: number }[] = [
    { label: "h2", tr: count(tr, /^## /gm), en: count(en, /^## /gm) },
    { label: "h3", tr: count(tr, /^### /gm), en: count(en, /^### /gm) },
    { label: "kod bloğu", tr: count(tr, /^```/gm), en: count(en, /^```/gm) },
    { label: "görsel", tr: count(tr, /!\[/g), en: count(en, /!\[/g) },
    { label: "çizgi roman", tr: count(tr, /::cizgi\[/g), en: count(en, /::cizgi\[/g) },
    { label: "tablo satırı", tr: count(tr, /^\|/gm), en: count(en, /^\|/gm) },
  ];
  return rows.filter((r) => r.tr !== r.en).map((r) => `${r.label} ${r.tr}→${r.en}`);
}

export async function translationQueue(): Promise<TranslationRow[]> {
  const lessons = await db.lesson.findMany({
    where: { archivedAt: null, track: { archivedAt: null } },
    orderBy: [{ track: { position: "asc" } }, { position: "asc" }],
    select: {
      slug: true,
      title: true,
      body: true,
      goals: true,
      quiz: true,
      missions: true,
      contentHash: true,
      track: { select: { code: true, title: true } },
      translations: { where: { locale: "en" } },
    },
  });
  return lessons.map((l) => {
    const tr = l.translations[0];
    const stored = tr ? readStoredTranslation(tr.activities) : null;
    const enQuiz = stored?.quiz ?? null;
    const enMissions = stored?.missions ?? null;
    const changedLines = tr ? lineDiff(l.body, tr.body).filter((d) => d.kind !== "same").length : 0;
    return {
      slug: l.slug,
      title: l.title,
      track: l.track.code,
      trackTitle: l.track.title,
      status: !tr ? "missing" : stored?.reviewed ? "reviewed" : "draft",
      review: stored?.review ?? null,
      enTitle: tr?.title ?? null,
      enWords: tr ? wordCount(tr.body) : 0,
      trWords: wordCount(l.body),
      goals: { tr: l.goals.length, en: tr?.goals.length ?? 0 },
      quiz: (l.quiz as unknown[] | null)?.length ? { tr: (l.quiz as unknown[]).length, en: enQuiz?.length ?? 0 } : null,
      missions: (l.missions as unknown[] | null)?.length ? { tr: (l.missions as unknown[]).length, en: enMissions?.length ?? 0 } : null,
      changedLines,
      missingSections: tr ? structuralDrift(l.body, tr.body) : [],
      bodyHashChanged: !!tr && tr.contentHash !== l.contentHash,
    };
  });
}

// Tek dersin iki dili: inceleme ekranında yan yana gösterilir. Gövde markdown olarak ham gelir.
export async function translationDetail(slug: string) {
  const l = await db.lesson.findFirst({
    where: { slug, archivedAt: null, track: { archivedAt: null } },
    select: {
      slug: true,
      title: true,
      body: true,
      goals: true,
      updatedAt: true,
      track: { select: { code: true, title: true } },
      translations: { where: { locale: "en" } },
    },
  });
  if (!l) throw notFound("Ders bulunamadı.");
  const tr = l.translations[0];
  const stored = tr ? readStoredTranslation(tr.activities) : null;
  return {
    slug: l.slug,
    track: l.track.code,
    trackTitle: l.track.title,
    tr: { title: l.title, body: l.body, goals: l.goals },
    en: tr ? { title: tr.title, body: tr.body, goals: tr.goals, contentHash: tr.contentHash } : null,
    review: stored?.review ?? null,
    reviewed: stored?.reviewed ?? false,
    headings: { tr: headingOf(l.body, 2), en: tr ? headingOf(tr.body, 2) : [] },
  };
}

export const translationReviewSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{1,60}$/),
  stage: z.enum(REVIEW_STAGES),
  decision: z.enum(["APPROVED", "CHANGES"]),
  note: z.string().trim().max(2000).default(""),
});

export async function saveTranslationReview(actor: Actor, input: z.output<typeof translationReviewSchema>, ip: string) {
  if (!canManageClassroom(actor)) throw forbidden();
  if (input.decision === "CHANGES" && input.note.length < 5) throw badRequest("Çeviri geri gönderilirken neyin düzeltilmesi gerektiğini yaz.");
  const l = await db.lesson.findFirst({
    where: { slug: input.slug, archivedAt: null },
    select: { id: true, contentHash: true, translations: { where: { locale: "en" } } },
  });
  if (!l) throw notFound();
  const tr = l.translations[0];
  if (!tr) throw badRequest("Bu dersin İngilizce çevirisi yok; önce çeviri eklenmeli.");
  const stored = readStoredTranslation(tr.activities);
  const review: TranslationReview = {
    stage: input.stage,
    decision: input.decision,
    by: actor.id,
    byName: (await db.user.findUnique({ where: { id: actor.id }, select: { displayName: true } }))?.displayName ?? "—",
    at: new Date().toISOString(),
    note: input.note,
  };
  const activities = { activities: stored.activities, quiz: stored.quiz, missions: stored.missions, reviewed: input.decision === "APPROVED", review } as unknown as Prisma.InputJsonValue;
  await db.lessonTranslation.update({ where: { lessonId_locale: { lessonId: l.id, locale: "en" } }, data: { activities } });
  await audit({ actorId: actor.id, action: "translation.review", targetType: "Lesson", targetId: l.id, meta: { stage: input.stage, decision: input.decision }, ip });
  return { reviewed: input.decision === "APPROVED" };
}
