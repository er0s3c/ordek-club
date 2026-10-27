import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { answerActivity } from "@/server/academy/activities";
import { slugParam } from "@/server/academy/params";
type Context = { params: Promise<{ slug: string }> };
export const POST = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  const input = await readJson(req, z.object({ activityId: z.string().regex(/^[a-z0-9-]{1,40}$/), hash: z.string().regex(/^[a-f0-9]{64}$/), locale: z.enum(["tr", "en"]), values: z.array(z.string().max(4000)).max(30) }));
  return json(await answerActivity(actor, slugParam.parse((await ctx.params).slug), input));
});
