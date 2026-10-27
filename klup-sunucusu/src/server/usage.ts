// Özellik kullanım paneli: anahtar başına son 7 ve 30 günde kaç kayıt ve kaç farklı kişi. Kişisel ayrıntı yok.
import { db } from "@/server/db";
import { FEATURE_KEYS, type FeatureKey } from "@/server/learning/features";

type Count = { label: string; d7: number; d30: number; people30: number };
const since = (days: number) => new Date(Date.now() - days * 86_400_000);

async function measure(label: string, count: (from: Date) => Promise<number>, people: (from: Date) => Promise<number>): Promise<Count> {
  const [d7, d30, people30] = await Promise.all([count(since(7)), count(since(30)), people(since(30))]);
  return { label, d7, d30, people30 };
}
const distinct = async (rows: Promise<unknown[]>) => (await rows).length;

export async function featureUsage(): Promise<{ key: FeatureKey; enabled: boolean; metrics: Count[] }[]> {
  const switches = await db.featureSwitch.findMany();
  const on = (k: FeatureKey) => switches.find((s) => s.key === k)?.enabled ?? false;
  const metrics: Partial<Record<FeatureKey, Count[]>> = {
    learning: [await measure("Öğrenme olayı", (f) => db.learningEvent.count({ where: { createdAt: { gte: f } } }), (f) => distinct(db.learningEvent.findMany({ distinct: ["userId"], select: { userId: true }, where: { createdAt: { gte: f } } })))],
    labs: [await measure("Lab doğrulama", (f) => db.workshopAttempt.count({ where: { kind: "lab", createdAt: { gte: f } } }), (f) => distinct(db.workshopAttempt.findMany({ distinct: ["userId"], select: { userId: true }, where: { kind: "lab", createdAt: { gte: f } } })))],
    community: [await measure("Nöbet Masası kararı", (f) => db.socAttempt.count({ where: { createdAt: { gte: f } } }), (f) => distinct(db.socAttempt.findMany({ distinct: ["userId"], select: { userId: true }, where: { createdAt: { gte: f } } })))],
    study: [
      await measure("Çalışma oturumu", (f) => db.studySession.count({ where: { startedAt: { gte: f } } }), (f) => distinct(db.studySession.findMany({ distinct: ["userId"], select: { userId: true }, where: { startedAt: { gte: f } } }))),
      await measure("Ders sorusu", (f) => db.lessonQuestion.count({ where: { createdAt: { gte: f } } }), (f) => distinct(db.lessonQuestion.findMany({ distinct: ["userId"], select: { userId: true }, where: { createdAt: { gte: f } } }))),
      await measure("Çalışma arkadaşı ilanı", (f) => db.buddyPost.count({ where: { createdAt: { gte: f } } }), (f) => distinct(db.buddyPost.findMany({ distinct: ["userId"], select: { userId: true }, where: { createdAt: { gte: f } } }))),
    ],
    workshops: [await measure("Atölye denemesi", (f) => db.workshopAttempt.count({ where: { kind: { notIn: ["lab", "lab-session"] }, createdAt: { gte: f } } }), (f) => distinct(db.workshopAttempt.findMany({ distinct: ["userId"], select: { userId: true }, where: { kind: { notIn: ["lab", "lab-session"] }, createdAt: { gte: f } } })))],
    "teacher-plus": [
      await measure("İçerik onay kararı", (f) => db.contentReview.count({ where: { createdAt: { gte: f } } }), async () => 0),
      await measure("Ön yoklama yanıtı", (f) => db.preClassAnswer.count({ where: { createdAt: { gte: f } } }), (f) => distinct(db.preClassAnswer.findMany({ distinct: ["userId"], select: { userId: true }, where: { createdAt: { gte: f } } }))),
    ],
    "club-ops": [
      await measure("Görüşme kaydı", (f) => db.officeHourBooking.count({ where: { createdAt: { gte: f } } }), (f) => distinct(db.officeHourBooking.findMany({ distinct: ["userId"], select: { userId: true }, where: { createdAt: { gte: f } } }))),
      await measure("Etkinlik katılımı", (f) => db.eventCheckIn.count({ where: { at: { gte: f } } }), (f) => distinct(db.eventCheckIn.findMany({ distinct: ["userId"], select: { userId: true }, where: { at: { gte: f } } }))),
    ],
  };
  return FEATURE_KEYS.filter((k) => metrics[k]).map((k) => ({ key: k, enabled: on(k), metrics: metrics[k]! }));
}
