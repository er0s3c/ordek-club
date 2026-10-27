// Nöbet Masası senaryo editörü: öğretmen alarm, kanıt, doğru karar ve açıklama tanımlar; aynı senaryonun
// kolay/orta/zor sürümlerini hazırlar. Yayınlanan senaryoyu düzenlemek sürümü artırır; denemeler sürüme bağlıdır.
import { z } from "zod";
import { db } from "@/server/db";
import { conflict, forbidden, notFound } from "@/server/errors";
import { canManageClassroom, isAdmin, type Actor } from "@/server/auth/policy";
import { recordLearning } from "./events";

const alert = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,30}$/),
  title: z.string().trim().min(3).max(120),
  evidence: z.string().trim().min(10).max(2000),
  answer: z.enum(["benign", "investigate", "contain"]),
  explanation: z.string().trim().min(10).max(1000),
});
export const LEVELS = ["easy", "medium", "hard"] as const;
export const scenarioSchema = z.object({
  title: z.string().trim().min(3).max(120),
  summary: z.string().trim().max(500).default(""),
  variants: z.object({ easy: z.array(alert).max(8).default([]), medium: z.array(alert).max(8).default([]), hard: z.array(alert).max(8).default([]) }).refine((v) => v.easy.length + v.medium.length + v.hard.length > 0, "En az bir alarm ekle."),
});
type Variants = z.output<typeof scenarioSchema>["variants"];

export async function listScenariosForStaff(actor: Actor) {
  if (!canManageClassroom(actor)) throw forbidden();
  return db.socScenario.findMany({ where: { status: { not: "ARCHIVED" }, ...(isAdmin(actor.role) ? {} : { authorId: actor.id }) }, orderBy: { updatedAt: "desc" } });
}

export async function saveScenario(actor: Actor, id: string | null, input: z.output<typeof scenarioSchema>) {
  if (!canManageClassroom(actor)) throw forbidden();
  if (!id) return db.socScenario.create({ data: { ...input, authorId: actor.id } });
  const cur = await db.socScenario.findUnique({ where: { id } });
  if (!cur) throw notFound();
  if (!isAdmin(actor.role) && cur.authorId !== actor.id) throw forbidden();
  return db.socScenario.update({ where: { id }, data: { ...input, version: cur.status === "PUBLISHED" ? { increment: 1 } : undefined } });
}

export async function setScenarioStatus(actor: Actor, id: string, status: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
  const cur = await db.socScenario.findUnique({ where: { id } });
  if (!cur) throw notFound();
  if (!canManageClassroom(actor) || (!isAdmin(actor.role) && cur.authorId !== actor.id)) throw forbidden();
  return db.socScenario.update({ where: { id }, data: { status } });
}

const attemptKey = (id: string, version: number, level: string, alertId: string) => `scn:${id}:v${version}:${level}:${alertId}`;

// Öğrenci görünümü: doğru karar ve açıklama yalnız karar verildikten sonra döner.
export async function publishedScenarios(userId: string) {
  const rows = await db.socScenario.findMany({ where: { status: "PUBLISHED" }, orderBy: { updatedAt: "desc" }, take: 20 });
  const attempts = await db.socAttempt.findMany({ where: { userId, alertKey: { startsWith: "scn:" } } });
  return rows.map((s) => {
    const v = s.variants as Variants;
    return {
      id: s.id, title: s.title, summary: s.summary, version: s.version,
      levels: LEVELS.filter((l) => v[l].length).map((l) => ({
        level: l,
        alerts: v[l].map((a) => {
          const at = attempts.find((x) => x.alertKey === attemptKey(s.id, s.version, l, a.id));
          return { id: a.id, title: a.title, evidence: a.evidence, attempt: at ? { decision: at.decision, correct: at.correct, explanation: a.explanation } : null };
        }),
      })),
    };
  });
}

export async function decideScenario(actor: Actor, id: string, level: string, alertId: string, decision: "benign" | "investigate" | "contain") {
  const s = await db.socScenario.findUnique({ where: { id } });
  if (!s || s.status !== "PUBLISHED") throw notFound();
  const a = (s.variants as Variants)[level as (typeof LEVELS)[number]]?.find((x) => x.id === alertId);
  if (!a) throw notFound();
  const key = attemptKey(id, s.version, level, alertId);
  return db.$transaction(async (tx) => {
    const prev = await tx.socAttempt.findUnique({ where: { userId_alertKey: { userId: actor.id, alertKey: key } } });
    if (prev) throw conflict("Bu alarm için ilk kararın kaydedildi.");
    const correct = a.answer === decision;
    await tx.socAttempt.create({ data: { userId: actor.id, alertKey: key, decision, correct } });
    if (correct) await recordLearning(tx, actor.id, `soc:${key}`, "soc");
    return { correct, answer: a.answer, explanation: a.explanation };
  });
}
