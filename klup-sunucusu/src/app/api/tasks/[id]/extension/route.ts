import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { extensionSchema, requestExtension } from "@/server/classroom/extensions";

type Context = { params: Promise<{ id: string }> };
export const POST = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  const r = await requestExtension(actor, (await ctx.params).id, await readJson(req, extensionSchema));
  return json({ id: r.id }, { status: 201 });
});
