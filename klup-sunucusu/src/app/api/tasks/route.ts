import { json, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { listAssignmentsForStudent } from "@/server/classroom/assignments";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  return json({ items: await listAssignmentsForStudent(actor) });
});
