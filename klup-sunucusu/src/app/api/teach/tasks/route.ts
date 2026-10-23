import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { assignmentInputSchema, createAssignment, listAssignmentsForStaff } from "@/server/classroom/assignments";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  return json({ items: await listAssignmentsForStaff(actor) });
});

export const POST = route(async (req) => {
  const { actor, ip } = await memberContext(req, { write: true });
  const input = await readJson(req, assignmentInputSchema);
  const a = await createAssignment(actor, input, ip);
  return json({ id: a.id }, { status: 201 });
});
