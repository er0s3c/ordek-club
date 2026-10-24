import { json, readJson, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { badgeSchema, createBadge } from "@/server/xp/admin";

export const dynamic = "force-dynamic";

export const POST = route(async (req) => {
  const { actor, ip } = await adminContext(req, { write: true });
  const b = await createBadge(actor, await readJson(req, badgeSchema), ip);
  return json({ id: b.id }, { status: 201 });
});
