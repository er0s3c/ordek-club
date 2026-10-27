// Sınıf içgörüleri (yalnız öğretmene): öğrenci × ders ısı haritası, destek gerekebilecek öğrenciler (gerekçeli),
// radardan müdahale (tekrar paketi atama ve önce/sonra karşılaştırması), takım oluşturucu ve dönem ders planı.
import { z } from "zod";
import { db } from "@/server/db";
import { badRequest, forbidden, notFound } from "@/server/errors";
import { isAdmin, isStaff, type Actor } from "@/server/auth/policy";
import { notify } from "@/server/classroom/notifications";
import { civilDay } from "@/server/learning/service";

async function ownedGroup(actor: Actor, groupId: string) {
  if (!isStaff(actor.role)) throw forbidden();
  const g = await db.classGroup.findFirst({ where: { id: groupId, archivedAt: null, ...(!isAdmin(actor.role) ? { createdById: actor.id } : {}) }, include: { members: { where: { user: { status: "ACTIVE", role: "STUDENT" } }, select: { userId: true, user: { select: { displayName: true, username: true } } } } } });
  if (!g) throw notFound("Sınıf bulunamadı ya da senin değil.");
  return g;
}

export async function myGroups(actor: Actor) {
  return db.classGroup.findMany({ where: { archivedAt: null, kind: "CLASS", ...(!isAdmin(actor.role) ? { createdById: actor.id } : {}) }, select: { id: true, name: true, _count: { select: { members: true } } }, orderBy: { name: "asc" } });
}

// Isı haritası: seçilen yolun dersleri sütun, öğrenciler satır. 0 başlanmadı · 1 başladı · 2 tamamladı.
export async function heatmap(actor: Actor, groupId: string, trackKey: string) {
  const g = await ownedGroup(actor, groupId);
  const ids = g.members.map((m) => m.userId);
  const lessons = await db.lesson.findMany({ where: { archivedAt: null, track: { key: trackKey, archivedAt: null } }, orderBy: { position: "asc" }, select: { id: true, slug: true, title: true, progress: { where: { userId: { in: ids } }, select: { userId: true, status: true } } } });
  return {
    lessons: lessons.map((l, i) => ({ slug: l.slug, title: l.title, no: i + 1 })),
    rows: g.members.map((m) => ({ id: m.userId, name: m.user.displayName, cells: lessons.map((l) => { const p = l.progress.find((x) => x.userId === m.userId); return p?.status === "COMPLETED" ? 2 : p ? 1 : 0; }) })),
  };
}

// Destek listesi: açıklanabilir kurallarla (puanlama yok). Öğretmenin bilgisi içindir; öğrenciye etiket olarak gösterilmez.
export async function supportList(actor: Actor, groupId: string, now = new Date()) {
  const g = await ownedGroup(actor, groupId);
  const ids = g.members.map((m) => m.userId);
  const since = new Date(now.getTime() - 7 * 86_400_000);
  const [recent, late, quizzes, overdue] = await Promise.all([
    db.learningEvent.groupBy({ by: ["userId"], where: { userId: { in: ids }, createdAt: { gte: since } }, _count: true }),
    db.submission.groupBy({ by: ["userId"], where: { userId: { in: ids }, late: true, submittedAt: { gte: new Date(now.getTime() - 30 * 86_400_000) } }, _count: true }),
    db.quizAttempt.findMany({ where: { userId: { in: ids }, createdAt: { gte: new Date(now.getTime() - 30 * 86_400_000) } }, select: { userId: true, score: true } }),
    db.assignment.findMany({ where: { status: "PUBLISHED", dueAt: { lt: now }, OR: [{ audience: "ALL" }, { groupId }] }, select: { id: true, title: true, submissions: { where: { userId: { in: ids } }, select: { userId: true } }, deadlineOverrides: { where: { userId: { in: ids } }, select: { userId: true, dueAt: true } } } }),
  ]);
  return g.members.map((m) => {
    const reasons: string[] = [];
    if (!recent.find((r) => r.userId === m.userId)) reasons.push("7 gündür doğrulanmış çalışma yok");
    const lateCount = late.find((r) => r.userId === m.userId)?._count ?? 0;
    if (lateCount >= 2) reasons.push(`Son 30 günde ${lateCount} geç teslim`);
    const qs = quizzes.filter((q) => q.userId === m.userId);
    if (qs.length >= 3) { const avg = Math.round(qs.reduce((a, q) => a + q.score, 0) / qs.length); if (avg < 50) reasons.push(`Son quiz ortalaması %${avg}`); }
    const missing = overdue.filter((a) => !a.submissions.some((s) => s.userId === m.userId) && !a.deadlineOverrides.some((o) => o.userId === m.userId && o.dueAt > now));
    if (missing.length) reasons.push(`${missing.length} görev teslim edilmedi (${missing.slice(0, 2).map((a) => a.title).join(", ")}${missing.length > 2 ? "…" : ""})`);
    return { id: m.userId, name: m.user.displayName, username: m.user.username, reasons };
  }).filter((r) => r.reasons.length).sort((a, b) => b.reasons.length - a.reasons.length);
}

// Beceri yüzdesi: hedef öğrencilerin, beceriyle etiketli derslerde tamamlama oranı.
async function skillPct(userIds: string[], skill: string) {
  if (!userIds.length) return 0;
  const lessons = await db.lesson.findMany({ where: { archivedAt: null, skills: { has: skill } }, select: { id: true } });
  if (!lessons.length) return 0;
  const done = await db.lessonProgress.count({ where: { userId: { in: userIds }, status: "COMPLETED", lessonId: { in: lessons.map((l) => l.id) } } });
  return Math.round((done / (lessons.length * userIds.length)) * 100);
}

