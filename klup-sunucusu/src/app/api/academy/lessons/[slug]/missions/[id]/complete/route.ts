import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { completeMission } from "@/server/academy/service";
import { slugParam } from "@/server/academy/params";
import { stepAnswerSchema } from "@/server/academy/missions";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string; id: string }> };

const bodySchema = z.object({ answers: z.array(stepAnswerSchema).max(10), hints: z.number().int().min(0).max(40).default(0) });

// Görevi tamamla: bütün cevaplar sunucuda yeniden puanlanır; XP görev başına bir kez.
export const POST = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req, { write: true });
  const p = await params;
  const b = await readJson(req, bodySchema, 8 * 1024);
  return json(await completeMission(actor, slugParam.parse(p.slug), slugParam.parse(p.id), b.answers, b.hints));
});
