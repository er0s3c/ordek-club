// Ek süre talebi ve kontrollü akran değerlendirmesi.
// Ek süre: öğrenci gerekçe yazar, görevin sahibi (ya da yönetici) onaylar/reddeder; onay kişiye özel son tarih üretir.
// Akran değerlendirmesi: öğretmen açar ve dağıtır; değerlendiren ve değerlendirilen birbirinin adını görmez;
// akran puanları yalnız geri bildirimdir, son not öğretmende kalır.
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { badRequest, conflict, forbidden, notFound, tooMany } from "@/server/errors";
import { canEditAssignment, isStaff, type Actor } from "@/server/auth/policy";
import { hit } from "@/server/rate-limit";
import { notify } from "./notifications";
import { visibleAssignmentsWhere } from "./access";
import { award } from "@/server/xp/engine";

export const extensionSchema = z.object({ reason: z.string().trim().min(15, "Gerekçeni biraz daha açıkla.").max(1500), requestedDue: z.coerce.date() });

export async function requestExtension(actor: Actor, assignmentId: string, input: z.output<typeof extensionSchema>) {
  if (isStaff(actor.role)) throw forbidden();
  const r = hit(`ext:${actor.id}:${assignmentId}`, 3, 7 * 86_400_000);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const a = await db.assignment.findFirst({ where: { id: assignmentId, ...visibleAssignmentsWhere(actor) } });
  if (!a) throw notFound();
  if (!a.dueAt) throw badRequest("Bu görevin son tarihi yok.");
  if (input.requestedDue <= a.dueAt) throw badRequest("İstenen tarih mevcut son tarihten sonra olmalı.");
  if (input.requestedDue.getTime() - a.dueAt.getTime() > 30 * 86_400_000) throw badRequest("En fazla 30 günlük uzatma istenebilir.");
  if (await db.extensionRequest.findFirst({ where: { assignmentId, userId: actor.id, status: "PENDING" } })) throw conflict("Bekleyen bir talebin var.");
  return db.$transaction(async (tx) => {
    const row = await tx.extensionRequest.create({ data: { assignmentId, userId: actor.id, reason: input.reason, requestedDue: input.requestedDue } });
    if (a.createdById) await notify(tx, [a.createdById], { type: "SUBMISSION", title: `Ek süre talebi: ${a.title}`, body: input.reason.slice(0, 160), link: `/teach/tasks/${a.id}#extensions` });
    return row;
  });
}

export const decisionSchema = z.object({ approve: z.boolean(), dueAt: z.coerce.date().optional(), note: z.string().trim().max(1000).default("") });

export async function decideExtension(actor: Actor, id: string, input: z.output<typeof decisionSchema>, ip: string) {
  return db.$transaction(async (tx) => {
    const e = await tx.extensionRequest.findUnique({ where: { id }, include: { assignment: true } });
    if (!e) throw notFound();
    if (!canEditAssignment(actor, e.assignment)) throw forbidden();
    if (e.status !== "PENDING") throw conflict("Bu talep için karar verilmiş.");
    const due = input.dueAt ?? e.requestedDue;
    await tx.extensionRequest.update({ where: { id }, data: { status: input.approve ? "APPROVED" : "REJECTED", decidedById: actor.id, decidedAt: new Date(), decisionNote: input.note } });
    if (input.approve) await tx.deadlineOverride.upsert({ where: { assignmentId_userId: { assignmentId: e.assignmentId, userId: e.userId } }, create: { assignmentId: e.assignmentId, userId: e.userId, dueAt: due }, update: { dueAt: due } });
    // Tarih dile bağımsız biçimde saklanır (YYYY-MM-DD HH:mm): bildirim metni okunurken çevrilir,
    // sabit "tr-TR" biçimi İngilizce okuyucuya Türkçe ay adı gösteriyordu.
    const dueText = due.toISOString().slice(0, 16).replace("T", " ");
    await notify(tx, [e.userId], { type: "REVIEW", title: `Ek süre ${input.approve ? "onaylandı" : "reddedildi"}: ${e.assignment.title}`, body: input.approve ? `Yeni son tarihin: ${dueText}. ${input.note}` : input.note, link: `/tasks/${e.assignmentId}` });
    await audit({ actorId: actor.id, action: "extension.decide", targetType: "ExtensionRequest", targetId: id, meta: { approve: input.approve }, ip }, tx);
  });
}

export const listExtensions = (assignmentId: string) =>
  db.extensionRequest.findMany({ where: { assignmentId }, orderBy: { createdAt: "desc" }, include: { user: { select: { displayName: true } }, decidedBy: { select: { displayName: true } } } });

