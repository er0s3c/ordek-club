import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { answerPrecheck } from "@/server/teaching/precheck";

type Context = { params: Promise<{ id: string }> };
export const POST = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("teacher-plus");
  const { answers } = await readJson(req, z.object({ answers: z.array(z.number().int()).max(3) }));
  await answerPrecheck(actor, (await ctx.params).id, answers);
  return json({ ok: true });
});
