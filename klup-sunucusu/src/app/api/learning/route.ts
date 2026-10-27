import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { db } from "@/server/db";
import { notFound } from "@/server/errors";
import { requireFeature } from "@/server/learning/features";
import { civilDay, preference, preferenceSchema, workspace, answerReview } from "@/server/learning/service";
const action = z.discriminatedUnion("action", [
  z.object({ action: z.literal("preferences"), value: preferenceSchema }),
  z.object({ action: z.literal("plan"), title: z.string().trim().min(2).max(160), day: civilDay }),
  z.object({ action: z.literal("plan.update"), id: z.string(), completed: z.boolean() }),
  z.object({ action: z.literal("plan.delete"), id: z.string() }),
  z.object({ action: z.literal("review"), id: z.string(), answer: z.number().int().min(0).max(50), version: z.number().int().min(0) }),
]);
export const GET = route(async req => { const { actor } = await memberContext(req); await requireFeature("learning"); return json(await workspace(actor)); });
export const POST = route(async req => {
  const { actor } = await memberContext(req, { write: true }); await requireFeature("learning");
  const input = await readJson(req, action);
  if (input.action === "preferences") { await preference(actor.id); await db.learningPreference.update({ where: { userId: actor.id }, data: input.value }); }
  if (input.action === "plan") await db.learningPlan.create({ data: { userId: actor.id, title: input.title, day: input.day } });
  if (input.action === "plan.update") { const r = await db.learningPlan.updateMany({ where: { id: input.id, userId: actor.id }, data: { completed: input.completed } }); if (!r.count) throw notFound(); }
  if (input.action === "plan.delete") { const r = await db.learningPlan.deleteMany({ where: { id: input.id, userId: actor.id } }); if (!r.count) throw notFound(); }
  if (input.action === "review") return json(await answerReview(actor, input.id, input.answer, input.version));
  return json({ ok: true });
});
