import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { db } from "@/server/db";
import { preference } from "@/server/learning/service";

// Okuma ve erişilebilirlik tercihleri (özellik anahtarından bağımsız, herkes için).
const a11ySchema = z.object({ fontScale: z.number().int().min(85).max(150), lineHeight: z.enum(["compact", "normal", "relaxed"]), readableFont: z.boolean(), highContrast: z.boolean(), reduceMotion: z.boolean() });
export const PUT = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  const input = await readJson(req, a11ySchema);
  await preference(actor.id);
  await db.learningPreference.update({ where: { userId: actor.id }, data: input });
  return json({ ok: true });
});
