import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { saveTerm } from "@/server/study/sessions";

const schema = z.object({ termId: z.string().regex(/^[a-z0-9-]{1,40}$/), saved: z.boolean().default(true) });
export const POST = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  const { termId, saved } = await readJson(req, schema);
  await saveTerm(actor, termId, saved);
  return json({ ok: true });
});
