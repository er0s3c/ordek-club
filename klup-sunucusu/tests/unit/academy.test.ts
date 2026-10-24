import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadAcademy, type QuizQuestion } from "@/server/academy/content";
import { gradeQuiz, publicQuestions } from "@/server/academy/service";

const REAL = path.resolve(__dirname, "../../content/academy");

describe("akademi içeriği (gerçek content/academy)", () => {
  const { tracks, problems } = loadAcademy(REAL);
  const lessons = tracks.flatMap((t) => t.lessons);

  it("hatasız ayrıştırılır; yollar ve dersler eksiksiz", () => {
    expect(problems).toEqual([]);
    expect(tracks.map((t) => t.key)).toContain("m01");
    expect(lessons.length).toBeGreaterThan(100);
    expect(new Set(lessons.map((l) => l.slug)).size).toBe(lessons.length);
  });

  it("göreli bağlantılar platform adreslerine çevrilir", () => {
    for (const l of lessons) {
      expect(l.body, l.slug).not.toMatch(/\]\((\.\.\/|[a-z0-9-]+\.md)/);
      expect(l.body, l.slug).not.toMatch(/gorseller\//);
    }
    const m01 = lessons.find((l) => l.slug === "m01-01")!;
    expect(m01.body).toContain("](/api/academy/images/karakter-tevfik.webp)");
    expect(m01.body).toContain("](/academy/lesson/p-09)");
  });

  it("modüller kötü adamını ve bölümünü taşır", () => {
    const m01 = tracks.find((t) => t.key === "m01")!;
    expect(m01.villain).toMatchObject({ id: "tevfik", bolum: "Bursun Onaylandı" });
    expect(tracks.find((t) => t.key === "program")!.villain).toBeNull();
  });

  it("quiz soruları doğru cevaplarıyla okunur", () => {
    const q = lessons.find((l) => l.slug === "m01-07")!;
    expect(q.kind).toBe("QUIZ");
    expect(q.passPercent).toBe(70);
    expect(q.quiz!.length).toBeGreaterThanOrEqual(3);
  });
});

describe("akademi içeriği: hatalı dosya", () => {
  it("bozuk front-matter ve geçersiz cevap indeksi sorun olarak raporlanır", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "academy-bad-"));
    fs.mkdirSync(path.join(dir, "t1"));
    fs.writeFileSync(path.join(dir, "akademi.yaml"), "yollar:\n  - { anahtar: t1, kod: T1, klasor: t1, tur: temel, baslik: T }\n");
    fs.writeFileSync(path.join(dir, "t1", "01-a.md"), "---\nid: t1-01\ntur: ders\n---\n# A\n"); // baslik/sure yok
    fs.writeFileSync(
      path.join(dir, "t1", "02-q.md"),
      "---\nid: t1-02\ntur: quiz\nbaslik: Q\nsure: 3\nsorular:\n  - { soru: S, tur: coktan, secenekler: [a, b], dogru: 5, aciklama: x }\n---\n# Q\n",
    );
    const { problems } = loadAcademy(dir);
    expect(problems.some((p) => p.includes("01-a.md"))).toBe(true);
    expect(problems.some((p) => p.includes("doğru cevap indeksi"))).toBe(true);
  });

  it("klasörü içerik dizininin dışına çıkan yol reddedilir", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "academy-escape-"));
    fs.writeFileSync(path.join(dir, "akademi.yaml"), "yollar:\n  - { anahtar: t1, kod: T1, klasor: ../, tur: temel, baslik: T }\n");
    expect(loadAcademy(dir).problems.length).toBeGreaterThan(0);
  });
});

describe("quiz puanlama", () => {
  const qs: QuizQuestion[] = [
    { kind: "choice", text: "1", options: ["a", "b", "c"], answer: 1, explanation: "e1" },
    { kind: "truefalse", text: "2", answer: false, explanation: "e2" },
    { kind: "choice", text: "3", options: ["a", "b"], answer: 0, explanation: "e3" },
  ];

  it("doğru cevaplar puanlanır, eşik geçme notudur", () => {
    expect(gradeQuiz(qs, [1, false, 0], 70)).toMatchObject({ correct: 3, total: 3, score: 100, passed: true });
    const r = gradeQuiz(qs, [1, true, 0], 70);
    expect(r).toMatchObject({ correct: 2, score: 67, passed: false });
    expect(r.results.map((x) => x.correct)).toEqual([true, false, true]);
    expect(gradeQuiz(qs, [1, true, 0], 67).passed).toBe(true);
  });

  it("tür uyuşmazlığı ve boş cevap yanlış sayılır", () => {
    expect(gradeQuiz(qs, [true, 0, null], 50).correct).toBe(0);
  });

  it("cevap sayısı soru sayısını tutmalı", () => {
    expect(() => gradeQuiz(qs, [1, false], 70)).toThrow();
  });

  it("istemciye giden sorular doğru cevabı ve açıklamayı içermez", () => {
    const pub = JSON.stringify(publicQuestions(qs));
    expect(pub).not.toMatch(/answer|explanation|e1/);
  });
});
