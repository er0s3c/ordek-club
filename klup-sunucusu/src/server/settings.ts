import type { ClubSettings } from "@prisma/client";
import { db } from "@/server/db";

// Ayarlar sık okunur; kısa ömürlü süreç içi önbellek (yazmada temizlenir).
const TTL_MS = 5_000;
const g = globalThis as unknown as { __clubSettings?: { at: number; value: ClubSettings } };

export async function getSettings(): Promise<ClubSettings> {
  const c = g.__clubSettings;
  if (c && Date.now() - c.at < TTL_MS) return c.value;
  const value = await db.clubSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  g.__clubSettings = { at: Date.now(), value };
  return value;
}

export function invalidateSettings() {
  g.__clubSettings = undefined;
}

export async function isSetupComplete(): Promise<boolean> {
  return (await getSettings()).setupCompletedAt !== null;
}

// İstemciye gönderilebilecek, hassas alan içermeyen görünüm.
export function publicSettings(s: ClubSettings) {
  return {
    clubName: s.clubName,
    description: s.description,
    universityName: s.universityName,
    hasLogo: Boolean(s.logoFile),
    logoVersion: s.logoUpdatedAt?.getTime() ?? 0,
    theme: s.theme,
    locale: s.locale,
    registrationPolicy: s.registrationPolicy,
    setupComplete: s.setupCompletedAt !== null,
  };
}
export type PublicSettings = ReturnType<typeof publicSettings>;
