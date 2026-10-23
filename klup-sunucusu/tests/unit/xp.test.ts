import { describe, expect, it } from "vitest";
import { dayKey, isPeriod, monthRange, periodOf, shiftPeriod, streaks } from "@/server/xp/time";
import { levelFor } from "@/server/xp/engine";
import { rankRows } from "@/server/xp/leaderboard";
import { badgeRuleSchema } from "@/server/xp/badges";
import { DEFAULT_LEVELS } from "@/server/xp/defaults";

describe("saat dilimine göre ay ve gün", () => {
  it("İstanbul: ay sınırı yerel gece yarısıdır", () => {
    const r = monthRange("2026-10", "Europe/Istanbul");
    expect(r.start.toISOString()).toBe("2026-09-30T21:00:00.000Z");
    expect(r.end.toISOString()).toBe("2026-10-31T21:00:00.000Z");
  });

  it("yaz saati geçişi olan dilimde de doğru (New York, Mart)", () => {
    const r = monthRange("2026-03", "America/New_York");
    expect(r.start.toISOString()).toBe("2026-03-01T05:00:00.000Z"); // EST
    expect(r.end.toISOString()).toBe("2026-04-01T04:00:00.000Z"); // EDT
  });

  it("UTC'de önceki gün olan an, İstanbul'da yeni güne/aya aittir", () => {
    const d = new Date("2026-10-31T22:30:00Z");
    expect(dayKey(d, "Europe/Istanbul")).toBe("2026-11-01");
    expect(periodOf(d, "Europe/Istanbul")).toBe("2026-11");
    expect(periodOf(d, "UTC")).toBe("2026-10");
  });

  it("dönem kaydırma ve doğrulama", () => {
    expect(shiftPeriod("2026-01", -1)).toBe("2025-12");
    expect(shiftPeriod("2026-12", 1)).toBe("2027-01");
    expect(isPeriod("2026-13")).toBe(false);
    expect(isPeriod("2026-07")).toBe(true);
  });
});

describe("öğrenme serisi", () => {
  it("bugün dahil ardışık günler; bugün çalışılmadıysa seri dünden sayılır", () => {
    const days = ["2026-10-18", "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-10", "2026-10-11"];
    expect(streaks(days, "2026-10-21")).toEqual({ current: 4, longest: 4 });
    expect(streaks(days, "2026-10-22")).toEqual({ current: 4, longest: 4 });
    expect(streaks(days, "2026-10-23").current).toBe(0);
    expect(streaks([], "2026-10-23")).toEqual({ current: 0, longest: 0 });
  });

  it("ay sonu geçişi seriyi bozmaz", () => {
    expect(streaks(["2026-09-29", "2026-09-30", "2026-10-01"], "2026-10-01").current).toBe(3);
  });
});

describe("seviye hesabı", () => {
  it("eşiklere göre seviye, sonraki seviyeye kalan XP ve yüzde", () => {
    expect(levelFor(0, DEFAULT_LEVELS)).toMatchObject({ number: 1, toNext: 150, progressPct: 0 });
    expect(levelFor(150, DEFAULT_LEVELS)).toMatchObject({ number: 2, title: "İz Sürücü" });
    expect(levelFor(275, DEFAULT_LEVELS)).toMatchObject({ number: 2, toNext: 125, progressPct: 50 });
    expect(levelFor(99_999, DEFAULT_LEVELS)).toMatchObject({ number: 10, next: null, toNext: 0, progressPct: 100 });
  });

  it("varsayılan eşikler kesin artan (artan zorluk)", () => {
    const gaps = DEFAULT_LEVELS.slice(1).map((l, i) => l.minXp - DEFAULT_LEVELS[i]!.minXp);
    expect(gaps.every((g, i) => i === 0 || g > gaps[i - 1]!)).toBe(true);
  });
});

describe("sıralama", () => {
  it("eşit XP aynı sırayı alır (1, 2, 2, 4)", () => {
    const r = rankRows([
      { xp: 50, username: "c" },
      { xp: 100, username: "a" },
      { xp: 50, username: "b" },
      { xp: 10, username: "d" },
    ]);
    expect(r.map((x) => [x.username, x.rank])).toEqual([["a", 1], ["b", 2], ["c", 2], ["d", 4]]);
  });
});

describe("rozet kuralları", () => {
  it("yalnız bilinen tipler ve sınırlı değerler kabul edilir", () => {
    expect(badgeRuleSchema.safeParse({ type: "lessons", count: 3 }).success).toBe(true);
    expect(badgeRuleSchema.safeParse({ type: "eval", code: "process.exit()" }).success).toBe(false);
    expect(badgeRuleSchema.safeParse({ type: "streak", days: 0 }).success).toBe(false);
    expect(badgeRuleSchema.safeParse({ type: "track", track: "../x" }).success).toBe(false);
  });
});
