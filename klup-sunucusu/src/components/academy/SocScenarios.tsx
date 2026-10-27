"use client";
// Nöbet Masası: öğretmen senaryo editörü ve öğrenci oynatıcısı (kolay/orta/zor sürümler).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Eye, Plus, Save, ShieldAlert, Trash2, Upload } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { StatusPill } from "@/components/ui/states";
import { useT } from "@/i18n/client";

type Decision = "benign" | "investigate" | "contain";
type Alert = { id: string; title: string; evidence: string; answer: Decision; explanation: string };
type Variants = { easy: Alert[]; medium: Alert[]; hard: Alert[] };
const LEVEL_TR = { easy: "Kolay", medium: "Orta", hard: "Zor" } as const;
const DEC_TR: Record<Decision, string> = { benign: "Zararsız, kaydet", investigate: "İncele", contain: "Sınırla (içeri al)" };

export type StaffScenario = { id: string; title: string; summary: string; status: string; version: number; variants: Variants };

export function SocEditor({ scenarios }: { scenarios: StaffScenario[] }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const blank = (): StaffScenario => ({ id: "", title: "", summary: "", status: "DRAFT", version: 1, variants: { easy: [], medium: [], hard: [] } });
  const [cur, setCur] = useState<StaffScenario>(scenarios[0] ?? blank());
  const [level, setLevel] = useState<keyof Variants>("easy");
  const alerts = cur.variants[level];
  const setAlerts = (a: Alert[]) => setCur({ ...cur, variants: { ...cur.variants, [level]: a } });
  const patch = (i: number, p: Partial<Alert>) => setAlerts(alerts.map((a, j) => (j === i ? { ...a, ...p } : a)));
  async function save() {
    try { const r = await api<{ id: string }>("/api/soc", { body: { action: "save", id: cur.id || null, data: { title: cur.title, summary: cur.summary, variants: cur.variants } } }); setCur({ ...cur, id: r.id }); toast("ok", cur.status === "PUBLISHED" ? t("Kaydedildi; yayındaki senaryonun sürümü arttı.") : "Kaydedildi."); router.refresh(); }
    catch (e) { toast("error", (e as Error).message); }
  }
  async function status(s: "PUBLISHED" | "ARCHIVED" | "DRAFT") {
    if (!cur.id) return;
    try { await api(`/api/soc/${cur.id}`, { method: "PATCH", body: { status: s } }); setCur({ ...cur, status: s }); toast("ok", s === "PUBLISHED" ? t("Yayınlandı; öğrenciler Uygulama meydanında görür.") : t("Durum güncellendi.")); router.refresh(); }
    catch (e) { toast("error", (e as Error).message); }
  }
  return (
    <div className="grid-2" style={{ gridTemplateColumns: "minmax(200px, 1fr) minmax(0, 3fr)", alignItems: "start" }}>
      <nav className="card card-b stack-sm" aria-label={t("Senaryolar")}>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => setCur(blank())}><Plus size={14} aria-hidden />{" "}{t("Yeni senaryo")}</button>
        {scenarios.map((s) => <button key={s.id} type="button" className="chip" aria-pressed={cur.id === s.id} onClick={() => setCur(s)}>{t("{title} · v{version}", { title: s.title, version: s.version })}</button>)}
      </nav>
      <section className="card card-b stack">
        <div className="row-between"><strong>{cur.id ? t("Senaryoyu düzenle") : t("Yeni senaryo")}</strong>{cur.id && <StatusPill tone={cur.status === "PUBLISHED" ? "ok" : "neutral"}>{cur.status === "PUBLISHED" ? t("yayında · v{version}", { version: cur.version }) : "taslak"}</StatusPill>}</div>
        <label className="field">{t("Başlık")}<input className="input" maxLength={120} value={cur.title} onChange={(e) => setCur({ ...cur, title: e.target.value })} placeholder={t("Gece yarısı VPN alarmları")} /></label>
        <label className="field">{t("Kısa açıklama")}<input className="input" maxLength={500} value={cur.summary} onChange={(e) => setCur({ ...cur, summary: e.target.value })} /></label>
        <div className="tabs-list" role="tablist" aria-label={t("Zorluk")}>{(Object.keys(LEVEL_TR) as (keyof Variants)[]).map((l) => <button key={l} type="button" role="tab" aria-selected={level === l} className="tabs-tab" onClick={() => setLevel(l)}>{LEVEL_TR[l]} ({cur.variants[l].length})</button>)}</div>
        {alerts.map((a, i) => (
          <article key={i} className="card card-b stack-sm">
            <div className="row-between"><strong className="small">{t("{v0}. alarm", { v0: i + 1 })}</strong><button type="button" className="btn btn-ghost btn-sm" aria-label={t("Alarmı sil")} onClick={() => setAlerts(alerts.filter((_, j) => j !== i))}><Trash2 size={13} /></button></div>
            <div className="form-grid">
              <label className="field"><span className="tiny faint">{t("Kimlik")}</span><input className="input" value={a.id} onChange={(e) => patch(i, { id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })} /></label>
              <label className="field"><span className="tiny faint">{t("Doğru karar")}</span><select className="select" value={a.answer} onChange={(e) => patch(i, { answer: e.target.value as Decision })}>{(Object.keys(DEC_TR) as Decision[]).map((d) => <option key={d} value={d}>{t(DEC_TR[d])}</option>)}</select></label>
            </div>
            <label className="field"><span className="tiny faint">{t("Alarm başlığı")}</span><input className="input" maxLength={120} value={a.title} onChange={(e) => patch(i, { title: e.target.value })} /></label>
            <label className="field"><span className="tiny faint">{t("Kanıt (satır satır)")}</span><textarea className="textarea mono" rows={4} maxLength={2000} value={a.evidence} onChange={(e) => patch(i, { evidence: e.target.value })} /></label>
            <label className="field"><span className="tiny faint">{t("Açıklama (karardan sonra gösterilir)")}</span><textarea className="textarea" rows={2} maxLength={1000} value={a.explanation} onChange={(e) => patch(i, { explanation: e.target.value })} /></label>
          </article>
        ))}
        <div><button type="button" className="btn btn-sm btn-ghost" disabled={alerts.length >= 8} onClick={() => setAlerts([...alerts, { id: `${level}-${alerts.length + 1}`, title: "", evidence: "", answer: "investigate", explanation: "" }])}><Plus size={13} aria-hidden />{" "}{t("{v0} sürüme alarm ekle", { v0: LEVEL_TR[level] })}</button></div>
        <div className="row">
          <button type="button" className="btn btn-sm btn-primary" disabled={cur.title.trim().length < 3} onClick={save}><Save size={14} aria-hidden />{" "}{t("Kaydet")}</button>
          {cur.id && cur.status !== "PUBLISHED" && <button type="button" className="btn btn-sm" onClick={() => status("PUBLISHED")}><Upload size={14} aria-hidden />{" "}{t("Yayınla")}</button>}
          {cur.id && cur.status === "PUBLISHED" && <button type="button" className="btn btn-sm" onClick={() => status("DRAFT")}><Eye size={14} aria-hidden />{" "}{t("Yayından kaldır")}</button>}
          {cur.id && <button type="button" className="btn btn-sm btn-ghost" onClick={() => status("ARCHIVED")}><Archive size={14} aria-hidden />{" "}{t("Arşivle")}</button>}
        </div>
      </section>
    </div>
  );
}

