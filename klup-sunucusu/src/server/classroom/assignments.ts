// Görev atama, teslim ve değerlendirme.
// - XP yalnız eğitmen ONAYINDAN sonra, onayla aynı transaction'da ve görev başına bir kez verilir.
// - Onaylanan ya da reddedilen teslim kesindir (öğrenci değiştiremez).
// - Öğrenci başkasının teslimini hiçbir yoldan göremez; hedeflenmediği görev 404'tür.
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { badRequest, conflict, forbidden, notFound } from "@/server/errors";
import { canEditAssignment, canManageClassroom, isAdmin, isStaff, type Actor } from "@/server/auth/policy";
import { award, MAX_CUSTOM_XP, XP_TX } from "@/server/xp/engine";
import { evaluateBadges } from "@/server/xp/badges";
import { storeFile } from "@/server/files/service";
import { visibleAssignmentsWhere } from "./access";
import { activeUserIds, notify } from "./notifications";

export const XP_RULES = ["task.approved", "task.daily", "task.weekly"] as const;
export const MAX_SUBMISSION_FILES = 5;

const rubricSchema = z.array(z.object({ criterion: z.string().trim().min(1).max(120), points: z.number().int().min(1).max(1000) })).max(12);

export const assignmentInputSchema = z
  .object({
    title: z.string().trim().min(3).max(140),
    description: z.string().max(20_000).default(""),
    kind: z.enum(["TEXT", "SHORT_ANSWER", "FILE", "PCAP", "LOG", "OSINT", "CODE_REVIEW", "VMWARE"]).default("TEXT"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
    audience: z.enum(["ALL", "SELECTED"]).default("ALL"),
    targetUsernames: z.array(z.string().trim().toLowerCase().min(1).max(40)).max(500).default([]),
    startsAt: z.coerce.date().optional(),
    dueAt: z.coerce.date().nullable().optional(),
    allowLate: z.boolean().default(false),
    allowResubmit: z.boolean().default(true),
    requireText: z.boolean().default(true),
    requireFile: z.boolean().default(false),
    maxScore: z.number().int().min(1).max(1000).default(100),
    rubric: rubricSchema.default([]),
    xpRuleKey: z.enum(XP_RULES).default("task.approved"),
    xpAmount: z.number().int().min(0).max(MAX_CUSTOM_XP).nullable().default(null),
  })
  .superRefine((v, ctx) => {
    if (v.dueAt && v.startsAt && v.dueAt <= v.startsAt) ctx.addIssue({ code: "custom", path: ["dueAt"], message: "Son teslim, başlangıçtan sonra olmalı." });
    if (v.rubric.length && v.rubric.reduce((a, r) => a + r.points, 0) !== v.maxScore)
      ctx.addIssue({ code: "custom", path: ["rubric"], message: "Ölçüt puanlarının toplamı en yüksek puana eşit olmalı." });
    if (!v.requireText && !v.requireFile) ctx.addIssue({ code: "custom", path: ["requireText"], message: "Metin ya da dosyadan en az biri istenmeli." });
    if (v.audience === "SELECTED" && !v.targetUsernames.length) ctx.addIssue({ code: "custom", path: ["targetUsernames"], message: "En az bir öğrenci seç." });
  });
export type AssignmentInput = z.output<typeof assignmentInputSchema>;

function requireStaff(actor: Actor) {
  if (!canManageClassroom(actor)) throw forbidden("Görev yönetimi eğitmen ve yöneticilere açıktır.");
}

async function resolveTargets(usernames: string[]) {
  const users = await db.user.findMany({ where: { username: { in: usernames }, status: "ACTIVE", role: "STUDENT" }, select: { id: true, username: true } });
  const missing = usernames.filter((u) => !users.some((x) => x.username === u));
  if (missing.length) throw badRequest(`Aktif öğrenci bulunamadı: ${missing.slice(0, 5).join(", ")}`, "BAD_TARGETS");
  return users.map((u) => u.id);
}

function dataOf(input: AssignmentInput) {
  return {
    title: input.title,
    description: input.description,
    kind: input.kind,
    difficulty: input.difficulty,
    audience: input.audience,
    ...(input.startsAt ? { startsAt: input.startsAt } : {}),
    dueAt: input.dueAt ?? null,
    allowLate: input.allowLate,
    allowResubmit: input.allowResubmit,
    requireText: input.requireText,
    requireFile: input.requireFile,
    maxScore: input.maxScore,
    rubric: input.rubric.length ? (input.rubric as Prisma.InputJsonValue) : undefined,
    xpRuleKey: input.xpRuleKey,
    xpAmount: input.xpAmount,
  };
}

export async function createAssignment(actor: Actor, input: AssignmentInput, ip: string, extra: { liveSessionId?: string; slideId?: string } = {}) {
  requireStaff(actor);
  const targets = input.audience === "SELECTED" ? await resolveTargets(input.targetUsernames) : [];
  return db.$transaction(async (tx) => {
    const a = await tx.assignment.create({
      data: { ...dataOf(input), createdById: actor.id, ...extra, targets: { create: targets.map((userId) => ({ userId })) } },
    });
    await audit({ actorId: actor.id, action: "assignment.create", targetType: "Assignment", targetId: a.id, meta: { title: a.title, kind: a.kind }, ip }, tx);
    return a;
  });
}

async function loadEditable(actor: Actor, id: string) {
  requireStaff(actor);
  const a = await db.assignment.findUnique({ where: { id } });
  if (!a) throw notFound("Görev bulunamadı.");
  if (!canEditAssignment(actor, a)) throw forbidden("Bu görevi yalnızca oluşturan eğitmen ya da yöneticiler düzenleyebilir.");
  return a;
}

export async function updateAssignment(actor: Actor, id: string, input: AssignmentInput, ip: string) {
  const a = await loadEditable(actor, id);
  const targets = input.audience === "SELECTED" ? await resolveTargets(input.targetUsernames) : [];
  await db.$transaction(async (tx) => {
    await tx.assignmentTarget.deleteMany({ where: { assignmentId: id } });
    await tx.assignment.update({
      where: { id },
      data: { ...dataOf(input), rubric: input.rubric.length ? (input.rubric as Prisma.InputJsonValue) : undefined, targets: { create: targets.map((userId) => ({ userId })) } },
    });
    await audit({ actorId: actor.id, action: "assignment.update", targetType: "Assignment", targetId: id, meta: { title: input.title }, ip }, tx);
  });
  return a;
}

// Yayınlamak hedef öğrencilere bildirim gönderir; kapatmak yeni teslimleri durdurur.
export async function setAssignmentStatus(actor: Actor, id: string, status: "DRAFT" | "PUBLISHED" | "CLOSED", ip: string) {
  const a = await loadEditable(actor, id);
  if (a.status === status) return;
  if (status === "DRAFT" && (await db.submission.count({ where: { assignmentId: id } }))) throw conflict("Teslim alınmış görev taslağa çekilemez; kapatabilirsin.", "HAS_SUBMISSIONS");
  await db.$transaction(async (tx) => {
    await tx.assignment.update({ where: { id }, data: { status } });
    if (status === "PUBLISHED" && a.status === "DRAFT") {
      const recipients =
        a.audience === "ALL" ? await activeUserIds({ students: true }) : (await tx.assignmentTarget.findMany({ where: { assignmentId: id }, select: { userId: true } })).map((t) => t.userId);
      await notify(tx, recipients, { type: "ASSIGNMENT", title: `Yeni görev: ${a.title}`, body: a.dueAt ? `Son teslim: ${a.dueAt.toISOString().slice(0, 16).replace("T", " ")}` : "", link: `/tasks/${id}` });
    }
    await audit({ actorId: actor.id, action: `assignment.${status.toLowerCase()}`, targetType: "Assignment", targetId: id, ip }, tx);
  });
}

export async function deleteAssignment(actor: Actor, id: string, ip: string) {
  await loadEditable(actor, id);
  if (await db.submission.count({ where: { assignmentId: id } })) throw conflict("Teslim alınmış görev silinemez; kapatabilirsin.", "HAS_SUBMISSIONS");
  await db.$transaction(async (tx) => {
    await tx.assignment.delete({ where: { id } });
    await audit({ actorId: actor.id, action: "assignment.delete", targetType: "Assignment", targetId: id, ip }, tx);
  });
}

// ── Listeleme ───────────────────────────────────────────────────────────────
export async function listAssignmentsForStaff(actor: Actor) {
  requireStaff(actor);
  const rows = await db.assignment.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: {
      createdBy: { select: { displayName: true } },
      liveSession: { select: { code: true } }, // uygulama molasından doğan görevler etiketlenir
      _count: { select: { submissions: true, targets: true } },
    },
  });
  const pending = await db.submission.groupBy({ by: ["assignmentId"], where: { status: "SUBMITTED" }, _count: true });
  const p = new Map(pending.map((r) => [r.assignmentId, r._count]));
  return rows.map((a) => ({ ...a, pending: p.get(a.id) ?? 0, canEdit: canEditAssignment(actor, a) }));
}

