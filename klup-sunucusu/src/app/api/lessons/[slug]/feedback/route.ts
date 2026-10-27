import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { feedbackSchema, myFeedback, saveFeedback } from "@/server/study/lesson-qa";

type Context = { params: Promise<{ slug: string }> };
export const GET = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req);
  await requireFeature("study");
  return json({ feedback: await myFeedback(actor, (await ctx.params).slug) });
});
export const PUT = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  await saveFeedback(actor, (await ctx.params).slug, await readJson(req, feedbackSchema));
  return json({ ok: true });
});
