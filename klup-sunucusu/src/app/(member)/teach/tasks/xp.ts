import { db } from "@/server/db";
import { ensureGamificationDefaults } from "@/server/xp/defaults";
import { XP_RULES } from "@/server/classroom/assignments";
import { groupOptions } from "@/server/classroom/groups";

// Görev formunda XP kurallarının güncel değerleri.
export async function taskXpDefaults() {
  await ensureGamificationDefaults();
  const rows = await db.xpRewardRule.findMany({ where: { key: { in: [...XP_RULES] } }, select: { key: true, amount: true, enabled: true } });
  return Object.fromEntries(rows.map((r) => [r.key, r.enabled ? r.amount : 0]));
}

// Görev formundaki sınıf/etkinlik seçenekleri.
export async function taskGroupOptions() {
  return (await groupOptions()).map((g) => ({ id: g.id, name: g.name, kind: g.kind, members: g._count.members }));
}
