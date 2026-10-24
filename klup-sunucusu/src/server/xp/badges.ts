// Rozet kuralları ve otomatik değerlendirme. Kural tipleri sabit bir listedir (yönetici yeni rozet
// oluştururken bu tiplerden birini seçer); kural verisi zod ile doğrulanır, kod çalıştırılmaz.
import { z } from "zod";
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import { ensureGamificationDefaults } from "./defaults";
import { dayKey, streaks } from "./time";

export const BADGE_ICONS = [
  "award", "medal", "trophy", "crown", "flame", "star", "shield", "book-open", "graduation-cap",
  "globe", "network", "search", "target", "zap", "key", "lock", "skull", "terminal",
] as const;

export const badgeRuleSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("manual") }),
  z.object({ type: z.literal("lessons"), count: z.number().int().min(1).max(10_000) }),
  z.object({ type: z.literal("quizzes"), count: z.number().int().min(1).max(10_000) }),
  z.object({ type: z.literal("streak"), days: z.number().int().min(2).max(3650) }),
  z.object({ type: z.literal("track"), track: z.string().regex(/^[a-z0-9-]{1,40}$/) }),
  z.object({ type: z.literal("track_kind"), kind: z.enum(["PROGRAM", "CORE", "SPECIALIZATION"]), count: z.number().int().min(1).max(100) }),
  z.object({ type: z.literal("xp"), total: z.number().int().min(1).max(10_000_000) }),
  z.object({ type: z.literal("overall_rank"), rank: z.number().int().min(1).max(1000) }),
  z.object({ type: z.literal("monthly_rank"), rank: z.number().int().min(1).max(1000) }),
]);
export type BadgeRule = z.infer<typeof badgeRuleSchema>;

export function describeRule(r: BadgeRule): string {
  switch (r.type) {
    case "manual": return "Yönetici verir";
    case "lessons": return `${r.count} ders tamamla`;
    case "quizzes": return `${r.count} quiz geç`;
    case "streak": return `${r.days} gün üst üste çalış`;
    case "track": return `${r.track.toUpperCase()} yolunu bitir`;
    case "track_kind": return `${r.count} ${r.kind === "CORE" ? "temel modül" : r.kind === "SPECIALIZATION" ? "uzmanlık yolu" : "program yolu"} bitir`;
    case "xp": return `${r.total} XP topla`;
    case "overall_rank": return `Genel sıralamada ilk ${r.rank}`;
    case "monthly_rank": return `Bir ayı ilk ${r.rank} içinde kapat`;
  }
}

// Kullanıcının tamamladığı yollar (arşivlenmemiş dersleri en az 3 olan ve hepsi tamamlanmış).
export async function completedTracks(userId: string) {
  const tracks = await db.track.findMany({
    where: { archivedAt: null },
    select: { id: true, key: true, code: true, title: true, kind: true, lessons: { where: { archivedAt: null }, select: { id: true } } },
  });
  const done = new Set(
    (await db.lessonProgress.findMany({ where: { userId, status: "COMPLETED", lesson: { archivedAt: null } }, select: { lessonId: true } })).map((p) => p.lessonId),
  );
  return tracks.filter((t) => t.lessons.length >= 3 && t.lessons.every((l) => done.has(l.id)));
}

export async function userStreak(userId: string) {
  const { timezone } = await getSettings();
  const days = (await db.activityDay.findMany({ where: { userId }, select: { day: true } })).map((d) => d.day);
  return streaks(days, dayKey(new Date(), timezone));
}

// Genel sıralama: yalnız aktif öğrenciler, XP > 0, eşitlikte aynı sıra. size: sıralamadaki öğrenci sayısı.
export async function overallStanding(userId: string): Promise<{ rank: number; size: number } | null> {
  const rows = (await db.xpTransaction.groupBy({ by: ["userId"], where: { user: { role: "STUDENT", status: "ACTIVE" } }, _sum: { amount: true } })).filter((r) => (r._sum.amount ?? 0) > 0);
  const mine = rows.find((r) => r.userId === userId)?._sum.amount ?? 0;
  if (mine <= 0) return null;
  return { rank: rows.filter((r) => (r._sum.amount ?? 0) > mine).length + 1, size: rows.length };
}

export const overallRankOf = async (userId: string) => (await overallStanding(userId))?.rank ?? null;

// Kullanıcının hak ettiği ama henüz almadığı otomatik rozetleri verir. Verilen rozetlerin adlarını döndürür.
export async function evaluateBadges(userId: string): Promise<string[]> {
  await ensureGamificationDefaults();
  const user = await db.user.findUnique({ where: { id: userId }, select: { status: true, role: true } });
  if (!user || user.status !== "ACTIVE") return [];
  const owned = new Set((await db.userBadge.findMany({ where: { userId }, select: { badgeId: true } })).map((b) => b.badgeId));
  const candidates = (await db.badge.findMany({ where: { active: true } })).filter((b) => !owned.has(b.id));
  if (!candidates.length) return [];

  // Gerekli ölçümler tembel hesaplanır (yalnız ilgili kural varsa).
  const memo = new Map<string, Promise<unknown>>();
  const once = <T,>(k: string, f: () => Promise<T>) => (memo.get(k) ?? memo.set(k, f()).get(k)) as Promise<T>;
  const lessons = () => once("lessons", () => db.lessonProgress.count({ where: { userId, status: "COMPLETED", lesson: { kind: { not: "QUIZ" }, archivedAt: null } } }));
  const quizzes = () => once("quizzes", async () => (await db.quizAttempt.groupBy({ by: ["lessonId"], where: { userId, passed: true } })).length);
  const tracks = () => once("tracks", () => completedTracks(userId));
  const streak = () => once("streak", () => userStreak(userId));
  const xp = () => once("xp", async () => (await db.xpTransaction.aggregate({ where: { userId }, _sum: { amount: true } }))._sum.amount ?? 0);
  const rank = () => once("rank", () => (user.role === "STUDENT" ? overallStanding(userId) : Promise.resolve(null)));

  const earned: { id: string; name: string; reason: string }[] = [];
  for (const b of candidates) {
    const parsed = badgeRuleSchema.safeParse(b.rule);
    if (!parsed.success) continue;
    const r = parsed.data;
    let ok = false;
    switch (r.type) {
      case "lessons": ok = (await lessons()) >= r.count; break;
      case "quizzes": ok = (await quizzes()) >= r.count; break;
      case "streak": ok = (await streak()).longest >= r.days; break;
      case "track": ok = (await tracks()).some((t) => t.key === r.track); break;
      case "track_kind": ok = (await tracks()).filter((t) => t.kind === r.kind).length >= r.count; break;
      case "xp": ok = (await xp()) >= r.total; break;
      // "İlk N" yalnız sıralamada N'den fazla öğrenci varken anlamlıdır (3 kişilik kulüpte herkes ilk 10'dadır).
      case "overall_rank": { const n = await rank(); ok = n !== null && n.rank <= r.rank && n.size > r.rank; break; }
      default: ok = false; // manual ve monthly_rank burada verilmez
    }
    if (ok) earned.push({ id: b.id, name: b.name, reason: describeRule(r) });
  }
  if (!earned.length) return [];
  await db.userBadge.createMany({ data: earned.map((e) => ({ userId, badgeId: e.id, reason: e.reason })), skipDuplicates: true });
  return earned.map((e) => e.name);
}
