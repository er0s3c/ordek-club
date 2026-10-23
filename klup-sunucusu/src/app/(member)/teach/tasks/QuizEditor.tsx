"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

// Sunucudaki autograde.ts şemasıyla aynı biçim.
export type QDraft =
  | { kind: "choice"; text: string; options: string[]; answer: number; explanation: string }
  | { kind: "multi"; text: string; options: string[]; answers: number[]; explanation: string }
  | { kind: "truefalse"; text: string; answer: boolean; explanation: string }
  | { kind: "short"; text: string; accepted: string[]; explanation: string }
  | { kind: "matching"; text: string; pairs: { left: string; right: string }[]; explanation: string };

const KINDS: Record<QDraft["kind"], string> = { choice: "Çoktan seçmeli (tek)", multi: "Çoklu seçim", truefalse: "Doğru / Yanlış", short: "Kısa cevap", matching: "Eşleştirme" };

const blank = (kind: QDraft["kind"], text = "", explanation = ""): QDraft => {
  switch (kind) {
    case "choice":
      return { kind, text, options: ["", ""], answer: 0, explanation };
    case "multi":
      return { kind, text, options: ["", "", ""], answers: [0], explanation };
    case "truefalse":
      return { kind, text, answer: true, explanation };
    case "short":
      return { kind, text, accepted: [""], explanation };
    case "matching":
      return { kind, text, pairs: [{ left: "", right: "" }, { left: "", right: "" }], explanation };
  }
};