export const interventionSchema = z.object({ groupId: z.string().min(1).max(40), skill: z.string().regex(/^[a-z0-9-]{1,30}$/), userIds: z.array(z.string().min(1).max(40)).min(1).max(200), lessonSlugs: z.array(z.string().regex(/^[a-z0-9-]{1,40}$/)).min(1).max(10), note: z.string().trim().max(1000).default(""), dueAt: z.coerce.date().nullable().default(null) });

export async function createIntervention(actor: Actor, input: z.output<typeof interventionSchema>) {
  const g = await ownedGroup(actor, input.groupId);
  const members = new Set(g.members.map((m) => m.userId));
  const targets = input.userIds.filter((id) => members.has(id));
  if (!targets.length) throw badRequest("Seçilen öğrenciler bu sınıfta değil.");
  const found = await db.lesson.count({ where: { slug: { in: input.lessonSlugs }, archivedAt: null } });
  if (found !== input.lessonSlugs.length) throw badRequest("Ders kimliklerinden biri bulunamadı.");
  const baseline = await skillPct(targets, input.skill);
  return db.$transaction(async (tx) => {
    const r = await tx.radarIntervention.create({ data: { groupId: g.id, skill: input.skill, lessonSlugs: input.lessonSlugs, note: input.note, dueAt: input.dueAt, baseline, createdById: actor.id, targets: { create: targets.map((userId) => ({ userId })) } } });
    await notify(tx, targets, { type: "ASSIGNMENT", title: "Sana bir tekrar paketi önerildi", body: input.note || `${input.lessonSlugs.length} kısa ders`, link: `/academy/lesson/${input.lessonSlugs[0]}` });
    return r;
  });
}

export async function interventions(actor: Actor, groupId: string) {
  await ownedGroup(actor, groupId);
  const rows = await db.radarIntervention.findMany({ where: { groupId }, orderBy: { createdAt: "desc" }, take: 20, include: { targets: { select: { userId: true } } } });
  return Promise.all(rows.map(async (r) => {
    const ids = r.targets.map((t) => t.userId);
    const lessons = await db.lesson.findMany({ where: { slug: { in: r.lessonSlugs } }, select: { id: true } });
    const doneAll = lessons.length ? (await db.lessonProgress.groupBy({ by: ["userId"], where: { userId: { in: ids }, lessonId: { in: lessons.map((l) => l.id) }, status: "COMPLETED" }, _count: true })).filter((x) => x._count >= lessons.length).length : 0;
    return { id: r.id, skill: r.skill, lessons: r.lessonSlugs, note: r.note, createdAt: r.createdAt.toISOString(), dueAt: r.dueAt?.toISOString() ?? null, targets: ids.length, completed: doneAll, before: r.baseline ?? 0, now: await skillPct(ids, r.skill) };
  }));
}

// Takım oluşturucu: rastgele ya da dengeli (tamamlanan ders sayısına göre yılan sıralaması). Yalnız öneri döner.
export async function suggestTeams(actor: Actor, groupId: string, size: number, mode: "random" | "balanced") {
  const g = await ownedGroup(actor, groupId);
  if (size < 2 || size > 8) throw badRequest("Takım boyutu 2–8 olmalı.");
  const ids = g.members.map((m) => m.userId);
  const counts = await db.lessonProgress.groupBy({ by: ["userId"], where: { userId: { in: ids }, status: "COMPLETED" }, _count: true });
  const score = new Map(counts.map((c) => [c.userId, c._count]));
  const people = g.members.map((m) => ({ id: m.userId, name: m.user.displayName, username: m.user.username, score: score.get(m.userId) ?? 0 }));
  const n = Math.max(1, Math.ceil(people.length / size));
  const teams: (typeof people)[] = Array.from({ length: n }, () => []);
  if (mode === "random") {
    const shuffled = [...people].sort(() => Math.random() - 0.5);
    shuffled.forEach((p, i) => teams[i % n]!.push(p));
  } else {
    const sorted = [...people].sort((a, b) => b.score - a.score);
    sorted.forEach((p, i) => { const round = Math.floor(i / n); const idx = round % 2 === 0 ? i % n : n - 1 - (i % n); teams[idx]!.push(p); });
  }
  return teams.map((t, i) => ({ name: `Takım ${i + 1}`, members: t, total: t.reduce((a, p) => a + p.score, 0) }));
}

// Dönem ders planı: hafta × dersler; grup üyeleri planı kendi Görevler/Takvim ekranında görür.
export const planSchema = z.object({ groupId: z.string().min(1).max(40), week: z.number().int().min(1).max(52), startsOn: civilDay, title: z.string().trim().min(2).max(120), lessonSlugs: z.array(z.string().regex(/^[a-z0-9-]{1,40}$/)).max(20).default([]), note: z.string().trim().max(1000).default("") });

export async function savePlan(actor: Actor, input: z.output<typeof planSchema>) {
  await ownedGroup(actor, input.groupId);
  return db.coursePlan.upsert({ where: { groupId_week: { groupId: input.groupId, week: input.week } }, create: { ...input, createdById: actor.id }, update: { startsOn: input.startsOn, title: input.title, lessonSlugs: input.lessonSlugs, note: input.note } });
}

export const groupPlans = (groupId: string) => db.coursePlan.findMany({ where: { groupId }, orderBy: { week: "asc" } });
