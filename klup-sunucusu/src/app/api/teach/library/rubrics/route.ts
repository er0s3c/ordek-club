import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { forbidden } from "@/server/errors";
import { canManageClassroom } from "@/server/auth/policy";
import { db } from "@/server/db";
import { rubricTemplateSchema } from "@/server/classroom/grading";

export const POST = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  if (!canManageClassroom(actor)) throw forbidden();
  const input = await readJson(req, rubricTemplateSchema);
  const r = await db.rubricTemplate.create({ data: { ownerId: actor.id, name: input.name, shared: input.shared, rubric: input.rubric } });
  return json({ id: r.id }, { status: 201 });
});
