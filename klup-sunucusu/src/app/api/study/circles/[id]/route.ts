import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { joinCircle, savePlan } from "@/server/study/buddies";

type Context = { params: Promise<{ id: string }> };
// PATCH: { join: boolean } katıl/ayrıl · PUT: { plan } ortak planı kaydet
export const PATCH = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  const { join } = await readJson(req, z.object({ join: z.boolean() }));
  await joinCircle(actor, (await ctx.params).id, join);
  return json({ ok: true });
});
export const PUT = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  const { plan } = await readJson(req, z.object({ plan: z.string() }));
  await savePlan(actor, (await ctx.params).id, plan);
  return json({ ok: true });
});
