import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { setEmailNotifications } from "@/server/auth/account";

export const dynamic = "force-dynamic";

export const PATCH = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  const { emailNotifications } = await readJson(req, z.object({ emailNotifications: z.boolean() }));
  await setEmailNotifications(actor, emailNotifications);
  return json({ ok: true });
});
