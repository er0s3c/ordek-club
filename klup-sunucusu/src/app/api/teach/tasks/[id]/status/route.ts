import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { setAssignmentStatus } from "@/server/classroom/assignments";

export const dynamic = "force-dynamic";

const idParam = z.string().min(1).max(40);

type Ctx = { params: Promise<{ id: string }> };

const body = z.object({ status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]) });

export const POST = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await memberContext(req, { write: true });
  const { status } = await readJson(req, body);
  await setAssignmentStatus(actor, idParam.parse((await params).id), status, ip);
  return json({ ok: true });
});
