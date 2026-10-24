import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { levelsSchema, replaceLevels } from "@/server/xp/admin";

export const dynamic = "force-dynamic";

export const PUT = route(async (req) => {
  const { actor, ip } = await adminContext(req, { write: true });
  const { levels } = await readJson(req, z.object({ levels: levelsSchema }));
  await replaceLevels(actor, levels, ip);
  return json({ ok: true });
});
