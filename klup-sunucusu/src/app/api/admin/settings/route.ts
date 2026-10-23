import { json, readJson, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { getSettings, invalidateSettings } from "@/server/settings";
import { settingsUpdateSchema } from "@/lib/validation";
import type { ClubSettings } from "@prisma/client";

export const dynamic = "force-dynamic";

// Kurulum anahtarı hash'i gibi iç alanlar istemciye gönderilmez.
function adminView(s: ClubSettings) {
  return {
    clubName: s.clubName,
    description: s.description,
    universityName: s.universityName,
    appUrl: s.appUrl,
    hasLogo: Boolean(s.logoFile),
    logoVersion: s.logoUpdatedAt?.getTime() ?? 0,
    locale: s.locale,
    timezone: s.timezone,
    registrationPolicy: s.registrationPolicy,
    maxUploadMb: s.maxUploadMb,
    storageQuotaMb: s.storageQuotaMb,
    userQuotaMb: s.userQuotaMb,
    sessionMaxAgeDays: s.sessionMaxAgeDays,
    sessionIdleHours: s.sessionIdleHours,
    setupCompletedAt: s.setupCompletedAt,
  };
}
export type AdminSettingsView = ReturnType<typeof adminView>;

export const GET = route(async (req) => {
  await adminContext(req);
  return json(adminView(await getSettings()));
});

export const PATCH = route(async (req) => {
  const { actor, ip } = await adminContext(req, { write: true });
  const input = await readJson(req, settingsUpdateSchema);
  const before = await getSettings();
  const updated = await db.$transaction(async (tx) => {
    const s = await tx.clubSettings.update({ where: { id: 1 }, data: input });
    const changed = Object.fromEntries(
      Object.entries(input).filter(([k, v]) => before[k as keyof ClubSettings] !== v).map(([k, v]) => [k, { from: before[k as keyof ClubSettings] as string | number, to: v }]),
    );
    await audit({ actorId: actor.id, action: "settings.update", targetType: "ClubSettings", targetId: "1", meta: changed, ip }, tx);
    return s;
  });
  invalidateSettings();
  return json(adminView(updated));
});
