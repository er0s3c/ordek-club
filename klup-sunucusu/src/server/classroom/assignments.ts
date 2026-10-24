// Görev atama, teslim ve değerlendirme.
// - XP yalnız eğitmen ONAYINDAN (ya da otomatik puanlamada geçme notundan) sonra, onayla aynı transaction'da ve görev başına kişi başı bir kez verilir.
// - Onaylanan ya da reddedilen teslim kesindir (öğrenci değiştiremez).
// - Öğrenci başkasının teslimini hiçbir yoldan göremez (takım görevinde yalnız kendi takımınınkini); hedeflenmediği görev 404'tür.
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
import { groupMemberIds } from "./groups";
import { answersSchema, gradeAnswers, publicQuiz, quizSchema, type Question, type QuizAnswers } from "./autograde";

export const XP_RULES = ["task.approved", "task.daily", "task.weekly"] as const;
export const MAX_SUBMISSION_FILES = 5;

const rubricSchema = z.array(z.object({ criterion: z.string().trim().min(1).max(120), points: z.number().int().min(1).max(1000) })).max(12);
const teamsSchema = z
  .array(z.object({ name: z.string().trim().min(1).max(60), usernames: z.array(z.string().trim().toLowerCase().min(1).max(40)).min(1).max(20) }))
  .max(100);

