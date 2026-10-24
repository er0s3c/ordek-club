import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { assignmentInputSchema, deleteAssignment, getAssignmentForStaff, updateAssignment } from "@/server/classroom/assignments";

export const dynamic = "force-dynamic";

const idParam = z.string().min(1).max(40);

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req);
  return json(await getAssignmentForStaff(actor, idParam.parse((await params).id)));
});

export const PUT = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await memberContext(req, { write: true });
  const input = await readJson(req, assignmentInputSchema);
  await updateAssignment(actor, idParam.parse((await params).id), input, ip);
  return json({ ok: true });
});

export const DELETE = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await memberContext(req, { write: true });
  await deleteAssignment(actor, idParam.parse((await params).id), ip);
  return json({ ok: true });
});
