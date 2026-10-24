import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { bulkApprove } from "@/server/classroom/assignments";

export const dynamic = "force-dynamic";

const idParam = z.string().min(1).max(40);

type Ctx = { params: Promise<{ id: string }> };

const body = z.object({ submissionIds: z.array(z.string().min(1).max(40)).min(1).max(200), feedback: z.string().trim().max(5000).default("") });

export const POST = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await memberContext(req, { write: true });
  const { submissionIds, feedback } = await readJson(req, body);
  return json(await bulkApprove(actor, idParam.parse((await params).id), submissionIds, feedback, ip));
});
