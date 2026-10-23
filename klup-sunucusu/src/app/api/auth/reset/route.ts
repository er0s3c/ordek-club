import { z } from "zod";
import { clientIp, json, readJson, route } from "@/server/http";
import { resetPassword } from "@/server/auth/account";
import { passwordSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const POST = route(async (req) => {
  const { token, password } = await readJson(req, z.object({ token: z.string().max(100), password: passwordSchema }));
  await resetPassword(token, password, clientIp(req));
  return json({ ok: true });
});
