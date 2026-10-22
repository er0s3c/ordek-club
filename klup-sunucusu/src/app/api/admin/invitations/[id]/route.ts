import { z } from "zod";
import { json, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { revokeInvitation } from "@/server/invitations";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await adminContext(req, { write: true });
  await revokeInvitation(actor, z.string().min(1).max(64).parse((await params).id), ip);
  return json({ ok: true });
});
