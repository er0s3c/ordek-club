import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { notFound } from "@/server/errors";
import { requireFeature } from "@/server/learning/features";
import { submitWorkshop, WORKSHOP_KINDS, type WorkshopKind } from "@/server/workshops/service";
import { z } from "zod";

type Context = { params: Promise<{ kind: string; key: string }> };
export const POST = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("workshops");
  const { kind, key } = await ctx.params;
  if (!(WORKSHOP_KINDS as readonly string[]).includes(kind) || !/^[a-z0-9-]{1,40}$/.test(key)) throw notFound();
  const { payload } = await readJson(req, z.object({ payload: z.unknown() }), 32 * 1024);
  return json(await submitWorkshop(actor, kind as WorkshopKind, key, payload));
});
