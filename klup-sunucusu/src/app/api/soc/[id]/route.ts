import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { setScenarioStatus } from "@/server/learning/soc-scenarios";

type Context = { params: Promise<{ id: string }> };
export const PATCH = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("community");
  const { status } = await readJson(req, z.object({ status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]) }));
  await setScenarioStatus(actor, (await ctx.params).id, status);
  return json({ ok: true });
});
