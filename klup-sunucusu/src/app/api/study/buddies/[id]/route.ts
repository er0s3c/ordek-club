import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { moderatePost, replyPost } from "@/server/study/buddies";

type Context = { params: Promise<{ id: string }> };
export const POST = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  const { body } = await readJson(req, z.object({ body: z.string() }));
  const r = await replyPost(actor, (await ctx.params).id, body);
  return json({ id: r.id }, { status: 201 });
});
export const PATCH = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  const { action } = await readJson(req, z.object({ action: z.enum(["close", "flag", "hide", "show"]) }));
  await moderatePost(actor, (await ctx.params).id, action);
  return json({ ok: true });
});