export const assignmentInputSchema = z
  .object({
    title: z.string().trim().min(3).max(140),
    description: z.string().max(20_000).default(""),
    kind: z.enum(["TEXT", "SHORT_ANSWER", "FILE", "PCAP", "LOG", "OSINT", "CODE_REVIEW", "VMWARE", "QUIZ"]).default("TEXT"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
    audience: z.enum(["ALL", "SELECTED", "GROUP"]).default("ALL"),
    targetUsernames: z.array(z.string().trim().toLowerCase().min(1).max(40)).max(500).default([]),
    groupId: z.string().min(1).max(40).nullable().default(null),
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
    teamMode: z.boolean().default(false),
    teams: teamsSchema.default([]),
    quiz: z.unknown().optional(),
    passPercent: z.number().int().min(0).max(100).default(60),
    maxAttempts: z.number().int().min(1).max(20).nullable().default(null),
  })
  .superRefine((v, ctx) => {
    if (v.dueAt && v.startsAt && v.dueAt <= v.startsAt) ctx.addIssue({ code: "custom", path: ["dueAt"], message: "Son teslim, başlangıçtan sonra olmalı." });
    if (v.rubric.length && v.rubric.reduce((a, r) => a + r.points, 0) !== v.maxScore)
      ctx.addIssue({ code: "custom", path: ["rubric"], message: "Ölçüt puanlarının toplamı en yüksek puana eşit olmalı." });
    if (v.kind !== "QUIZ" && !v.requireText && !v.requireFile) ctx.addIssue({ code: "custom", path: ["requireText"], message: "Metin ya da dosyadan en az biri istenmeli." });
    if (v.audience === "SELECTED" && !v.teamMode && !v.targetUsernames.length) ctx.addIssue({ code: "custom", path: ["targetUsernames"], message: "En az bir öğrenci seç." });
    if (v.audience === "GROUP" && !v.groupId) ctx.addIssue({ code: "custom", path: ["groupId"], message: "Bir sınıf ya da etkinlik seç." });
    if (v.teamMode) {
      if (!v.teams.length) ctx.addIssue({ code: "custom", path: ["teams"], message: "En az bir takım tanımla." });
      if (v.kind === "QUIZ") ctx.addIssue({ code: "custom", path: ["teamMode"], message: "Otomatik puanlanan görev kişiseldir; takım görevi olamaz." });
      const all = v.teams.flatMap((t) => t.usernames);
      if (new Set(all).size !== all.length) ctx.addIssue({ code: "custom", path: ["teams"], message: "Bir öğrenci yalnız bir takımda olabilir." });
      if (new Set(v.teams.map((t) => t.name.toLocaleLowerCase("tr"))).size !== v.teams.length) ctx.addIssue({ code: "custom", path: ["teams"], message: "Takım adları farklı olmalı." });
    }
    if (v.kind === "QUIZ") {
      if (v.rubric.length) ctx.addIssue({ code: "custom", path: ["rubric"], message: "Otomatik puanlanan görevde rubrik kullanılmaz." });
      const q = quizSchema.safeParse(v.quiz);
      if (!q.success) ctx.addIssue({ code: "custom", path: ["quiz"], message: q.error.issues[0]?.message ?? "Sorular geçersiz." });
    }
  })
  .transform((v) => ({
    ...v,
    // Takım görevinde hedef = takım üyeleri; otomatik puanlamada metin/dosya istenmez.
    audience: v.teamMode ? ("SELECTED" as const) : v.audience,
    targetUsernames: v.teamMode ? v.teams.flatMap((t) => t.usernames) : v.targetUsernames,
    groupId: v.audience === "GROUP" && !v.teamMode ? v.groupId : null,
    requireText: v.kind === "QUIZ" ? false : v.requireText,
    requireFile: v.kind === "QUIZ" ? false : v.requireFile,
    quiz: v.kind === "QUIZ" ? quizSchema.parse(v.quiz) : null,
  }));
export type AssignmentInput = z.output<typeof assignmentInputSchema>;

function requireStaff(actor: Actor) {
  if (!canManageClassroom(actor)) throw forbidden("Görev yönetimi eğitmen ve yöneticilere açıktır.");
}

async function resolveUsers(usernames: string[]) {
  const unique = [...new Set(usernames)];
  const users = await db.user.findMany({ where: { username: { in: unique }, status: "ACTIVE", role: "STUDENT" }, select: { id: true, username: true } });
  const missing = unique.filter((u) => !users.some((x) => x.username === u));
  if (missing.length) throw badRequest(`Aktif öğrenci bulunamadı: ${missing.slice(0, 5).join(", ")}`, "BAD_TARGETS");
  return new Map(users.map((u) => [u.username, u.id]));
}

async function checkGroup(groupId: string | null) {
  if (!groupId) return;
  const g = await db.classGroup.findUnique({ where: { id: groupId }, select: { archivedAt: true } });
  if (!g || g.archivedAt) throw badRequest("Seçilen sınıf/etkinlik bulunamadı.", "BAD_GROUP");
}

function dataOf(input: AssignmentInput) {
  return {
    title: input.title,
    description: input.description,
    kind: input.kind,
    difficulty: input.difficulty,
    audience: input.audience,
    groupId: input.groupId,
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
    teamMode: input.teamMode,
    quiz: input.quiz ? (input.quiz as Prisma.InputJsonValue) : undefined,
    passPercent: input.passPercent,
    maxAttempts: input.maxAttempts,
  };
}

async function writeTeams(tx: Prisma.TransactionClient, assignmentId: string, input: AssignmentInput, ids: Map<string, string>) {
  await tx.assignmentTeam.deleteMany({ where: { assignmentId } });
  for (const t of input.teamMode ? input.teams : []) {
    await tx.assignmentTeam.create({
      data: { assignmentId, name: t.name, members: { create: t.usernames.map((u) => ({ userId: ids.get(u)!, assignmentId })) } },
    });
  }
}

export async function createAssignment(actor: Actor, input: AssignmentInput, ip: string, extra: { liveSessionId?: string; slideId?: string } = {}) {
  requireStaff(actor);
  const ids = input.audience === "SELECTED" ? await resolveUsers(input.targetUsernames) : new Map<string, string>();
  await checkGroup(input.groupId);
  return db.$transaction(async (tx) => {
    const a = await tx.assignment.create({
      data: { ...dataOf(input), createdById: actor.id, ...extra, targets: { create: [...ids.values()].map((userId) => ({ userId })) } },
    });
    await writeTeams(tx, a.id, input, ids);
    await audit({ actorId: actor.id, action: "assignment.create", targetType: "Assignment", targetId: a.id, meta: { title: a.title, kind: a.kind, teams: input.teams.length }, ip }, tx);
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
  const subs = await db.submission.count({ where: { assignmentId: id } });
  // Teslim alındıktan sonra takım yapısı ve soru/cevap anahtarı değişmez (önceki puanlar anlamsızlaşır).
  if (subs && (a.teamMode !== input.teamMode || (a.teamMode && JSON.stringify(input.teams) !== JSON.stringify(await teamShape(id)))))
    throw conflict("Teslim alınmış görevin takımları değiştirilemez.", "HAS_SUBMISSIONS");
  if (subs && a.kind === "QUIZ" && JSON.stringify(a.quiz) !== JSON.stringify(input.quiz)) throw conflict("Teslim alınmış görevin soruları değiştirilemez.", "HAS_SUBMISSIONS");
  const ids = input.audience === "SELECTED" ? await resolveUsers(input.targetUsernames) : new Map<string, string>();
  await checkGroup(input.groupId);
  await db.$transaction(async (tx) => {
    await tx.assignmentTarget.deleteMany({ where: { assignmentId: id } });
    await tx.assignment.update({
      where: { id },
      data: {
        ...dataOf(input),
        rubric: input.rubric.length ? (input.rubric as Prisma.InputJsonValue) : undefined,
        targets: { create: [...ids.values()].map((userId) => ({ userId })) },
      },
    });
    if (!subs) await writeTeams(tx, id, input, ids);
    await audit({ actorId: actor.id, action: "assignment.update", targetType: "Assignment", targetId: id, meta: { title: input.title }, ip }, tx);
  });
  return a;
}

async function teamShape(assignmentId: string) {
  const teams = await db.assignmentTeam.findMany({ where: { assignmentId }, orderBy: { name: "asc" }, include: { members: { include: { user: { select: { username: true } } } } } });
  return teams.map((t) => ({ name: t.name, usernames: t.members.map((m) => m.user.username) }));
}

async function recipientsOf(tx: Prisma.TransactionClient, a: { id: string; audience: string; groupId: string | null }) {
  if (a.audience === "ALL") return activeUserIds({ students: true });
  if (a.audience === "GROUP") return a.groupId ? groupMemberIds(a.groupId) : [];
  return (await tx.assignmentTarget.findMany({ where: { assignmentId: a.id }, select: { userId: true } })).map((t) => t.userId);
}

// Yayınlamak hedef öğrencilere bildirim gönderir; kapatmak yeni teslimleri durdurur.
export async function setAssignmentStatus(actor: Actor, id: string, status: "DRAFT" | "PUBLISHED" | "CLOSED", ip: string) {
  const a = await loadEditable(actor, id);
  if (a.status === status) return;
  if (status === "DRAFT" && (await db.submission.count({ where: { assignmentId: id } }))) throw conflict("Teslim alınmış görev taslağa çekilemez; kapatabilirsin.", "HAS_SUBMISSIONS");
  await db.$transaction(async (tx) => {
    await tx.assignment.update({ where: { id }, data: { status } });
    if (status === "PUBLISHED" && a.status === "DRAFT") {
      await notify(tx, await recipientsOf(tx, a), {
        type: "ASSIGNMENT",
        title: `Yeni görev: ${a.title}`,
        body: a.dueAt ? `Son teslim: ${a.dueAt.toISOString().slice(0, 16).replace("T", " ")}` : "",
        link: `/tasks/${id}`,
      });
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

// Kişinin bu görevdeki teslimi: takım görevinde takımının teslimi, değilse kendi teslimi.
const mySubmissionWhere = (userId: string): Prisma.SubmissionWhereInput => ({ OR: [{ userId, teamId: null }, { team: { members: { some: { userId } } } }] });

// ── Listeleme ───────────────────────────────────────────────────────────────
export async function listAssignmentsForStaff(actor: Actor) {
  requireStaff(actor);
  const rows = await db.assignment.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 200,
    include: {
      createdBy: { select: { displayName: true } },
      liveSession: { select: { code: true } }, // uygulama molasından doğan görevler etiketlenir
      group: { select: { name: true, kind: true } },
      _count: { select: { submissions: true, targets: true, teams: true } },
    },
  });
  const pending = await db.submission.groupBy({ by: ["assignmentId"], where: { status: "SUBMITTED" }, _count: true });
  const p = new Map(pending.map((r) => [r.assignmentId, r._count]));
  // Cevap anahtarı listelerde taşınmaz.
  return rows.map((a) => ({ ...a, quiz: undefined, pending: p.get(a.id) ?? 0, canEdit: canEditAssignment(actor, a) }));
}

export async function listAssignmentsForStudent(actor: Actor) {
  const rows = await db.assignment.findMany({
    where: visibleAssignmentsWhere(actor),
    orderBy: [{ dueAt: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    take: 200,
    include: { submissions: { where: mySubmissionWhere(actor.id), select: { status: true, score: true, late: true } }, group: { select: { name: true } } },
  });
  return rows.map(({ submissions, ...a }) => ({ ...a, quiz: undefined, mine: submissions[0] ?? null }));
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
        { submissions: { none: { AND: [mySubmissionWhere(actor.id), { status: { not: "RETURNED" } }] } } },
      ],
    },
  });
}

export function pendingReviewCount(actor: Actor) {
  return db.submission.count({ where: { status: "SUBMITTED", ...(isAdmin(actor.role) ? {} : { assignment: { createdById: actor.id } }) } });
}

// Öğrencinin bir görevi (yalnız kendi ya da takımının teslimiyle). Otomatik puanlamada cevap anahtarı çıkarılır.
export async function getAssignmentForStudent(actor: Actor, id: string) {
  const a = await db.assignment.findFirst({
    where: { id, ...visibleAssignmentsWhere(actor) },
    include: {
      files: { where: { deletedAt: null }, select: { id: true, name: true, size: true, kind: true } },
      submissions: {
        where: mySubmissionWhere(actor.id),
        include: { files: { where: { deletedAt: null }, select: { id: true, name: true, size: true } }, user: { select: { displayName: true } } },
      },
      createdBy: { select: { displayName: true } },
      group: { select: { id: true, name: true, kind: true } },
      teams: { where: { members: { some: { userId: actor.id } } }, include: { members: { include: { user: { select: { displayName: true } } } } } },
    },
  });
  if (!a) throw notFound("Görev bulunamadı.");
  const { submissions, quiz, teams, ...rest } = a;
  const myTeam = teams[0] ? { id: teams[0].id, name: teams[0].name, members: teams[0].members.map((m) => m.user.displayName) } : null;
  const mine = submissions[0] ?? null;
  const qs = (quiz ?? null) as Question[] | null;
  // Sonuç kesinleşince (geçti ya da hakkı bitti) her sorunun doğru/yanlış bilgisi ve açıklaması gösterilir.
  const final = !!mine && (mine.status === "APPROVED" || mine.status === "REJECTED");
  const review = qs && mine?.answers && final ? gradeAnswers(qs, mine.answers as QuizAnswers, a.id).results.map((ok, i) => ({ ok, explanation: qs[i]!.explanation })) : null;
  return {
    ...rest,
    quiz: qs ? publicQuiz(qs, a.id) : null,
    quizReview: review,
    myTeam,
    mine: mine ? { ...mine, answers: undefined } : null,
  };
}

export async function getAssignmentForStaff(actor: Actor, id: string) {
  requireStaff(actor);
  const a = await db.assignment.findUnique({
    where: { id },
    include: {
      files: { where: { deletedAt: null }, select: { id: true, name: true, size: true, kind: true } },
      targets: { select: { user: { select: { username: true, displayName: true } } } },
      group: { select: { id: true, name: true, kind: true, _count: { select: { members: true } } } },
      teams: { orderBy: { name: "asc" }, include: { members: { include: { user: { select: { username: true, displayName: true } } } } } },
      submissions: {
        orderBy: { submittedAt: "asc" },
        include: {
          user: { select: { username: true, displayName: true } },
          team: { select: { name: true } },
          files: { where: { deletedAt: null }, select: { id: true, name: true, size: true } },
        },
      },
      createdBy: { select: { displayName: true } },
    },
  });
  if (!a) throw notFound("Görev bulunamadı.");
  return { ...a, canEdit: canEditAssignment(actor, a) };
}

// ── Teslim ──────────────────────────────────────────────────────────────────
type SubmitInput = { text: string; files: File[]; answers?: unknown };

export async function submitAssignment(actor: Actor, id: string, input: SubmitInput, ip: string) {
  if (isStaff(actor.role)) throw forbidden("Görev teslimi öğrencilere açıktır.");
  const a = await db.assignment.findFirst({ where: { id, ...visibleAssignmentsWhere(actor) } });
  if (!a) throw notFound("Görev bulunamadı.");
  if (a.status !== "PUBLISHED") throw conflict("Bu görev teslime kapalı.", "CLOSED");
  const now = new Date();
  const late = !!a.dueAt && now > a.dueAt;
  if (late && !a.allowLate) throw conflict("Son teslim tarihi geçti.", "PAST_DUE");
  const text = input.text.trim().slice(0, 20_000);
  if (input.files.length > MAX_SUBMISSION_FILES) throw badRequest(`En fazla ${MAX_SUBMISSION_FILES} dosya eklenebilir.`, "TOO_MANY_FILES");

  let teamId: string | null = null;
  if (a.teamMode) {
    const m = await db.assignmentTeamMember.findUnique({ where: { assignmentId_userId: { assignmentId: id, userId: actor.id } } });
    if (!m) throw forbidden("Bu takım görevinde bir takıma atanmadın; eğitmenine haber ver.");
    teamId = m.teamId;
  }
  const prevWhere = teamId ? { teamId } : { assignmentId_userId: { assignmentId: id, userId: actor.id } };
  const prev = await db.submission.findUnique({ where: prevWhere, include: { _count: { select: { files: { where: { deletedAt: null } } } } } });
  if (prev && (prev.status === "APPROVED" || prev.status === "REJECTED")) throw conflict("Bu teslim değerlendirildi; değiştirilemez.", "LOCKED");
  if (prev?.status === "RETURNED" && !a.allowResubmit) throw conflict("Bu görevde yeniden teslim kapalı.", "NO_RESUBMIT");

  // Otomatik puanlanan görev: cevaplar sunucuda puanlanır; geçerse onay + XP aynı transaction'da.
  let graded: ReturnType<typeof gradeAnswers> | null = null;
  let answers: QuizAnswers | null = null;
  if (a.kind === "QUIZ") {
    if (prev && a.maxAttempts !== null && prev.attempts >= a.maxAttempts) throw conflict("Deneme hakkın bitti.", "NO_ATTEMPTS");
    const parsed = answersSchema.safeParse(input.answers);
    if (!parsed.success) throw badRequest("Cevaplar geçersiz.", "BAD_ANSWERS");
    answers = parsed.data;
    graded = gradeAnswers(a.quiz as Question[], answers, a.id);
    if (input.files.length) throw badRequest("Bu görev dosya kabul etmiyor.", "NO_FILES");
  } else {
    const fileCount = (prev?._count.files ?? 0) + input.files.length;
    if (fileCount > MAX_SUBMISSION_FILES) throw badRequest(`Bir teslimde en fazla ${MAX_SUBMISSION_FILES} dosya olabilir.`, "TOO_MANY_FILES");
    if (a.requireText && !text) throw badRequest("Bu görev bir açıklama/cevap metni istiyor.", "TEXT_REQUIRED");
    if (a.requireFile && fileCount === 0) throw badRequest("Bu görev en az bir dosya istiyor.", "FILE_REQUIRED");
  }

  const attempts = prev ? prev.attempts + (prev.status === "RETURNED" ? 1 : 0) : 1;
  const out = await db.$transaction(async (tx) => {
    const base = { text, late, submittedAt: now, ...(answers ? { answers: answers as Prisma.InputJsonValue } : {}) };
    let auto: { status: "APPROVED" | "RETURNED" | "REJECTED"; score: number; feedback: string } | null = null;
    if (graded) {
      const score = Math.round((graded.correct / graded.total) * a.maxScore);
      const passed = graded.percent >= a.passPercent;
      const left = a.maxAttempts === null ? Infinity : a.maxAttempts - attempts;
      const status = passed ? "APPROVED" : left > 0 && a.allowResubmit ? "RETURNED" : "REJECTED";
      const feedback = `Otomatik puan: ${graded.correct}/${graded.total} doğru (%${graded.percent}, geçme %${a.passPercent}).${status === "RETURNED" ? ` Tekrar deneyebilirsin${Number.isFinite(left) ? ` (${left} hak)` : ""}.` : ""}`;
      auto = { status, score, feedback };
    }
    const data = { ...base, status: auto?.status ?? ("SUBMITTED" as const), score: auto?.score ?? null, feedback: auto?.feedback ?? "", reviewedAt: auto ? now : null, reviewedById: null };
    const s = prev
      ? await tx.submission.update({ where: { id: prev.id }, data: { ...data, attempts } })
      : await tx.submission.create({ data: { ...data, assignmentId: id, userId: actor.id, teamId } });
    for (const f of input.files) await storeFile(tx, actor, f, { scope: "SUBMISSION", submissionId: s.id });
    let xp = 0;
    if (auto?.status === "APPROVED") xp = await awardTask(tx, a, actor.id);
    await audit({ actorId: actor.id, action: "submission.submit", targetType: "Submission", targetId: s.id, meta: { assignmentId: id, files: input.files.length, late, auto: auto?.status ?? null, teamId }, ip }, tx);
    if (!auto && a.createdById) await notify(tx, [a.createdById], { type: "SUBMISSION", title: `Yeni teslim: ${a.title}`, link: `/teach/tasks/${id}` });
    if (auto) await notify(tx, [actor.id], { type: "REVIEW", title: `${a.title}: ${auto.status === "APPROVED" ? `geçti${xp ? ` (+${xp} XP)` : ""}` : auto.status === "RETURNED" ? "tekrar dene" : "geçemedi"}`, body: auto.feedback, link: `/tasks/${id}` });
    return { ...s, xp };
  }, XP_TX);
  if (out.status === "APPROVED") await evaluateBadges(actor.id);
  return out;
}

function awardTask(tx: Prisma.TransactionClient, a: { id: string; title: string; xpRuleKey: string; xpAmount: number | null }, userId: string) {
  return award(tx, {
    userId,
    ruleKey: a.xpRuleKey as (typeof XP_RULES)[number],
    key: `task:${userId}:${a.id}`,
    source: "TASK",
    refType: "Assignment",
    refId: a.id,
    reason: a.title,
    ...(a.xpAmount !== null ? { amount: a.xpAmount } : {}),
  });
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
  const s = await tx.submission.findUnique({ where: { id: submissionId }, include: { assignment: true, team: { include: { members: { select: { userId: true } } } } } });
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
  // Takım teslimi: sonuç ve XP takımdaki herkese (kişi başı bir kez).
  const userIds = s.team ? s.team.members.map((m) => m.userId) : [s.userId];
  let xp = 0;
  if (status === "APPROVED") for (const uid of userIds) xp = Math.max(xp, await awardTask(tx, a, uid));
  const label = status === "APPROVED" ? `onaylandı${xp ? ` (+${xp} XP)` : ""}` : status === "RETURNED" ? "düzeltme istendi" : "reddedildi";
  await notify(tx, userIds, { type: "REVIEW", title: `${a.title}: ${label}`, body: input.feedback, link: `/tasks/${a.id}` });
  return { userIds, status, xp };
}

export async function reviewSubmission(actor: Actor, submissionId: string, input: ReviewInput, ip: string) {
  requireStaff(actor);
  const r = await db.$transaction(async (tx) => {
    const out = await reviewOne(tx, actor, submissionId, input);
    await audit({ actorId: actor.id, action: `submission.${out.status.toLowerCase()}`, targetType: "Submission", targetId: submissionId, meta: { xp: out.xp, members: out.userIds.length }, ip }, tx);
    return out;
  }, XP_TX);
  if (r.status === "APPROVED") for (const uid of r.userIds) await evaluateBadges(uid);
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
