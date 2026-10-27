import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { cardSchema, createCard } from "@/server/study/sessions";

export const POST = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("study");
  const c = await createCard(actor, await readJson(req, cardSchema));
  return json({ id: c.id }, { status: 201 });
});
