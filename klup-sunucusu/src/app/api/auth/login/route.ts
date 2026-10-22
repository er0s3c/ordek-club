import { clientIp, json, readJson, route } from "@/server/http";
import { loginSchema } from "@/lib/validation";
import { login } from "@/server/auth/service";
import { sessionCookieHeader } from "@/server/auth/session";
import { isSetupComplete } from "@/server/settings";
import { HttpError } from "@/server/errors";

export const dynamic = "force-dynamic";

export const POST = route(async (req) => {
  if (!(await isSetupComplete())) throw new HttpError(503, "SETUP_REQUIRED", "Kurulum henüz tamamlanmadı.");
  const input = await readJson(req, loginSchema);
  const { user, session } = await login(input.login, input.password, {
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent"),
  });
  return json(
    { user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role } },
    { headers: { "Set-Cookie": sessionCookieHeader(session.token, session.expiresAt) } },
  );
});
