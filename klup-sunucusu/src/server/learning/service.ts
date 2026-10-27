import { recordLearning } from "./events";
import crypto from "node:crypto";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { badRequest, conflict, forbidden, notFound } from "@/server/errors";
import { isAdmin, isStaff, type Actor } from "@/server/auth/policy";
import { getSettings } from "@/server/settings";
import { dayKey } from "@/server/xp/time";
import { listAssignmentsForStudent } from "@/server/classroom/assignments";
import type { QuizQuestion } from "@/server/academy/content";
import { learningCalendar, nextReview, shiftDay } from "./calendar";

export const civilDay = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s => { const d = new Date(`${s}T12:00:00Z`); return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s; });
export const preferenceSchema = z.object({ dailyGoal: z.number().int().min(1).max(3), reminderEnabled: z.boolean(), reminderTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), reminderEmail: z.boolean(), locale: z.enum(["auto", "tr", "en"]) });
export async function preference(userId: string) {
  const { timezone } = await getSettings();
  const enabled = await db.featureSwitch.findUnique({ where: { key: "learning" } });
  return db.learningPreference.upsert({ where: { userId }, update: {}, create: { userId, protectionStart: dayKey(enabled?.enabledAt ?? new Date(), timezone) } });
}


export async function workspace(actor: Actor, now = new Date()) {
  const { timezone } = await getSettings();
  const today = dayKey(now, timezone);
  const prefs = await preference(actor.id);
  const [active, events, protections, plans, personal, due, groups, tasks] = await Promise.all([
    db.activityDay.findMany({ where: { userId: actor.id }, select: { day: true } }),
    db.learningEvent.findMany({ where: { userId: actor.id, day: { gte: shiftDay(today, -27), lte: today } }, orderBy: { createdAt: "desc" } }),
    db.examProtection.findMany({ where: { memberIds: { has: actor.id } } }),
    db.learningPlan.findMany({ where: { userId: actor.id }, orderBy: { day: "asc" }, take: 100 }),
    db.lessonPersonal.findMany({ where: { userId: actor.id, OR: [{ bookmarked: true }, { note: { not: "" } }] }, orderBy: { updatedAt: "desc" }, take: 100 }),
    db.reviewCard.findMany({ where: { userId: actor.id, dueAt: { lte: now } }, orderBy: { dueAt: "asc" }, take: 20 }),
    db.classGroup.findMany({ where: { archivedAt: null, members: { some: { userId: actor.id } }, startsAt: { gte: new Date(`${shiftDay(today, -1)}T00:00:00Z`) } }, select: { id: true, name: true, startsAt: true }, take: 50 }),
    isStaff(actor.role) ? Promise.resolve([]) : listAssignmentsForStudent(actor),
  ]);
  const lessons = await db.lesson.findMany({ where: { id: { in: [...personal.map(p => p.lessonId), ...due.map(r => r.lessonId)] }, archivedAt: null, track: { archivedAt: null } }, select: { id: true, title: true, slug: true } });
  const visible = new Map(lessons.map(l => [l.id, l]));
  const calendar = learningCalendar(active.map(a => a.day), today, prefs.protectionStart, protections);
  const states = new Map(calendar.days.map(d => [d.day, d.state]));
  return {
    today, timezone, prefs, streak: { current: calendar.current, longest: calendar.longest, remainingProtection: calendar.remainingProtection },
    days: Array.from({ length: 28 }, (_, i) => { const day = shiftDay(today, i - 27); return { day, state: states.get(day) ?? (day === today ? "pending" : "missed") }; }),
    completedToday: events.filter(e => e.day === today).length,
    week: { activities: events.filter(e => e.day >= shiftDay(today, -6)).length, activeDays: active.filter(a => a.day >= shiftDay(today, -6) && a.day <= today).length },
    plans,
    personal: personal.filter(p => visible.has(p.lessonId)).map(p => ({ ...p, lesson: visible.get(p.lessonId)! })),
    reviews: due.filter(r => visible.has(r.lessonId)).map(r => { const q = r.question as unknown as QuizQuestion; return { id: r.id, version: r.version, text: q.text, kind: q.kind, options: q.kind === "choice" ? q.options : ["Yanlış", "Doğru"], lesson: visible.get(r.lessonId)! }; }),
    schedule: [...groups.map(g => ({ id: g.id, title: g.name, day: dayKey(g.startsAt!, timezone), href: `/groups/${g.id}`, kind: "Etkinlik" })), ...tasks.filter(t => t.dueAt).map(t => ({ id: t.id, title: t.title, day: dayKey(t.dueAt!, timezone), href: `/tasks/${t.id}`, kind: "Görev" }))].sort((a,b) => a.day.localeCompare(b.day)),
  };
}

