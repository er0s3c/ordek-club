import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { reviewSchema, saveContentReview } from "@/server/teaching/content";

// İçerik onayı: aşama kararı (yazar / teknik / dil) güncel içerik sürümüne yazılır.
export const POST = route(async (req) => {
  const { actor, ip } = await memberContext(req, { write: true });
  await requireFeature("teacher-plus");
  const r = await saveContentReview(actor, await readJson(req, reviewSchema), ip);
  return json({ id: r.id }, { status: 201 });
});
