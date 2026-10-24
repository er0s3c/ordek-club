import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { submitQuiz } from "@/server/academy/service";
import { slugParam } from "@/server/academy/params";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

const bodySchema = z.object({ answers: z.array(z.union([z.number().int().min(0).max(10), z.boolean(), z.null()])).max(50) });

export const POST = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req, { write: true });
  const { answers } = await readJson(req, bodySchema, 8 * 1024);
  return json(await submitQuiz(actor, slugParam.parse((await params).slug), answers));
});