export async function listAssignmentsForStudent(actor: Actor) {
  const rows = await db.assignment.findMany({
    where: visibleAssignmentsWhere(actor),
    orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    take: 200,
    include: { submissions: { where: { userId: actor.id }, select: { status: true, score: true, late: true } } },
  });
  return rows.map(({ submissions, ...a }) => ({ ...a, mine: submissions[0] ?? null }));
}

// Menü sayaçları: öğrenci için teslim edilmemiş (ya da düzeltme istenmiş) açık görevler,
// eğitmen için kendi görevlerinde (yönetici: tümünde) değerlendirme bekleyen teslimler.
export function openTaskCount(actor: Actor, now = new Date()) {
  return db.assignment.count({
    where: {
      AND: [
        visibleAssignmentsWhere(actor, now),
        { status: "PUBLISHED" },
        { OR: [{ dueAt: null }, { dueAt: { gt: now } }, { allowLate: true }] },
        { submissions: { none: { userId: actor.id, status: { not: "RETURNED" } } } },
      ],
    },
  });
}

export function pendingReviewCount(actor: Actor) {
  return db.submission.count({ where: { status: "SUBMITTED", ...(isAdmin(actor.role) ? {} : { assignment: { createdById: actor.id } }) } });
}

// Öğrencinin bir görevi (yalnız kendi teslimiyle).
export async function getAssignmentForStudent(actor: Actor, id: string) {
  const a = await db.assignment.findFirst({
    where: { id, ...visibleAssignmentsWhere(actor) },
    include: {
      files: { where: { deletedAt: null }, select: { id: true, name: true, size: true, kind: true } },
      submissions: { where: { userId: actor.id }, include: { files: { where: { deletedAt: null }, select: { id: true, name: true, size: true } } } },
      createdBy: { select: { displayName: true } },
    },
  });
  if (!a) throw notFound("Görev bulunamadı.");
  const { submissions, ...rest } = a;
  return { ...rest, mine: submissions[0] ?? null };
}

