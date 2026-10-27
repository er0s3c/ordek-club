import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { goalSchema, saveGoal } from "@/server/study/sessions";
import { db } from "@/server/db";

export const PUT = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  await saveGoal(actor, await readJson(req, goalSchema));
  return json({ ok: true });
});
export const DELETE = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  await db.studyGoal.deleteMany({ where: { userId: actor.id } });
  return json({ ok: true });
});
