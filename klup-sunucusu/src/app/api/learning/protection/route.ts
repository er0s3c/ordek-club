import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { civilDay, addExamProtection } from "@/server/learning/service";
export const POST = route(async req => {
  const { actor } = await memberContext(req, { write: true }); await requireFeature("learning");
  const input = await readJson(req, z.object({ groupId: z.string(), startsOn: civilDay, endsOn: civilDay }));
  return json(await addExamProtection(actor, input.groupId, input.startsOn, input.endsOn));
});
