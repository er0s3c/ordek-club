import { z } from "zod";
import { adminContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { badRequest } from "@/server/errors";
import { FEATURE_KEYS, AVAILABLE_FEATURE_KEYS } from "@/server/learning/features";
import { labConfigurationStatus, labHealth } from "@/server/learning/lab-client";
export const PATCH = route(async req => {
  const { actor, ip } = await adminContext(req, { write: true });
  const input = await readJson(req, z.object({ key: z.enum(FEATURE_KEYS), enabled: z.boolean() }));
  if (!AVAILABLE_FEATURE_KEYS.includes(input.key)) throw badRequest("Bu paket henüz teslim edilmedi.");
  if (input.key === "labs" && input.enabled && !labConfigurationStatus().configured) throw badRequest("Linux lab bağlantı kurulumu tamamlanmadan bu özellik açılamaz. Yönetim ekranındaki kurulum durumunu kontrol et.", "LAB_NOT_CONFIGURED");
  if (input.key === "labs" && input.enabled) await labHealth();
  await db.$transaction(async tx => {
    const current = await tx.featureSwitch.findUnique({ where: { key: input.key } });
    await tx.featureSwitch.upsert({ where: { key: input.key }, create: { ...input, enabledAt: input.enabled ? new Date() : null }, update: { enabled: input.enabled, ...(input.enabled && !current?.enabledAt ? { enabledAt: new Date() } : {}) } });
    await audit({ actorId: actor.id, action: "feature.update", targetType: "FeatureSwitch", targetId: input.key, meta: input, ip }, tx);
  });
  return json({ ok: true });
});
