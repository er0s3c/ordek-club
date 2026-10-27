"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, ClipboardCheck, Copy, Plus, Shuffle, Target, Trash2, Wand2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/states";
import { useT } from "@/i18n/client";

type Plan = { week: number; startsOn: string; title: string; lessonSlugs: string[]; note: string };
type Pre = { id: string; title: string; group: string; closesAt: string; responses: number; questions: { question: string; options: string[]; counts: number[] }[] };
type Goal = { id: string; title: string; metric: string; target: number; endsOn: string; value: number; pct: number };

function useAct() {
  const router = useRouter();
  const toast = useToast();
  return async <T,>(fn: () => Promise<T>, ok?: string): Promise<T | null> => {
    try { const r = await fn(); if (ok) toast("ok", ok); router.refresh(); return r; } catch (e) { toast("error", (e as Error).message); return null; }
  };
}

function GroupPicker({ groups, groupId }: { groups: { id: string; name: string }[]; groupId: string | null }) {
  const t = useT();
  const router = useRouter();
  if (!groups.length) return <p className="small muted">{t("Önce bir sınıf oluştur.")}</p>;
  return <label className="field"><span className="tiny faint">{t("Sınıf")}</span><select className="select" value={groupId ?? ""} onChange={(e) => router.push(`?group=${e.target.value}`)}>{groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>;
}

function Plans({ groupId, plans }: { groupId: string | null; plans: Plan[] }) {
  const t = useT();
  const act = useAct();
  const next = (plans.at(-1)?.week ?? 0) + 1;
  const [week, setWeek] = useState(next);
  const [startsOn, setStartsOn] = useState("");
  const [title, setTitle] = useState("");
  const [lessons, setLessons] = useState("");
  const [note, setNote] = useState("");
  if (!groupId) return null;
  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <section className="card card-b stack">
        <strong><CalendarRange size={15} aria-hidden />{" "}{t("Hafta ekle / güncelle")}</strong>
        <div className="form-grid">
          <label className="field">{t("Hafta")}<input className="input" type="number" min={1} max={52} value={week} onChange={(e) => setWeek(Number(e.target.value))} /></label>
          <label className="field">{t("Başlangıç")}<input className="input" type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} /></label>
        </div>
        <label className="field">{t("Başlık")}<input className="input" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Ağlara giriş: DNS ve TCP")} /></label>
        <label className="field">{t("Dersler (kimlikler, virgülle)")}<input className="input" value={lessons} onChange={(e) => setLessons(e.target.value)} placeholder="m05-01, m05-02" /></label>
        <label className="field">{t("Not")}<input className="input" maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} /></label>
        <div><button type="button" className="btn btn-sm btn-primary" disabled={!startsOn || title.trim().length < 2} onClick={async () => { if (await act(() => api("/api/teach/planning", { body: { action: "plan", data: { groupId, week, startsOn, title, lessonSlugs: lessons.split(/[\s,]+/).filter(Boolean), note } } }), "Plan kaydedildi.")) { setWeek(week + 1); setTitle(""); setLessons(""); setNote(""); } }}>{t("Kaydet")}</button></div>
      </section>
      <section className="card card-b">
        {plans.length ? <ol className="timeline">{plans.map((p) => <li key={p.week}><time>{t("{week}. hafta ·", { week: p.week })}{" "}{new Date(`${p.startsOn}T12:00:00Z`).toLocaleDateString(t.intl, { timeZone: "UTC", day: "numeric", month: "short" })}</time><span><strong>{p.title}</strong>{p.lessonSlugs.length > 0 && <span className="tiny faint" style={{ display: "block" }}>{p.lessonSlugs.map((s) => <a key={s} href={`/academy/lesson/${s}`} style={{ marginRight: 6 }}>{s}</a>)}</span>}{p.note && <span className="tiny faint" style={{ display: "block" }}>{p.note}</span>}</span></li>)}</ol> : <EmptyState title={t("Bu sınıf için plan yok")} text={t("Haftalara ders ekleyerek dönem planını oluştur; öğrenciler grubun sayfasında görür.")} />}
      </section>
    </div>
  );
}

