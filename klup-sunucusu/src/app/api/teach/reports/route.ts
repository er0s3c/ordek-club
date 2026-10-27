import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { forbidden, notFound } from "@/server/errors";
import { canManageClassroom } from "@/server/auth/policy";
import { db } from "@/server/db";
import { notify } from "@/server/classroom/notifications";

// Rapor Atölyesi incelemesi: dört ölçüt (0–5) ve öğretmen notu.
const schema = z.object({ userId: z.string().min(1).max(40), labKey: z.string().regex(/^[a-z0-9-]{1,40}$/), rubricScores: z.array(z.number().int().min(0).max(5)).length(4), feedback: z.string().trim().max(3000).default("") });
export const PATCH = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  if (!canManageClassroom(actor)) throw forbidden();
  const input = await readJson(req, schema);
  await db.$transaction(async (tx) => {
    const r = await tx.reportDraft.updateMany({ where: { userId: input.userId, labKey: input.labKey, status: "SUBMITTED" }, data: { status: "REVIEWED", rubricScores: input.rubricScores, feedback: input.feedback, reviewerId: actor.id, reviewedAt: new Date() } });
    if (!r.count) throw notFound("İncelemede bekleyen rapor bulunamadı.");
    await notify(tx, [input.userId], { type: "REVIEW", title: "Rapor Atölyesi: raporun değerlendirildi", body: input.feedback.slice(0, 160), link: "/academy/practice" });
  });
  return json({ ok: true });
});
