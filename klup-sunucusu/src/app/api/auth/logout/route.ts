import { clientIp, json, route } from "@/server/http";
import {
  SESSION_COOKIE, clearSessionCookieHeader, readCookie, revokeSessionToken, validateSessionToken,
} from "@/server/auth/session";
import { audit } from "@/server/audit";

export const dynamic = "force-dynamic";

export const POST = route(async (req) => {
  const token = readCookie(req.headers.get("cookie"), SESSION_COOKIE);
  const s = await validateSessionToken(token);
  await revokeSessionToken(token);
  if (s) await audit({ actorId: s.user.id, action: "auth.logout", targetType: "User", targetId: s.user.id, ip: clientIp(req) });
  return json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookieHeader() } });
});
