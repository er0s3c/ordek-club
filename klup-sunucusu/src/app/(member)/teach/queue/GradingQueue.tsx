"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, CornerUpLeft, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState, StatusPill } from "@/components/ui/states";
import { VersionCompare } from "@/components/classroom/TaskExtras";
import { REPORT_RUBRIC, REPORT_MAX } from "@/components/academy/ReportReview";
import { AnimatedList } from "@/components/motion/AnimatedList";
import { useT } from "@/i18n/client";

type Item = {
  id: string; text: string; late: boolean; submittedAt: string; attempts: number; checklist: { items: string[]; checked: number[] } | null; student: string; username: string;
  assignment: { id: string; title: string; maxScore: number; rubric: { criterion: string; points: number }[] };
  files: { id: string; name: string; size: number }[]; versions: { number: number; text: string; createdAt: string }[]; peer: { scores: number[] | null; comment: string }[];
};
type Report = { userId: string; labKey: string; student: string; title: string; evidence: string; impact: string; recommendation: string; submittedAt: string | null };
type Challenge = { id: string; user: string; title: string; score: number; evidence: string; createdAt: string };
type Workshop = { id: string; student: string; key: string; payload: { links?: { from: string; to: string; reason: string }[] }; score: number; createdAt: string };

function useAct() {
  const router = useRouter();
  const toast = useToast();
  return async (fn: () => Promise<unknown>, ok?: string) => {
    try { await fn(); if (ok) toast("ok", ok); router.refresh(); return true; } catch (e) { toast("error", (e as Error).message); return false; }
  };
}