type Play = { id: string; title: string; summary: string; version: number; levels: { level: keyof Variants; alerts: { id: string; title: string; evidence: string; attempt: { decision: string; correct: boolean; explanation: string } | null }[] }[] };
export function SocPlayer({ scenarios }: { scenarios: Play[] }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [level, setLevel] = useState<Record<string, keyof Variants>>({});
  if (!scenarios.length) return null;
  async function decide(id: string, lv: string, alertId: string, decision: Decision) {
    try { const r = await api<{ correct: boolean }>("/api/soc", { body: { action: "decide", id, level: lv, alertId, decision } }); toast(r.correct ? "ok" : "info", r.correct ? t("Doğru karar.") : t("Bu kez farklı bir karar gerekiyordu; açıklamayı oku.")); router.refresh(); }
    catch (e) { toast("error", (e as Error).message); }
  }
  return (
    <section className="stack" aria-labelledby="scn-h">
      <h2 id="scn-h" className="section-title"><ShieldAlert size={16} aria-hidden />{" "}{t("Öğretmen senaryoları")}</h2>
      {scenarios.map((s) => {
        const lv = level[s.id] ?? s.levels[0]?.level;
        const cur = s.levels.find((l) => l.level === lv);
        return (
          <article key={s.id} className="card card-b stack">
            <div className="row-between"><strong>{s.title}</strong><div className="chips">{s.levels.map((l) => <button key={l.level} type="button" className="chip" aria-pressed={lv === l.level} onClick={() => setLevel({ ...level, [s.id]: l.level })}>{LEVEL_TR[l.level]}</button>)}</div></div>
            {s.summary && <span className="small muted">{s.summary}</span>}
            {cur?.alerts.map((a) => (
              <div key={a.id} className="stack-sm qa-item">
                <strong className="small">{a.title}</strong>
                <pre className="learning-note">{a.evidence}</pre>
                {a.attempt ? <div className={`alert ${a.attempt.correct ? "alert-ok" : "alert-warn"} small`}><span><strong>{a.attempt.correct ? t("Doğru") : t("Farklı karar gerekiyordu")}</strong>{" "}{t("· senin kararın: {v0} · {explanation}", { v0: t(DEC_TR[a.attempt.decision as Decision]), explanation: a.attempt.explanation })}</span></div>
                  : <div className="row">{(Object.keys(DEC_TR) as Decision[]).map((d) => <button key={d} type="button" className="btn btn-sm" onClick={() => decide(s.id, lv!, a.id, d)}>{t(DEC_TR[d])}</button>)}</div>}
              </div>
            ))}
          </article>
        );
      })}
    </section>
  );
}
