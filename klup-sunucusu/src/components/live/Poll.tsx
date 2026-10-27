"use client";

import { useEffect, useState } from "react";
import { BarChart3, CheckCircle2, Eye, Lock, Timer, Vote } from "lucide-react";
import type { ClientMessage, PollStats, PollView } from "@/lib/live-protocol";
import { useT } from "@/i18n/client";

// Sunucu saatine göre kalan saniye (istemci saati kaymış olabilir).
export function useCountdown(closesAt: number | null, skew: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!closesAt) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [closesAt]);
  return closesAt ? Math.max(0, Math.ceil((closesAt - (now + skew)) / 1000)) : 0;
}

const LETTERS = "ABCDEF";

// Yatay çubuk grafik: dağılım; quizde doğru seçenek açıklandıysa işaretlenir.
export function PollBars({ options, counts, total, correctIndex, mine }: { options: string[]; counts: number[]; total: number; correctIndex: number | null; mine?: number | null }) {
  const t = useT();
  return (
    <ul className="poll-bars" aria-label={t("Sonuç dağılımı")}>
      {options.map((o, i) => {
        const n = counts[i] ?? 0;
        const pct = total ? Math.round((n / total) * 100) : 0;
        const ok = correctIndex === i;
        return (
          <li key={i} className={ok ? "is-correct" : correctIndex !== null ? "is-wrong" : undefined}>
            <div className="poll-bar-label">
              <span className="poll-letter">{LETTERS[i]}</span>
              <span style={{ flex: 1 }}>{o}{mine === i && <span className="tiny faint">{" "}{t("· senin cevabın")}</span>}</span>
              {ok && <CheckCircle2 size={15} aria-label={t("doğru cevap")} />}
              <span className="mono small">{n} · %{pct}</span>
            </div>
            <div className="poll-bar" aria-hidden><span style={{ width: `${pct}%` }} /></div>
          </li>
        );
      })}
    </ul>
  );
}

const STATUS = { OPEN: "Cevaplar açık", CLOSED: "Cevaplar kapandı", REVEALED: "Sonuç açıklandı" };

// Öğrenci (ve projeksiyon) görünümü. readOnly → eğitmenin projeksiyon ekranı: seçenekler tıklanmaz.
export function StudentPoll({ poll, skew, send, readOnly = false }: { poll: PollView; skew: number; send: (m: ClientMessage) => boolean; readOnly?: boolean }) {
  const t = useT();
  const left = useCountdown(poll.status === "OPEN" ? poll.closesAt : null, skew);
  const open = poll.status === "OPEN" && left > 0;
  const answered = poll.mine !== null;
  return (
    <section className="poll-card" aria-labelledby="poll-q" aria-live="polite">
      <div className="row-between">
        <span className="eyebrow">
          {poll.kind === "QUIZ" ? <><Vote size={13} aria-hidden /> {poll.purpose === "EXIT" ? t("Çıkış bileti") : t("Canlı quiz")}</> : <><BarChart3 size={13} aria-hidden />{" "}{t("Anket")}{poll.anonymous ? t(" · anonim") : ""}</>}
        </span>
        <span className="row small mono">
          {open ? <><Timer size={14} aria-hidden />{" "}{t("{left} sn", { left })}</> : <><Lock size={14} aria-hidden /> {t(STATUS[poll.status])}</>}
          <span className="faint">{t("· {total} cevap", { total: poll.total })}</span>
        </span>
      </div>
      <h2 id="poll-q" className="poll-q">{poll.question}</h2>
      {poll.results ? (
        <PollBars options={poll.options} counts={poll.results} total={poll.total} correctIndex={poll.correctIndex} mine={poll.mine} />
      ) : (
        <div className="poll-opts" role="group" aria-label={t("Seçenekler")}>
          {poll.options.map((o, i) => (
            <button
              key={i}
              className="poll-opt"
              aria-pressed={poll.mine === i}
              disabled={readOnly || !open || answered}
              onClick={() => send({ t: "poll.answer", pollId: poll.id, choice: i })}
            >
              <span className="poll-letter">{LETTERS[i]}</span> {o}
            </button>
          ))}
        </div>
      )}
      {!readOnly && !poll.results && (
        <p className="tiny muted" style={{ margin: 0 }}>
          {answered ? t("Cevabın alındı. Sonucu eğitmen açıklayınca göreceksin.") : open ? t("Tek seçim; gönderdikten sonra değiştirilemez.") : t("Bu soru cevaba kapandı.")}
          {poll.kind === "QUIZ" && t(" Doğru cevap XP kazandırır.")}
        </p>
      )}
      {!readOnly && poll.results && poll.kind === "QUIZ" && poll.mine !== null && (
        <p className={poll.mine === poll.correctIndex ? "small text-ok" : "small muted"} style={{ margin: 0 }}>
          {poll.mine === poll.correctIndex ? t("Doğru! XP hesabına eklendi.") : t("Bu sefer olmadı — doğru cevap işaretli.")}
        </p>
      )}
    </section>
  );
}

