"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Flame, CalendarDays, Target, Bookmark, Repeat2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api-client";
import type { workspace } from "@/server/learning/service";
import { Tabs } from "@/components/ui/Tabs";
import { ProgressBar } from "./Progress";
import { Feedback } from "@/components/motion/Feedback";
import { AnimatedList } from "@/components/motion/AnimatedList";
import { StreakMilestone } from "@/components/motion/StreakMilestone";
import { useT } from "@/i18n/client";
type Data = Awaited<ReturnType<typeof workspace>>;
const labels = { active: "Çalışıldı", protected: "Telafi", exam: "Sınav koruması", missed: "Etkinlik yok", pending: "Bugün" };
export function LearningWorkspace({ data }: { data: Data }) {
  const t = useT();
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [prefs, setPrefs] = useState(data.prefs);
  const [title, setTitle] = useState("");
  const [day, setDay] = useState(data.today);
  async function send(body: unknown) {
    setBusy(true); setMessage("");
    try { const result = await api<{ correct?: boolean; explanation?: string }>("/api/learning", { body }); setMessage(result.explanation ? `${result.correct ? "Doğru" : "Henüz değil"}: ${result.explanation}` : "Kaydedildi."); router.refresh(); return true; }
    catch (e) { setMessage((e as Error).message); return false; } finally { setBusy(false); }
  }
  function panel(section: string) { return <>
    {section === "overview" && <>
      <div className="learning-stats"><section className="card card-b"><Flame aria-hidden /><span className="eyebrow">{t("Öğrenme serisi")}</span><strong className="learning-number">{data.streak.current}<small>{" "}{t("gün")}</small></strong><StreakMilestone count={data.streak.current} day={data.today} active={data.completedToday > 0} /><p className="muted">{t("En uzun: {longest} gün · Bu hafta {remainingProtection} telafi", { longest: data.streak.longest, remainingProtection: data.streak.remainingProtection })}</p></section>
      <section className="card card-b"><Target aria-hidden /><span className="eyebrow">{t("Bugünkü hedef")}</span><strong className="learning-number">{Math.min(data.completedToday,prefs.dailyGoal)}<small> / {prefs.dailyGoal}</small></strong><ProgressBar max={prefs.dailyGoal} value={Math.min(data.completedToday,prefs.dailyGoal)} label={t("Günlük hedef")} /><p className="muted">{t("Doğrulanmış öğrenme etkinlikleri sayılır.")}</p></section>
      <section className="card card-b"><CalendarDays aria-hidden /><span className="eyebrow">{t("Son 7 gün")}</span><strong className="learning-number">{data.week.activeDays}<small>{" "}{t("aktif gün")}</small></strong><p className="muted">{t("{activities} tamamlanan etkinlik", { activities: data.week.activities })}</p></section></div>
      <section className="card"><div className="card-h"><h2>{t("Öğrenme takvimin")}</h2><span className="small muted">{data.timezone}</span></div><div className="card-b"><div className="learning-heatmap">{data.days.map(d => <div key={d.day} className={`learning-day is-${d.state}`} title={`${d.day}: ${t(labels[d.state])}`} aria-label={`${d.day}: ${t(labels[d.state])}`}><span>{Number(d.day.slice(-2))}</span><small>{t(labels[d.state])}</small></div>)}</div><p className="small muted">{t("Telafi ve sınav koruması serini korur; çalışma günü veya XP eklemez.")}</p></div></section>
      <div className="grid-2"><Link className="card card-b learning-link" href="/academy"><span><strong>{t("Kaldığın yerden devam et")}</strong><p className="muted">{t("Bir sonraki dersini seç.")}</p></span><ArrowRight aria-hidden /></Link><button className="card card-b learning-link" onClick={() => setTab("review")}><span><strong>{t("{length} tekrar seni bekliyor", { length: data.reviews.length })}</strong><p className="muted">{t("Yanlış cevaplarını öğrenme fırsatına çevir.")}</p></span><Repeat2 aria-hidden /></button></div>
    </>}
    {section === "calendar" && <section className="card"><div className="card-h"><h2>{t("Çalışma gündemin")}</h2></div><div className="card-b stack"><form className="learning-plan-form" onSubmit={async e => { e.preventDefault(); if (await send({ action: "plan", title, day })) setTitle(""); }}><label>{t("Çalışma başlığı")}<input className="input" required minLength={2} maxLength={160} value={title} onChange={e=>setTitle(e.target.value)} placeholder={t("DNS dersini tekrar et")} /></label><label>{t("Tarih")}<input className="input" required type="date" value={day} onChange={e=>setDay(e.target.value)} /></label><button disabled={busy} className="btn btn-primary">{t("Planla")}</button></form>
      {data.plans.length === 0 && data.schedule.length === 0 && <p className="muted">{t("Henüz planın yok. İlk çalışmanı yukarıdan ekleyebilirsin.")}</p>}
      <AnimatedList className="stack">{data.plans.map(p => <div className="learning-agenda" key={p.id}><input type="checkbox" aria-label={t("{title} tamamlandı", { title: p.title })} checked={p.completed} disabled={busy} onChange={e=>void send({action:"plan.update",id:p.id,completed:e.target.checked})} /><span><strong>{p.title}</strong><small>{t("{day} · Kişisel plan", { day: p.day })}</small></span><button className="btn btn-sm" disabled={busy} onClick={()=>void send({action:"plan.delete",id:p.id})}>{t("Sil")}</button></div>)}
      {data.schedule.map(p=><Link className="learning-agenda" key={`${p.kind}:${p.id}`} href={p.href}><CalendarDays size={18} aria-hidden /><span><strong>{p.title}</strong><small>{p.day} · {p.kind}</small></span><ArrowRight size={16} aria-hidden /></Link>)}</AnimatedList><p className="small muted">{t("Kişisel planı işaretlemek XP veya streak üretmez.")}</p></div></section>}
    {section === "saved" && <AnimatedList className="stack">{!data.personal.length && <div className="card card-b"><Bookmark aria-hidden /><h2>{t("Notlarına burada dön")}</h2><p className="muted">{t("Derslerdeki “Notlarım ve kaydet” alanını kullan.")}</p></div>}{data.personal.map(p=><article className="card card-b" key={p.lessonId}><Link href={`/academy/lesson/${p.lesson.slug}`}><h2>{p.lesson.title}</h2></Link>{p.bookmarked && <span className="badge">{t("Kaydedildi")}</span>}<p className="learning-note">{p.note}</p></article>)}</AnimatedList>}
    {section === "review" && <AnimatedList className="stack">{!data.reviews.length && <section className="card card-b"><Repeat2 aria-hidden /><h2>{t("Bugünkü tekrarların tamam")}</h2><p className="muted">{t("Yanlış quiz cevapların üç gün sonra burada görünür.")}</p></section>}{data.reviews.map(r=><section className="card card-b stack" key={`${r.id}:${r.version}`}><Link className="small" href={`/academy/lesson/${r.lesson.slug}`}>{r.lesson.title}</Link><h2>{r.text}</h2><div className="stack">{r.options.map((o,i)=><button className="btn learning-answer" key={i} disabled={busy} onClick={()=>void send({action:"review",id:r.id,version:r.version,answer:i})}>{o}</button>)}</div></section>)}</AnimatedList>}
    {section === "settings" && <form className="card card-b stack learning-settings" onSubmit={e=>{e.preventDefault();void send({action:"preferences",value:prefs});}}><h2>{t("Senin ritmin")}</h2><label>{t("Günlük etkinlik hedefi")}<select className="input" value={prefs.dailyGoal} onChange={e=>setPrefs({...prefs,dailyGoal:Number(e.target.value)})}>{[1,2,3].map(n=><option key={n} value={n}>{t("{n} etkinlik", { n })}</option>)}</select></label><label className="learning-check"><input type="checkbox" checked={prefs.reminderEnabled} onChange={e=>setPrefs({...prefs,reminderEnabled:e.target.checked})} />{" "}{t("Çalışma hatırlatması")}</label><label>{t("Hatırlatma saati ({timezone})", { timezone: data.timezone })}<input className="input" type="time" value={prefs.reminderTime} onChange={e=>setPrefs({...prefs,reminderTime:e.target.value})} /></label><label className="learning-check"><input type="checkbox" checked={prefs.reminderEmail} onChange={e=>setPrefs({...prefs,reminderEmail:e.target.checked})} />{" "}{t("E-posta ile de hatırlat (sunucu yapılandırılmışsa)")}</label><label>{t("Dil (site ve dersler)")}<select className="input" value={prefs.locale} onChange={e=>setPrefs({...prefs,locale:e.target.value})}><option value="auto">{t("Otomatik (tarayıcı/sistem dili)")}</option><option value="tr">Türkçe</option><option value="en">English</option></select></label><button disabled={busy} className="btn btn-primary">{t("Tercihleri kaydet")}</button></form>}
  </>; }
  return <div className="stack learning-workspace">
    <header className="page-head hero-galaxy"><div className="eyebrow">{t("Ördek Akademi · Kişisel alan")}</div><h1 className="page-title">{t("Her gün bir adım")}</h1><p className="page-sub">{t("Çalışmanı planla, öğrendiklerini hatırla, kendi ritmini bul.")}</p></header>
    {message && <Feedback stateKey={message} className="alert">{message}</Feedback>}
    <Tabs label={t("Öğrenme alanı")} value={tab} onValueChange={setTab} tabs={([
      ["overview", t("Özet")], ["calendar", "Takvim"], ["review", "Tekrar"], ["saved", t("Notlar ve kayıtlar")], ["settings", "Tercihler"],
    ] as const).map(([id, label]) => ({ id, label, content: panel(id) }))} />
  </div>;
}
