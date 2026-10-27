import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { issueUpdateSchema, updateIssue } from "@/server/issues";

type Context = { params: Promise<{ id: string }> };
export const PATCH = route<Context>(async (req, ctx) => {
  const { actor, ip } = await memberContext(req, { write: true });
  await updateIssue(actor, (await ctx.params).id, await readJson(req, issueUpdateSchema), ip);
  return json({ ok: true });
});
