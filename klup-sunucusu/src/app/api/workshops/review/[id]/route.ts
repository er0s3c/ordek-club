import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { forbidden, notFound } from "@/server/errors";
import { canManageClassroom } from "@/server/auth/policy";
import { db } from "@/server/db";
import { notify } from "@/server/classroom/notifications";

type Context = { params: Promise<{ id: string }> };
// Kanıt haritası gerekçelerine öğretmen geri bildirimi.
export const PATCH = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  if (!canManageClassroom(actor)) throw forbidden();
  const { review } = await readJson(req, z.object({ review: z.string().trim().max(2000) }));
  const id = (await ctx.params).id;
  await db.$transaction(async (tx) => {
    const a = await tx.workshopAttempt.findUnique({ where: { id } });
    if (!a) throw notFound();
    await tx.workshopAttempt.update({ where: { id }, data: { review, reviewedById: actor.id, reviewedAt: new Date() } });
    await notify(tx, [a.userId], { type: "REVIEW", title: "Kanıt haritana geri bildirim geldi", body: review.slice(0, 200), link: `/academy/workshops/${a.kind}` });
  });
  return json({ ok: true });
});