export function QuizEditor({ value, onChange, error }: { value: QDraft[]; onChange: (v: QDraft[]) => void; error?: string }) {
  const put = (i: number, q: QDraft) => onChange(value.map((x, j) => (j === i ? q : x)));
  const move = (i: number, d: -1 | 1) => {
    const n = [...value];
    [n[i], n[i + d]] = [n[i + d]!, n[i]!];
    onChange(n);
  };

  return (
    <div className="stack">
      {value.map((q, i) => (
        <fieldset key={i} className="quiz-q">
          <legend className="eyebrow">Soru {i + 1}</legend>
          <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
            <select className="input select" style={{ width: "auto" }} aria-label={`Soru ${i + 1} türü`} value={q.kind} onChange={(e) => put(i, blank(e.target.value as QDraft["kind"], q.text, q.explanation))}>
              {Object.entries(KINDS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <span style={{ flex: 1 }} />
            <button type="button" className="btn btn-sm btn-ghost" aria-label="Yukarı taşı" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={14} aria-hidden /></button>
            <button type="button" className="btn btn-sm btn-ghost" aria-label="Aşağı taşı" disabled={i === value.length - 1} onClick={() => move(i, 1)}><ArrowDown size={14} aria-hidden /></button>
            <button type="button" className="btn btn-sm btn-ghost" aria-label={`Soru ${i + 1} sil`} onClick={() => onChange(value.filter((_, j) => j !== i))}><Trash2 size={14} aria-hidden /></button>
          </div>
          <textarea className="textarea" rows={2} maxLength={500} aria-label={`Soru ${i + 1} metni`} placeholder="Soru metni" value={q.text} onChange={(e) => put(i, { ...q, text: e.target.value })} />

          {(q.kind === "choice" || q.kind === "multi") && (
            <div className="stack-sm">
              {q.options.map((o, k) => (
                <div key={k} className="row" style={{ gap: 6 }}>
                  {q.kind === "choice" ? (
                    <input type="radio" name={`q${i}`} aria-label={`Seçenek ${k + 1} doğru`} checked={q.answer === k} onChange={() => put(i, { ...q, answer: k })} />
                  ) : (
                    <input type="checkbox" aria-label={`Seçenek ${k + 1} doğru`} checked={q.answers.includes(k)} onChange={(e) => put(i, { ...q, answers: e.target.checked ? [...q.answers, k].sort() : q.answers.filter((x) => x !== k) })} />
                  )}
                  <input className="input" style={{ flex: 1 }} maxLength={200} placeholder={`Seçenek ${k + 1}`} value={o} onChange={(e) => put(i, { ...q, options: q.options.map((x, j) => (j === k ? e.target.value : x)) })} />
                  {q.options.length > 2 && (
                    <button type="button" className="btn btn-sm btn-ghost" aria-label={`Seçenek ${k + 1} sil`} onClick={() => {
                      const options = q.options.filter((_, j) => j !== k);
                      if (q.kind === "choice") put(i, { ...q, options, answer: q.answer === k ? 0 : q.answer > k ? q.answer - 1 : q.answer });
                      else put(i, { ...q, options, answers: q.answers.filter((x) => x !== k).map((x) => (x > k ? x - 1 : x)) });
                    }}>×</button>
                  )}
                </div>
              ))}
              {q.options.length < 8 && <button type="button" className="btn btn-sm btn-ghost" style={{ alignSelf: "flex-start" }} onClick={() => put(i, { ...q, options: [...q.options, ""] } as QDraft)}>+ seçenek</button>}
              <span className="hint">{q.kind === "choice" ? "Doğru seçeneği işaretle." : "Doğru seçeneklerin hepsini işaretle; öğrenci tam eşleşmeyle puan alır."}</span>
            </div>
          )}
          {q.kind === "truefalse" && (
            <div className="seg" role="group" aria-label="Doğru cevap">
              <button type="button" aria-pressed={q.answer} onClick={() => put(i, { ...q, answer: true })}>Doğru</button>
              <button type="button" aria-pressed={!q.answer} onClick={() => put(i, { ...q, answer: false })}>Yanlış</button>
            </div>
          )}
          {q.kind === "short" && (
            <div className="field">
              <label htmlFor={`acc${i}`}>Kabul edilen cevaplar (virgülle ayır)</label>
              <input id={`acc${i}`} className="input" value={q.accepted.join(", ")} onChange={(e) => put(i, { ...q, accepted: e.target.value.split(",").map((x) => x.trimStart()) })} placeholder="ör. 4444, port 4444" />
              <span className="hint">Büyük/küçük harf, boşluk ve Türkçe karakter farkı gözetilmez.</span>
            </div>
          )}
          {q.kind === "matching" && (
            <div className="stack-sm">
              {q.pairs.map((p, k) => (
                <div key={k} className="row" style={{ gap: 6 }}>
                  <input className="input" style={{ flex: 1, minWidth: 0 }} maxLength={200} aria-label={`Sol ${k + 1}`} placeholder="Sol (ör. 22/tcp)" value={p.left} onChange={(e) => put(i, { ...q, pairs: q.pairs.map((x, j) => (j === k ? { ...x, left: e.target.value } : x)) })} />
                  <span aria-hidden>↔</span>
                  <input className="input" style={{ flex: 1, minWidth: 0 }} maxLength={200} aria-label={`Sağ ${k + 1}`} placeholder="Sağ (ör. SSH)" value={p.right} onChange={(e) => put(i, { ...q, pairs: q.pairs.map((x, j) => (j === k ? { ...x, right: e.target.value } : x)) })} />
                  {q.pairs.length > 2 && <button type="button" className="btn btn-sm btn-ghost" aria-label={`Çift ${k + 1} sil`} onClick={() => put(i, { ...q, pairs: q.pairs.filter((_, j) => j !== k) })}>×</button>}
                </div>
              ))}
              {q.pairs.length < 8 && <button type="button" className="btn btn-sm btn-ghost" style={{ alignSelf: "flex-start" }} onClick={() => put(i, { ...q, pairs: [...q.pairs, { left: "", right: "" }] })}>+ çift</button>}
              <span className="hint">Doğru eşleşmeleri yan yana yaz; öğrenciye sağ taraf karışık gösterilir.</span>
            </div>
          )}
          <input className="input" maxLength={1000} aria-label={`Soru ${i + 1} açıklaması`} placeholder="Açıklama (sonuç kesinleşince öğrenciye gösterilir)" value={q.explanation} onChange={(e) => put(i, { ...q, explanation: e.target.value })} />
        </fieldset>
      ))}
      {value.length < 50 && <button type="button" className="btn btn-sm" style={{ alignSelf: "flex-start" }} onClick={() => onChange([...value, blank("choice")])}><Plus size={14} aria-hidden /> Soru ekle</button>}
      {error && <span className="err" role="alert">{error}</span>}
    </div>
  );
}

// Kısa cevaplarda boş girdileri temizler (gönderim öncesi).
export const cleanQuiz = (qs: QDraft[]): QDraft[] => qs.map((q) => (q.kind === "short" ? { ...q, accepted: q.accepted.map((a) => a.trim()).filter(Boolean) } : q));
