"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api-client";
import type { ActivityView } from "@/lib/academy-activities";
import { Feedback } from "@/components/motion/Feedback";
import { useT } from "@/i18n/client";
export function ActivityPanel({ slug, hash, locale, activities }: { slug: string; hash: string; locale: "tr" | "en"; activities: (ActivityView & { solved: boolean })[] }) {
  const t = useT();
  return <section className="stack" aria-label={t("Etkinlikler")}>{activities.map(a => <Exercise key={`${a.id}:${hash}:${locale}`} slug={slug} hash={hash} locale={locale} activity={a} />)}</section>;
}
function Exercise({ slug, hash, locale, activity: a }: { slug: string; hash: string; locale: "tr" | "en"; activity: ActivityView & { solved: boolean } }) {
  const t = useT();
  const router = useRouter();
  const [values, setValues] = useState<string[]>(a.kind === "order" ? a.options!.map((_, i) => String(i)) : a.kind === "match" ? a.left!.map(() => "") : [a.starter ?? ""]);
  const [solved, setSolved] = useState(a.solved), [busy, setBusy] = useState(false), [message, setMessage] = useState("");
  return <form className="card card-b stack activity-card" onSubmit={async e => {
    e.preventDefault(); setBusy(true);
    try { const r = await api<{ correct: boolean; explanation: string }>(`/api/academy/lessons/${slug}/activities`, { body: { activityId: a.id, values, hash, locale } }); setMessage(r.explanation); if (r.correct) { setSolved(true); router.refresh(); } } catch (err) { setMessage((err as Error).message); } finally { setBusy(false); }
  }}><div className="row"><span className="badge">{a.kind}</span>{solved && <span className="small"><CheckCircle2 size={14} aria-hidden /> {t("Tamamlandı")}</span>}</div><h3>{a.prompt}</h3>
    {a.kind === "match" ? a.left!.map((left, i) => <label key={i}>{left}<select className="input" required disabled={solved || busy} value={values[i]} onChange={e => setValues(v => v.map((x, n) => n === i ? e.target.value : x))}><option value="">{t("Seç")}</option>{a.right!.map((r, n) => <option key={n} value={n}>{r}</option>)}</select></label>) : a.kind === "order" ? <ol className="activity-order">{values.map((value, i) => <li key={value}><span>{a.options![Number(value)]}</span><button type="button" className="btn btn-sm" disabled={solved || busy || i === 0} aria-label={`${t("Yukarı taşı")}: ${a.options![Number(value)]}`} onClick={() => setValues(v => { const copy = [...v]; [copy[i - 1], copy[i]] = [copy[i]!, copy[i - 1]!]; return copy; })}>↑</button><button type="button" className="btn btn-sm" disabled={solved || busy || i === values.length - 1} aria-label={`${t("Aşağı taşı")}: ${a.options![Number(value)]}`} onClick={() => setValues(v => { const copy = [...v]; [copy[i], copy[i + 1]] = [copy[i + 1]!, copy[i]!]; return copy; })}>↓</button></li>)}</ol> : a.options ? <div className="stack">{a.options.map((option, i) => <label className="activity-option" key={i}><input type="radio" name={a.id} value={i} required disabled={solved || busy} checked={values[0] === String(i)} onChange={() => setValues([String(i)])} /><span>{a.kind === "code" || a.kind === "log" ? <code>{option}</code> : option}</span></label>)}</div> : <label>{t("Yanıtın")}{a.kind === "http" ? <textarea className="textarea" rows={6} maxLength={4000} required disabled={solved || busy} value={values[0]} onChange={e => setValues([e.target.value])} /> : <input className="input" maxLength={4000} required disabled={solved || busy} value={values[0]} spellCheck={false} onChange={e => setValues([e.target.value])} />}</label>}
    {!solved && <button className="btn btn-primary" disabled={busy}>{busy ? t("Kontrol ediliyor…") : t("Yanıtı kontrol et")}</button>}{message && <Feedback stateKey={message} className={solved ? "alert alert-ok" : "alert"}>{message}</Feedback>}
  </form>;
}
