"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookCheck, Brain, CalendarRange, Layers, Pause, Play, RotateCcw, Shuffle, Timer, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState, StatusPill } from "@/components/ui/states";
import { Duck } from "@/components/ui/Duck";
import { useT } from "@/i18n/client";

type Session = { id: string; minutes: number; topic: string; status: string; startedAt: string; endsAt: string; reflection: string };
type Plan = { remaining: number; minutes: number; days: number; weeks: number; perWeek: number; perDayMinutes: number; realistic: boolean; weekly: { week: number; startsOn: string; lessons: { slug: string; title: string; minutes: number; track: { code: string } }[] }[] };
type Data = {
  today: string; active: Session | null; recent: Session[];
  goal: { title: string; targetDay: string; trackKeys: string[]; plan: Plan } | null;
  cards: { id: string; front: string; back: string; dueAt: string; consecutive: number }[];
  terms: { id: string; tr: string; en: string; definitionTr: string }[];
  week: { minutes: number; sessions: number };
};
type Mistake = { id: string; lesson: { slug: string; title: string }; text: string; correct: string; explanation: string; closed: boolean; dueAt: string };
type Metric = { label: string; prev: number; cur: number; delta: number };

function Countdown({ endsAt, onDone }: { endsAt: string; onDone: () => void }) {
  const tl = useT();
  const [left, setLeft] = useState(() => Date.parse(endsAt) - Date.now());
  useEffect(() => {
    const t = setInterval(() => { const l = Date.parse(endsAt) - Date.now(); setLeft(l); if (l <= 0) { clearInterval(t); onDone(); } }, 1000);
    return () => clearInterval(t);
  }, [endsAt, onDone]);
  const s = Math.max(0, Math.round(left / 1000));
  return <div className="study-clock" role="timer" aria-live="off" aria-label={tl("Kalan süre {v0} dakika", { v0: Math.floor(s / 60) })}>{String(Math.floor(s / 60)).padStart(2, "0")}:{String(s % 60).padStart(2, "0")}</div>;
}

