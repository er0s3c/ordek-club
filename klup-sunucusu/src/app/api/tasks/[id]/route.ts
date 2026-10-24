import { z } from "zod";
import { json, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { getAssignmentForStudent } from "@/server/classroom/assignments";

export const dynamic = "force-dynamic";

const idParam = z.string().min(1).max(40);

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req);
  return json(await getAssignmentForStudent(actor, idParam.parse((await params).id)));
});
