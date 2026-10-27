import crypto from "node:crypto";
import { db } from "@/server/db";
import { badRequest, conflict, notFound } from "@/server/errors";
import { activitiesSchema, publicActivity, gradeActivity } from "@/lib/academy-activities";
import type { Actor } from "@/server/auth/policy";
import { recordLearning } from "@/server/learning/events";
import { requireFeature } from "@/server/learning/features";
import { readStoredTranslation } from "./translation";
export const activityHash = (value: unknown) => crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
export async function lessonActivities(userId: string, slug: string, locale: "tr" | "en") {
  const lesson = await db.lesson.findFirst({ where: { slug, archivedAt: null, track: { archivedAt: null } }, include: { translations: { where: { locale: "en" } } } });
  if (!lesson) throw notFound();
  const original = activitiesSchema.parse(lesson.activities ?? []);
  const translation = locale === "en" ? lesson.translations[0] : null;
  const activities = translation ? activitiesSchema.parse(readStoredTranslation(translation.activities).activities) : original;
  const hash = activityHash(original);
  const solved = await db.activitySolution.findMany({ where: { userId, lessonId: lesson.id, contentHash: hash }, select: { activityId: true } });
  return { hash, activities: activities.map(a => ({ ...publicActivity(a), solved: solved.some(s => s.activityId === a.id) })), locale: translation ? "en" as const : "tr" as const };
}
export async function answerActivity(actor: Actor, slug: string, input: { activityId: string; values: string[]; locale: "tr" | "en"; hash: string }) {
  await requireFeature("academy-v2");
  return db.$transaction(async tx => {
    const lesson = await tx.lesson.findFirst({ where: { slug, archivedAt: null, track: { archivedAt: null } }, include: { translations: { where: { locale: "en" } } } });
    if (!lesson) throw notFound();
    const hash = activityHash(activitiesSchema.parse(lesson.activities ?? []));
    if (hash !== input.hash) throw conflict("Ders güncellendi. Sayfayı yenileyip tekrar dene.");
    const translation = input.locale === "en" ? lesson.translations[0] : null;
    if (input.locale === "en" && !translation) throw badRequest("Bu dersin İngilizce sürümü yayımlanmadı.");
    const activities = activitiesSchema.parse(translation ? readStoredTranslation(translation.activities).activities : lesson.activities ?? []);
    const activity = activities.find(a => a.id === input.activityId);
    if (!activity) throw notFound();
    const correct = gradeActivity(activity, input.values);
    if (correct) {
      await tx.activitySolution.createMany({ data: [{ userId: actor.id, lessonId: lesson.id, activityId: activity.id, contentHash: hash }], skipDuplicates: true });
      await recordLearning(tx, actor.id, `activity:${lesson.id}:${activity.id}`, "activity");
    }
    // A wrong attempt receives a hint, not the complete answer explanation.
    return { correct, explanation: correct ? activity.explanation : input.locale === "en" ? "Review the evidence and try again." : "Kanıtı ve ilgili bölümü yeniden inceleyip dene." };
  });
}
