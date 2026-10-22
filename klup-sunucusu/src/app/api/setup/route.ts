import { clientIp, json, readJson, route } from "@/server/http";
import { setupSchema } from "@/lib/validation";
import { completeSetup } from "@/server/setup";
import { isSetupComplete } from "@/server/settings";
import { createSession, sessionCookieHeader } from "@/server/auth/session";
import { LIMITS, hit } from "@/server/rate-limit";
import { tooMany } from "@/server/errors";

export const dynamic = "force-dynamic";

export const GET = route(async () => json({ setupComplete: await isSetupComplete() }));

export const POST = route(async (req) => {
  const ip = clientIp(req);
  const [max, win] = LIMITS.setupPerIp;
  const r = hit(`setup:ip:${ip}`, max, win);
  if (!r.ok) throw tooMany(r.retryAfterSec);

  const input = await readJson(req, setupSchema);
  const owner = await completeSetup(input, ip);
  const { token, expiresAt } = await createSession(owner.id, req.headers.get("user-agent"));
  return json({ ok: true }, { status: 201, headers: { "Set-Cookie": sessionCookieHeader(token, expiresAt) } });
});
