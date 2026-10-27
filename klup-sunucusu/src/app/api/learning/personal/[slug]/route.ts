import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { db } from "@/server/db";
import { conflict } from "@/server/errors";
import { requireFeature } from "@/server/learning/features";
import { personalLesson } from "@/server/learning/service";
type Context = { params: Promise<{ slug: string }> };
export const GET = route<Context>(async (req, ctx) => { const { actor } = await memberContext(req); await requireFeature("learning"); return json(await personalLesson(actor.id, (await ctx.params).slug)); });
export const PUT = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true }); await requireFeature("learning");
  const input = await readJson(req, z.object({ note: z.string().max(20_000), bookmarked: z.boolean(), updatedAt: z.string().datetime().nullable() }));
  const personal = await personalLesson(actor.id, (await ctx.params).slug);
  const saved = await db.$transaction(async tx => {
    // Serialize edits even when the personal row does not exist yet.
    await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${actor.id} FOR UPDATE`;
    const where = { userId_lessonId: { userId: actor.id, lessonId: personal.lessonId } };
    const current = await tx.lessonPersonal.findUnique({ where });
    if ((current?.updatedAt.toISOString() ?? null) !== input.updatedAt) throw conflict("Not başka bir sekmede değişti. Metnini kopyalayıp sayfayı yenile.");
    return tx.lessonPersonal.upsert({ where, create: { userId: actor.id, lessonId: personal.lessonId, note: input.note, bookmarked: input.bookmarked }, update: { note: input.note, bookmarked: input.bookmarked } });
  });
  return json({ updatedAt: saved.updatedAt.toISOString() });
});
