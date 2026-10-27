import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { badRequest } from "@/server/errors";
import { requireFeature } from "@/server/learning/features";
import { createMisconception, deleteMisconception, misconceptionSchema } from "@/server/teaching/content";

export const POST = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("teacher-plus");
  const m = await createMisconception(actor, await readJson(req, misconceptionSchema));
  return json({ id: m.id }, { status: 201 });
});
export const DELETE = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) throw badRequest("Kimlik eksik.");
  await deleteMisconception(actor, id);
  return json({ ok: true });
});
