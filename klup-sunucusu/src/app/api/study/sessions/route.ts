import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { startSchema, startSession, studyOverview } from "@/server/study/sessions";

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  await requireFeature("study");
  return json(await studyOverview(actor));
});
export const POST = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  const s = await startSession(actor, await readJson(req, startSchema));
  return json({ id: s.id, endsAt: s.endsAt.toISOString() }, { status: 201 });
});
