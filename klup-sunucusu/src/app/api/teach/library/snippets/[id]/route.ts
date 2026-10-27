import { memberContext } from "@/server/api-auth";
import { json, route } from "@/server/http";
import { db } from "@/server/db";

type Context = { params: Promise<{ id: string }> };
export const DELETE = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await db.commentSnippet.deleteMany({ where: { id: (await ctx.params).id, ownerId: actor.id } });
  return json({ ok: true });
});
