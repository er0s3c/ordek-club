import { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { notFound } from "@/server/errors";
export const FEATURE_KEYS = ["learning", "academy-v2", "teacher-tools", "operations", "ai", "labs", "community", "study", "workshops", "teacher-plus", "club-ops"] as const;
export type FeatureKey = typeof FEATURE_KEYS[number];
let warnedMissingTable = false;
export async function featureSwitch(key: FeatureKey) {
  try {
    return await db.featureSwitch.findUnique({ where: { key } });
  } catch (error) {
    // Eski şemada yeni özellikler kapalı kalır; bağlantı ve diğer şema hataları gizlenmez.
    if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2021" || error.meta?.table !== "public.FeatureSwitch") throw error;
    if (!warnedMissingTable) {
      console.warn("[club] FeatureSwitch tablosu eksik. klup-sunucusu içinde npm run db:migrate çalıştırın; yeni özellikler kapalı tutuluyor.");
      warnedMissingTable = true;
    }
    return null;
  }
}
export async function featureEnabled(key: FeatureKey) {
  return (await featureSwitch(key))?.enabled ?? false;
}
export async function requireFeature(key: FeatureKey) {
  if (!await featureEnabled(key)) throw notFound("Bu özellik henüz kullanıma açılmadı.");
}

export async function enabledFeatures(keys: readonly FeatureKey[]) {
  const rows = await Promise.all(keys.map(featureEnabled));
  return Object.fromEntries(keys.map((k, i) => [k, rows[i]])) as Record<FeatureKey, boolean>;
}

export const AVAILABLE_FEATURE_KEYS: readonly FeatureKey[] = ["learning", "labs", "academy-v2", "teacher-tools", "operations", "community", "study", "workshops", "teacher-plus", "club-ops"];