export async function personalLesson(userId: string, slug: string) {
  const lesson = await db.lesson.findFirst({ where: { slug, archivedAt: null, track: { archivedAt: null } }, select: { id: true } });
  if (!lesson) throw notFound();
  const personal = await db.lessonPersonal.findUnique({ where: { userId_lessonId: { userId, lessonId: lesson.id } } });
  return { lessonId: lesson.id, note: personal?.note ?? "", bookmarked: personal?.bookmarked ?? false, updatedAt: personal?.updatedAt.toISOString() ?? null };
}

export async function seedReviews(tx: Prisma.TransactionClient, userId: string, lessonId: string, questions: QuizQuestion[], results: { correct: boolean }[]) {
  for (let i = 0; i < questions.length; i++) if (!results[i]!.correct) {
    const question = questions[i]!;
    const contentHash = crypto.createHash("sha256").update(JSON.stringify(question)).digest("hex");
    await tx.reviewCard.upsert({ where: { userId_lessonId_questionIndex: { userId, lessonId, questionIndex: i } },
      create: { userId, lessonId, questionIndex: i, contentHash, question: question as unknown as Prisma.InputJsonValue, ...nextReview(false, 0, new Date()) },
      update: { contentHash, question: question as unknown as Prisma.InputJsonValue, ...nextReview(false, 0, new Date()), version: { increment: 1 } },
    });
  }
}

export async function answerReview(actor: Actor, id: string, answer: number, version: number) {
  return db.$transaction(async tx => {
    const card = await tx.reviewCard.findFirst({ where: { id, userId: actor.id } });
    if (!card) throw notFound();
    if (card.dueAt > new Date() || card.version !== version) throw conflict("Bu tekrar işlendi veya henüz zamanı gelmedi.");
    const lesson = await tx.lesson.findFirst({ where: { id: card.lessonId, archivedAt: null, track: { archivedAt: null } } });
    if (!lesson) throw notFound();
    const question = card.question as unknown as QuizQuestion;
    const correct = question.kind === "truefalse" ? answer === Number(question.answer) : answer === question.answer;
    if (answer < 0 || answer >= (question.kind === "truefalse" ? 2 : question.options.length)) throw badRequest("Geçersiz seçenek.");
    const updated = await tx.reviewCard.updateMany({ where: { id, userId: actor.id, version }, data: { ...nextReview(correct, card.consecutive, new Date()), version: { increment: 1 } } });
    if (!updated.count) throw conflict("Bu tekrar başka bir sekmede işlendi.");
    if (correct) await recordLearning(tx, actor.id, `review:${id}:${version}`, "review");
    return { correct, explanation: question.explanation };
  });
}

export async function addExamProtection(actor: Actor, groupId: string, startsOn: string, endsOn: string) {
  const group = await db.classGroup.findUnique({ where: { id: groupId } });
  if (!group || group.archivedAt || group.kind !== "CLASS") throw notFound();
  if (!isStaff(actor.role) || (!isAdmin(actor.role) && group.createdById !== actor.id)) throw forbidden();
  const { timezone } = await getSettings();
  if (startsOn <= dayKey(new Date(), timezone) || endsOn < startsOn || endsOn > shiftDay(startsOn, 30)) throw badRequest("Koruma yarından itibaren, en fazla 31 gün olabilir.");
  const members = await db.classGroupMember.findMany({ where: { groupId, user: { status: "ACTIVE" } }, select: { userId: true } });
  return db.examProtection.create({ data: { groupId, startsOn, endsOn, memberIds: members.map(m => m.userId) } });
}
