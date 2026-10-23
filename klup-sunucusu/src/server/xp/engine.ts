// XP motoru. Tüm ödüller buradan geçer:
//  - miktar istemciden değil, sunucudaki kuraldan gelir,
//  - her ödülün benzersiz bir anahtarı vardır (ON CONFLICT DO NOTHING): aynı ödül iki kez yazılamaz,
//  - ödül, onu doğuran işlemle (ders tamamlama, quiz) aynı transaction içinde yazılır.
import type { Level, Prisma, XpSource } from "@prisma/client";
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import { ensureGamificationDefaults, type RuleKey } from "./defaults";
import { dayKey } from "./time";

type Tx = Prisma.TransactionClient;

// Ödül yazan transaction'lar: yoğun anda (ör. ders sonunda herkes aynı anda quiz gönderirken) bağlantı
// havuzunu beklerken varsayılan 2 sn'de hata vermesinler.
export const XP_TX = { maxWait: 10_000, timeout: 15_000 } as const;

export type AwardInput = {
  userId: string;
  ruleKey: RuleKey;
  key: string; // idempotency anahtarı
  source: XpSource;
  refType?: string;
  refId?: string;
  reason?: string;
  // Görevde personelin belirlediği özel miktar (kural açık olmalı; üst sınır sunucuda).
  amount?: number;
};

export const MAX_CUSTOM_XP = 500;

// Kural kapalıysa ya da ödül daha önce verildiyse 0 döner.
export async function award(tx: Tx, input: AwardInput): Promise<number> {
  await ensureGamificationDefaults();
  const rule = await tx.xpRewardRule.findUnique({ where: { key: input.ruleKey } });
  if (!rule || !rule.enabled) return 0;
  const amount = input.amount !== undefined ? Math.min(Math.max(0, Math.trunc(input.amount)), MAX_CUSTOM_XP) : rule.amount;
  if (amount <= 0) return 0;
  const r = await tx.xpTransaction.createMany({
    data: [
      {
        userId: input.userId,
        amount,
        source: input.source,
        ruleKey: rule.key,
        idempotencyKey: input.key,
        reason: input.reason ?? rule.label,
        refType: input.refType ?? null,
        refId: input.refId ?? null,
      },
    ],
    skipDuplicates: true,
  });
  return r.count ? amount : 0;
}

// Öğrenme serisi için bugünü işaretler (kulüp saat dilimi).
export async function recordActivity(tx: Tx, userId: string, at = new Date()) {
  const { timezone } = await getSettings();
  await tx.activityDay.createMany({ data: [{ userId, day: dayKey(at, timezone) }], skipDuplicates: true });
}

// Yoldaki bütün (arşivlenmemiş) dersler tamamlandıysa yol ödülü. Kısa tanıtım yolları (≤2 sayfa) sayılmaz.
async function maybeTrack(tx: Tx, userId: string, trackId: string) {
  const total = await tx.lesson.count({ where: { trackId, archivedAt: null } });
  if (total < 3) return 0;
  const done = await tx.lessonProgress.count({ where: { userId, status: "COMPLETED", lesson: { trackId, archivedAt: null } } });
  if (done < total) return 0;
  return award(tx, { userId, ruleKey: "track.complete", key: `track:${userId}:${trackId}`, source: "TRACK", refType: "Track", refId: trackId });
}

export async function onLessonCompleted(tx: Tx, userId: string, lesson: { id: string; trackId: string; kind: string; title: string }) {
  const ruleKey: RuleKey = lesson.kind === "INFO" ? "info.read" : "lesson.complete";
  const gained =
    (await award(tx, { userId, ruleKey, key: `lesson:${userId}:${lesson.id}`, source: "LESSON", refType: "Lesson", refId: lesson.id, reason: lesson.title })) +
    (await maybeTrack(tx, userId, lesson.trackId));
  await recordActivity(tx, userId);
  return gained;
}

