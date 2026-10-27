import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { saveTranslationReview, translationReviewSchema } from "@/server/teaching/translations";

// Çeviri incelemesi: dil veya teknik aşamada onay/geri gönderme. Karar veritabanında tutulur ve
// içerik değişmedikçe academy-import tarafından korunur.
export const POST = route(async (req) => {
  const { actor, ip } = await memberContext(req, { write: true });
  await requireFeature("teacher-plus");
  const r = await saveTranslationReview(actor, await readJson(req, translationReviewSchema), ip);
  return json(r);
});
