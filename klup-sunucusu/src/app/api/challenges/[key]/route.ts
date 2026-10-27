import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { challengeSchema, decideChallenge, decisionSchema, submitChallenge } from "@/server/workshops/challenges";

type Context = { params: Promise<{ key: string }> };
// POST /api/challenges/<gösterim anahtarı>: öğrenci başvurusu · PATCH /api/challenges/<başvuru kimliği>: öğretmen kararı
export const POST = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("workshops");
  return json(await submitChallenge(actor, (await ctx.params).key, await readJson(req, challengeSchema)), { status: 201 });
});
export const PATCH = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await decideChallenge(actor, (await ctx.params).key, await readJson(req, decisionSchema));
  return json({ ok: true });
});
