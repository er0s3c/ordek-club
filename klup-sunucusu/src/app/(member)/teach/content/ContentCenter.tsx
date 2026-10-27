"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, MessageCircleQuestion, PencilLine } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { Tabs } from "@/components/ui/Tabs";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState, StatusPill } from "@/components/ui/states";
import { useT } from "@/i18n/client";

type Stage = { decision: string; note: string; by: string; at: string } | null;
type Row = { id: string; slug: string; title: string; track: string; trackTitle: string; stages: Record<"AUTHOR" | "TECH" | "LANGUAGE", Stage>; ready: boolean; changedSinceReview: boolean };
type Status = { rows: Row[]; changes: { id: string; slug: string; title: string; oldTitle: string; at: string }[] };
type QA = { slug: string; title: string; track: string; respondents: number; questions: { text: string; options: string[]; correctIndex: number; counts: number[]; total: number; enough: boolean; correctPct: number | null; topDistractor: { option: string; pct: number } | null }[] };
type FB = { slug: string; title: string; track: string; avg: number | null; count: number; unclear: string[]; comments: string[] };
type Question = { id: string; body: string; author: string; slug: string; title: string; createdAt: string };
const STAGES = [["AUTHOR", "Yazar"], ["TECH", "Teknik"], ["LANGUAGE", "Dil"]] as const;

function StageCell({ s }: { s: Stage }) {
  const t = useT();
  if (!s) return <StatusPill tone="neutral">{t("bekliyor")}</StatusPill>;
  return s.decision === "APPROVED" ? <StatusPill tone="ok">{t("onay · {by}", { by: s.by })}</StatusPill> : <span title={s.note}><StatusPill tone="warn">{t("değişiklik")}</StatusPill></span>;
}

function ReviewForm({ row }: { row: Row }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [stage, setStage] = useState<"AUTHOR" | "TECH" | "LANGUAGE">("AUTHOR");
  const [note, setNote] = useState("");
  async function send(decision: "APPROVED" | "CHANGES") {
    try { await api("/api/teach/content", { body: { slug: row.slug, stage, decision, note } }); toast("ok", t("Karar kaydedildi.")); setNote(""); router.refresh(); }
    catch (e) { toast("error", (e as Error).message); }
  }
  return (
    <div className="stack">
      <Link href={`/academy/lesson/${row.slug}`} target="_blank">{t("Dersi yeni sekmede aç →")}</Link>
      <dl className="kv">{STAGES.map(([k, l]) => <div key={k} style={{ display: "contents" }}><dt>{l}</dt><dd><StageCell s={row.stages[k]} />{row.stages[k]?.note && <div className="tiny faint">{row.stages[k]!.note}</div>}</dd></div>)}</dl>
      <label className="field">{t("Aşama")}<select className="select" value={stage} onChange={(e) => setStage(e.target.value as typeof stage)}>{STAGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
      <label className="field">{t("Not")}<textarea className="textarea" rows={3} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("Değişiklik istiyorsan neyin değişmesi gerektiğini yaz.")} /></label>
      <div className="row"><button type="button" className="btn btn-sm btn-primary" onClick={() => send("APPROVED")}><Check size={14} aria-hidden />{" "}{t("Onayla")}</button><button type="button" className="btn btn-sm" onClick={() => send("CHANGES")}><PencilLine size={14} aria-hidden />{" "}{t("Değişiklik iste")}</button></div>
      <p className="tiny faint">{t("Kararlar dersin şu anki içerik sürümüne bağlıdır; içerik değişirse onaylar yeniden istenir. Teknik inceleme yazardan farklı biri tarafından yapılır.")}</p>
    </div>
  );
}

