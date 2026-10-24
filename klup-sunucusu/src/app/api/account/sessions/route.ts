import { json, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { listSessions, revokeOtherSessions } from "@/server/auth/account";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const { actor, session } = await memberContext(req);
  return json({ items: await listSessions(actor, session.sessionId) });
});

// Bu cihaz dışındaki tüm oturumları kapatır.
export const DELETE = route(async (req) => {
  const { actor, session, ip } = await memberContext(req, { write: true });
  await revokeOtherSessions(actor, session.sessionId, ip);
  return json({ ok: true });
});
