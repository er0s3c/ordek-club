import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { deleteCard, reviewCard } from "@/server/study/sessions";

type Context = { params: Promise<{ id: string }> };
export const POST = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  const { remembered } = await readJson(req, z.object({ remembered: z.boolean() }));
  const c = await reviewCard(actor, (await ctx.params).id, remembered);
  return json({ dueAt: c.dueAt.toISOString(), closed: c.closed });
});
export const DELETE = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  await deleteCard(actor, (await ctx.params).id);
  return json({ ok: true });
});
