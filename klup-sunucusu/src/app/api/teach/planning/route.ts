import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { badRequest, forbidden } from "@/server/errors";
import { canManageClassroom } from "@/server/auth/policy";
import { requireFeature } from "@/server/learning/features";
import { db } from "@/server/db";
import { createIntervention, interventionSchema, planSchema, savePlan, suggestTeams } from "@/server/teaching/insights";
import { createPrecheck, precheckSchema } from "@/server/teaching/precheck";
import { createGoal, goalSchema } from "@/server/community/goals";
import { assignmentInputSchema, createAssignment } from "@/server/classroom/assignments";
import { questionSchema } from "@/server/classroom/autograde";

// Öğretmen planlama işlemleri tek uçta, eylem adına göre: radar müdahalesi, dönem planı, takım önerisi,
// ders öncesi yoklama, kulüp ortak hedefi ve soru bankasından rastgele quiz formu.
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("intervention"), data: interventionSchema }),
  z.object({ action: z.literal("plan"), data: planSchema }),
  z.object({ action: z.literal("teams"), groupId: z.string().min(1).max(40), size: z.number().int().min(2).max(8), mode: z.enum(["random", "balanced"]) }),
  z.object({ action: z.literal("precheck"), data: precheckSchema }),
  z.object({ action: z.literal("goal"), data: goalSchema }),
  z.object({ action: z.literal("quizform"), title: z.string().trim().min(3).max(140), skill: z.string().max(30).nullable().default(null), difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).nullable().default(null), count: z.number().int().min(1).max(30), groupId: z.string().max(40).nullable().default(null) }),
]);

export const POST = route(async (req) => {
  const { actor, ip } = await memberContext(req, { write: true });
  if (!canManageClassroom(actor)) throw forbidden();
  await requireFeature("teacher-plus");
  const input = await readJson(req, schema, 128 * 1024);
  switch (input.action) {
    case "intervention": return json({ id: (await createIntervention(actor, input.data)).id }, { status: 201 });
    case "plan": return json({ id: (await savePlan(actor, input.data)).id });
    case "teams": return json({ teams: await suggestTeams(actor, input.groupId, input.size, input.mode) });
    case "precheck": return json({ id: (await createPrecheck(actor, input.data)).id }, { status: 201 });
    case "goal": return json({ id: (await createGoal(actor, input.data)).id }, { status: 201 });
    case "quizform": {
      const qs = await db.bankQuestion.findMany({ where: { ...(input.skill ? { skill: input.skill } : {}), ...(input.difficulty ? { difficulty: input.difficulty } : {}) }, include: { revisions: { orderBy: { number: "desc" }, take: 1 } } });
      const pool = qs.map((q) => questionSchema.safeParse(q.revisions[0]?.content)).filter((r) => r.success).map((r) => r.data!);
      if (pool.length < input.count) throw badRequest(`Bu filtrede yalnız ${pool.length} uygun soru var.`);
      const quiz = [...pool].sort(() => Math.random() - 0.5).slice(0, input.count);
      const a = await createAssignment(actor, assignmentInputSchema.parse({ title: input.title, kind: "QUIZ", audience: input.groupId ? "GROUP" : "ALL", groupId: input.groupId, quiz, requireText: false, maxScore: 100, skills: input.skill ? [input.skill] : [] }), ip);
      return json({ id: a.id }, { status: 201 });
    }
  }
});