function SessionPanel({ data, compare }: { data: Data; compare: Metric[] }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [minutes, setMinutes] = useState<15 | 25 | 45>(25);
  const [topic, setTopic] = useState("");
  const [ended, setEnded] = useState(() => !!data.active && Date.parse(data.active.endsAt) <= Date.now() + 60_000);
  const [reflection, setReflection] = useState("");
  const [understood, setUnderstood] = useState(3);
  const [nextStep, setNextStep] = useState("");
  const [busy, setBusy] = useState(false);
  const a = data.active;
  async function start() {
    setBusy(true);
    try { await api("/api/study/sessions", { body: { minutes, topic, lessonSlug: null } }); router.refresh(); }
    catch (e) { toast("error", (e as Error).message); } finally { setBusy(false); }
  }
  async function finish() {
    if (!a) return;
    setBusy(true);
    try {
      const r = await api<{ verified: number; xp: number }>(`/api/study/sessions/${a.id}`, { body: { reflection, understood, nextStep } });
      toast("ok", r.verified ? t("Oturum kaydedildi. Bu sürede {verified} doğrulanmış çalışma yaptın{v0}.", { verified: r.verified, v0: r.xp ? `, +${r.xp} XP` : "" }) : t("Değerlendirmen kaydedildi. Oturum sırasında ders/quiz/tekrar tamamlanmadığı için XP verilmedi."));
      setReflection(""); setNextStep(""); router.refresh();
    } catch (e) { toast("error", (e as Error).message); } finally { setBusy(false); }
  }
  async function abandon() {
    if (!a || !confirm(t("Oturumu erken sonlandırmak istiyor musun? Değerlendirme ve ödül olmaz."))) return;
    try { await api(`/api/study/sessions/${a.id}`, { method: "DELETE" }); router.refresh(); } catch (e) { toast("error", (e as Error).message); }
  }
  return (
    <div className="grid-2">
      <section className="card card-primary" aria-labelledby="ses-h">
        <div className="card-h"><h2 id="ses-h"><Timer size={16} aria-hidden /> {a ? t("Çalışıyorsun") : t("Yeni oturum")}</h2></div>
        <div className="card-b stack">
          {a ? (
            <>
              <div className="row-between"><strong>{a.topic}</strong><span className="tiny faint">{t("{minutes} dk", { minutes: a.minutes })}</span></div>
              {!ended ? <><Countdown endsAt={a.endsAt} onDone={() => setEnded(true)} /><p className="small muted" style={{ margin: 0 }}>{t("Bu sürede bir ders, quiz, tekrar ya da lab tamamlarsan oturum sonunda doğrulanmış çalışma sayılır. Sekmeyi kapatsan da süre işler.")}</p><div><button type="button" className="btn btn-sm btn-danger" onClick={abandon}><Pause size={14} aria-hidden />{" "}{t("Erken sonlandır")}</button></div></> : (
                <div className="stack">
                  <div className="alert alert-ok"><Duck pose="cheer" size={40} /><span>{t("Süre doldu. Kısa bir değerlendirme yap: öğrendiğini kendi cümlelerinle yazmak hatırlamayı güçlendirir.")}</span></div>
                  <label className="field">{t("Bu oturumda ne öğrendin / ne yaptın?")}<textarea className="textarea" rows={4} maxLength={2000} value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder={t("Örn. “TCP el sıkışmasının üç adımını çizdim; SYN-ACK’in neden gerektiğini anladım.”")} /></label>
                  <fieldset className="field"><legend className="small">{t("Konuyu ne kadar anladın?")}</legend><div className="row" role="radiogroup">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className="chip" role="radio" aria-checked={understood === n} onClick={() => setUnderstood(n)}>{n}</button>)}</div><span className="tiny faint">{t("1: hiç oturmadı · 5: başkasına anlatabilirim")}</span></fieldset>
                  <label className="field">{t("Sıradaki adımın")}<input className="input" maxLength={300} value={nextStep} onChange={(e) => setNextStep(e.target.value)} placeholder={t("Örn. “UDP ile farkını tekrar et”")} /></label>
                  <div className="row"><button type="button" className="btn btn-primary" disabled={busy || reflection.trim().length < 20} onClick={finish}><BookCheck size={16} aria-hidden />{" "}{t("Değerlendirmeyi kaydet")}</button><button type="button" className="btn btn-ghost btn-sm" onClick={abandon}>{t("Değerlendirmeden kapat")}</button></div>
                </div>
              )}
            </>
          ) : (
            <>
              <fieldset className="field"><legend className="small">{t("Süre")}</legend><div className="row" role="radiogroup">{([15, 25, 45] as const).map((m) => <button key={m} type="button" className="chip" role="radio" aria-checked={minutes === m} onClick={() => setMinutes(m)}>{t("{m} dk", { m })}</button>)}</div></fieldset>
              <label className="field">{t("Ne çalışacaksın?")}<input className="input" maxLength={140} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t("Örn. M05 · Ağlar: TCP ve UDP")} /></label>
              <div><button type="button" className="btn btn-primary" disabled={busy || topic.trim().length < 2} onClick={start}><Play size={16} aria-hidden />{" "}{t("Başlat")}</button></div>
              <p className="tiny faint" style={{ margin: 0 }}>{t("Yalnız süre geçirmek XP üretmez; oturum sonunda kısa bir değerlendirme yaparsın.")}</p>
            </>
          )}
        </div>
      </section>
      <section className="card" aria-labelledby="cmp-h">
        <div className="card-h"><h2 id="cmp-h">{t("Bu hafta / geçen hafta")}</h2><span className="tiny faint">{t("yalnız seninle karşılaştırılır")}</span></div>
        <div className="card-b">
          <div className="compare" role="table" aria-label={t("Haftalık karşılaştırma")}>
            <span role="columnheader" className="tiny faint">{t("Ölçü")}</span><span role="columnheader" className="tiny faint num">{t("Geçen")}</span><span role="columnheader" className="tiny faint num">{t("Bu")}</span><span role="columnheader" className="tiny faint num">{t("Fark")}</span>
            {compare.map((m) => [
              <span key={`${m.label}-l`} role="cell">{m.label}</span>,
              <span key={`${m.label}-p`} role="cell" className="num">{m.prev}</span>,
              <span key={`${m.label}-c`} role="cell" className="num"><strong>{m.cur}</strong></span>,
              <span key={`${m.label}-d`} role="cell" className={`num ${m.delta > 0 ? "trend-up" : m.delta < 0 ? "trend-down" : ""}`}>{m.delta > 0 ? <><TrendingUp size={13} aria-hidden /> +{m.delta}</> : m.delta < 0 ? <><TrendingDown size={13} aria-hidden /> {m.delta}</> : "="}</span>,
            ])}
          </div>
          {data.recent.length > 0 && (
            <>
              <div className="eyebrow" style={{ marginTop: 16 }}>{t("Son oturumlar")}</div>
              <ul className="list-tight">{data.recent.slice(0, 5).map((s) => <li key={s.id}><span style={{ flex: 1, minWidth: 0 }}>{s.topic}</span><span className="tiny faint">{t("{minutes} dk", { minutes: s.minutes })}</span>{s.status === "DONE" ? <StatusPill tone="ok">{t("değerlendirildi")}</StatusPill> : <StatusPill tone="neutral">{t("yarım kaldı")}</StatusPill>}</li>)}</ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function GoalPanel({ data, tracks }: { data: Data; tracks: { key: string; code: string; title: string }[] }) {
  const tl = useT();
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState(data.goal?.title ?? tl("Dönem sonu hedefim"));
  const [targetDay, setTargetDay] = useState(data.goal?.targetDay ?? "");
  const [keys, setKeys] = useState<string[]>(data.goal?.trackKeys ?? []);
  async function save() {
    try { await api("/api/study/goal", { method: "PUT", body: { title, targetDay, trackKeys: keys } }); toast("ok", tl("Hedef planın güncellendi.")); router.refresh(); }
    catch (e) { toast("error", (e as Error).message); }
  }
  const p = data.goal?.plan;
  return (
    <div className="stack">
      <section className="card"><div className="card-b stack">
        <div className="form-grid">
          <label className="field">{tl("Hedefin")}<input className="input" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <label className="field">{tl("Hedef tarih")}<input className="input" type="date" min={data.today} value={targetDay} onChange={(e) => setTargetDay(e.target.value)} /></label>
        </div>
        <fieldset className="field"><legend className="small">{tl("Hangi yollar? (boş = tüm temel ve uzmanlık yolları)")}</legend>
          <div className="chips">{tracks.map((t) => <button key={t.key} type="button" className="chip" aria-pressed={keys.includes(t.key)} onClick={() => setKeys((k) => (k.includes(t.key) ? k.filter((x) => x !== t.key) : [...k, t.key]))}>{t.code}</button>)}</div>
        </fieldset>
        <div><button type="button" className="btn btn-primary btn-sm" disabled={!targetDay} onClick={save}><CalendarRange size={14} aria-hidden />{" "}{tl("Planı oluştur")}</button></div>
      </div></section>
      {p && (
        <section className="card" aria-labelledby="plan-h">
          <div className="card-h"><h2 id="plan-h">{data.goal!.title} · {new Date(`${data.goal!.targetDay}T12:00:00Z`).toLocaleDateString(tl.intl, { timeZone: "UTC" })}</h2>{p.realistic ? <StatusPill tone="ok">{tl("gerçekçi")}</StatusPill> : <StatusPill tone="warn">{tl("yoğun plan")}</StatusPill>}</div>
          <div className="card-b stack">
            <p className="small" style={{ margin: 0 }}>{tl("Kalan")}{" "}<strong>{p.remaining}</strong>{" "}{tl("ders (~{v0} saat) · {days} gün · haftada ~{perWeek} ders · günde ~{perDayMinutes} dk.", { v0: Math.round(p.minutes / 60), days: p.days, perWeek: p.perWeek, perDayMinutes: p.perDayMinutes })}{!p.realistic && tl(" Günlük süre yüksek; hedef tarihi ileri almayı ya da yol sayısını azaltmayı düşün.")}</p>
            {p.weekly.map((w) => (
              <details key={w.week} open={w.week === 1}>
                <summary><strong>{tl("{week}. hafta", { week: w.week })}</strong> <span className="tiny faint">({tl("{date} itibarıyla · {length} ders", { date: new Date(`${w.startsOn}T12:00:00Z`).toLocaleDateString(tl.intl, { timeZone: "UTC", day: "numeric", month: "short" }), length: w.lessons.length })})</span></summary>
                <ul className="list-tight">{w.lessons.map((l) => <li key={l.slug}><Link href={`/academy/lesson/${l.slug}`} style={{ flex: 1 }}>{l.title}</Link><span className="tiny faint">{tl("{code} · {minutes} dk", { code: l.track.code, minutes: l.minutes })}</span></li>)}</ul>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function CardsPanel({ data }: { data: Data }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [flipped, setFlipped] = useState<string | null>(null);
  const due = data.cards.filter((c) => Date.parse(c.dueAt) <= Date.now());
  async function add() {
    try { await api("/api/study/cards", { body: { front, back } }); setFront(""); setBack(""); router.refresh(); } catch (e) { toast("error", (e as Error).message); }
  }
  async function review(id: string, remembered: boolean) {
    try { await api(`/api/study/cards/${id}`, { body: { remembered } }); setFlipped(null); router.refresh(); } catch (e) { toast("error", (e as Error).message); }
  }
  async function remove(id: string) {
    try { await api(`/api/study/cards/${id}`, { method: "DELETE" }); router.refresh(); } catch (e) { toast("error", (e as Error).message); }
  }
  return (
    <div className="grid-2">
      <section className="card" aria-labelledby="due-h">
        <div className="card-h"><h2 id="due-h"><Layers size={16} aria-hidden />{" "}{t("Bugün tekrar edilecek ({length})", { length: due.length })}</h2></div>
        <div className="card-b stack">
          {due.length === 0 ? <EmptyState duck="sleep" title={t("Bugün tekrar edilecek kart yok")} text={t("Yeni kart ekle ya da ders notlarından kart oluştur.")} /> : due.slice(0, 5).map((c) => (
            <div key={c.id} className="flash">
              <strong>{c.front}</strong>
              {flipped === c.id ? <><p style={{ margin: "8px 0" }}>{c.back}</p><div className="row"><button type="button" className="btn btn-sm btn-primary" onClick={() => review(c.id, true)}>{t("Hatırladım")}</button><button type="button" className="btn btn-sm" onClick={() => review(c.id, false)}>{t("Hatırlamadım")}</button></div></> : <div><button type="button" className="btn btn-sm" onClick={() => setFlipped(c.id)}><RotateCcw size={14} aria-hidden />{" "}{t("Cevabı göster")}</button></div>}
            </div>
          ))}
        </div>
      </section>
      <section className="card" aria-labelledby="new-h">
        <div className="card-h"><h2 id="new-h">{t("Kendi kartını oluştur")}</h2></div>
        <div className="card-b stack">
          <label className="field">{t("Ön yüz (soru)")}<input className="input" maxLength={300} value={front} onChange={(e) => setFront(e.target.value)} placeholder={t("Hash ile şifreleme arasındaki fark?")} /></label>
          <label className="field">{t("Arka yüz (cevap)")}<textarea className="textarea" rows={3} maxLength={1000} value={back} onChange={(e) => setBack(e.target.value)} /></label>
          <div><button type="button" className="btn btn-primary btn-sm" disabled={front.trim().length < 2 || !back.trim()} onClick={add}>{t("Kartı ekle")}</button></div>
          {data.cards.length > 0 && <details><summary className="small">{t("Tüm kartlarım ({length})", { length: data.cards.length })}</summary><ul className="list-tight">{data.cards.map((c) => <li key={c.id}><span style={{ flex: 1, minWidth: 0 }}>{c.front}</span><span className="tiny faint">{new Date(c.dueAt).toLocaleDateString(t.intl)}</span><button type="button" className="btn btn-ghost btn-sm" aria-label={t("{front} kartını sil", { front: c.front })} onClick={() => remove(c.id)}><Trash2 size={14} aria-hidden /></button></li>)}</ul></details>}
        </div>
      </section>
    </div>
  );
}

// Kişisel terim listesi + eşleştirme alıştırması (notsuz).
function TermsPanel({ data }: { data: Data }) {
  const tl = useT();
  const [round, setRound] = useState(0);
  const set = useMemo(() => [...data.terms].sort(() => Math.random() - 0.5).slice(0, 4), [data.terms, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const defs = useMemo(() => [...set].sort(() => Math.random() - 0.5), [set]);
  const [pick, setPick] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  if (!data.terms.length) return <EmptyState icon={Brain} title={tl("Terim listen boş")} text={tl("Ders içinde bir terime tıklayıp “Terim listeme ekle”yi seç.")} />;
  return (
    <div className="stack">
      <ul className="list-tight">{data.terms.map((t) => <li key={t.id}><strong>{t.tr}</strong><span className="tiny faint" lang="en">{t.en}</span></li>)}</ul>
      {data.terms.length >= 2 && (
        <section className="card" aria-labelledby="match-h">
          <div className="card-h"><h2 id="match-h">{tl("Eşleştir")}</h2><button type="button" className="btn btn-ghost btn-sm" onClick={() => { setRound((r) => r + 1); setMatched([]); setPick(null); }}><Shuffle size={14} aria-hidden />{" "}{tl("Yeni tur")}</button></div>
          <div className="card-b match-grid">
            <div className="stack-sm">{set.map((t) => <button key={t.id} type="button" className="chip" disabled={matched.includes(t.id)} aria-pressed={pick === t.id} onClick={() => { setPick(t.id); setWrong(null); }}>{t.tr}</button>)}</div>
            <div className="stack-sm">{defs.map((t) => <button key={t.id} type="button" className={`match-def${matched.includes(t.id) ? " is-ok" : wrong === t.id ? " is-bad" : ""}`} disabled={matched.includes(t.id) || !pick} onClick={() => { if (pick === t.id) { setMatched((m) => [...m, t.id]); setPick(null); } else setWrong(t.id); }}>{t.definitionTr}</button>)}</div>
            <p className="tiny faint" role="status">{matched.length === set.length ? tl("Hepsi doğru eşleşti!") : wrong ? tl("Bu tanım o terime ait değil, tekrar dene.") : tl("Önce bir terim, sonra tanımını seç.")}</p>
          </div>
        </section>
      )}
    </div>
  );
}

function MistakesPanel({ mistakes }: { mistakes: Mistake[] }) {
  const t = useT();
  if (!mistakes.length) return <EmptyState duck="cheer" title={t("Hata defterin boş")} text={t("Quizlerde yanlış yaptığın sorular, doğru cevap ve açıklamasıyla burada toplanır.")} />;
  return (
    <div className="stack">
      <p className="small muted" style={{ margin: 0 }}>{t("Quizlerde yanlış yaptığın sorular. Zamanı gelen tekrarları")}{" "}<Link href="/academy/workspace">{t("Öğrenme alanım")}</Link>{t("’da cevaplayabilirsin.")}</p>
      {mistakes.map((m) => (
        <article key={m.id} className="card card-b stack-sm">
          <div className="row-between"><Link className="tiny" href={`/academy/lesson/${m.lesson.slug}`}>{m.lesson.title}</Link>{m.closed ? <StatusPill tone="ok">{t("öğrenildi")}</StatusPill> : <StatusPill tone="info">{t("tekrar:")}{" "}{new Date(m.dueAt).toLocaleDateString(t.intl)}</StatusPill>}</div>
          <strong>{m.text}</strong>
          <span className="small"><span className="faint">{t("Doğru cevap:")}</span> {m.correct}</span>
          {m.explanation && <span className="small muted">{m.explanation}</span>}
        </article>
      ))}
    </div>
  );
}

export function StudyCenter({ data, mistakes, compare, tracks }: { data: Data; mistakes: Mistake[]; compare: Metric[]; tracks: { key: string; code: string; title: string }[] }) {
  const t = useT();
  return (
    <Tabs
      label={t("Çalışma merkezi")}
      tabs={[
        { id: "session", label: t("Oturum"), content: <SessionPanel data={data} compare={compare} /> },
        { id: "goal", label: t("Hedef planı"), content: <GoalPanel data={data} tracks={tracks} /> },
        { id: "cards", label: t("Kartlarım ({length})", { length: data.cards.length }), content: <CardsPanel data={data} /> },
        { id: "terms", label: t("Terimlerim ({length})", { length: data.terms.length }), content: <TermsPanel data={data} /> },
        { id: "mistakes", label: t("Hata defteri ({length})", { length: mistakes.length }), content: <MistakesPanel mistakes={mistakes} /> },
      ]}
    />
  );
}