function Submissions({ queue, snippets }: { queue: Item[]; snippets: { id: string; label: string; text: string }[] }) {
  const t = useT();
  const act = useAct();
  const [i, setI] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const item = queue[Math.min(i, queue.length - 1)];
  useEffect(() => { setScores(item ? item.assignment.rubric.map(() => 0) : []); setScore(""); setFeedback(""); }, [item?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))) return;
      if (e.key === "j") setI((x) => Math.min(queue.length - 1, x + 1));
      if (e.key === "k") setI((x) => Math.max(0, x - 1));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [queue.length]);
  if (!item) return <EmptyState duck="cheer" title={t("Kuyruk boş")} text={t("Değerlendirme bekleyen teslim yok.")} />;
  const rubric = item.assignment.rubric;
  async function decide(decision: "APPROVE" | "RETURN" | "REJECT") {
    const body = { decision, feedback, ...(rubric.length ? { rubricScores: scores } : score !== "" ? { score: Number(score) } : {}) };
    if (await act(() => api(`/api/teach/submissions/${item!.id}/review`, { body }), decision === "APPROVE" ? t("Onaylandı.") : decision === "RETURN" ? t("Düzeltme istendi.") : "Reddedildi.")) setI((x) => Math.min(x, queue.length - 2));
  }
  return (
    <div className="queue">
      <div className="row-between">
        <div className="row"><button type="button" className="btn btn-sm" disabled={i === 0} onClick={() => setI(i - 1)} aria-label={t("Önceki (k)")}><ArrowLeft size={14} aria-hidden /></button><span className="small">{i + 1} / {queue.length}</span><button type="button" className="btn btn-sm" disabled={i >= queue.length - 1} onClick={() => setI(i + 1)} aria-label={t("Sonraki (j)")}><ArrowRight size={14} aria-hidden /></button></div>
        <a className="small" href={`/teach/tasks/${item.assignment.id}`}>{t("Görev sayfası →")}</a>
      </div>
      <div className="grid-2" style={{ alignItems: "start" }}>
        <section className="card" aria-label={t("Teslim")}>
          <div className="card-h"><h2>{item.assignment.title}</h2>{item.late ? <StatusPill tone="warn">{t("geç teslim")}</StatusPill> : <StatusPill tone="info">{t("{attempts}. deneme", { attempts: item.attempts })}</StatusPill>}</div>
          <div className="card-b stack-sm">
            <span className="tiny faint">{item.student} (@{item.username}) · {new Date(item.submittedAt).toLocaleString(t.intl)}</span>
            <div className="notes small" style={{ whiteSpace: "pre-wrap", maxHeight: 420, overflow: "auto" }}>{item.text || "—"}</div>
            {item.files.length > 0 && <ul className="list-tight">{item.files.map((f) => <li key={f.id}><a href={`/api/files/${f.id}`}>{f.name}</a><span className="tiny faint">{Math.round(f.size / 1024)} KB</span></li>)}</ul>}
            {item.checklist && <span className="tiny faint">{t("Kontrol listesi: {length}/{length1} işaretlendi", { length: item.checklist.checked.length, length1: item.checklist.items.length })}</span>}
            <VersionCompare versions={item.versions} />
            {item.peer.length > 0 && <details><summary className="small">{t("Akran geri bildirimleri ({length})", { length: item.peer.length })}</summary>{item.peer.map((p, j) => <div key={j} className="qa-answer"><span className="tiny faint">{t("Akran {v0}", { v0: j + 1 })}{p.scores ? t(" · {v0} puan önerdi", { v0: p.scores.reduce((a, b) => a + b, 0) }) : ""}</span><p style={{ margin: "4px 0 0" }}>{p.comment}</p></div>)}</details>}
          </div>
        </section>
        <section className="card card-primary" aria-label={t("Değerlendirme")}>
          <div className="card-b stack">
            {rubric.length ? rubric.map((r, j) => (
              <label key={j} className="row-between small"><span>{r.criterion}</span><span className="row"><input className="input" style={{ width: 90 }} type="number" min={0} max={r.points} value={scores[j] ?? 0} onChange={(e) => setScores((s) => s.map((v, k) => (k === j ? Math.min(r.points, Math.max(0, Number(e.target.value))) : v)))} /><span className="tiny faint">/ {r.points}</span></span></label>
            )) : <label className="field">{t("Puan (/{maxScore})", { maxScore: item.assignment.maxScore })}<input className="input" type="number" min={0} max={item.assignment.maxScore} value={score} onChange={(e) => setScore(e.target.value)} /></label>}
            {rubric.length > 0 && <span className="small">{t("Toplam:")}{" "}<strong>{scores.reduce((a, b) => a + b, 0)}</strong> / {item.assignment.maxScore}</span>}
            <label className="field">{t("Geri bildirim")}<textarea className="textarea" rows={5} maxLength={5000} value={feedback} onChange={(e) => setFeedback(e.target.value)} /></label>
            {snippets.length > 0 && <div className="chips" aria-label={t("Yorum bankası")}>{snippets.map((s) => <button key={s.id} type="button" className="chip" title={s.text} onClick={() => setFeedback((f) => (f ? `${f}\n${s.text}` : s.text))}>{s.label}</button>)}</div>}
            <div className="row">
              <button type="button" className="btn btn-primary btn-sm" onClick={() => decide("APPROVE")}><Check size={14} aria-hidden />{" "}{t("Onayla")}</button>
              <button type="button" className="btn btn-sm" onClick={() => decide("RETURN")}><CornerUpLeft size={14} aria-hidden />{" "}{t("Düzeltme iste")}</button>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => decide("REJECT")}><X size={14} aria-hidden />{" "}{t("Reddet")}</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Reports({ reports }: { reports: Report[] }) {
  const t = useT();
  const act = useAct();
  const [s, setS] = useState<Record<string, number[]>>({});
  const [f, setF] = useState<Record<string, string>>({});
  if (!reports.length) return <EmptyState title={t("İncelemede rapor yok")} />;
  return (
    <AnimatedList className="stack">
      {reports.map((r) => {
        const key = `${r.userId}:${r.labKey}`;
        const sc = s[key] ?? REPORT_RUBRIC.map(() => 3);
        return (
          <article key={key} className="card" aria-label={t("{student} raporu", { student: r.student })}>
            <div className="card-h"><h2>{r.title}</h2><span className="tiny faint">{r.student}</span></div>
            <div className="card-b grid-2" style={{ alignItems: "start" }}>
              <dl className="story"><div><dt>{t("Kanıt")}</dt><dd>{r.evidence}</dd></div><div><dt>{t("Etki")}</dt><dd>{r.impact}</dd></div><div><dt>{t("Öneri")}</dt><dd>{r.recommendation}</dd></div></dl>
              <div className="stack-sm">
                {REPORT_RUBRIC.map((c, i) => <label key={c.key} className="row-between small" title={c.hint}><span>{c.label}</span><select className="select" style={{ width: 90 }} value={sc[i]} onChange={(e) => setS((x) => ({ ...x, [key]: sc.map((v, j) => (j === i ? Number(e.target.value) : v)) }))}>{Array.from({ length: REPORT_MAX + 1 }, (_, n) => <option key={n} value={n}>{n}</option>)}</select></label>)}
                <textarea className="textarea" rows={3} aria-label={t("Öğretmen notu")} placeholder={t("En güçlü kısım ve geliştirilecek tek şey…")} value={f[key] ?? ""} onChange={(e) => setF((x) => ({ ...x, [key]: e.target.value }))} />
                <div><button type="button" className="btn btn-sm btn-primary" onClick={() => act(() => api("/api/teach/reports", { method: "PATCH", body: { userId: r.userId, labKey: r.labKey, rubricScores: sc, feedback: f[key] ?? "" } }), t("Rapor değerlendirildi."))}>{t("Değerlendirmeyi kaydet")}</button></div>
              </div>
            </div>
          </article>
        );
      })}
    </AnimatedList>
  );
}

