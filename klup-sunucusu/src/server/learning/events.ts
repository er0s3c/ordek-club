import type { Prisma } from "@prisma/client";
import { getSettings } from "@/server/settings";
import { dayKey } from "@/server/xp/time";
export async function recordLearning(tx: Prisma.TransactionClient, userId: string, key: string, kind: string, at = new Date()) {
  const { timezone } = await getSettings();
  const day = dayKey(at, timezone);
  const inserted = await tx.learningEvent.createMany({ data: [{ userId, key, kind, day, createdAt: at }], skipDuplicates: true });
  if (inserted.count) await tx.activityDay.createMany({ data: [{ userId, day }], skipDuplicates: true });
}

