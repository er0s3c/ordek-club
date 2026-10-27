// Kulüp ortak hedefi: herkesin doğrulanmış çalışması birlikte sayılır; bireysel sıralama gösterilmez.
import { z } from "zod";
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import { dayKey } from "@/server/xp/time";
import { forbidden } from "@/server/errors";
import { canManageClassroom, type Actor } from "@/server/auth/policy";
import { civilDay } from "@/server/learning/service";

export const goalSchema = z.object({
  title: z.string().trim().min(3).max(120),
  metric: z.enum(["LESSONS", "LABS", "STUDY_MINUTES"]),
  target: z.number().int().min(1).max(1_000_000),
  startsOn: civilDay,
  endsOn: civilDay,
}).refine((g) => g.startsOn <= g.endsOn, { message: "Bitiş tarihi başlangıçtan önce olamaz.", path: ["endsOn"] });

export async function createGoal(actor: Actor, input: z.output<typeof goalSchema>) {
  if (!canManageClassroom(actor)) throw forbidden("Kulüp hedefini eğitmenler belirler.");
  return db.clubGoal.create({ data: { ...input, createdById: actor.id } });
}

export async function clubGoalProgress(now = new Date()) {
  const { timezone } = await getSettings();
  const today = dayKey(now, timezone);
  const goals = await db.clubGoal.findMany({ where: { startsOn: { lte: today }, endsOn: { gte: today } }, orderBy: { endsOn: "asc" }, take: 3 });
  return Promise.all(goals.map(async (g) => {
    const range = { gte: g.startsOn, lte: g.endsOn };
    const value =
      g.metric === "LESSONS" ? await db.learningEvent.count({ where: { kind: "lesson", day: range } })
      : g.metric === "LABS" ? await db.learningEvent.count({ where: { kind: { in: ["lab", "workshop"] }, day: range } })
      : (await db.studySession.aggregate({ where: { status: "DONE", startedAt: { gte: new Date(`${g.startsOn}T00:00:00Z`), lte: new Date(`${g.endsOn}T23:59:59Z`) } }, _sum: { minutes: true } }))._sum.minutes ?? 0;
    return { id: g.id, title: g.title, metric: g.metric, target: g.target, endsOn: g.endsOn, value, pct: Math.min(100, Math.round((value / g.target) * 100)) };
  }));
}
