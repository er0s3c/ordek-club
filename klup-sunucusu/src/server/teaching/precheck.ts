// Ders öncesi yoklama: öğretmen dersten önce en fazla üç kısa soru gönderir; yanıtlar notlandırılmaz.
// Öğretmen seçenek dağılımını görür ve anlatımını buna göre ayarlar.
import { z } from "zod";
import { db } from "@/server/db";
import { badRequest, conflict, forbidden, notFound } from "@/server/errors";
import { canManageClassroom, isStaff, type Actor } from "@/server/auth/policy";
import { notify } from "@/server/classroom/notifications";

const question = z.object({ question: z.string().trim().min(3).max(300), options: z.array(z.string().trim().min(1).max(160)).min(2).max(5) });
export const precheckSchema = z.object({ groupId: z.string().min(1).max(40).nullable().default(null), title: z.string().trim().min(3).max(120), questions: z.array(question).min(1).max(3), closesAt: z.coerce.date() });
type Q = z.infer<typeof question>;

export async function createPrecheck(actor: Actor, input: z.output<typeof precheckSchema>) {
  if (!canManageClassroom(actor)) throw forbidden();
  if (input.closesAt <= new Date()) throw badRequest("Kapanış zamanı ileride olmalı.");
  return db.$transaction(async (tx) => {
    const c = await tx.preClassCheck.create({ data: { groupId: input.groupId, title: input.title, questions: input.questions, closesAt: input.closesAt, createdById: actor.id } });
    const members = input.groupId ? (await tx.classGroupMember.findMany({ where: { groupId: input.groupId }, select: { userId: true } })).map((m) => m.userId) : (await tx.user.findMany({ where: { status: "ACTIVE", role: "STUDENT" }, select: { id: true } })).map((u) => u.id);
    await notify(tx, members, { type: "ASSIGNMENT", title: `Ders öncesi yoklama: ${input.title}`, body: "Üç kısa soru · notlandırılmaz", link: "/dashboard#precheck" });
    return c;
  });
}

export async function openPrechecks(actor: Actor, now = new Date()) {
  const rows = await db.preClassCheck.findMany({ where: { opensAt: { lte: now }, closesAt: { gt: now }, OR: [{ groupId: null }, { group: { members: { some: { userId: actor.id } } } }] }, orderBy: { closesAt: "asc" }, include: { answers: { where: { userId: actor.id }, select: { userId: true } } } });
  return rows.map((r) => ({ id: r.id, title: r.title, closesAt: r.closesAt.toISOString(), questions: r.questions as Q[], answered: r.answers.length > 0 }));
}

export async function answerPrecheck(actor: Actor, id: string, answers: number[]) {
  const c = await db.preClassCheck.findUnique({ where: { id }, include: { group: { select: { members: { where: { userId: actor.id }, select: { userId: true } } } } } });
  if (!c || (c.groupId && !c.group?.members.length)) throw notFound();
  if (c.closesAt <= new Date()) throw conflict("Yoklama kapandı.");
  const qs = c.questions as Q[];
  if (answers.length !== qs.length || answers.some((a, i) => !Number.isInteger(a) || a < 0 || a >= qs[i]!.options.length)) throw badRequest("Yanıtlar geçersiz.");
  await db.preClassAnswer.upsert({ where: { checkId_userId: { checkId: id, userId: actor.id } }, create: { checkId: id, userId: actor.id, answers }, update: { answers } });
}

export async function precheckResults(actor: Actor) {
  if (!isStaff(actor.role)) throw forbidden();
  const rows = await db.preClassCheck.findMany({ where: { createdById: actor.id }, orderBy: { createdAt: "desc" }, take: 20, include: { answers: { select: { answers: true } }, group: { select: { name: true } } } });
  return rows.map((r) => {
    const qs = r.questions as Q[];
    return { id: r.id, title: r.title, group: r.group?.name ?? "Tüm öğrenciler", closesAt: r.closesAt.toISOString(), responses: r.answers.length, questions: qs.map((q, i) => ({ question: q.question, options: q.options, counts: q.options.map((_, k) => r.answers.filter((a) => (a.answers as number[])[i] === k).length) })) };
  });
}
