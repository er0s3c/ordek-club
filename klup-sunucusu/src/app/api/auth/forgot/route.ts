import { z } from "zod";
import { clientIp, json, readJson, route } from "@/server/http";
import { requestPasswordReset } from "@/server/auth/account";

export const dynamic = "force-dynamic";

// Yanıt her zaman aynı: hesap var mı yok mu belli edilmez.
export const POST = route(async (req) => {
  const { identifier } = await readJson(req, z.object({ identifier: z.string().trim().min(1).max(254) }));
  await requestPasswordReset(identifier, clientIp(req));
  return json({ ok: true });
});
