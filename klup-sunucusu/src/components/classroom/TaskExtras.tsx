"use client";
// Görev ekranı ekleri: teslim sürümleri karşılaştırması, ek süre talebi, akran değerlendirmesi ve öğretmen tarafı kararları.
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Check, GitCompare, Hourglass, Users, X } from "lucide-react";
import { api } from "@/lib/api-client";
import { lineDiff } from "@/lib/text";
import { useToast } from "@/components/providers";
import { StatusPill, type Tone } from "@/components/ui/states";
import { useT } from "@/i18n/client";

function useAct() {
  const router = useRouter();
  const toast = useToast();
  return async (fn: () => Promise<unknown>, ok?: string) => {
    try { await fn(); if (ok) toast("ok", ok); router.refresh(); return true; } catch (e) { toast("error", (e as Error).message); return false; }
  };
}

export type Version = { number: number; text: string; createdAt: string };

export function VersionCompare({ versions }: { versions: Version[] }) {
  const t = useT();
  const [a, setA] = useState(Math.max(1, versions.length - 1));
  const [b, setB] = useState(versions.length);
  const diff = useMemo(() => lineDiff(versions.find((v) => v.number === a)?.text ?? "", versions.find((v) => v.number === b)?.text ?? ""), [a, b, versions]);
  if (versions.length < 2) return null;
  const changed = diff.filter((d) => d.kind !== "same").length;
  return (
    <details className="version-compare">
      <summary><GitCompare size={14} aria-hidden />{" "}{t("Teslim sürümleri ({length}) — karşılaştır", { length: versions.length })}</summary>
      <div className="stack-sm" style={{ marginTop: 10 }}>
        <div className="row">
          <label className="field"><span className="tiny faint">{t("Önceki")}</span><select className="select" value={a} onChange={(e) => setA(Number(e.target.value))}>{versions.map((v) => <option key={v.number} value={v.number}>{t("{number}. sürüm ·", { number: v.number })}{" "}{new Date(v.createdAt).toLocaleString(t.intl)}</option>)}</select></label>
          <label className="field"><span className="tiny faint">{t("Sonraki")}</span><select className="select" value={b} onChange={(e) => setB(Number(e.target.value))}>{versions.map((v) => <option key={v.number} value={v.number}>{t("{number}. sürüm ·", { number: v.number })}{" "}{new Date(v.createdAt).toLocaleString(t.intl)}</option>)}</select></label>
        </div>
        <span className="tiny faint" role="status">{changed ? t("{changed} satır değişti", { changed }) : t("Metin aynı")}</span>
        <div className="diff" aria-label={t("Sürüm farkı")}>{diff.map((d, i) => <div key={i} className={d.kind}>{d.text || " "}</div>)}</div>
      </div>
    </details>
  );
}

type Ext = { id: string; reason: string; requestedDue: string; status: string; decisionNote: string; createdAt: string; user?: string };
const EXT_TONE: Record<string, Tone> = { PENDING: "warn", APPROVED: "ok", REJECTED: "neutral" };
const EXT_LABEL: Record<string, string> = { PENDING: "karar bekliyor", APPROVED: "onaylandı", REJECTED: "reddedildi" };

