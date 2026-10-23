import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { reviewSchema, reviewSubmission } from "@/server/classroom/assignments";

export const dynamic = "force-dynamic";

const idParam = z.string().min(1).max(40);

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await memberContext(req, { write: true });
  const input = await readJson(req, reviewSchema);
  return json(await reviewSubmission(actor, idParam.parse((await params).id), input, ip));
});
