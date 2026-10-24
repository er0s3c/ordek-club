import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { checkMissionStep } from "@/server/academy/service";
import { slugParam } from "@/server/academy/params";
import { stepAnswerSchema } from "@/server/academy/missions";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string; id: string }> };

const bodySchema = z.object({ step: z.number().int().min(0).max(10), answer: stepAnswerSchema, hints: z.number().int().min(0).max(20).default(0) });

// Adım başına geri bildirim (durumsuz puanlama, hız sınırlı). Doğru cevap anahtarı yanıtta yer almaz.
export const POST = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req, { write: true });
  const p = await params;
  const b = await readJson(req, bodySchema, 4 * 1024);
  return json(await checkMissionStep(actor, slugParam.parse(p.slug), slugParam.parse(p.id), b.step, b.answer, b.hints));
});
