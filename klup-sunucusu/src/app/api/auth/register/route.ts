import { clientIp, json, readJson, route } from "@/server/http";
import { registerSchema } from "@/lib/validation";
import { register } from "@/server/auth/service";
import { sessionCookieHeader } from "@/server/auth/session";

export const dynamic = "force-dynamic";

export const POST = route(async (req) => {
  const input = await readJson(req, registerSchema);
  const result = await register(input, { ip: clientIp(req), userAgent: req.headers.get("user-agent") });
  if (result.status === "ACTIVE") {
    return json(
      { status: "ACTIVE" },
      { status: 201, headers: { "Set-Cookie": sessionCookieHeader(result.session.token, result.session.expiresAt) } },
    );
  }
  return json({ status: "PENDING" }, { status: 201 });
});