export async function getAssignmentForStaff(actor: Actor, id: string) {
  requireStaff(actor);
  const a = await db.assignment.findUnique({
    where: { id },
    include: {
      files: { where: { deletedAt: null }, select: { id: true, name: true, size: true, kind: true } },
      targets: { select: { user: { select: { username: true, displayName: true } } } },
      submissions: {
        orderBy: { submittedAt: "asc" },
        include: { user: { select: { username: true, displayName: true } }, files: { where: { deletedAt: null }, select: { id: true, name: true, size: true } } },
      },
      createdBy: { select: { displayName: true } },
    },
  });
  if (!a) throw notFound("Görev bulunamadı.");
  return { ...a, canEdit: canEditAssignment(actor, a) };
}

// ── Teslim ──────────────────────────────────────────────────────────────────
export async function submitAssignment(actor: Actor, id: string, input: { text: string; files: File[] }, ip: string) {
  if (isStaff(actor.role)) throw forbidden("Görev teslimi öğrencilere açıktır.");
  const a = await db.assignment.findFirst({ where: { id, ...visibleAssignmentsWhere(actor) } });
  if (!a) throw notFound("Görev bulunamadı.");
  if (a.status !== "PUBLISHED") throw conflict("Bu görev teslime kapalı.", "CLOSED");
  const now = new Date();
  const late = !!a.dueAt && now > a.dueAt;
  if (late && !a.allowLate) throw conflict("Son teslim tarihi geçti.", "PAST_DUE");
  const text = input.text.trim().slice(0, 20_000);
  if (input.files.length > MAX_SUBMISSION_FILES) throw badRequest(`En fazla ${MAX_SUBMISSION_FILES} dosya eklenebilir.`, "TOO_MANY_FILES");

  const prev = await db.submission.findUnique({ where: { assignmentId_userId: { assignmentId: id, userId: actor.id } }, include: { _count: { select: { files: { where: { deletedAt: null } } } } } });
  if (prev && (prev.status === "APPROVED" || prev.status === "REJECTED")) throw conflict("Bu teslim değerlendirildi; değiştirilemez.", "LOCKED");
  if (prev?.status === "RETURNED" && !a.allowResubmit) throw conflict("Bu görevde yeniden teslim kapalı.", "NO_RESUBMIT");
  const fileCount = (prev?._count.files ?? 0) + input.files.length;
  if (fileCount > MAX_SUBMISSION_FILES) throw badRequest(`Bir teslimde en fazla ${MAX_SUBMISSION_FILES} dosya olabilir.`, "TOO_MANY_FILES");
  if (a.requireText && !text) throw badRequest("Bu görev bir açıklama/cevap metni istiyor.", "TEXT_REQUIRED");
  if (a.requireFile && fileCount === 0) throw badRequest("Bu görev en az bir dosya istiyor.", "FILE_REQUIRED");

  const sub = await db.$transaction(async (tx) => {
    const s = prev
      ? await tx.submission.update({
          where: { id: prev.id },
          data: { text, status: "SUBMITTED", late, submittedAt: now, attempts: prev.status === "RETURNED" ? { increment: 1 } : undefined },
        })
      : await tx.submission.create({ data: { assignmentId: id, userId: actor.id, text, late } });
    for (const f of input.files) await storeFile(tx, actor, f, { scope: "SUBMISSION", submissionId: s.id });
    await audit({ actorId: actor.id, action: "submission.submit", targetType: "Submission", targetId: s.id, meta: { assignmentId: id, files: input.files.length, late }, ip }, tx);
    if (a.createdById) await notify(tx, [a.createdById], { type: "SUBMISSION", title: `Yeni teslim: ${a.title}`, link: `/teach/tasks/${id}` });
    return s;
  }, XP_TX);
  return sub;
}

