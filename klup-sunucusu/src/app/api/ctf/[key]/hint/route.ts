import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { notFound } from "@/server/errors";
import { requireFeature } from "@/server/learning/features";
import { unlockHint } from "@/server/ctf/service";

type Ctx = { params: Promise<{ key: string }> };

// İpucu açma: maliyeti CTF puanından düşülür (XP'den değil).
export const POST = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("community");
  const { key } = await params;
  if (!/^[a-z0-9-]{1,40}$/.test(key)) throw notFound();
  const { index } = await readJson(req, z.object({ index: z.number().int().min(0).max(5) }), 1024);
  return json(await unlockHint(actor, key, index));
});