export function ExtensionPanel({ taskId, dueAt, override, history }: { taskId: string; dueAt: string | null; override: string | null; history: Ext[] }) {
  const t = useT();
  const act = useAct();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [due, setDue] = useState("");
  if (!dueAt) return null;
  const pending = history.some((h) => h.status === "PENDING");
  return (
    <div className="stack-sm">
      {override && <div className="alert alert-ok small"><Check size={16} aria-hidden /><span>{t("Sana özel son tarih:")}{" "}<strong>{new Date(override).toLocaleString(t.intl)}</strong></span></div>}
      {history.length > 0 && (
        <ul className="timeline">{history.map((h) => <li key={h.id}><time>{new Date(h.createdAt).toLocaleDateString(t.intl)}</time><span><StatusPill tone={EXT_TONE[h.status] ?? "neutral"}>{t(EXT_LABEL[h.status] ?? h.status)}</StatusPill> {new Date(h.requestedDue).toLocaleString(t.intl)}{" "}{t("istendi")}{h.decisionNote && <> · <em>{h.decisionNote}</em></>}</span></li>)}</ul>
      )}
      {!pending && !open && <div><button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen(true)}><Hourglass size={14} aria-hidden />{" "}{t("Ek süre iste")}</button></div>}
      {open && (
        <div className="stack-sm card card-b">
          <label className="field">{t("Yeni tarih")}<input className="input" type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} /></label>
          <label className="field">{t("Gerekçe")}<textarea className="textarea" rows={3} maxLength={1500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("Örn. “Hastalık nedeniyle iki gün derse katılamadım; rapor eki öğretmene ayrıca iletildi.”")} /></label>
          <div className="row">
            <button type="button" className="btn btn-sm btn-primary" disabled={!due || reason.trim().length < 15} onClick={async () => { if (await act(() => api(`/api/tasks/${taskId}/extension`, { body: { reason, requestedDue: new Date(due).toISOString() } }), t("Talebin öğretmene iletildi."))) { setOpen(false); setReason(""); } }}><CalendarPlus size={14} aria-hidden />{" "}{t("Gönder")}</button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen(false)}>{t("Vazgeç")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ExtensionDecisions({ rows }: { rows: Ext[] }) {
  const t = useT();
  const act = useAct();
  const [notes, setNotes] = useState<Record<string, string>>({});
  if (!rows.length) return <p className="small muted" style={{ margin: 0 }}>{t("Ek süre talebi yok.")}</p>;
  return (
    <ul className="qa-list">
      {rows.map((e) => (
        <li key={e.id} className="qa-item stack-sm">
          <div className="row-between"><strong>{e.user}</strong><StatusPill tone={EXT_TONE[e.status] ?? "neutral"}>{t(EXT_LABEL[e.status] ?? e.status)}</StatusPill></div>
          <span className="small">{t("İstenen:")}{" "}{new Date(e.requestedDue).toLocaleString(t.intl)}</span>
          <p className="small" style={{ margin: 0, whiteSpace: "pre-wrap" }}>{e.reason}</p>
          {e.status === "PENDING" ? (
            <div className="row">
              <input className="input" style={{ flex: 1, minWidth: 180 }} aria-label={t("Karar notu")} placeholder={t("Not (isteğe bağlı)")} value={notes[e.id] ?? ""} onChange={(ev) => setNotes((n) => ({ ...n, [e.id]: ev.target.value }))} />
              <button type="button" className="btn btn-sm btn-primary" onClick={() => act(() => api(`/api/extensions/${e.id}`, { method: "PATCH", body: { approve: true, note: notes[e.id] ?? "" } }), t("Onaylandı; öğrenciye özel son tarih tanımlandı."))}><Check size={14} aria-hidden />{" "}{t("Onayla")}</button>
              <button type="button" className="btn btn-sm" onClick={() => act(() => api(`/api/extensions/${e.id}`, { method: "PATCH", body: { approve: false, note: notes[e.id] ?? "" } }), "Reddedildi.")}><X size={14} aria-hidden />{" "}{t("Reddet")}</button>
            </div>
          ) : e.decisionNote ? <span className="tiny faint">{t("Not: {decisionNote}", { decisionNote: e.decisionNote })}</span> : null}
        </li>
      ))}
    </ul>
  );
}

type PeerTask = { id: string; label: string; text: string; status: string; rubricScores: number[] | null; comment: string };
export function PeerPanel({ tasks, received, rubric }: { tasks: PeerTask[]; received: { id: string; label: string; rubricScores: number[] | null; comment: string }[]; rubric: { criterion: string; points: number }[] }) {
  const tl = useT();
  const act = useAct();
  const [scores, setScores] = useState<Record<string, number[]>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  if (!tasks.length && !received.length) return null;
  return (
    <section id="peer" className="card" aria-labelledby="peer-h">
      <div className="card-h"><h2 id="peer-h"><Users size={16} aria-hidden />{" "}{tl("Akran değerlendirmesi")}</h2><span className="tiny faint">{tl("kimlikler gizli · son not öğretmende")}</span></div>
      <div className="card-b stack">
        {tasks.map((t) => (
          <article key={t.id} className="stack-sm qa-item">
            <div className="row-between"><strong>{t.label}</strong>{t.status === "DONE" ? <StatusPill tone="ok">{tl("gönderildi")}</StatusPill> : <StatusPill tone="warn">{tl("bekliyor")}</StatusPill>}</div>
            <div className="notes small" style={{ whiteSpace: "pre-wrap", maxHeight: 260, overflow: "auto" }}>{t.text || "—"}</div>
            {t.status !== "DONE" && (
              <>
                {rubric.map((r, i) => (
                  <label key={i} className="row-between small"><span>{r.criterion}</span><input className="input" style={{ width: 90 }} type="number" min={0} max={r.points} aria-label={tl("{criterion} (en fazla {points})", { criterion: r.criterion, points: r.points })} value={scores[t.id]?.[i] ?? ""} onChange={(e) => setScores((s) => { const arr = [...(s[t.id] ?? rubric.map(() => 0))]; arr[i] = Math.min(r.points, Math.max(0, Number(e.target.value))); return { ...s, [t.id]: arr }; })} /> <span className="tiny faint">/ {r.points}</span></label>
                ))}
                <textarea className="textarea" rows={3} maxLength={2000} aria-label={tl("Yorum")} placeholder={tl("Güçlü yanı ne? Hangi kısmı geliştirilebilir? Kanıta dayanarak yaz.")} value={comments[t.id] ?? ""} onChange={(e) => setComments((c) => ({ ...c, [t.id]: e.target.value }))} />
                <div><button type="button" className="btn btn-sm btn-primary" disabled={(comments[t.id] ?? "").trim().length < 20} onClick={() => act(() => api(`/api/peer-reviews/${t.id}`, { body: { rubricScores: scores[t.id] ?? rubric.map(() => 0), comment: comments[t.id] ?? "" } }), tl("Değerlendirmen gönderildi. Teşekkürler!"))}>{tl("Değerlendirmeyi gönder")}</button></div>
              </>
            )}
          </article>
        ))}
        {received.length > 0 && (
          <div className="stack-sm">
            <div className="eyebrow">{tl("Sana gelen akran geri bildirimleri")}</div>
            {received.map((r) => <div key={r.id} className="qa-answer"><span className="tiny faint">{r.label}{r.rubricScores ? tl(" · {v0} puan önerdi", { v0: r.rubricScores.reduce((a, b) => a + b, 0) }) : ""}</span><p style={{ margin: "4px 0 0", whiteSpace: "pre-wrap" }}>{r.comment}</p></div>)}
          </div>
        )}
      </div>
    </section>
  );
}
