import { describe, expect, it } from "vitest";
import { fold, jaccard, lineDiff, matchScore, readingMinutes, shingles } from "@/lib/text";
import { evaluateFirewall, orderScore, runQuery, type Row } from "@/lib/workshop-query";
import { learningCalendar } from "@/server/learning/calendar";

describe("Türkçe katlama ve arama puanı", () => {
  it("büyük/küçük harf ve Türkçe karakterleri aynı anahtara indirir", () => {
    expect(fold("ŞİFRELEME")).toBe("sifreleme");
    expect(fold("Işık Güvenliği")).toBe("isik guvenligi");
  });
  it("tam, önek ve kelime eşleşmesini sıralar", () => {
    expect(matchScore("Yetkilendirme", "yetkilendirme")).toBe(100);
    expect(matchScore("Yetkilendirme hataları", "yetki")).toBe(80);
    expect(matchScore("Ağ ve sistem güvenliği", "sistem ag")).toBeGreaterThan(0);
    expect(matchScore("DNS", "http")).toBe(0);
  });
});

describe("okuma süresi", () => {
  it("en az 1 dakika, etkinlik başına 2 dakika ekler", () => {
    expect(readingMinutes("kısa metin")).toBe(1);
    expect(readingMinutes(Array(360).fill("kelime").join(" "), 2)).toBe(6);
  });
});

describe("teslim sürümü farkı", () => {
  it("eklenen ve silinen satırları ayırır", () => {
    const d = lineDiff("a\nb\nc", "a\nB\nc\nd");
    expect(d.filter((x) => x.kind === "same").map((x) => x.text)).toEqual(["a", "c"]);
    expect(d.filter((x) => x.kind === "del").map((x) => x.text)).toEqual(["b"]);
    expect(d.filter((x) => x.kind === "add").map((x) => x.text)).toEqual(["B", "d"]);
  });
});

describe("benzerlik uyarısı", () => {
  const base = "Bu raporda saldırganın önce parola deneme yaptığını ardından test hesabıyla giriş yapıp yedek dosyasını indirdiğini gösteriyorum";
  it("aynı metin için 1, farklı metin için düşük oran", () => {
    expect(jaccard(shingles(base), shingles(base))).toBe(1);
    expect(jaccard(shingles(base), shingles("Tamamen farklı bir konu hakkında yazılmış ağ ve DNS çözümlemesi incelemesi burada yer alıyor"))).toBeLessThan(0.1);
  });
});

describe("sorgu atölyesi mini dili", () => {
  const rows: Row[] = [
    { user: "ayse", src_ip: "10.0.0.1", status: "OK" },
    { user: "root", src_ip: "203.0.113.77", status: "FAIL" },
    { user: "test", src_ip: "203.0.113.77", status: "FAIL" },
    { user: "test", src_ip: "203.0.113.77", status: "OK" },
  ];
  it("süzme, sayma ve sıralama", () => {
    const r = runQuery(rows, "where status=FAIL | count by src_ip");
    expect(r.ok && r.rows[0]).toEqual({ src_ip: "203.0.113.77", count: 2 });
  });
  it("içerir ve alan seçimi", () => {
    const r = runQuery(rows, "where src_ip~203 and status=OK | fields user");
    expect(r.ok && r.rows).toEqual([{ user: "test" }]);
  });
  it("bilinmeyen alan ve komutları açıklamayla reddeder", () => {
    expect(runQuery(rows, "where country=TR").ok).toBe(false);
    expect(runQuery(rows, "drop table").ok).toBe(false);
    expect(runQuery(rows, "limit 0").ok).toBe(false);
  });
});

describe("ağ atölyesi güvenlik duvarı", () => {
  it("ilk eşleşen kural uygulanır, eşleşme yoksa red", () => {
    const rules = [{ from: "student", to: "web", port: "443", action: "allow" as const }, { from: "any", to: "web", port: "any", action: "deny" as const }];
    expect(evaluateFirewall(rules, { from: "student", to: "web", port: 443 })).toEqual({ action: "allow", rule: 0 });
    expect(evaluateFirewall(rules, { from: "student", to: "web", port: 22 })).toEqual({ action: "deny", rule: 1 });
    expect(evaluateFirewall(rules, { from: "web", to: "db", port: 5432 })).toEqual({ action: "deny", rule: null });
  });
});

describe("zaman çizelgesi puanı", () => {
  it("doğru ardışık çiftlerin oranı", () => {
    expect(orderScore(["a", "b", "c", "d"], ["a", "b", "c", "d"])).toBe(100);
    expect(orderScore(["b", "a", "c", "d"], ["a", "b", "c", "d"])).toBe(33);
    expect(orderScore(["a"], ["a", "b"])).toBe(0);
  });
});

describe("seri günü açıklaması için takvim durumları", () => {
  it("haftada bir telafi ve sınav koruması", () => {
    const cal = learningCalendar(["2026-10-19", "2026-10-21", "2026-10-24"], "2026-10-24", "2026-10-01", [{ startsOn: "2026-10-22", endsOn: "2026-10-23" }]);
    const state = (d: string) => cal.days.find((x) => x.day === d)?.state;
    expect(state("2026-10-20")).toBe("protected");
    expect(state("2026-10-22")).toBe("exam");
    expect(cal.current).toBe(3);
  });
});
