"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, CheckCircle2, CircleX, RotateCcw, Send, Stamp } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { useT } from "@/i18n/client";

type Question = { kind: "choice"; text: string; options: string[] } | { kind: "truefalse"; text: string };
type Answer = number | boolean | null;
type Result = { results: { correct: boolean; explanation: string }[]; correct: number; total: number; score: number; passed: boolean; xp: number; badges: string[] };
type Reward = { xp: number; badges: string[] };

// Ödül bildirimi: kazanılan XP ve yeni rozetler (miktar sunucudan gelir).
function rewardText(r: Reward) {
  return [r.xp > 0 ? `+${r.xp} XP` : "", ...r.badges.map((b) => `🏅 Yeni rozet: ${b}`)].filter(Boolean).join(" · ");
}

export function CompleteButton({ slug, done }: { slug: string; done: boolean }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  if (done)
    return (
      <span className="lab-done"><CheckCircle2 size={16} aria-hidden />{" "}{t("Tamamlandı")}</span>
    );
  async function complete() {
    setBusy(true);
    try {
      const r = await api<Reward>(`/api/academy/lessons/${slug}/complete`, { method: "POST" });
      const extra = rewardText(r);
      toast("ok", t("Ders tamamlandı.{v0}", { v0: extra ? ` ${extra}` : "" }));
      router.refresh();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <button className="btn btn-primary" onClick={complete} disabled={busy}>
      {busy ? <span className="spinner" aria-hidden /> : <Stamp size={16} aria-hidden />}{" "}{t("Okudum, tamamla")}
    </button>
  );
}

// Görevli derste "Okudum, tamamla" yok: ders görev çözülünce kendiliğinden tamamlanır. Kilidin nedeni yazılır
// (sessiz kilit yok — 04 §6.6); bağlantı göreve kaydırır.
export function MissionLock({ done, left, target }: { done: boolean; left: number; target: string }) {
  const t = useT();
  if (done) return <span className="lab-done"><CheckCircle2 size={16} aria-hidden />{" "}{t("Tamamlandı")}</span>;
  return (
    <div className="lab-lock">
      <span className="btn" aria-disabled="true"><Stamp size={16} aria-hidden />{" "}{t("Dersi bitir")}</span>
      <a href={`#gorev-${target}`}>{left > 1 ? t("{left} görev kaldı", { left }) : t("1 görev kaldı")}{" "}{t("— görevi çöz, ders kendiliğinden tamamlanır ↑")}</a>
    </div>
  );
}

export function QuizForm({ slug, questions, passPercent, note, lang }: { slug: string; questions: Question[]; passPercent: number; note?: string; lang?: "tr" | "en" }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [answers, setAnswers] = useState<Answer[]>(() => questions.map(() => null));
  // Güven işareti: true = eminim, false = tahmin ettim; tahminle doğru bilinenler de tekrar kartına girer.
  const [sure, setSure] = useState<(boolean | null)[]>(() => questions.map(() => null));
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const missing = answers.filter((a) => a === null).length;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (missing) return toast("error", t("{missing} soru cevapsız.", { missing }));
    setBusy(true);
    try {
      const r = await api<Result>(`/api/academy/lessons/${slug}/quiz`, { body: { answers, confidence: sure, lang } });
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
    setSure(questions.map(() => null));
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const set = (i: number, v: Answer) => !result && setAnswers((a) => a.map((x, j) => (j === i ? v : x)));

  return (
    <form className="quiz lab-qa" onSubmit={submit} noValidate aria-labelledby="qa-title">
      <h2 id="qa-title" className="lab-qa-title">{t("Soruları cevaplayın")}</h2>
      {note && <p className="lab-qa-note">{note}</p>}
      {/* Sonuç bölgesi her zaman DOM'da: ekran okuyucu yeni sonucu duyurur */}
      <div id="quiz-result" aria-live="polite">
        {result && (
          <div className={`lab-qa-result ${result.passed ? "is-ok" : "is-bad"}`}>
            {result.passed ? <CheckCircle2 size={18} aria-hidden /> : <CircleX size={18} aria-hidden />}
            <div>
              <strong>%{result.score}</strong>{" "}{t("· {correct}/{total} doğru ·{v0}", { correct: result.correct, total: result.total, v0: " " })}
              {result.passed ? t("Geçtin, dosya kapandı.") : t("Geçme notu %{passPercent}. Açıklamaları oku, tekrar dene.", { passPercent })}
              {rewardText(result) && <div className="xp-gain">{rewardText(result)}</div>}
            </div>
          </div>
        )}
      </div>
      {questions.map((q, i) => {
        const r = result?.results[i];
        const options: { label: string; value: Answer }[] =
          q.kind === "choice" ? q.options.map((o, j) => ({ label: o, value: j })) : [{ label: t("Doğru"), value: true }, { label: t("Yanlış"), value: false }];
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
            {!result && answers[i] !== null && (
              <div className="row quiz-sure" role="radiogroup" aria-label={t("Cevabından ne kadar eminsin?")}>
                <span className="tiny faint">{t("Ne kadar eminsin?")}</span>
                <button type="button" className="chip" role="radio" aria-checked={sure[i] === true} onClick={() => setSure((c) => c.map((x, j) => (j === i ? true : x)))}>{t("Eminim")}</button>
                <button type="button" className="chip" role="radio" aria-checked={sure[i] === false} onClick={() => setSure((c) => c.map((x, j) => (j === i ? false : x)))}>{t("Tahmin ettim")}</button>
              </div>
            )}
            {r && sure[i] === false && r.correct && <p className="tiny faint">{t("Tahminle doğru bildin; bu soru tekrar kartlarına eklendi.")}</p>}
            {r && (
              <div className={`lab-qa-verdict ${r.correct ? "is-ok" : "is-bad"}`}>
                {r.correct ? <><Check size={15} aria-hidden />{" "}{t("Doğru cevap")}</> : <><CircleX size={15} aria-hidden />{" "}{t("Tekrar dene")}</>}
              </div>
            )}
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
          <button type="button" className="btn" onClick={retry}><RotateCcw size={16} aria-hidden />{" "}{t("Tekrar dene")}</button>
        ) : (
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? <span className="spinner" aria-hidden /> : <Send size={16} aria-hidden />}{" "}{t("Cevapları gönder")}
          </button>
        )}
        {!result && missing > 0 && <span className="tiny faint">{t("{missing} soru cevapsız", { missing })}</span>}
      </div>
    </form>
  );
}
