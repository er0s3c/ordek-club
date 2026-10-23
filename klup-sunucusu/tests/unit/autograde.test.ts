import { describe, expect, it } from "vitest";
import { gradeAnswers, publicQuiz, quizSchema, shuffleOrder, type Question } from "@/server/classroom/autograde";

const QS: Question[] = quizSchema.parse([
  { kind: "choice", text: "SSH portu?", options: ["21", "22", "80"], answer: 1 },
  { kind: "multi", text: "Hangileri şifreli?", options: ["HTTP", "HTTPS", "SSH", "Telnet"], answers: [1, 2] },
  { kind: "truefalse", text: "MD5 parola saklamak için uygundur.", answer: false },
  { kind: "short", text: "Ters kabuk portu?", accepted: ["4444", "port 4444"] },
  { kind: "short", text: "Saldırı tekniği?", accepted: ["İçerik Enjeksiyonu"] },
  { kind: "matching", text: "Eşleştir", pairs: [{ left: "22", right: "SSH" }, { left: "53", right: "DNS" }, { left: "443", right: "HTTPS" }] },
]);
const SEED = "gorev-1";

// Karışık sağ listeden doğru seçimleri üretir (öğrencinin yapacağı gibi).
function correctMatching(i: number) {
  const pub = publicQuiz(QS, SEED)[i] as { right: string[] };
  const q = QS[i] as Extract<Question, { kind: "matching" }>;
  return q.pairs.map((p) => pub.right.indexOf(p.right));
}

describe("otomatik puanlama", () => {
  it("öğrenci görünümünde cevap anahtarı yoktur", () => {
    const pub = JSON.stringify(publicQuiz(QS, SEED));
    expect(pub).not.toMatch(/"answer"|"answers"|"accepted"|"pairs"|4444/);
    const m = publicQuiz(QS, SEED)[5] as { right: string[]; left: string[] };
    expect(m.left).toEqual(["22", "53", "443"]);
    expect([...m.right].sort()).toEqual(["DNS", "HTTPS", "SSH"]);
  });

  it("karıştırma deterministik ve tohuma bağlı", () => {
    expect(shuffleOrder(8, "a")).toEqual(shuffleOrder(8, "a"));
    expect([...shuffleOrder(8, "a")].sort()).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    const different = ["b", "c", "d", "e"].some((x) => JSON.stringify(shuffleOrder(8, x)) !== JSON.stringify(shuffleOrder(8, "a")));
    expect(different).toBe(true);
  });

  it("tüm türleri doğru puanlar; kısa cevapta harf/Türkçe karakter farkı gözetilmez", () => {
    const full = gradeAnswers(QS, [1, [2, 1], false, " PORT 4444 ", "icerik enjeksiyonu", correctMatching(5)], SEED);
    expect(full).toMatchObject({ correct: 6, total: 6, percent: 100 });
    const wrong = gradeAnswers(QS, [0, [1], true, "1337", "xss", [0, 0, 0]], SEED);
    expect(wrong.results).toEqual([false, false, false, false, false, false]);
    // Çoklu seçimde fazladan seçenek ya da tekrar puan getirmez
    expect(gradeAnswers(QS, [1, [1, 2, 3], false, "4444", "x", [0, 1, 2]], SEED).results[1]).toBe(false);
    expect(gradeAnswers(QS, [1, [1, 1], false, "4444", "x", [0, 1, 2]], SEED).results[1]).toBe(false);
  });

  it("tür uyuşmazlığı yanlış sayılır; cevap sayısı eksikse hata", () => {
    expect(gradeAnswers(QS, ["1", 1, "false", 4444, null, "x"] as never, SEED).correct).toBe(0);
    expect(() => gradeAnswers(QS, [1], SEED)).toThrow();
  });

  it("şema: geçersiz doğru seçenek ve tekrarlı eşleştirme reddedilir", () => {
    expect(quizSchema.safeParse([{ kind: "choice", text: "a", options: ["x", "y"], answer: 2 }]).success).toBe(false);
    expect(quizSchema.safeParse([{ kind: "multi", text: "a", options: ["x", "y"], answers: [0, 0] }]).success).toBe(false);
    expect(quizSchema.safeParse([{ kind: "matching", text: "a", pairs: [{ left: "1", right: "A" }, { left: "2", right: "A" }] }]).success).toBe(false);
    expect(quizSchema.safeParse([]).success).toBe(false);
  });
});