// ── Değerlendirme ──────────────────────────────────────────────────────────
export const reviewSchema = z.object({
  decision: z.enum(["APPROVE", "RETURN", "REJECT"]),
  score: z.number().int().min(0).max(1000).optional(),
  rubricScores: z.array(z.number().int().min(0).max(1000)).max(12).optional(),
  feedback: z.string().trim().max(5_000).default(""),
});
export type ReviewInput = z.output<typeof reviewSchema>;

async function reviewOne(tx: Prisma.TransactionClient, actor: Actor, submissionId: string, input: ReviewInput) {
  const s = await tx.submission.findUnique({ where: { id: submissionId }, include: { assignment: true } });
  if (!s) throw notFound("Teslim bulunamadı.");
  const a = s.assignment;
  if (!canEditAssignment(actor, a)) throw forbidden("Bu teslimi yalnızca görevi oluşturan eğitmen ya da yöneticiler değerlendirebilir.");
  if (s.status !== "SUBMITTED") throw conflict("Yalnızca değerlendirme bekleyen teslimler değerlendirilebilir.", "NOT_PENDING");
  if (input.decision === "RETURN" && !input.feedback) throw badRequest("Düzeltme isterken geri bildirim yaz.", "FEEDBACK_REQUIRED");

  const rubric = (Array.isArray(a.rubric) ? a.rubric : []) as { criterion: string; points: number }[];
  let score = input.score ?? (input.decision === "APPROVE" ? a.maxScore : undefined);
  if (input.rubricScores) {
    if (input.rubricScores.length !== rubric.length) throw badRequest("Her ölçüt için bir puan gir.", "RUBRIC_MISMATCH");
    input.rubricScores.forEach((p, i) => {
      if (p > rubric[i]!.points) throw badRequest(`"${rubric[i]!.criterion}" en fazla ${rubric[i]!.points} puan.`, "RUBRIC_RANGE");
    });
    score = input.rubricScores.reduce((x, y) => x + y, 0);
  }
  if (score !== undefined && score > a.maxScore) throw badRequest(`Puan en fazla ${a.maxScore} olabilir.`, "SCORE_RANGE");

  const status = input.decision === "APPROVE" ? "APPROVED" : input.decision === "RETURN" ? "RETURNED" : "REJECTED";
  await tx.submission.update({
    where: { id: s.id },
    data: { status, score: score ?? null, rubricScores: input.rubricScores ?? undefined, feedback: input.feedback, reviewedById: actor.id, reviewedAt: new Date() },
  });
  let xp = 0;
  if (status === "APPROVED") {
    xp = await award(tx, {
      userId: s.userId,
      ruleKey: a.xpRuleKey as (typeof XP_RULES)[number],
      key: `task:${s.userId}:${a.id}`,
      source: "TASK",
      refType: "Assignment",
      refId: a.id,
      reason: a.title,
      ...(a.xpAmount !== null ? { amount: a.xpAmount } : {}),
    });
  }
  const label = status === "APPROVED" ? `onaylandı${xp ? ` (+${xp} XP)` : ""}` : status === "RETURNED" ? "düzeltme istendi" : "reddedildi";
  await notify(tx, [s.userId], { type: "REVIEW", title: `${a.title}: ${label}`, body: input.feedback, link: `/tasks/${a.id}` });
  return { userId: s.userId, status, xp };
}

export async function reviewSubmission(actor: Actor, submissionId: string, input: ReviewInput, ip: string) {
  requireStaff(actor);
  const r = await db.$transaction(async (tx) => {
    const out = await reviewOne(tx, actor, submissionId, input);
    await audit({ actorId: actor.id, action: `submission.${out.status.toLowerCase()}`, targetType: "Submission", targetId: submissionId, meta: { xp: out.xp }, ip }, tx);
    return out;
  }, XP_TX);
  if (r.status === "APPROVED") await evaluateBadges(r.userId);
  return r;
}

// Toplu değerlendirme: seçilen bekleyen teslimleri tam puanla onaylar (her biri ayrı transaction).
export async function bulkApprove(actor: Actor, assignmentId: string, submissionIds: string[], feedback: string, ip: string) {
  await loadEditable(actor, assignmentId);
  const subs = await db.submission.findMany({ where: { id: { in: submissionIds }, assignmentId, status: "SUBMITTED" }, select: { id: true } });
  let approved = 0;
  for (const s of subs) {
    const r = await reviewSubmission(actor, s.id, { decision: "APPROVE", feedback }, ip);
    if (r.status === "APPROVED") approved++;
  }
  return { approved, skipped: submissionIds.length - approved };
}
