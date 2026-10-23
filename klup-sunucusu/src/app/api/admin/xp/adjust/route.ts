import { json, readJson, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { adjustSchema, adjustXp } from "@/server/xp/admin";
import { evaluateBadges } from "@/server/xp/badges";

export const dynamic = "force-dynamic";

// Elle puan düzeltme: gerekçe zorunlu, işlem ayrı kayıt olarak yazılır ve audit log'a düşer.
export const POST = route(async (req) => {
  const { actor, ip } = await adminContext(req, { write: true });
  const t = await adjustXp(actor, await readJson(req, adjustSchema), ip);
  await evaluateBadges(t.userId);
  return json({ id: t.id }, { status: 201 });
});
