import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { askQuestion, askSchema, listQuestions } from "@/server/study/lesson-qa";

type Context = { params: Promise<{ slug: string }> };
export const GET = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req);
  await requireFeature("study");
  return json({ questions: await listQuestions(actor, (await ctx.params).slug) });
});
export const POST = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  const q = await askQuestion(actor, (await ctx.params).slug, await readJson(req, askSchema));
  return json({ id: q.id }, { status: 201 });
});