function Prechecks({ groups, rows }: { groups: { id: string; name: string }[]; rows: Pre[] }) {
  const t = useT();
  const act = useAct();
  const [groupId, setGroupId] = useState("");
  const [title, setTitle] = useState("");
  const [closes, setCloses] = useState("");
  const [qs, setQs] = useState([{ question: "", options: "" }]);
  const ready = title.trim().length >= 3 && closes && qs.every((q) => q.question.trim().length >= 3 && q.options.split("\n").filter((x) => x.trim()).length >= 2);
  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <section className="card card-b stack">
        <strong><ClipboardCheck size={15} aria-hidden />{" "}{t("Yeni yoklama (notlandırılmaz)")}</strong>
        <label className="field">{t("Başlık")}<input className="input" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Perşembe: TLS öncesi")} /></label>
        <div className="form-grid">
          <label className="field">{t("Hedef")}<select className="select" value={groupId} onChange={(e) => setGroupId(e.target.value)}><option value="">{t("Tüm öğrenciler")}</option>{groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
          <label className="field">{t("Kapanış")}<input className="input" type="datetime-local" value={closes} onChange={(e) => setCloses(e.target.value)} /></label>
        </div>
        {qs.map((q, i) => (
          <div key={i} className="stack-sm card card-b">
            <label className="field">{t("{v0}. soru", { v0: i + 1 })}<input className="input" maxLength={300} value={q.question} onChange={(e) => setQs(qs.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))} /></label>
            <label className="field"><span className="tiny faint">{t("Seçenekler (satır başına bir)")}</span><textarea className="textarea" rows={3} value={q.options} onChange={(e) => setQs(qs.map((x, j) => (j === i ? { ...x, options: e.target.value } : x)))} /></label>
            {qs.length > 1 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setQs(qs.filter((_, j) => j !== i))}><Trash2 size={13} aria-hidden />{" "}{t("Soruyu kaldır")}</button>}
          </div>
        ))}
        <div className="row">{qs.length < 3 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setQs([...qs, { question: "", options: "" }])}><Plus size={13} aria-hidden />{" "}{t("Soru")}</button>}
          <button type="button" className="btn btn-sm btn-primary" disabled={!ready} onClick={async () => { if (await act(() => api("/api/teach/planning", { body: { action: "precheck", data: { groupId: groupId || null, title, closesAt: new Date(closes).toISOString(), questions: qs.map((q) => ({ question: q.question, options: q.options.split("\n").map((x) => x.trim()).filter(Boolean) })) } } }), t("Yoklama gönderildi."))) { setTitle(""); setQs([{ question: "", options: "" }]); } }}>{t("Gönder")}</button></div>
      </section>
      <div className="stack-sm">
        {rows.length ? rows.map((r) => (
          <article key={r.id} className="card card-b stack-sm">
            <div className="row-between"><strong>{r.title}</strong><span className="tiny faint">{t("{group} · {responses} yanıt", { group: r.group, responses: r.responses })}</span></div>
            {r.questions.map((q, i) => (
              <div key={i} className="stack-sm"><span className="small">{q.question}</span>{q.options.map((o, k) => { const pct = r.responses ? Math.round((q.counts[k]! / r.responses) * 100) : 0; return <div key={k} className="dist"><span className="dist-label">{o}</span><div className="bar"><span style={{ width: `${pct}%` }} /></div><span className="tiny mono">{q.counts[k]} · %{pct}</span></div>; })}</div>
            ))}
          </article>
        )) : <EmptyState title={t("Henüz yoklama yok")} />}
      </div>
    </div>
  );
}

