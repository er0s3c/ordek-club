"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Send } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { useT } from "@/i18n/client";

type PQ =
  | { kind: "choice" | "multi"; text: string; options: string[] }
  | { kind: "truefalse"; text: string }
  | { kind: "short"; text: string }
  | { kind: "matching"; text: string; left: string[]; right: string[] };
type A = number | boolean | string | number[] | null;

const initial = (q: PQ): A => (q.kind === "multi" ? [] : q.kind === "short" ? "" : q.kind === "matching" ? q.left.map(() => -1) : null);
const answered = (q: PQ, a: A) =>
  q.kind === "multi" ? Array.isArray(a) && a.length > 0 : q.kind === "short" ? typeof a === "string" && a.trim() !== "" : q.kind === "matching" ? Array.isArray(a) && a.every((x) => x >= 0) : a !== null;

// Cevaplar sunucuda puanlanır; doğru cevaplar istemciye hiç gelmez.
export function QuizTake({ id, questions, attemptsLeft }: { id: string; questions: PQ[]; attemptsLeft: number | null }) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const [answers, setAnswers] = useState<A[]>(() => questions.map(initial));
  const [busy, setBusy] = useState(false);
  const set = (i: number, a: A) => setAnswers((x) => x.map((y, j) => (j === i ? a : y)));
  const done = questions.every((q, i) => answered(q, answers[i]!));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!window.confirm(t("Cevaplar gönderilsin mi?{v0}", { v0: attemptsLeft !== null ? ` (${attemptsLeft} hakkın var)` : "" }))) return;
    const form = new FormData();
    form.set("answers", JSON.stringify(answers));
    setBusy(true);
    try {
      const r = await api<{ status: string; feedback: string; xp: number }>(`/api/tasks/${encodeURIComponent(id)}/submit`, { method: "POST", form });
      toast(r.status === "APPROVED" ? "ok" : "info", r.feedback + (r.xp ? ` +${r.xp} XP` : ""));
      router.refresh();
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="stack" onSubmit={submit}>
      {questions.map((q, i) => (
        <fieldset key={i} className="quiz-q">
          <legend className="eyebrow">{t("Soru {v0}", { v0: i + 1 })}</legend>
          <div className="prose-plain">{q.text}</div>
          {(q.kind === "choice" || q.kind === "multi") && (
            <div className="stack-sm">
              {q.options.map((o, k) => (
                <label key={k} className="check">
                  {q.kind === "choice" ? (
                    <input type="radio" name={`a${i}`} checked={answers[i] === k} onChange={() => set(i, k)} />
                  ) : (
                    <input type="checkbox" checked={(answers[i] as number[]).includes(k)} onChange={(e) => {
                      const cur = answers[i] as number[];
                      set(i, e.target.checked ? [...cur, k] : cur.filter((x) => x !== k));
                    }} />
                  )}
                  <span>{o}</span>
                </label>
              ))}
              {q.kind === "multi" && <span className="hint">{t("Birden çok doğru olabilir; hepsini işaretle.")}</span>}
            </div>
          )}
          {q.kind === "truefalse" && (
            <div className="row">
              <label className="check"><input type="radio" name={`a${i}`} checked={answers[i] === true} onChange={() => set(i, true)} />{" "}{t("Doğru")}</label>
              <label className="check"><input type="radio" name={`a${i}`} checked={answers[i] === false} onChange={() => set(i, false)} />{" "}{t("Yanlış")}</label>
            </div>
          )}
          {q.kind === "short" && (
            <input className="input" maxLength={200} aria-label={t("Soru {v0} cevabı", { v0: i + 1 })} value={answers[i] as string} onChange={(e) => set(i, e.target.value)} />
          )}
          {q.kind === "matching" && (
            <div className="stack-sm">
              {q.left.map((l, k) => (
                <div key={k} className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                  <span style={{ flex: "1 1 140px", minWidth: 0 }}>{l}</span>
                  <select className="input select" style={{ flex: "1 1 160px", width: "auto" }} aria-label={t("{l} eşleşmesi", { l })} value={(answers[i] as number[])[k]} onChange={(e) => set(i, (answers[i] as number[]).map((x, j) => (j === k ? Number(e.target.value) : x)))}>
                    <option value={-1}>{t("— seç —")}</option>
                    {q.right.map((r, j) => <option key={j} value={j}>{r}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}
        </fieldset>
      ))}
      <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} disabled={busy || !done}><Send size={15} aria-hidden /> {busy ? t("Gönderiliyor…") : t("Cevapları gönder")}</button>
      {!done && <span className="hint">{t("Göndermek için her soruyu cevapla.")}</span>}
    </form>
  );
}