// ── akran değerlendirmesi ──
export async function distributePeerReviews(actor: Actor, assignmentId: string) {
  const a = await db.assignment.findUnique({ where: { id: assignmentId } });
  if (!a) throw notFound();
  if (!canEditAssignment(actor, a)) throw forbidden();
  if (!a.peerReviewEnabled) throw badRequest("Önce görevde akran değerlendirmesini aç.");
  const subs = await db.submission.findMany({ where: { assignmentId, status: { in: ["SUBMITTED", "RETURNED", "APPROVED"] }, teamId: null }, select: { id: true, userId: true }, orderBy: { submittedAt: "asc" } });
  if (subs.length < 2) throw conflict("Dağıtım için en az iki teslim gerekir.");
  const k = Math.min(a.peerReviewCount, subs.length - 1);
  // Dairesel atama: i. öğrenci (i+1..i+k). teslimleri değerlendirir; kimse kendi teslimini almaz, yük eşittir.
  const rows = subs.flatMap((s, i) => Array.from({ length: k }, (_, j) => ({ assignmentId, reviewerId: s.userId, submissionId: subs[(i + j + 1) % subs.length]!.id })));
  const created = await db.peerReview.createMany({ data: rows, skipDuplicates: true });
  const reviewers = [...new Set(rows.map((r) => r.reviewerId))];
  await db.$transaction((tx) => notify(tx, reviewers, { type: "ASSIGNMENT", title: `Akran değerlendirmesi: ${a.title}`, body: `${k} arkadaşının çalışmasını rubrikle değerlendir. Kimlikler gizlidir.`, link: `/tasks/${assignmentId}#peer` }));
  return { created: created.count, perStudent: k };
}

export async function myPeerTasks(actor: Actor, assignmentId: string) {
  const rows = await db.peerReview.findMany({ where: { assignmentId, reviewerId: actor.id }, orderBy: { createdAt: "asc" }, include: { submission: { select: { text: true } } } });
  return rows.map((r, i) => ({ id: r.id, label: `Çalışma ${String.fromCharCode(65 + i)}`, text: r.submission.text, status: r.status, rubricScores: r.rubricScores as number[] | null, comment: r.comment }));
}

export async function receivedPeerReviews(actor: Actor, assignmentId: string) {
  const sub = await db.submission.findUnique({ where: { assignmentId_userId: { assignmentId, userId: actor.id } }, select: { id: true } });
  if (!sub) return [];
  const rows = await db.peerReview.findMany({ where: { submissionId: sub.id, status: "DONE" }, orderBy: { submittedAt: "asc" } });
  return rows.map((r, i) => ({ id: r.id, label: `Akran ${i + 1}`, rubricScores: r.rubricScores as number[] | null, comment: r.comment }));
}

export const peerSchema = z.object({ rubricScores: z.array(z.number().int().min(0).max(1000)).max(20), comment: z.string().trim().min(20, "Gerekçeli, yapıcı bir yorum yaz (en az bir cümle).").max(2000) });

export async function submitPeerReview(actor: Actor, id: string, input: z.output<typeof peerSchema>) {
  return db.$transaction(async (tx) => {
    const r = await tx.peerReview.findUnique({ where: { id }, include: { assignment: true } });
    if (!r || r.reviewerId !== actor.id) throw notFound();
    if (r.status === "DONE") throw conflict("Bu değerlendirmeyi gönderdin.");
    const rubric = (Array.isArray(r.assignment.rubric) ? r.assignment.rubric : []) as { points: number }[];
    if (input.rubricScores.length !== rubric.length || input.rubricScores.some((v, i) => v > rubric[i]!.points)) throw badRequest("Rubrik puanları geçersiz.");
    await tx.peerReview.update({ where: { id }, data: { rubricScores: input.rubricScores, comment: input.comment, status: "DONE", submittedAt: new Date() } });
    return award(tx, { userId: actor.id, ruleKey: "peer.review", key: `peer:${id}`, source: "TASK", reason: `Akran değerlendirmesi: ${r.assignment.title}`, refType: "PeerReview", refId: id });
  });
}

export async function peerReviewsForStaff(assignmentId: string) {
  const rows = await db.peerReview.findMany({ where: { assignmentId }, include: { reviewer: { select: { displayName: true } }, submission: { select: { id: true, user: { select: { displayName: true } } } } } });
  return rows.map((r) => ({ id: r.id, submissionId: r.submission.id, author: r.submission.user.displayName, reviewer: r.reviewer.displayName, status: r.status, rubricScores: r.rubricScores as number[] | null, comment: r.comment }));
}