function Approval({ status }: { status: Status }) {
  const t = useT();
  const ready = status.rows.filter((r) => r.ready).length;
  return (
    <div className="stack">
      <div className="grid-stats">
        <div className="card stat card-stat"><div className="label">{t("Yayına hazır")}</div><div className="value">{ready}</div><div className="hint">{t("/ {length} ders", { length: status.rows.length })}</div></div>
        <div className="card stat card-stat"><div className="label">{t("Değişiklik istenen")}</div><div className="value">{status.rows.filter((r) => Object.values(r.stages).some((s) => s?.decision === "CHANGES")).length}</div></div>
        <div className="card stat card-stat"><div className="label">{t("İncelemeden sonra değişen")}</div><div className="value">{status.rows.filter((r) => r.changedSinceReview).length}</div></div>
      </div>
      <DataTable
        label={t("İçerik onay durumu")}
        rows={status.rows}
        searchText={(r) => `${r.title} ${r.track} ${r.slug}`}
        filters={{ label: t("Durum"), options: [{ value: "ready", label: t("Yayına hazır") }, { value: "pending", label: t("Onay bekliyor") }, { value: "changed", label: t("İncelemeden sonra değişti") }], value: (r) => (r.ready ? "ready" : r.changedSinceReview ? "changed" : "pending") }}
        columns={[
          { key: "track", label: t("Yol"), render: (r) => r.track, sort: (r) => r.track },
          { key: "title", label: t("Ders"), render: (r) => <>{r.title}{r.changedSinceReview && <> <StatusPill tone="warn">{t("güncellendi")}</StatusPill></>}</>, sort: (r) => r.title },
          ...STAGES.map(([k, l]) => ({ key: k, label: l, render: (r: Row) => <StageCell s={r.stages[k]} /> })),
          { key: "ready", label: t("Yayın"), render: (r) => (r.ready ? <StatusPill tone="ok">{t("hazır")}</StatusPill> : <StatusPill tone="neutral">{t("hayır")}</StatusPill>) },
        ]}
        detail={{ title: (r) => `${r.track} · ${r.title}`, render: (r) => <ReviewForm row={r} /> }}
      />
    </div>
  );
}

