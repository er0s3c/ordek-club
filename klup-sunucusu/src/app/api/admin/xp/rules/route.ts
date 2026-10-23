import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { rulesSchema, updateRules } from "@/server/xp/admin";

export const dynamic = "force-dynamic";

export const PATCH = route(async (req) => {
  const { actor, ip } = await adminContext(req, { write: true });
  const { rules } = await readJson(req, z.object({ rules: rulesSchema }));
  await updateRules(actor, rules, ip);
  return json({ ok: true });
});
