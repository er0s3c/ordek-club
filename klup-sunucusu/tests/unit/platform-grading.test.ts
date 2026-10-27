import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/db", () => ({ db: {} }));
import { grade } from "@/server/workshops/service";
import { gradeChallenge, CHALLENGES } from "@/server/workshops/challenges";
import { hasContact } from "@/server/study/buddies";
import { TIMELINE, NETWORK } from "@/server/workshops/data";

describe("güvenli kod atölyesi kural testleri", () => {
  it("parametreli sorgu geçer, birleştirme kalır", () => {
    const ok = grade("secure-code", "sql-login", { line: 2, fix: 'cur.execute("SELECT id, name, email FROM users WHERE name = %s", (name,))' });
    expect(ok.passed).toBe(true);
    const bad = grade("secure-code", "sql-login", { line: 2, fix: "cur.execute(f\"SELECT id FROM users WHERE name = '{name}'\")" });
    expect(bad.passed).toBe(false);
    expect(bad.checks.find((c) => c.name.includes("girdisi"))?.ok).toBe(false);
  });
  it("yanlış satır işaretlenince geçmez", () => {
    expect(grade("secure-code", "xss-greeting", { line: 1, fix: 'box.textContent = "Hoş geldin, " + user.name + "!";' }).passed).toBe(false);
    expect(grade("secure-code", "xss-greeting", { line: 2, fix: 'box.textContent = "Hoş geldin, " + user.name + "!";' }).passed).toBe(true);
  });
  it("davranışı bozan düzeltme 'davranış korundu' testinden kalır", () => {
    const r = grade("secure-code", "cmd-ping", { line: 2, fix: 'return subprocess.run(["echo", "ok"]).returncode' });
    expect(r.passed).toBe(false);
    expect(r.checks.filter((c) => c.name.startsWith("Davranış")).some((c) => !c.ok)).toBe(true);
  });
  it("düzenleyicide birkaç satırlık bölge değişince zafiyetli satır bölgedeyse kabul edilir", () => {
    const fix = 'import subprocess\ndef check_host(host):\n    return subprocess.run(["ping", "-c", "1", host]).returncode';
    expect(grade("secure-code", "cmd-ping", { line: 0, span: 3, fix }).passed).toBe(true);
    // bütün dosyayı değiştirmek "satırı buldu" sayılmaz
    expect(grade("secure-code", "cmd-ping", { line: 0, span: 4, fix }).checks[0]!.ok).toBe(false);
  });
});

describe("ağ atölyesi sunucu puanlaması", () => {
  it("en az ayrıcalıklı kurallar bütün paketleri doğru yönlendirir", () => {
    const rules = [{ from: "student", to: "web", port: "443", action: "allow" }, { from: "web", to: "db", port: "5432", action: "allow" }];
    expect(grade("network", "web-db", { rules }).passed).toBe(true);
    expect(grade("network", "web-db", { rules: NETWORK[0]!.starter }).passed).toBe(false);
  });
  it("bilinmeyen düğümü reddeder", () => {
    expect(() => grade("network", "web-db", { rules: [{ from: "x", to: "web", port: "443", action: "allow" }] })).toThrow();
  });
});

describe("sorgu ve zaman çizelgesi atölyeleri", () => {
  it("cevap sorgu sonucunda görünmeli", () => {
    expect(grade("query", "brute-ip", { query: "where status=FAIL | count by src_ip | limit 1", answer: "203.0.113.77" }).passed).toBe(true);
    expect(grade("query", "brute-ip", { query: "where status=OK | limit 1", answer: "203.0.113.77" }).passed).toBe(false);
  });
  it("doğru sıra ve açıklama gerekir", () => {
    const order = TIMELINE[0]!.order;
    expect(grade("timeline", "phish-chain", { order, explanation: "Saatleri UTC'ye çevirdim; önce e-posta geldi, sonra form dolduruldu ve giriş yapıldı." }).passed).toBe(true);
    expect(grade("timeline", "phish-chain", { order: [...order].reverse(), explanation: "x".repeat(50) }).passed).toBe(false);
  });
});

describe("kanıt haritası", () => {
  it("gerekli bağlantılar ve gerekçeler", () => {
    const links = [["ip1", "e1"], ["u1", "e1"], ["e1", "e2"], ["e2", "f1"]].map(([from, to]) => ({ from, to, reason: "Kanıt ayrıntısı bu bağı gösteriyor." }));
    expect(grade("evidence-map", "lab-intrusion", { links }).passed).toBe(true);
    expect(grade("evidence-map", "lab-intrusion", { links: links.slice(0, 2) }).passed).toBe(false);
  });
});

describe("yetkinlik gösterimi ön elemesi", () => {
  it("doğru cevaplar %100", () => {
    const c = CHALLENGES[0]!;
    expect(gradeChallenge(c, c.questions.map((q) => q.answer))).toBe(100);
    expect(gradeChallenge(c, c.questions.map(() => 99))).toBe(0);
  });
});

describe("çalışma arkadaşı ilanında iletişim bilgisi filtresi", () => {
  it("e-posta, telefon, bağlantı ve kullanıcı adını yakalar", () => {
    expect(hasContact("bana ayse@example.com yaz")).toBe(true);
    expect(hasContact("0532 123 45 67 ara")).toBe(true);
    expect(hasContact("https://example.com")).toBe(true);
    expect(hasContact("instagram: @ayse_sec")).toBe(true);
    expect(hasContact("Salı akşamı M05 tekrarı yapalım mı?")).toBe(false);
  });
});
