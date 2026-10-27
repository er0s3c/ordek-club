// Öğretmen değerlendirme araçları: not kuyruğu, teslim benzerlik uyarısı, not çizelgesi (CSV), görev klonlama,
// yorum bankası ve rubrik kütüphanesi. Benzerlik yalnız bir uyarıdır; karar öğretmendedir.
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { forbidden, notFound } from "@/server/errors";
import { canEditAssignment, canManageClassroom, isAdmin, type Actor } from "@/server/auth/policy";
import { jaccard, shingles, wordCount } from "@/lib/text";

const mine = (actor: Actor): Prisma.AssignmentWhereInput => (isAdmin(actor.role) ? {} : { createdById: actor.id });

// Not kuyruğu: değerlendirme bekleyen teslimler, en eski önce (geç teslimler işaretli).
export async function gradingQueue(actor: Actor) {
  if (!canManageClassroom(actor)) throw forbidden();
  const rows = await db.submission.findMany({
    where: { status: "SUBMITTED", assignment: mine(actor) },
    orderBy: { submittedAt: "asc" },
    take: 200,
    include: { user: { select: { displayName: true, username: true } }, assignment: { select: { id: true, title: true, rubric: true, maxScore: true, checklist: true } }, files: { where: { deletedAt: null }, select: { id: true, name: true, size: true } }, versions: { orderBy: { number: "asc" }, select: { number: true, text: true, createdAt: true } }, peerReviews: { where: { status: "DONE" }, select: { rubricScores: true, comment: true } } },
  });
  return rows.map((s) => ({
    id: s.id, text: s.text, late: s.late, submittedAt: s.submittedAt.toISOString(), attempts: s.attempts, checklist: s.checklist as { items: string[]; checked: number[] } | null,
    student: s.user.displayName, username: s.user.username,
    assignment: { id: s.assignment.id, title: s.assignment.title, maxScore: s.assignment.maxScore, rubric: (Array.isArray(s.assignment.rubric) ? s.assignment.rubric : []) as { criterion: string; points: number }[] },
    files: s.files, versions: s.versions.map((v) => ({ ...v, createdAt: v.createdAt.toISOString() })),
    peer: s.peerReviews.map((p) => ({ scores: p.rubricScores as number[] | null, comment: p.comment })),
  }));
}

// Teslim benzerliği: aynı görevdeki metinler arasında 5 kelimelik parça örtüşmesi (Jaccard). 60 kelimeden kısa metinler atlanır.
export async function similarity(actor: Actor, assignmentId: string, threshold = 0.45) {
  const a = await db.assignment.findUnique({ where: { id: assignmentId } });
  if (!a) throw notFound();
  if (!canEditAssignment(actor, a)) throw forbidden();
  const subs = (await db.submission.findMany({ where: { assignmentId }, select: { id: true, text: true, user: { select: { displayName: true } } } })).filter((s) => wordCount(s.text) >= 60);
  const sets = subs.map((s) => shingles(s.text));
  const pairs: { a: string; b: string; aId: string; bId: string; score: number }[] = [];
  for (let i = 0; i < subs.length; i++)
    for (let j = i + 1; j < subs.length; j++) {
      const score = jaccard(sets[i]!, sets[j]!);
      if (score >= threshold) pairs.push({ a: subs[i]!.user.displayName, b: subs[j]!.user.displayName, aId: subs[i]!.id, bId: subs[j]!.id, score: Math.round(score * 100) });
    }
  return { checked: subs.length, pairs: pairs.sort((x, y) => y.score - x.score) };
}

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Formül enjeksiyonuna karşı: =,+,-,@ ile başlayan hücreler metne çevrilir.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export async function gradebookCsv(actor: Actor, groupId?: string) {
  if (!canManageClassroom(actor)) throw forbidden();
  const assignments = await db.assignment.findMany({ where: { ...mine(actor), status: { in: ["PUBLISHED", "CLOSED"] }, ...(groupId ? { groupId } : {}) }, orderBy: { createdAt: "asc" }, select: { id: true, title: true, maxScore: true } });
  const subs = await db.submission.findMany({ where: { assignmentId: { in: assignments.map((a) => a.id) } }, select: { assignmentId: true, userId: true, score: true, status: true, late: true } });
  const userIds = [...new Set(subs.map((s) => s.userId))];
  const users = await db.user.findMany({ where: { id: { in: userIds } }, select: { id: true, displayName: true, username: true, studentNumber: true }, orderBy: { displayName: "asc" } });
  const header = ["Öğrenci", "Kullanıcı adı", "Öğrenci no", ...assignments.map((a) => `${a.title} (/${a.maxScore})`), "Toplam"];
  const lines = users.map((u) => {
    const cells = assignments.map((a) => { const s = subs.find((x) => x.assignmentId === a.id && x.userId === u.id); return s ? (s.score ?? (s.status === "SUBMITTED" ? "bekliyor" : "")) + (s.late ? " (geç)" : "") : ""; });
    const total = subs.filter((s) => s.userId === u.id && typeof s.score === "number").reduce((x, s) => x + (s.score ?? 0), 0);
    return [u.displayName, u.username, u.studentNumber ?? "", ...cells, total];
  });
  return "﻿" + [header, ...lines].map((r) => r.map(csvCell).join(";")).join("\r\n");
}

