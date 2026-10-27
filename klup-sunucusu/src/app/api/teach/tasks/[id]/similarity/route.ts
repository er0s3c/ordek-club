import { memberContext } from "@/server/api-auth";
import { json, route } from "@/server/http";
import { similarity } from "@/server/classroom/grading";

type Context = { params: Promise<{ id: string }> };
export const GET = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req);
  return json(await similarity(actor, (await ctx.params).id));
});
