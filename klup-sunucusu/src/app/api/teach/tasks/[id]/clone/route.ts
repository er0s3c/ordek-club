import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { cloneAssignment, cloneSchema } from "@/server/classroom/grading";

type Context = { params: Promise<{ id: string }> };
export const POST = route<Context>(async (req, ctx) => {
  const { actor, ip } = await memberContext(req, { write: true });
  const c = await cloneAssignment(actor, (await ctx.params).id, await readJson(req, cloneSchema), ip);
  return json({ id: c.id }, { status: 201 });
});