function Teams({ groupId }: { groupId: string | null }) {
  const tl = useT();
  const act = useAct();
  const toast = useToast();
  const [size, setSize] = useState(3);
  const [mode, setMode] = useState<"random" | "balanced">("balanced");
  const [teams, setTeams] = useState<{ name: string; members: { name: string; username: string; score: number }[]; total: number }[]>([]);
  if (!groupId) return null;
  const text = teams.map((t) => `${t.name}: ${t.members.map((m) => m.username).join(", ")}`).join("\n");
  return (
    <div className="stack">
      <div className="row">
        <label className="field"><span className="tiny faint">{tl("Takım boyutu")}</span><input className="input" type="number" min={2} max={8} value={size} onChange={(e) => setSize(Number(e.target.value))} style={{ width: 100 }} /></label>
        <label className="field"><span className="tiny faint">{tl("Yöntem")}</span><select className="select" value={mode} onChange={(e) => setMode(e.target.value as "random" | "balanced")}><option value="balanced">{tl("Dengeli (ilerlemeye göre)")}</option><option value="random">{tl("Rastgele")}</option></select></label>
        <button type="button" className="btn btn-sm btn-primary" style={{ alignSelf: "flex-end" }} onClick={async () => { const r = await act(() => api<{ teams: typeof teams }>("/api/teach/planning", { body: { action: "teams", groupId, size, mode } })); if (r) setTeams(r.teams); }}><Shuffle size={14} aria-hidden />{" "}{tl("Öner")}</button>
      </div>
      {teams.length > 0 && (
        <>
          <div className="grid-3">{teams.map((t) => <article key={t.name} className="card card-b stack-sm"><strong>{t.name}</strong><ul className="list-tight">{t.members.map((m) => <li key={m.username}><span style={{ flex: 1 }}>{m.name}</span><span className="tiny faint">{tl("{score} ders", { score: m.score })}</span></li>)}</ul></article>)}</div>
          <div><button type="button" className="btn btn-sm" onClick={async () => { await navigator.clipboard.writeText(text); toast("ok", tl("Takımlar kopyalandı; görev formundaki “Takımlar” alanına yapıştır.")); }}><Copy size={14} aria-hidden />{" "}{tl("Görev formu için kopyala")}</button></div>
        </>
      )}
    </div>
  );
}

function Goals({ goals }: { goals: Goal[] }) {
  const t = useT();
  const act = useAct();
  const [title, setTitle] = useState("");
  const [metric, setMetric] = useState("LESSONS");
  const [target, setTarget] = useState(100);
  const [startsOn, setStartsOn] = useState("");
  const [endsOn, setEndsOn] = useState("");
  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <section className="card card-b stack">
        <strong><Target size={15} aria-hidden />{" "}{t("Kulüp ortak hedefi")}</strong>
        <p className="tiny faint" style={{ margin: 0 }}>{t("Herkesin çalışması birlikte sayılır; bireysel sıralama gösterilmez. Topluluk özelliği açıkken öğrencilerin ana sayfasında görünür.")}</p>
        <label className="field">{t("Başlık")}<input className="input" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Ekim: kulüpçe 300 ders")} /></label>
        <div className="form-grid">
          <label className="field">{t("Ölçü")}<select className="select" value={metric} onChange={(e) => setMetric(e.target.value)}><option value="LESSONS">{t("Tamamlanan ders")}</option><option value="LABS">{t("Lab ve atölye")}</option><option value="STUDY_MINUTES">{t("Çalışma dakikası")}</option></select></label>
          <label className="field">{t("Hedef")}<input className="input" type="number" min={1} value={target} onChange={(e) => setTarget(Number(e.target.value))} /></label>
          <label className="field">{t("Başlangıç")}<input className="input" type="date" value={startsOn} onChange={(e) => setStartsOn(e.target.value)} /></label>
          <label className="field">{t("Bitiş")}<input className="input" type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} /></label>
        </div>
        <div><button type="button" className="btn btn-sm btn-primary" disabled={title.trim().length < 3 || !startsOn || !endsOn} onClick={async () => { if (await act(() => api("/api/teach/planning", { body: { action: "goal", data: { title, metric, target, startsOn, endsOn } } }), t("Hedef oluşturuldu."))) setTitle(""); }}>{t("Oluştur")}</button></div>
      </section>
      <div className="stack-sm">{goals.length ? goals.map((g) => <article key={g.id} className="card card-b stack-sm"><strong>{g.title}</strong><div className="bar"><span style={{ width: `${g.pct}%` }} /></div><span className="tiny faint">{g.value} / {g.target} · {g.endsOn}</span></article>) : <EmptyState title={t("Etkin kulüp hedefi yok")} />}</div>
    </div>
  );
}

