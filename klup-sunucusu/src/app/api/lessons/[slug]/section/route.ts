import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { saveSection } from "@/server/study/lesson-qa";

type Context = { params: Promise<{ slug: string }> };
export const PUT = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  const { sectionId } = await readJson(req, z.object({ sectionId: z.string().max(60) }));
  await saveSection(actor, (await ctx.params).slug, sectionId);
  return json({ ok: true });
});
