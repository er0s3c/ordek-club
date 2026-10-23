"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, CircleX, RotateCcw, Send, Stamp } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";

type Question = { kind: "choice"; text: string; options: string[] } | { kind: "truefalse"; text: string };
type Answer = number | boolean | null;
type Result = { results: { correct: boolean; explanation: string }[]; correct: number; total: number; score: number; passed: boolean; xp: number; badges: string[] };
type Reward = { xp: number; badges: string[] };

// Ödül bildirimi: kazanılan XP ve yeni rozetler (miktar sunucudan gelir).
function rewardText(r: Reward) {
  return [r.xp > 0 ? `+${r.xp} XP` : "", ...r.badges.map((b) => `🏅 Yeni rozet: ${b}`)].filter(Boolean).join(" · ");
}

export function CompleteButton({ slug, done }: { slug: string; done: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  if (done)
    return (
      <span className="stamp stamp-ok"><CheckCircle2 size={16} aria-hidden /> Tamamlandı</span>
    );
  async function complete() {
    setBusy(true);
    try {
      const r = await api<Reward>(`/api/academy/lessons/${slug}/complete`, { method: "POST" });
      const extra = rewardText(r);
      toast("ok", `Ders tamamlandı.${extra ? ` ${extra}` : ""}`);
      router.refresh();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <button className="btn btn-primary" onClick={complete} disabled={busy}>
      {busy ? <span className="spinner" aria-hidden /> : <Stamp size={16} aria-hidden />} Okudum, tamamla
    </button>
  );
}

export function QuizForm({ slug, questions, passPercent }: { slug: string; questions: Question[]; passPercent: number }) {
  const router = useRouter();
  const toast = useToast();
  const [answers, setAnswers] = useState<Answer[]>(() => questions.map(() => null));
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const missing = answers.filter((a) => a === null).length;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (missing) return toast("error", `${missing} soru cevapsız.`);
    setBusy(true);
    try {
      const r = await api<Result>(`/api/academy/lessons/${slug}/quiz`, { body: { answers } });
      setResult(r);
      if (r.passed) router.refresh();
      document.getElementById("quiz-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function retry() {
    setAnswers(questions.map(() => null));
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const set = (i: number, v: Answer) => !result && setAnswers((a) => a.map((x, j) => (j === i ? v : x)));

  return (
    <form className="quiz stack" onSubmit={submit} noValidate>
      {result && (
        <div id="quiz-result" className={`alert ${result.passed ? "alert-ok" : "alert-error"}`} role="status">
          {result.passed ? <CheckCircle2 size={18} aria-hidden /> : <CircleX size={18} aria-hidden />}
          <div>
            <strong>%{result.score}</strong> · {result.correct}/{result.total} doğru ·{" "}
            {result.passed ? "Geçtin, dosya kapandı." : `Geçme notu %${passPercent}. Açıklamaları oku, tekrar dene.`}
            {rewardText(result) && <div className="xp-gain">{rewardText(result)}</div>}
          </div>
        </div>
      )}
      {questions.map((q, i) => {
        const r = result?.results[i];
        const options: { label: string; value: Answer }[] =
          q.kind === "choice" ? q.options.map((o, j) => ({ label: o, value: j })) : [{ label: "Doğru", value: true }, { label: "Yanlış", value: false }];
        return (
          <fieldset key={i} className={`quiz-q card${r ? (r.correct ? " is-correct" : " is-wrong") : ""}`}>
            <legend className="quiz-legend"><span className="quiz-no">{String(i + 1).padStart(2, "0")}</span> {q.text}</legend>
            <div className="quiz-options">
              {options.map((o) => (
                <label key={String(o.value)} className={`quiz-opt${answers[i] === o.value ? " is-picked" : ""}`}>
                  <input type="radio" name={`q${i}`} checked={answers[i] === o.value} onChange={() => set(i, o.value)} disabled={!!result} />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
            {r && (
              <p className="quiz-expl small">
                {r.correct ? <CheckCircle2 size={15} aria-hidden /> : <CircleX size={15} aria-hidden />} {r.explanation}
              </p>
            )}
          </fieldset>
        );
      })}
      <div className="row">
        {result ? (
          <button type="button" className="btn" onClick={retry}><RotateCcw size={16} aria-hidden /> Tekrar dene</button>
        ) : (
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? <span className="spinner" aria-hidden /> : <Send size={16} aria-hidden />} Cevapları gönder
          </button>
        )}
        {!result && missing > 0 && <span className="tiny faint">{missing} soru cevapsız</span>}
      </div>
    </form>
  );
}