type Draft = { purpose: "LIVE" | "EXIT"; kind: "QUIZ" | "POLL"; question: string; options: string[]; correctIndex: number; anonymous: boolean; timeLimitSec: number };
const EMPTY: Draft = { purpose: "LIVE", kind: "QUIZ", question: "", options: ["", ""], correctIndex: 0, anonymous: false, timeLimitSec: 60 };
const TIMES = [20, 30, 60, 90, 120, 300];

// Eğitmen paneli: soru hazırla → başlat → canlı dağılım → kapat → açıkla.
export function HostPollPanel({ poll, stats, skew, send, allowExit = false }: { poll: PollView | null; stats: PollStats | null; skew: number; send: (m: ClientMessage) => boolean; allowExit?: boolean }) {
  const tl = useT();
  const [d, setD] = useState<Draft>(EMPTY);
  const left = useCountdown(poll?.status === "OPEN" ? poll.closesAt : null, skew);
  const opts = d.options.map((o) => o.trim());
  const valid = d.question.trim().length > 0 && opts.every(Boolean) && opts.length >= 2;
  const set = (p: Partial<Draft>) => setD((x) => ({ ...x, ...p }));

  function start() {
    const ok = send({
      t: "poll.open",
      purpose: d.purpose,
      kind: d.kind,
      question: d.question.trim(),
      options: opts,
      ...(d.kind === "QUIZ" ? { correctIndex: d.correctIndex } : {}),
      anonymous: d.kind === "POLL" && d.anonymous,
      timeLimitSec: d.timeLimitSec,
    });
    if (ok) setD((x) => ({ ...EMPTY, kind: x.kind, timeLimitSec: x.timeLimitSec }));
  }

  return (
    <section className="card" aria-labelledby="poll-h">
      <div className="card-h"><h2 id="poll-h"><Vote size={15} aria-hidden />{" "}{tl("Quiz / anket")}</h2>{poll?.status === "OPEN" && <span className="badge badge-amber">{tl("{left} sn", { left })}</span>}</div>
      <div className="card-b stack-sm">
        {poll && stats?.pollId === poll.id && (
          <div className="stack-sm poll-live">
            <div className="row-between small">
              <strong style={{ minWidth: 0, overflowWrap: "anywhere" }}>{poll.question}</strong>
              <span className="badge">{poll.kind === "QUIZ" ? "quiz" : poll.anonymous ? tl("anonim anket") : "anket"}</span>
            </div>
            <PollBars options={poll.options} counts={stats.counts} total={stats.total} correctIndex={poll.kind === "QUIZ" ? poll.correctIndex : null} />
            <div className="row">
              {poll.status === "OPEN" && <button className="btn btn-sm" onClick={() => send({ t: "poll.close" })}><Lock size={14} aria-hidden />{" "}{tl("Cevapları kapat")}</button>}
              {poll.status !== "REVEALED" && <button className="btn btn-sm btn-primary" onClick={() => send({ t: "poll.reveal" })}><Eye size={14} aria-hidden />{" "}{tl("Sonucu açıkla")}</button>}
              {poll.status === "REVEALED" && <span className="small text-ok">{tl("Açıklandı")}{poll.kind === "QUIZ" ? tl(" · doğru cevaplayanlara XP verildi") : ""}</span>}
            </div>
            {stats.answers && stats.answers.length > 0 && (
              <details className="small">
                <summary>{tl("Kim ne cevapladı ({length})", { length: stats.answers.length })}</summary>
                <ul className="list-tight">
                  {stats.answers.map((a, i) => <li key={i}><span style={{ flex: 1 }}>{a.displayName}</span><span className="mono">{LETTERS[a.choice]}</span></li>)}
                </ul>
              </details>
            )}
          </div>
        )}

        <form className="stack-sm" onSubmit={(e) => { e.preventDefault(); if (valid) start(); }}>
          <div className="seg" role="group" aria-label={tl("Tür")}>
            <button type="button" aria-pressed={d.kind === "QUIZ"} onClick={() => set({ kind: "QUIZ" })}>{tl("Quiz (puanlı)")}</button>
            <button type="button" aria-pressed={d.kind === "POLL"} onClick={() => set({ kind: "POLL", purpose: "LIVE" })}>{tl("Anket")}</button>
          </div>
          {allowExit && d.kind === "QUIZ" && <label className="small row"><input type="checkbox" checked={d.purpose === "EXIT"} onChange={e => set({ purpose: e.target.checked ? "EXIT" : "LIVE" })} />{tl("Ders sonu çıkış bileti")}</label>}
          <label className="sr-only" htmlFor="poll-q-in">{tl("Soru")}</label>
          <input id="poll-q-in" className="input" maxLength={300} placeholder={tl("Soru")} value={d.question} onChange={(e) => set({ question: e.target.value })} />
          {d.options.map((o, i) => (
            <div key={i} className="row" style={{ gap: 6 }}>
              {d.kind === "QUIZ" && (
                <input type="radio" name="correct" aria-label={tl("{v0} doğru cevap", { v0: LETTERS[i] })} checked={d.correctIndex === i} onChange={() => set({ correctIndex: i })} />
              )}
              <input className="input" style={{ flex: 1 }} maxLength={120} placeholder={tl("Seçenek {v0}", { v0: LETTERS[i] })} value={o} onChange={(e) => set({ options: d.options.map((x, j) => (j === i ? e.target.value : x)) })} />
              {d.options.length > 2 && (
                <button type="button" className="btn btn-sm btn-ghost" aria-label={tl("{v0} seçeneğini kaldır", { v0: LETTERS[i] })} onClick={() => set({ options: d.options.filter((_, j) => j !== i), correctIndex: d.correctIndex >= i && d.correctIndex > 0 ? d.correctIndex - 1 : d.correctIndex })}>×</button>
              )}
            </div>
          ))}
          <div className="row" style={{ flexWrap: "wrap" }}>
            {d.options.length < 6 && <button type="button" className="btn btn-sm btn-ghost" onClick={() => set({ options: [...d.options, ""] })}>{tl("+ seçenek")}</button>}
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => set({ options: [tl("Doğru"), tl("Yanlış")], correctIndex: 0 })}>{tl("Doğru/Yanlış")}</button>
            <label className="small row" style={{ gap: 4 }}>
              {tl("Süre")}
              <select className="input" style={{ width: "auto" }} value={d.timeLimitSec} onChange={(e) => set({ timeLimitSec: Number(e.target.value) })}>
                {TIMES.map((t) => <option key={t} value={t}>{t < 60 ? tl("{t} sn", { t }) : tl("{v0} dk", { v0: t / 60 })}</option>)}
              </select>
            </label>
            {d.kind === "POLL" && (
              <label className="small row" style={{ gap: 4 }}>
                <input type="checkbox" checked={d.anonymous} onChange={(e) => set({ anonymous: e.target.checked })} />{" "}{tl("anonim")}
              </label>
            )}
          </div>
          <button className="btn btn-sm btn-primary" disabled={!valid}>{poll?.status === "OPEN" ? tl("Yenisini başlat (açık olan kapanır)") : tl("Başlat")}</button>
          <p className="tiny faint" style={{ margin: 0 }}>{d.kind === "QUIZ" ? tl("Quiz isimlidir; açıklayınca doğru cevaplayan her öğrenciye bir kez XP verilir.") : tl("Anket puansızdır; anonimse kimin ne seçtiğini sen de görmezsin.")}</p>
        </form>
      </div>
    </section>
  );
}
