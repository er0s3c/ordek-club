import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { decideExtension, decisionSchema } from "@/server/classroom/extensions";

type Context = { params: Promise<{ id: string }> };
export const PATCH = route<Context>(async (req, ctx) => {
  const { actor, ip } = await memberContext(req, { write: true });
  await decideExtension(actor, (await ctx.params).id, await readJson(req, decisionSchema), ip);
  return json({ ok: true });
});
