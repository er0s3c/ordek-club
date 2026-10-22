import { clientIp, json, readJson, route } from "@/server/http";
import { changePasswordSchema } from "@/lib/validation";
import { requireSession } from "@/server/auth/guard";
import { changePassword } from "@/server/auth/service";

export const dynamic = "force-dynamic";

export const POST = route(async (req) => {
  const s = await requireSession(req);
  const input = await readJson(req, changePasswordSchema);
  await changePassword(s, input.currentPassword, input.newPassword, { ip: clientIp(req), userAgent: req.headers.get("user-agent") });
  return json({ ok: true });
});
