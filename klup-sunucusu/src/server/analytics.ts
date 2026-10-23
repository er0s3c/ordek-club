// Analitik (yalnız personel): kulüp geneli toplu göstergeler. Bireysel öğrenci verisi listelenmez;
// en zor quizler ve görevler gibi içerik odaklı tablolar gösterilir. Yalnız öğrenciler sayılır.
import { db } from "@/server/db";
import { forbidden } from "@/server/errors";
import { canManageClassroom, type Actor } from "@/server/auth/policy";
import { getSettings } from "@/server/settings";
import { dayKey } from "@/server/xp/time";

const DAY = 86_400_000;
const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export async function clubAnalytics(actor: Actor, now = new Date()) {
  if (!canManageClassroom(actor)) throw forbidden("Analitik eğitmen ve yöneticilere açıktır.");
  const tz = (await getSettings()).timezone;
  const student = { role: "STUDENT" as const, status: "ACTIVE" as const };

  // ── Üyeler ve etkinlik ──
  const weeks = 8;
  const since = dayKey(new Date(now.getTime() - weeks * 7 * DAY), tz);
  const [students, newStudents, loggedIn7, loggedIn30, activity] = await Promise.all([
    db.user.count({ where: student }),
    db.user.count({ where: { ...student, joinedAt: { gte: new Date(now.getTime() - 30 * DAY) } } }),
    db.user.count({ where: { ...student, lastLoginAt: { gte: new Date(now.getTime() - 7 * DAY) } } }),
    db.user.count({ where: { ...student, lastLoginAt: { gte: new Date(now.getTime() - 30 * DAY) } } }),
    db.activityDay.findMany({ where: { day: { gte: since }, user: student }, select: { userId: true, day: true } }),
  ]);
  // Haftalık benzersiz aktif öğrenci (öğrenme etkinliği: ders, quiz, canlı ders, görev)
  const weekly = Array.from({ length: weeks }, (_, i) => {
    const end = new Date(now.getTime() - (weeks - 1 - i) * 7 * DAY);
    const from = dayKey(new Date(end.getTime() - 6 * DAY), tz);
    const to = dayKey(end, tz);
    const users = new Set(activity.filter((a) => a.day >= from && a.day <= to).map((a) => a.userId));
    return { label: from.slice(5).replace("-", "."), active: users.size };
  });

  // ── Akademi ──
  const tracks = await db.track.findMany({
    where: { archivedAt: null },
    orderBy: { position: "asc" },
    select: { id: true, code: true, title: true, lessons: { where: { archivedAt: null }, select: { id: true } } },
  });
  const progress = await db.lessonProgress.groupBy({ by: ["lessonId", "status"], where: { user: student }, _count: true });
  const starters = await db.lessonProgress.findMany({ where: { user: student }, distinct: ["userId", "lessonId"], select: { userId: true, lessonId: true } });
  const trackRows = tracks.map((t) => {
    const ids = new Set(t.lessons.map((l) => l.id));
    const completed = progress.filter((p) => ids.has(p.lessonId) && p.status === "COMPLETED").reduce((a, p) => a + p._count, 0);
    const learners = new Set(starters.filter((s) => ids.has(s.lessonId)).map((s) => s.userId)).size;
    return { code: t.code, title: t.title, lessons: ids.size, learners, completion: pct(completed, ids.size * Math.max(learners, 1)) };
  });

  const attempts = await db.quizAttempt.groupBy({ by: ["lessonId"], where: { user: student }, _count: true, _avg: { score: true } });
  const passed = await db.quizAttempt.groupBy({ by: ["lessonId"], where: { user: student, passed: true }, _count: true });
  const passMap = new Map(passed.map((p) => [p.lessonId, p._count]));
  const lessonTitles = new Map((await db.lesson.findMany({ where: { id: { in: attempts.map((a) => a.lessonId) } }, select: { id: true, title: true, slug: true } })).map((l) => [l.id, l]));
  const hardest = attempts
    .filter((a) => a._count >= 3)
    .map((a) => ({ title: lessonTitles.get(a.lessonId)?.title ?? "—", slug: lessonTitles.get(a.lessonId)?.slug ?? "", attempts: a._count, passRate: pct(passMap.get(a.lessonId) ?? 0, a._count), avgScore: Math.round(a._avg.score ?? 0) }))
    .sort((a, b) => a.passRate - b.passRate || b.attempts - a.attempts)
    .slice(0, 6);
  const quizTotals = { attempts: attempts.reduce((a, x) => a + x._count, 0), passed: passed.reduce((a, x) => a + x._count, 0) };

  // ── Görevler ──
  const subs = await db.submission.groupBy({ by: ["status"], _count: true });
  const subCount = (s: string) => subs.find((x) => x.status === s)?._count ?? 0;
  const reviewed = subCount("APPROVED") + subCount("REJECTED") + subCount("RETURNED");
  const [lateCount, scoreAgg, recentTasks] = await Promise.all([
    db.submission.count({ where: { late: true } }),
    db.submission.findMany({ where: { status: "APPROVED", score: { not: null } }, select: { score: true, assignment: { select: { maxScore: true } } } }),
    db.assignment.findMany({
      where: { status: { in: ["PUBLISHED", "CLOSED"] } },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, title: true, audience: true, kind: true, _count: { select: { submissions: true, targets: true } }, group: { select: { _count: { select: { members: true } } } }, submissions: { select: { status: true } } },
    }),
  ]);
  const avgScore = scoreAgg.length ? Math.round(scoreAgg.reduce((a, s) => a + (s.score! / s.assignment.maxScore) * 100, 0) / scoreAgg.length) : 0;
  const taskRows = recentTasks.map((t) => {
    const targeted = t.audience === "ALL" ? students : t.audience === "GROUP" ? t.group?._count.members ?? 0 : t._count.targets;
    return { id: t.id, title: t.title, kind: t.kind, targeted, submitted: t._count.submissions, approved: t.submissions.filter((s) => s.status === "APPROVED").length, pending: t.submissions.filter((s) => s.status === "SUBMITTED").length };
  });
  const totalSubs = subs.reduce((a, x) => a + x._count, 0);

  // ── Canlı dersler (son 30 gün) ──
  const sessions = await db.liveSession.findMany({
    where: { startedAt: { gte: new Date(now.getTime() - 30 * DAY) } },
    select: { id: true, participants: { where: { user: { role: "STUDENT" } }, select: { connectedMs: true } }, polls: { select: { _count: { select: { answers: true } } } } },
  });
  const parts = sessions.flatMap((s) => s.participants);
  const polls = sessions.flatMap((s) => s.polls);

  // ── XP (bu ay, kaynağa göre) ──
  const monthStart = new Date(now.getTime() - 30 * DAY);
  const xpBySource = await db.xpTransaction.groupBy({ by: ["source"], where: { createdAt: { gte: monthStart }, user: { role: "STUDENT" } }, _sum: { amount: true } });

  return {
    members: { students, newStudents, loggedIn7, loggedIn30, weekly },
    academy: { tracks: trackRows, hardest, quizAttempts: quizTotals.attempts, quizPassRate: pct(quizTotals.passed, quizTotals.attempts) },
    tasks: { submissions: totalSubs, pending: subCount("SUBMITTED"), approvalRate: pct(subCount("APPROVED"), reviewed), lateRate: pct(lateCount, totalSubs), avgScore, recent: taskRows },
    live: {
      sessions: sessions.length,
      avgParticipants: sessions.length ? Math.round(parts.length / sessions.length) : 0,
      avgMinutes: parts.length ? Math.round(parts.reduce((a, p) => a + p.connectedMs, 0) / parts.length / 60_000) : 0,
      polls: polls.length,
      avgAnswers: polls.length ? Math.round(polls.reduce((a, p) => a + p._count.answers, 0) / polls.length) : 0,
    },
    xp: xpBySource.map((x) => ({ source: x.source, amount: x._sum.amount ?? 0 })).sort((a, b) => b.amount - a.amount),
  };
}
export type ClubAnalytics = Awaited<ReturnType<typeof clubAnalytics>>;
