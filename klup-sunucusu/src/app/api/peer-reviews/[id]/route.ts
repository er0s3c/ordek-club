import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { peerSchema, submitPeerReview } from "@/server/classroom/extensions";

type Context = { params: Promise<{ id: string }> };
export const POST = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  const xp = await submitPeerReview(actor, (await ctx.params).id, await readJson(req, peerSchema));
  return json({ xp });
});
