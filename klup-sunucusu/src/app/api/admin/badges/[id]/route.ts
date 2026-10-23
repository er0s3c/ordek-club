import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { setBadgeActive } from "@/server/xp/admin";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await adminContext(req, { write: true });
  const { active } = await readJson(req, z.object({ active: z.boolean() }));
  await setBadgeActive(actor, z.string().min(1).max(64).parse((await params).id), active, ip);
  return json({ ok: true });
});