function Challenges({ rows }: { rows: Challenge[] }) {
  const t = useT();
  const act = useAct();
  const [note, setNote] = useState<Record<string, string>>({});
  const [ex, setEx] = useState<Record<string, boolean>>({});
  if (!rows.length) return <EmptyState title={t("Bekleyen yetkinlik başvurusu yok")} />;
  return (
    <AnimatedList className="stack">
      {rows.map((c) => (
        <article key={c.id} className="card" aria-label={c.title}>
          <div className="card-h"><h2>{c.title}</h2><StatusPill tone="info">{t("ön eleme %{score}", { score: c.score })}</StatusPill></div>
          <div className="card-b stack-sm">
            <span className="tiny faint">{c.user} · {new Date(c.createdAt).toLocaleDateString(t.intl)}</span>
            <p className="small" style={{ whiteSpace: "pre-wrap", margin: 0 }}>{c.evidence}</p>
            <label className="check"><input type="checkbox" checked={!!ex[c.id]} onChange={(e) => setEx((x) => ({ ...x, [c.id]: e.target.checked }))} />{" "}{t("İlgili dersler için muafiyet ver")}</label>
            <input className="input" aria-label={t("Karar notu")} placeholder={t("Karar notu")} value={note[c.id] ?? ""} onChange={(e) => setNote((x) => ({ ...x, [c.id]: e.target.value }))} />
            <div className="row">
              <button type="button" className="btn btn-sm btn-primary" onClick={() => act(() => api(`/api/challenges/${c.id}`, { method: "PATCH", body: { accept: true, exemption: !!ex[c.id], note: note[c.id] ?? "" } }), t("Kabul edildi; beceri kanıtı olarak eklendi."))}>{t("Kabul et")}</button>
              <button type="button" className="btn btn-sm" onClick={() => act(() => api(`/api/challenges/${c.id}`, { method: "PATCH", body: { accept: false, note: note[c.id] ?? "" } }), "Kabul edilmedi.")}>{t("Kabul etme")}</button>
            </div>
          </div>
        </article>
      ))}
    </AnimatedList>
  );
}

function Workshops({ rows }: { rows: Workshop[] }) {
  const t = useT();
  const act = useAct();
  const [note, setNote] = useState<Record<string, string>>({});
  if (!rows.length) return <EmptyState title={t("İncelenecek kanıt haritası yok")} />;
  return (
    <AnimatedList className="stack">
      {rows.map((w) => (
        <article key={w.id} className="card" aria-label={t("{student} kanıt haritası", { student: w.student })}>
          <div className="card-h"><h2>{t("Kanıt haritası · {key}", { key: w.key })}</h2><span className="tiny faint">{w.student}</span></div>
          <div className="card-b stack-sm">
            <ul className="list-tight">{(w.payload.links ?? []).map((l, i) => <li key={i}><span style={{ flex: 1 }}><strong>{l.from} → {l.to}</strong><span className="tiny faint" style={{ display: "block" }}>{l.reason}</span></span></li>)}</ul>
            <input className="input" aria-label={t("Gerekçelere geri bildirim")} placeholder={t("Çıkarımlara geri bildirim")} value={note[w.id] ?? ""} onChange={(e) => setNote((x) => ({ ...x, [w.id]: e.target.value }))} />
            <div><button type="button" className="btn btn-sm btn-primary" onClick={() => act(() => api(`/api/workshops/review/${w.id}`, { method: "PATCH", body: { review: note[w.id] ?? "" } }), "Geri bildirim kaydedildi.")}>{t("Geri bildirimi gönder")}</button></div>
          </div>
        </article>
      ))}
    </AnimatedList>
  );
}

export function GradingQueue({ queue, snippets, reports, challenges, workshops }: { queue: Item[]; snippets: { id: string; label: string; text: string }[]; reports: Report[]; challenges: Challenge[]; workshops: Workshop[] }) {
  const t = useT();
  return (
    <Tabs label={t("Değerlendirme kuyruğu")} tabs={[
      { id: "subs", label: t("Teslimler ({length})", { length: queue.length }), content: <Submissions queue={queue} snippets={snippets} /> },
      { id: "reports", label: t("Raporlar ({length})", { length: reports.length }), content: <Reports reports={reports} /> },
      { id: "challenges", label: t("Yetkinlik başvuruları ({length})", { length: challenges.length }), content: <Challenges rows={challenges} /> },
      { id: "maps", label: t("Kanıt haritaları ({length})", { length: workshops.length }), content: <Workshops rows={workshops} /> },
    ]} />
  );
}
