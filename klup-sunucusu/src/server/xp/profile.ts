// Profil ve özet verileri. Profil yalnız giriş yapmış üyelere açıktır; XP geçmişi yalnız kişinin
// kendisine ve yöneticilere gösterilir. E-posta, öğrenci numarası gibi alanlar hiçbir zaman eklenmez.
import { db } from "@/server/db";
import { notFound } from "@/server/errors";
import { isAdmin, type Actor } from "@/server/auth/policy";
import { getSettings } from "@/server/settings";
import { badgeRuleSchema, completedTracks, describeRule, overallRankOf, userStreak } from "./badges";
import { levelFor, loadLevels, totalXp } from "./engine";
import { monthRange, periodOf } from "./time";
import { monthlyBoard } from "./leaderboard";

export async function xpSummary(userId: string, role: string) {
  const { timezone } = await getSettings();
  const period = periodOf(new Date(), timezone);
  const [total, month, levels, streak] = await Promise.all([totalXp(userId), totalXp(userId, monthRange(period, timezone)), loadLevels(), userStreak(userId)]);
  const isStudent = role === "STUDENT";
  const overallRank = isStudent ? await overallRankOf(userId) : null;
  const monthlyRank = isStudent && month > 0 ? ((await monthlyBoard(period)).rows.find((r) => r.userId === userId)?.rank ?? null) : null;
  return { total, month, period, level: levelFor(total, levels), overallRank, monthlyRank, streak, ranked: isStudent };
}

export async function publicProfile(viewer: Actor, username: string) {
  const u = await db.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, username: true, displayName: true, role: true, status: true, joinedAt: true, createdAt: true },
  });
  if (!u || u.status !== "ACTIVE") throw notFound("Üye bulunamadı.");
  const own = viewer.id === u.id;
  const [summary, earned, all, tracks] = await Promise.all([
    xpSummary(u.id, u.role),
    db.userBadge.findMany({ where: { userId: u.id }, orderBy: { awardedAt: "desc" }, include: { badge: true } }),
    db.badge.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
    completedTracks(u.id),
  ]);
  const earnedIds = new Set(earned.map((e) => e.badgeId));
  const history =
    own || isAdmin(viewer.role)
      ? await db.xpTransaction.findMany({
          where: { userId: u.id },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: { id: true, amount: true, source: true, reason: true, createdAt: true, reversalOfId: true, reversedBy: { select: { id: true } } },
        })
      : null;
  const ruleText = (r: unknown) => {
    const p = badgeRuleSchema.safeParse(r);
    return p.success ? describeRule(p.data) : "";
  };
  return {
    user: { id: u.id, username: u.username, displayName: u.displayName, role: u.role, joinedAt: u.joinedAt ?? u.createdAt },
    own,
    summary,
    badges: earned.map((e) => ({ id: e.badgeId, name: e.badge.name, description: e.badge.description, icon: e.badge.icon, awardedAt: e.awardedAt, reason: e.reason })),
    locked: all.filter((b) => !earnedIds.has(b.id)).map((b) => ({ id: b.id, name: b.name, description: b.description, icon: b.icon, how: ruleText(b.rule) })),
    tracks: tracks.map((t) => ({ key: t.key, code: t.code, title: t.title })),
    history,
  };
}
