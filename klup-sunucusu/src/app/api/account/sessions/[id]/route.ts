import { z } from "zod";
import { json, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { revokeSession } from "@/server/auth/account";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const DELETE = route<Ctx>(async (req, { params }) => {
  const { actor, session, ip } = await memberContext(req, { write: true });
  await revokeSession(actor, z.string().min(1).max(40).parse((await params).id), session.sessionId, ip);
  return json({ ok: true });
});
