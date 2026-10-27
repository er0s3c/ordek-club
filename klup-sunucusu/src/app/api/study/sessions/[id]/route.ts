import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { abandonSession, finishSchema, finishSession } from "@/server/study/sessions";

type Context = { params: Promise<{ id: string }> };
// POST: süre sonunda değerlendirme · DELETE: erken sonlandır (değerlendirme ve ödül yok)
export const POST = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  return json(await finishSession(actor, (await ctx.params).id, await readJson(req, finishSchema)));
});
export const DELETE = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  await abandonSession(actor, (await ctx.params).id);
  return json({ ok: true });
});