export async function onQuizAttempt(tx: Tx, userId: string, lesson: { id: string; trackId: string; title: string }, passed: boolean) {
  await recordActivity(tx, userId);
  if (!passed) return 0;
  // Anahtar ders başına sabit: quiz tekrarları ek XP üretmez.
  return (
    (await award(tx, { userId, ruleKey: "quiz.pass", key: `quiz:${userId}:${lesson.id}`, source: "QUIZ", refType: "Lesson", refId: lesson.id, reason: lesson.title })) +
    (await maybeTrack(tx, userId, lesson.trackId))
  );
}

// XP sistemi açılmadan önce yapılmış tamamlama ve quiz geçişlerini ödüllendirir. Anahtarlar canlı akıştakilerle
// aynı olduğu için tekrar çalıştırmak güvenlidir (zaten verilmiş ödül yeniden yazılmaz).
export async function backfillXp(): Promise<{ users: number; xp: number }> {
  await ensureGamificationDefaults();
  const done = await db.lessonProgress.findMany({
    where: { status: "COMPLETED", user: { status: "ACTIVE" }, lesson: { archivedAt: null } },
    select: { userId: true, lesson: { select: { id: true, trackId: true, kind: true, title: true } } },
  });
  const users = new Set<string>();
  let xp = 0;
  for (const p of done) {
    const gained = await db.$transaction(async (tx) => {
      if (p.lesson.kind !== "QUIZ") return onLessonCompleted(tx, p.userId, p.lesson);
      const passed = await tx.quizAttempt.count({ where: { userId: p.userId, lessonId: p.lesson.id, passed: true } });
      return passed ? onQuizAttempt(tx, p.userId, p.lesson, true) : 0;
    }, XP_TX);
    if (gained) users.add(p.userId);
    xp += gained;
  }
  return { users: users.size, xp };
}

export const LIVE_MIN_MS = 10 * 60_000;

// Canlı ders bittiğinde: en az 10 dakika bağlı kalan her katılımcıya bir kez.
export async function onLiveSessionEnded(sessionId: string) {
  const s = await db.liveSession.findUnique({
    where: { id: sessionId },
    select: { title: true, startedAt: true, participants: { where: { connectedMs: { gte: LIVE_MIN_MS }, user: { status: "ACTIVE" } }, select: { userId: true } } },
  });
  if (!s) return [];
  const rewarded: string[] = [];
  for (const p of s.participants) {
    await db.$transaction(async (tx) => {
      const n = await award(tx, { userId: p.userId, ruleKey: "live.attend", key: `live:${p.userId}:${sessionId}`, source: "LIVE", refType: "LiveSession", refId: sessionId, reason: s.title });
      await recordActivity(tx, p.userId, s.startedAt);
      if (n) rewarded.push(p.userId);
    }, XP_TX);
  }
  return rewarded;
}

// ── Seviye ──────────────────────────────────────────────────────────────────
export type LevelInfo = { number: number; title: string; minXp: number; next: { number: number; title: string; minXp: number } | null; toNext: number; progressPct: number };

export function levelFor(total: number, levels: Pick<Level, "number" | "title" | "minXp">[]): LevelInfo {
  const sorted = [...levels].sort((a, b) => a.minXp - b.minXp);
  let i = 0;
  for (let j = 0; j < sorted.length; j++) if (total >= sorted[j]!.minXp) i = j;
  const cur = sorted[i] ?? { number: 1, title: "Çaylak", minXp: 0 };
  const next = sorted[i + 1] ?? null;
  const span = next ? next.minXp - cur.minXp : 1;
  return {
    number: cur.number,
    title: cur.title,
    minXp: cur.minXp,
    next: next ? { number: next.number, title: next.title, minXp: next.minXp } : null,
    toNext: next ? Math.max(0, next.minXp - total) : 0,
    progressPct: next ? Math.min(100, Math.max(0, Math.round(((total - cur.minXp) / span) * 100))) : 100,
  };
}

export async function loadLevels() {
  await ensureGamificationDefaults();
  return db.level.findMany({ orderBy: { minXp: "asc" } });
}

export async function totalXp(userId: string, range?: { start: Date; end: Date }) {
  const r = await db.xpTransaction.aggregate({
    where: { userId, ...(range ? { createdAt: { gte: range.start, lt: range.end } } : {}) },
    _sum: { amount: true },
  });
  return r._sum.amount ?? 0;
}