function QuizForm({ skills, bank, groups }: { skills: { key: string; tr: string }[]; bank: { skill: string; difficulty: string; count: number }[]; groups: { id: string; name: string }[] }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState("Tekrar quizi");
  const [skill, setSkill] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [count, setCount] = useState(5);
  const [groupId, setGroupId] = useState("");
  const available = bank.filter((b) => (!skill || b.skill === skill) && (!difficulty || b.difficulty === difficulty)).reduce((a, b) => a + b.count, 0);
  async function make() {
    try { const r = await api<{ id: string }>("/api/teach/planning", { body: { action: "quizform", title, skill: skill || null, difficulty: difficulty || null, count, groupId: groupId || null } }); toast("ok", t("Taslak quiz görevi oluşturuldu.")); router.push(`/teach/tasks/${r.id}/edit`); }
    catch (e) { toast("error", (e as Error).message); }
  }
  return (
    <section className="card card-b stack" style={{ maxWidth: 640 }}>
      <strong><Wand2 size={15} aria-hidden />{" "}{t("Soru bankasından rastgele form")}</strong>
      <label className="field">{t("Görev başlığı")}<input className="input" maxLength={140} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <div className="form-grid">
        <label className="field">{t("Beceri")}<select className="select" value={skill} onChange={(e) => setSkill(e.target.value)}><option value="">{t("Tümü")}</option>{skills.map((s) => <option key={s.key} value={s.key}>{s.tr}</option>)}</select></label>
        <label className="field">{t("Zorluk")}<select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}><option value="">{t("Tümü")}</option><option value="EASY">{t("Kolay")}</option><option value="MEDIUM">{t("Orta")}</option><option value="HARD">{t("Zor")}</option></select></label>
        <label className="field">{t("Soru sayısı")}<input className="input" type="number" min={1} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} /></label>
        <label className="field">{t("Hedef")}<select className="select" value={groupId} onChange={(e) => setGroupId(e.target.value)}><option value="">{t("Tüm öğrenciler")}</option>{groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
      </div>
      <span className="tiny faint" role="status">{t("Bu filtrede {available} soru var.", { available })}</span>
      <div><button type="button" className="btn btn-sm btn-primary" disabled={available < count || title.trim().length < 3} onClick={make}>{t("Taslak quiz oluştur")}</button></div>
    </section>
  );
}

export function PlanningBoard({ groups, groupId, plans, prechecks, goals, skills, bank }: { groups: { id: string; name: string }[]; groupId: string | null; plans: Plan[]; prechecks: Pre[]; goals: Goal[]; skills: { key: string; tr: string }[]; bank: { skill: string; difficulty: string; count: number }[] }) {
  const t = useT();
  return (
    <Tabs label={t("Planlama")} tabs={[
      { id: "plan", label: t("Dönem planı"), content: <div className="stack"><GroupPicker groups={groups} groupId={groupId} /><Plans groupId={groupId} plans={plans} /></div> },
      { id: "pre", label: t("Ders öncesi yoklama ({length})", { length: prechecks.length }), content: <Prechecks groups={groups} rows={prechecks} /> },
      { id: "teams", label: t("Takım oluşturucu"), content: <div className="stack"><GroupPicker groups={groups} groupId={groupId} /><Teams groupId={groupId} /></div> },
      { id: "goal", label: t("Kulüp hedefi"), content: <Goals goals={goals} /> },
      { id: "quiz", label: t("Rastgele quiz"), content: <QuizForm skills={skills} bank={bank} groups={groups} /> },
    ]} />
  );
}
