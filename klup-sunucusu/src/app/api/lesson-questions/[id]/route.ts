import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { answerQuestion, answerSchema, moderateQuestion, moderateSchema } from "@/server/study/lesson-qa";

type Context = { params: Promise<{ id: string }> };
// POST: yanıt yaz · PATCH: gizle/göster/çözüldü/yanıtı kabul et
export const POST = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  const a = await answerQuestion(actor, (await ctx.params).id, await readJson(req, answerSchema));
  return json({ id: a.id }, { status: 201 });
});
export const PATCH = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  await moderateQuestion(actor, (await ctx.params).id, await readJson(req, moderateSchema));
  return json({ ok: true });
});
