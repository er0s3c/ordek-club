// Otomatik puanlanan görev (QUIZ türü): soru şeması, öğrenciye giden görünüm ve puanlama.
// Cevap anahtarı yalnız sunucudadır; öğrenciye giden görünümde doğru cevap bulunmaz.
import crypto from "node:crypto";
import { z } from "zod";
import { badRequest } from "@/server/errors";

const t = (max: number) => z.string().trim().min(1).max(max);

export const questionSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("choice"), text: t(500), options: z.array(t(200)).min(2).max(8), answer: z.number().int().min(0), explanation: z.string().max(1000).default("") }),
  z.object({ kind: z.literal("multi"), text: t(500), options: z.array(t(200)).min(2).max(8), answers: z.array(z.number().int().min(0)).min(1).max(8), explanation: z.string().max(1000).default("") }),
  z.object({ kind: z.literal("truefalse"), text: t(500), answer: z.boolean(), explanation: z.string().max(1000).default("") }),
  // Kısa cevap: büyük/küçük harf, baştaki/sondaki boşluk ve Türkçe karakter farkı gözetilmez.
  z.object({ kind: z.literal("short"), text: t(500), accepted: z.array(t(100)).min(1).max(10), explanation: z.string().max(1000).default("") }),
  // Eşleştirme: pairs[i].left ↔ pairs[i].right doğru eşleşmedir; öğrenciye sağ taraf karışık gösterilir.
  z.object({ kind: z.literal("matching"), text: t(500), pairs: z.array(z.object({ left: t(200), right: t(200) })).min(2).max(8), explanation: z.string().max(1000).default("") }),
]);
export type Question = z.output<typeof questionSchema>;

export const quizSchema = z
  .array(questionSchema)
  .min(1, "En az bir soru ekle.")
  .max(50)
  .superRefine((qs, ctx) => {
    qs.forEach((q, i) => {
      if (q.kind === "choice" && q.answer >= q.options.length) ctx.addIssue({ code: "custom", path: [i, "answer"], message: `Soru ${i + 1}: doğru seçenek geçersiz.` });
      if (q.kind === "multi" && (q.answers.some((a) => a >= q.options.length) || new Set(q.answers).size !== q.answers.length))
        ctx.addIssue({ code: "custom", path: [i, "answers"], message: `Soru ${i + 1}: doğru seçenekler geçersiz.` });
      if (q.kind === "matching" && new Set(q.pairs.map((p) => p.right)).size !== q.pairs.length)
        ctx.addIssue({ code: "custom", path: [i, "pairs"], message: `Soru ${i + 1}: sağ taraftaki öğeler birbirinden farklı olmalı.` });
    });
  });

// Deterministik karıştırma: aynı görev + soru için her istekte aynı sıra (puanlama aynı sırayı yeniden hesaplar).
export function shuffleOrder(n: number, seed: string): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = crypto.createHash("sha256").update(`${seed}#${i}`).digest().readUInt32BE(0) % (i + 1);
    [order[i], order[j]] = [order[j]!, order[i]!];
  }
  return order;
}

export type PublicQuestion =
  | { kind: "choice" | "multi"; text: string; options: string[] }
  | { kind: "truefalse"; text: string }
  | { kind: "short"; text: string }
  | { kind: "matching"; text: string; left: string[]; right: string[] };

export function publicQuiz(qs: Question[], seed: string): PublicQuestion[] {
  return qs.map((q, i) => {
    switch (q.kind) {
      case "choice":
      case "multi":
        return { kind: q.kind, text: q.text, options: q.options };
      case "truefalse":
      case "short":
        return { kind: q.kind, text: q.text };
      case "matching": {
        const order = shuffleOrder(q.pairs.length, `${seed}:${i}`);
        return { kind: "matching", text: q.text, left: q.pairs.map((p) => p.left), right: order.map((k) => q.pairs[k]!.right) };
      }
    }
  });
}

export const answersSchema = z.array(z.union([z.number().int().min(0).max(50), z.boolean(), z.string().max(200), z.array(z.number().int().min(0).max(50)).max(8), z.null()])).max(50);
export type QuizAnswers = z.output<typeof answersSchema>;

const norm = (s: string) =>
  s
    .trim()
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ı/g, "i")
    .replace(/\s+/g, " ");

export function gradeAnswers(qs: Question[], answers: QuizAnswers, seed: string) {
  if (answers.length !== qs.length) throw badRequest("Her soru için bir cevap gönderilmeli.", "ANSWER_COUNT");
  const results = qs.map((q, i) => {
    const a = answers[i];
    switch (q.kind) {
      case "choice":
        return typeof a === "number" && a === q.answer;
      case "multi":
        return Array.isArray(a) && a.length === q.answers.length && new Set(a).size === a.length && a.every((x) => q.answers.includes(x));
      case "truefalse":
        return typeof a === "boolean" && a === q.answer;
      case "short":
        return typeof a === "string" && q.accepted.some((x) => norm(x) === norm(a));
      case "matching": {
        // a[sol] = karışık sağ listedeki seçilen indeks; doğru eşleşme order[a[sol]] === sol
        if (!Array.isArray(a) || a.length !== q.pairs.length) return false;
        const order = shuffleOrder(q.pairs.length, `${seed}:${i}`);
        return a.every((pick, left) => order[pick] === left);
      }
    }
  });
  const correct = results.filter(Boolean).length;
  return { results, correct, total: qs.length, percent: qs.length ? Math.round((correct / qs.length) * 100) : 0 };
}