export const cloneSchema = z.object({ groupId: z.string().min(1).max(40).nullable().default(null), shiftDays: z.number().int().min(0).max(365).default(7) });

export async function cloneAssignment(actor: Actor, id: string, input: z.output<typeof cloneSchema>, ip: string) {
  const a = await db.assignment.findUnique({ where: { id } });
  if (!a) throw notFound();
  if (!canEditAssignment(actor, a)) throw forbidden();
  const shift = (d: Date | null) => (d ? new Date(d.getTime() + input.shiftDays * 86_400_000) : null);
  const copy = await db.assignment.create({
    data: {
      title: `${a.title} (kopya)`, description: a.description, kind: a.kind, difficulty: a.difficulty, status: "DRAFT",
      audience: input.groupId ? "GROUP" : a.audience === "SELECTED" ? "ALL" : a.audience, groupId: input.groupId ?? a.groupId,
      startsAt: shift(a.startsAt) ?? new Date(), dueAt: shift(a.dueAt), allowLate: a.allowLate, allowResubmit: a.allowResubmit, requireText: a.requireText, requireFile: a.requireFile,
      maxScore: a.maxScore, rubric: a.rubric ?? undefined, xpRuleKey: a.xpRuleKey, xpAmount: a.xpAmount, quiz: a.quiz ?? undefined, passPercent: a.passPercent, maxAttempts: a.maxAttempts,
      checklist: a.checklist, skills: a.skills, peerReviewEnabled: a.peerReviewEnabled, peerReviewCount: a.peerReviewCount, createdById: actor.id,
    },
  });
  await audit({ actorId: actor.id, action: "assignment.clone", targetType: "Assignment", targetId: copy.id, meta: { from: id }, ip });
  return copy;
}

// Yorum bankası ve rubrik kütüphanesi
export const snippetSchema = z.object({ label: z.string().trim().min(2).max(60), text: z.string().trim().min(2).max(2000) });
export const rubricTemplateSchema = z.object({ name: z.string().trim().min(2).max(80), shared: z.boolean().default(false), rubric: z.array(z.object({ criterion: z.string().trim().min(1).max(120), points: z.number().int().min(1).max(1000) })).min(1).max(12) });

export async function library(actor: Actor) {
  if (!canManageClassroom(actor)) throw forbidden();
  const [snippets, rubrics] = await Promise.all([
    db.commentSnippet.findMany({ where: { ownerId: actor.id }, orderBy: { createdAt: "desc" } }),
    db.rubricTemplate.findMany({ where: { OR: [{ ownerId: actor.id }, { shared: true }] }, orderBy: { createdAt: "desc" }, include: { owner: { select: { displayName: true } } } }),
  ]);
  return { snippets, rubrics: rubrics.map((r) => ({ id: r.id, name: r.name, shared: r.shared, mine: r.ownerId === actor.id, owner: r.owner.displayName, rubric: r.rubric as { criterion: string; points: number }[] })) };
}
