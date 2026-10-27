import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { notFound } from "@/server/errors";
import { requireFeature } from "@/server/learning/features";
import { submitFlag } from "@/server/ctf/service";

type Ctx = { params: Promise<{ key: string }> };

// Bayrak gönderimi: görev ve kullanıcı başına dakikada 8 deneme.
export const POST = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("community");
  const { key } = await params;
  if (!/^[a-z0-9-]{1,40}$/.test(key)) throw notFound();
  const { flag } = await readJson(req, z.object({ flag: z.string().max(200) }), 4 * 1024);
  return json(await submitFlag(actor, key, flag));
});
