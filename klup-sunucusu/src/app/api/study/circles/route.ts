import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { circleSchema, createCircle, listCircles } from "@/server/study/buddies";

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  await requireFeature("study");
  return json({ circles: await listCircles(actor) });
});
export const POST = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  const c = await createCircle(actor, await readJson(req, circleSchema));
  return json({ id: c.id }, { status: 201 });
});
