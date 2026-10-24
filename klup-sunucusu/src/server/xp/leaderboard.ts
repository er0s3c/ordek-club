// Aylık ve genel liderlik tabloları. Sıralamada yalnız aktif ÖĞRENCİLER yer alır (eğitmen ve yöneticilerin
// ders denemeleri sıralamayı bozmasın). Ay sınırları kulübün saat dilimine göre hesaplanır;
// biten aylar ilk ihtiyaçta arşivlenir ve sonradan yapılan düzeltmelerden etkilenmez.
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { getSettings } from "@/server/settings";
import { badgeRuleSchema } from "./badges";
import { levelFor, loadLevels, type LevelInfo } from "./engine";
import { ensureGamificationDefaults } from "./defaults";
import { monthRange, periodOf, shiftPeriod } from "./time";

export type BoardRow = { rank: number; userId: string; username: string; displayName: string; xp: number; level: LevelInfo };

const STUDENTS = { role: "STUDENT" as const, status: "ACTIVE" as const };

// Eşit puan aynı sırayı alır (1, 2, 2, 4).
export function rankRows<T extends { xp: number; username: string }>(rows: T[]): (T & { rank: number })[] {
  const sorted = [...rows].sort((a, b) => b.xp - a.xp || a.username.localeCompare(b.username));
  let prev: { xp: number; rank: number } | null = null;
  return sorted.map((r, i) => {
    const rank = prev && prev.xp === r.xp ? prev.rank : i + 1;
    prev = { xp: r.xp, rank };
    return { ...r, rank };
  });
}

async function sums(range?: { start: Date; end: Date }) {
  const rows = await db.xpTransaction.groupBy({
    by: ["userId"],
    where: { user: STUDENTS, ...(range ? { createdAt: { gte: range.start, lt: range.end } } : {}) },
    _sum: { amount: true },
  });
  return rows.map((r) => ({ userId: r.userId, xp: r._sum.amount ?? 0 })).filter((r) => r.xp > 0);
}

async function withUsers(rows: { userId: string; xp: number }[], totals?: Map<string, number>): Promise<BoardRow[]> {
  const users = await db.user.findMany({ where: { id: { in: rows.map((r) => r.userId) } }, select: { id: true, username: true, displayName: true } });
  const byId = new Map(users.map((u) => [u.id, u]));
  const levels = await loadLevels();
  // Seviye her zaman TOPLAM XP'den hesaplanır (aylık tabloda da).
  const all = totals ?? new Map((await sums()).map((r) => [r.userId, r.xp]));
  return rankRows(
    rows.filter((r) => byId.has(r.userId)).map((r) => ({ ...r, username: byId.get(r.userId)!.username, displayName: byId.get(r.userId)!.displayName })),
  ).map((r) => ({ ...r, level: levelFor(all.get(r.userId) ?? 0, levels) }));
}

export async function overallBoard(): Promise<BoardRow[]> {
  const rows = await sums();
  return withUsers(rows, new Map(rows.map((r) => [r.userId, r.xp])));
}

export async function monthlyBoard(period?: string) {
  const { timezone } = await getSettings();
  const p = period ?? periodOf(new Date(), timezone);
  return { period: p, rows: await withUsers(await sums(monthRange(p, timezone))) };
}

// Arşivlenmiş bir ay (yoksa null).
export async function archivedBoard(period: string) {
  const board = await db.leaderboardPeriod.findUnique({
    where: { period },
    include: { entries: { orderBy: [{ rank: "asc" }, { xp: "desc" }], include: { user: { select: { username: true, displayName: true } } } } },
  });
  if (!board) return null;
  const levels = await loadLevels();
  const totals = new Map((await sums()).map((r) => [r.userId, r.xp]));
  return {
    period,
    rows: board.entries.map((e) => ({ rank: e.rank, userId: e.userId, username: e.user.username, displayName: e.user.displayName, xp: e.xp, level: levelFor(totals.get(e.userId) ?? 0, levels) })),
  };
}

export async function archivedPeriods() {
  return db.leaderboardPeriod.findMany({
    orderBy: { period: "desc" },
    take: 24,
    select: { period: true, entries: { where: { rank: 1 }, select: { xp: true, user: { select: { username: true, displayName: true } } } } },
  });
}

// Biten ayları arşivler (en fazla son 36 ay). Eşzamanlı çağrılar güvenlidir: dönem satırı tek kez yazılır.
export async function ensureArchived(now = new Date()): Promise<string[]> {
  await ensureGamificationDefaults();
  const { timezone } = await getSettings();
  const current = periodOf(now, timezone);
  const first = await db.xpTransaction.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } });
  if (!first) return [];
  const done = new Set((await db.leaderboardPeriod.findMany({ select: { period: true } })).map((p) => p.period));
  const archived: string[] = [];
  let p = periodOf(first.createdAt, timezone);
  if (p < shiftPeriod(current, -36)) p = shiftPeriod(current, -36);
  const champions = (await db.badge.findMany({ where: { active: true } })).flatMap((b) => {
    const r = badgeRuleSchema.safeParse(b.rule);
    return r.success && r.data.type === "monthly_rank" ? [{ id: b.id, rank: r.data.rank, name: b.name }] : [];
  });
  for (; p < current; p = shiftPeriod(p, 1)) {
    if (done.has(p)) continue;
    const rows = rankRows(
      (await sums(monthRange(p, timezone))).map((r) => ({ ...r, username: "" })),
    );
    const period = p;
    const wrote = await db.$transaction(async (tx) => {
      const c = await tx.leaderboardPeriod.createMany({ data: [{ period, timezone }], skipDuplicates: true });
      if (!c.count) return false; // başka bir istek arşivledi
      if (rows.length) await tx.leaderboardEntry.createMany({ data: rows.map((r) => ({ period, userId: r.userId, rank: r.rank, xp: r.xp })) });
      for (const ch of champions) {
        const winners = rows.filter((r) => r.rank <= ch.rank);
        if (winners.length)
          await tx.userBadge.createMany({ data: winners.map((w) => ({ userId: w.userId, badgeId: ch.id, reason: `${period} ayı #${w.rank}` })), skipDuplicates: true });
      }
      await audit({ action: "leaderboard.archive", targetType: "LeaderboardPeriod", targetId: period, meta: { entries: rows.length } }, tx);
      return true;
    });
    if (wrote) archived.push(period);
  }
  return archived;
}
