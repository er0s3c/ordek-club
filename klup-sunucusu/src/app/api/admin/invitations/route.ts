import { json, readJson, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { createInvitation, listInvitations } from "@/server/invitations";
import { invitationCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  await adminContext(req);
  return json({ items: await listInvitations() });
});

export const POST = route(async (req) => {
  const { actor, ip } = await adminContext(req, { write: true });
  const input = await readJson(req, invitationCreateSchema);
  return json(await createInvitation(actor, input, ip), { status: 201 });
});
