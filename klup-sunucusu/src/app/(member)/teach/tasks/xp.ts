import { db } from "@/server/db";
import { ensureGamificationDefaults } from "@/server/xp/defaults";
import { XP_RULES } from "@/server/classroom/assignments";

// Görev formunda XP kurallarının güncel değerleri.
export async function taskXpDefaults() {
  await ensureGamificationDefaults();
  const rows = await db.xpRewardRule.findMany({ where: { key: { in: [...XP_RULES] } }, select: { key: true, amount: true, enabled: true } });
  return Object.fromEntries(rows.map((r) => [r.key, r.enabled ? r.amount : 0]));
}