function Analytics({ data }: { data: QA[] }) {
  const t = useT();
  const [open, setOpen] = useState<string | null>(data.find((d) => d.respondents)?.slug ?? null);
  if (!data.length) return <EmptyState title={t("Quiz içeren ders yok")} />;
  return (
    <div className="stack">
      <p className="small muted" style={{ margin: 0 }}>{t("Kişi başına ilk deneme sayılır.")}{" "}{t("10'dan")}{" "}{t("az yanıtı olan sorularda oranlar yönlendirici değildir.")}</p>
      {data.map((l) => (
        <details key={l.slug} open={open === l.slug} onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && setOpen(l.slug)} className="card">
          <summary className="card-b row-between"><span><strong>{l.title}</strong> <span className="tiny faint">{l.track}</span></span><span className="tiny faint">{t("{respondents} öğrenci", { respondents: l.respondents })}</span></summary>
          <div className="card-b stack" style={{ paddingTop: 0 }}>
            {l.questions.map((q, i) => (
              <div key={i} className="stack-sm qa-item">
                <div className="row-between"><strong className="small">{i + 1}. {q.text}</strong>{!q.enough ? <StatusPill tone="neutral">{t("yetersiz veri ({total})", { total: q.total })}</StatusPill> : q.correctPct !== null && q.correctPct < 50 ? <StatusPill tone="warn">{t("%{correctPct} doğru", { correctPct: q.correctPct })}</StatusPill> : <StatusPill tone="ok">{t("%{correctPct} doğru", { correctPct: q.correctPct })}</StatusPill>}</div>
                {q.options.map((o, k) => {
                  const pct = q.total ? Math.round((q.counts[k]! / q.total) * 100) : 0;
                  return <div key={k} className="dist"><span className={k === q.correctIndex ? "dist-label is-correct" : "dist-label"}>{k === q.correctIndex ? "✓ " : ""}{o}</span><div className="bar"><span style={{ width: `${pct}%`, background: k === q.correctIndex ? "var(--ok)" : "var(--accent)" }} /></div><span className="tiny mono">{q.counts[k]} · %{pct}</span></div>;
                })}
                {q.enough && q.topDistractor && q.topDistractor.pct >= 30 && <span className="tiny"><AlertTriangle size={12} aria-hidden />{" "}{t("“{option}” seçeneği %{pct} oranında işaretlenmiş — kavram yanılgısı olabilir; kütüphaneye ekleyebilirsin.", { option: q.topDistractor.option, pct: q.topDistractor.pct })}</span>}
              </div>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

function Feedback({ rows }: { rows: FB[] }) {
  const t = useT();
  if (!rows.length) return <EmptyState title={t("Henüz ders geri bildirimi yok")} />;
  return (
    <div className="stack">
      {rows.map((r) => (
        <article key={r.slug} className="card card-b stack-sm">
          <div className="row-between"><Link href={`/academy/lesson/${r.slug}`}><strong>{r.title}</strong></Link><span className="small">{r.avg !== null ? <>★ {r.avg} <span className="tiny faint">({r.count})</span></> : <span className="tiny faint">{t("puan yok")}</span>}</span></div>
          {r.unclear.length > 0 && <div><div className="eyebrow">{t("En belirsiz noktalar (isimsiz)")}</div><ul className="small">{r.unclear.slice(0, 8).map((u, i) => <li key={i}>{u}</li>)}</ul></div>}
          {r.comments.length > 0 && <details><summary className="small">{t("Yorumlar ({length})", { length: r.comments.length })}</summary><ul className="small">{r.comments.slice(0, 20).map((c, i) => <li key={i}>{c}</li>)}</ul></details>}
        </article>
      ))}
    </div>
  );
}

function Questions({ rows }: { rows: Question[] }) {
  const t = useT();
  if (!rows.length) return <EmptyState duck="cheer" title={t("Yanıt bekleyen soru yok")} />;
  return (
    <ul className="list-tight">
      {rows.map((q) => <li key={q.id}><MessageCircleQuestion size={14} aria-hidden /><span style={{ flex: 1, minWidth: 0 }}><Link href={`/academy/lesson/${q.slug}#sorular`}>{q.title}</Link><span className="tiny faint" style={{ display: "block" }}>{q.author}: {q.body.slice(0, 160)}</span></span><span className="tiny faint">{new Date(q.createdAt).toLocaleDateString(t.intl)}</span></li>)}
    </ul>
  );
}

export function ContentCenter({ status, analytics, feedback, questions }: { status: Status; analytics: QA[]; feedback: FB[]; questions: Question[] }) {
  const t = useT();
  return (
    <Tabs label={t("İçerik merkezi")} tabs={[
      { id: "approval", label: t("Onay adımları"), content: <Approval status={status} /> },
      { id: "analytics", label: t("Soru kalitesi"), content: <Analytics data={analytics} /> },
      { id: "feedback", label: t("Geri bildirim ({length})", { length: feedback.length }), content: <Feedback rows={feedback} /> },
      { id: "questions", label: t("Ders soruları ({length})", { length: questions.length }), content: <Questions rows={questions} /> },
      { id: "changes", label: t("Değişiklikler ({length})", { length: status.changes.length }), content: status.changes.length ? <ul className="timeline">{status.changes.map((c) => <li key={c.id}><time>{new Date(c.at).toLocaleString(t.intl)}</time><span><Link href={`/academy/lesson/${c.slug}`}>{c.title}</Link>{c.oldTitle && c.oldTitle !== c.title && <span className="tiny faint">{" "}{t("· önceki başlık: {oldTitle}", { oldTitle: c.oldTitle })}</span>}{" "}{t("güncellendi")}</span></li>)}</ul> : <EmptyState title={t("Son 30 günde içerik değişikliği yok")} /> },
    ]} />
  );
}
