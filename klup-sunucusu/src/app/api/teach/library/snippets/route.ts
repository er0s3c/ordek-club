import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { forbidden } from "@/server/errors";
import { canManageClassroom } from "@/server/auth/policy";
import { db } from "@/server/db";
import { library, snippetSchema } from "@/server/classroom/grading";

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  return json(await library(actor));
});
export const POST = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  if (!canManageClassroom(actor)) throw forbidden();
  const s = await db.commentSnippet.create({ data: { ownerId: actor.id, ...(await readJson(req, snippetSchema)) } });
  return json({ id: s.id }, { status: 201 });
});
