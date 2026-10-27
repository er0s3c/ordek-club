import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { decideScenario, saveScenario, scenarioSchema } from "@/server/learning/soc-scenarios";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("save"), id: z.string().max(40).nullable(), data: scenarioSchema }),
  z.object({ action: z.literal("decide"), id: z.string().max(40), level: z.enum(["easy", "medium", "hard"]), alertId: z.string().max(30), decision: z.enum(["benign", "investigate", "contain"]) }),
]);
export const POST = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("community");
  const input = await readJson(req, schema, 128 * 1024);
  if (input.action === "save") return json({ id: (await saveScenario(actor, input.id, input.data)).id });
  return json(await decideScenario(actor, input.id, input.level, input.alertId, input.decision));
});
