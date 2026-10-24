import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { createGroup, groupInputSchema, listGroups } from "@/server/classroom/groups";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  return json({ items: await listGroups(actor) });
});

export const POST = route(async (req) => {
  const { actor, ip } = await memberContext(req, { write: true });
  const g = await createGroup(actor, await readJson(req, groupInputSchema), ip);
  return json({ id: g.id }, { status: 201 });
});
