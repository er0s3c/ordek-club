import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { transferOwnership } from "@/server/auth/account";
import { passwordSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const POST = route(async (req) => {
  const { actor, ip } = await adminContext(req, { write: true });
  const { username, password } = await readJson(req, z.object({ username: z.string().trim().toLowerCase().min(1).max(40), password: passwordSchema }));
  await transferOwnership(actor, username, password, ip);
  return json({ ok: true });
});
