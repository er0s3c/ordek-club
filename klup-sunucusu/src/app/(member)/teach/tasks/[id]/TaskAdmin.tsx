"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Check, CornerUpLeft, Pencil, Trash2, Upload, X } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { formatDateTime } from "@/components/ui/format";
import { FileList } from "@/components/classroom/FileList";
import { FILE_ACCEPT, SUBMISSION_STATUS } from "@/components/classroom/labels";
import { useT } from "@/i18n/client";

type FileRef = { id: string; name: string; size: number };
type Sub = {
  id: string; status: string; late: boolean; attempts: number; submittedAt: string; text: string; score: number | null; feedback: string;
  rubricScores: number[] | null; user: { username: string; displayName: string }; files: FileRef[]; team: string | null;
};
type Task = {
  id: string; status: string; canEdit: boolean; description: string; maxScore: number; rubric: { criterion: string; points: number }[];
  targets: string[]; files: FileRef[]; submissions: Sub[]; kind: string; passPercent: number; teams: { name: string; members: string[] }[];
};

type Filter = "pending" | "all" | "done";

export function TaskAdmin({ task, timezone }: { task: Task; timezone: string }) {
  const tl = useT();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<Filter>(task.submissions.some((s) => s.status === "SUBMITTED") ? "pending" : "all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);

  const subs = useMemo(
    () => task.submissions.filter((s) => (filter === "all" ? true : filter === "pending" ? s.status === "SUBMITTED" : s.status !== "SUBMITTED")),
    [task.submissions, filter],
  );
  const pending = task.submissions.filter((s) => s.status === "SUBMITTED");
  const open = task.submissions.find((s) => s.id === openId) ?? null;

  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    try {
      await fn();
      toast("ok", ok);
      router.refresh();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const status = (s: string, ok: string) => run(() => api(`/api/teach/tasks/${task.id}/status`, { body: { status: s } }), ok);

  async function upload() {
    const files = Array.from(fileRef.current?.files ?? []);
    if (!files.length) return;
    await run(async () => {
      for (const f of files) {
        const form = new FormData();
        form.set("file", f);
        form.set("scope", "ASSIGNMENT");
        form.set("assignmentId", task.id);
        await api("/api/files", { method: "POST", form });
      }
      if (fileRef.current) fileRef.current.value = "";
    }, tl("Ekler yüklendi."));
  }

  return (
    <div className="stack">
      {task.canEdit && (
        <div className="row" style={{ flexWrap: "wrap" }}>
          <Link className="btn" href={`/teach/tasks/${task.id}/edit`}><Pencil size={15} aria-hidden />{" "}{tl("Düzenle")}</Link>
          {task.status === "DRAFT" && <button className="btn btn-primary" disabled={busy} onClick={() => status("PUBLISHED", tl("Görev yayınlandı; öğrencilere bildirim gitti."))}>{tl("Yayınla")}</button>}
          {task.status === "PUBLISHED" && <button className="btn" disabled={busy} onClick={() => status("CLOSED", tl("Görev teslime kapatıldı."))}>{tl("Teslime kapat")}</button>}
          {task.status === "CLOSED" && <button className="btn" disabled={busy} onClick={() => status("PUBLISHED", tl("Görev yeniden açıldı."))}>{tl("Yeniden aç")}</button>}
          {task.submissions.length === 0 && (
            <button className="btn btn-danger" disabled={busy} onClick={() => {
              if (!window.confirm(tl("Görev silinsin mi?"))) return;
              void (async () => {
                try {
                  await api(`/api/teach/tasks/${task.id}`, { method: "DELETE" });
                  toast("ok", tl("Görev silindi."));
                  router.replace("/teach/tasks");
                } catch (e) {
                  toast("error", (e as Error).message);
                }
              })();
            }}><Trash2 size={15} aria-hidden />{" "}{tl("Sil")}</button>
          )}
        </div>
      )}

      <div className="grid-2" style={{ alignItems: "start" }}>
        <section className="card">
          <div className="card-h"><h2>{tl("Görev metni")}</h2></div>
          <div className="card-b stack-sm">
            <div className="prose-plain">{task.description || "—"}</div>
            {task.rubric.length > 0 && (
              <ul className="list-tight">{task.rubric.map((r, i) => <li key={i}><span style={{ flex: 1 }}>{r.criterion}</span><span className="mono small">{r.points}</span></li>)}</ul>
            )}
            {task.targets.length > 0 && <p className="small muted" style={{ margin: 0 }}>{tl("Hedef: {v0}", { v0: task.targets.join(", ") })}</p>}
            {task.teams.length > 0 && (
              <ul className="list-tight">{task.teams.map((t) => <li key={t.name}><strong>{t.name}</strong><span className="small muted" style={{ flex: 1 }}>{t.members.join(", ")}</span></li>)}</ul>
            )}
            {task.kind === "QUIZ" && <div className="alert alert-info small">{tl("Otomatik puanlanır: geçme %{passPercent}. Geçen teslim onaylanır ve XP verilir; değerlendirme gerekmez.", { passPercent: task.passPercent })}</div>}
          </div>
        </section>
        <section className="card">
          <div className="card-h"><h2>{tl("Ekler")}</h2></div>
          <div className="card-b stack-sm">
            <FileList files={task.files} empty={tl("Ek dosya yok.")} />
            {task.canEdit && (
              <div className="row" style={{ flexWrap: "wrap" }}>
                <label htmlFor="att" className="sr-only">{tl("Ek dosya seç")}</label>
                <input id="att" ref={fileRef} type="file" multiple className="input" style={{ flex: 1, minWidth: 0 }} accept={FILE_ACCEPT} />
                <button className="btn btn-sm" disabled={busy} onClick={upload}><Upload size={14} aria-hidden />{" "}{tl("Yükle")}</button>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="card" aria-labelledby="subs-h">
        <div className="card-h">
          <h2 id="subs-h">{tl("Teslimler")}</h2>
          <div className="seg" role="group" aria-label={tl("Filtre")}>
            <button aria-pressed={filter === "pending"} onClick={() => setFilter("pending")}>{tl("Bekleyen ({length})", { length: pending.length })}</button>
            <button aria-pressed={filter === "done"} onClick={() => setFilter("done")}>{tl("Değerlendirilen")}</button>
            <button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>{tl("Tümü ({length})", { length: task.submissions.length })}</button>
          </div>
        </div>
        {task.canEdit && pending.length > 0 && (
          <div className="card-b row" style={{ flexWrap: "wrap", paddingBottom: 0 }}>
            <button className="btn btn-sm" onClick={() => setPicked(picked.size === pending.length ? new Set() : new Set(pending.map((p) => p.id)))}>
              {picked.size === pending.length ? tl("Seçimi kaldır") : tl("Bekleyenlerin hepsini seç")}
            </button>
            <button className="btn btn-sm btn-primary" disabled={busy || picked.size === 0} onClick={() => {
              if (!window.confirm(tl("{size} teslim tam puanla onaylansın mı? Her öğrenciye XP verilir.", { size: picked.size }))) return;
              void run(async () => {
                const r = await api<{ approved: number; skipped: number }>(`/api/teach/tasks/${task.id}/bulk-approve`, { body: { submissionIds: [...picked], feedback: "" } });
                setPicked(new Set());
                if (r.skipped) toast("info", tl("{skipped} teslim atlandı (artık bekleyen değil).", { skipped: r.skipped }));
              }, tl("Seçilen teslimler onaylandı."));
            }}><Check size={14} aria-hidden />{" "}{tl("Seçilenleri onayla ({size})", { size: picked.size })}</button>
          </div>
        )}
        {!subs.length ? (
          <div className="empty"><div>{filter === "pending" ? tl("Değerlendirme bekleyen teslim yok.") : tl("Henüz teslim yok.")}</div></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr>{task.canEdit && <th aria-label={tl("Seç")} />}<th>{tl("Öğrenci")}</th><th>{tl("Teslim")}</th><th>{tl("Durum")}</th><th className="num">{tl("Puan")}</th><th /></tr></thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className={openId === s.id ? "is-open" : undefined}>
                    {task.canEdit && (
                      <td>{s.status === "SUBMITTED" && <input type="checkbox" aria-label={tl("{displayName} seç", { displayName: s.user.displayName })} checked={picked.has(s.id)} onChange={(e) => {
                        const n = new Set(picked);
                        if (e.target.checked) n.add(s.id); else n.delete(s.id);
                        setPicked(n);
                      }} />}</td>
                    )}
                    <td>{s.team ? <><strong>{s.team}</strong><div className="tiny faint">{tl("teslim eden: {displayName}", { displayName: s.user.displayName })}</div></> : <>{s.user.displayName}<div className="tiny faint mono">@{s.user.username}</div></>}</td>
                    <td className="small">{formatDateTime(s.submittedAt, timezone, tl.intl)}{s.late && <span className="badge" style={{ marginLeft: 6 }}>{tl("geç")}</span>}{s.attempts > 1 && <div className="tiny faint">{tl("{attempts}. deneme", { attempts: s.attempts })}</div>}</td>
                    <td><span className={SUBMISSION_STATUS[s.status]!.cls}>{tl(SUBMISSION_STATUS[s.status]!.label)}</span></td>
                    <td className="num mono">{s.score ?? "—"}/{task.maxScore}</td>
                    <td><button className="btn btn-sm" onClick={() => setOpenId(openId === s.id ? null : s.id)}>{openId === s.id ? tl("Kapat") : s.status === "SUBMITTED" && task.canEdit ? tl("Değerlendir") : tl("Görüntüle")}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {open && <Review key={open.id} sub={open} task={task} busy={busy} run={run} onDone={() => setOpenId(null)} />}
    </div>
  );
}

function Review({ sub, task, busy, run, onDone }: { sub: Sub; task: Task; busy: boolean; run: (fn: () => Promise<unknown>, ok: string) => Promise<void>; onDone: () => void }) {
  const t = useT();
  const [scores, setScores] = useState<number[]>(sub.rubricScores ?? task.rubric.map((r) => r.points));
  const [score, setScore] = useState<number>(sub.score ?? task.maxScore);
  const [feedback, setFeedback] = useState(sub.feedback);
  const editable = task.canEdit && sub.status === "SUBMITTED";
  const total = task.rubric.length ? scores.reduce((a, b) => a + (Number(b) || 0), 0) : score;

  const decide = (decision: "APPROVE" | "RETURN" | "REJECT") =>
    run(async () => {
      await api(`/api/teach/submissions/${sub.id}/review`, {
        body: { decision, feedback, ...(task.rubric.length ? { rubricScores: scores.map(Number) } : { score: Number(score) }) },
      });
      onDone();
    }, decision === "APPROVE" ? t("Teslim onaylandı; XP verildi.") : decision === "RETURN" ? t("Düzeltme istendi.") : "Teslim reddedildi.");

  return (
    <section className="card" aria-labelledby="rev-h" style={{ borderColor: "var(--ink)" }}>
      <div className="card-h"><h2 id="rev-h">{sub.team ? t("Takım {team}", { team: sub.team }) : sub.user.displayName}{" "}{t("· teslim")}</h2><span className={SUBMISSION_STATUS[sub.status]!.cls}>{t(SUBMISSION_STATUS[sub.status]!.label)}</span></div>
      <div className="card-b grid-2" style={{ alignItems: "start" }}>
        <div className="stack-sm">
          <div className="notes">{sub.text || t("— metin yok —")}</div>
          <FileList files={sub.files} empty={t("Dosya eklenmemiş.")} />
        </div>
        <div className="stack-sm">
          {task.rubric.length > 0 ? (
            <ul className="list-tight">
              {task.rubric.map((r, i) => (
                <li key={i}>
                  <label htmlFor={`rs-${i}`} style={{ flex: 1 }}>{r.criterion}</label>
                  <input id={`rs-${i}`} className="input" style={{ width: 80 }} type="number" min={0} max={r.points} disabled={!editable} value={scores[i] ?? 0} onChange={(e) => setScores(scores.map((x, j) => (j === i ? Number(e.target.value) : x)))} />
                  <span className="mono small">/ {r.points}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="field">
              <label htmlFor="rv-score">{t("Puan (0–{maxScore})", { maxScore: task.maxScore })}</label>
              <input id="rv-score" className="input" type="number" min={0} max={task.maxScore} disabled={!editable} value={score} onChange={(e) => setScore(Number(e.target.value))} />
            </div>
          )}
          <div className="small">{t("Toplam:")}{" "}<strong>{total}</strong> / {task.maxScore}</div>
          <div className="field">
            <label htmlFor="rv-fb">{t("Geri bildirim")}</label>
            <textarea id="rv-fb" className="textarea" rows={4} maxLength={5000} disabled={!editable} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder={t("Öğrenci bildirimle görür. Düzeltme isterken zorunlu.")} />
          </div>
          {editable ? (
            <div className="row" style={{ flexWrap: "wrap" }}>
              <button className="btn btn-primary" disabled={busy} onClick={() => decide("APPROVE")}><Check size={15} aria-hidden />{" "}{t("Onayla (XP ver)")}</button>
              <button className="btn" disabled={busy || !feedback.trim()} onClick={() => decide("RETURN")} title={t("Öğrenci düzeltip yeniden teslim eder")}><CornerUpLeft size={15} aria-hidden />{" "}{t("Düzeltme iste")}</button>
              <button className="btn btn-danger" disabled={busy} onClick={() => { if (window.confirm(t("Teslim reddedilsin mi? Öğrenci değiştiremez."))) void decide("REJECT"); }}><X size={15} aria-hidden />{" "}{t("Reddet")}</button>
            </div>
          ) : (
            <p className="small muted" style={{ margin: 0 }}>{task.canEdit ? t("Bu teslim değerlendirildi.") : t("Değerlendirmeyi görevi oluşturan eğitmen yapar.")}</p>
          )}
        </div>
      </div>
    </section>
  );
}
