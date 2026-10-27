"use client";
import { useState } from "react";
import { Plus, Vote } from "lucide-react";
import { useClubAction } from "@/components/club/useClubAction";
import { EmptyState, StatusPill } from "@/components/ui/states";
import { useT } from "@/i18n/client";

type Poll = { id: string; question: string; options: string[]; anonymous: boolean; open: boolean; closesAt: string | null; by: string; mine: number | null; total: number; counts: number[] | null; voters: { name: string; choice: number }[] | null };

function NewPoll() {
  const t = useT();
  const act = useClubAction();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState("");
  const [closes, setCloses] = useState("");
  const [anonymous, setAnonymous] = useState(true);
  const list = options.split("\n").map((o) => o.trim()).filter(Boolean);
  return (
    <section className="card card-b stack-sm" aria-labelledby="np-h">
      <strong id="np-h"><Plus size={15} aria-hidden />{" "}{t("Yeni anket")}</strong>
      <label className="field">{t("Soru")}<input className="input" maxLength={200} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t("Bir sonraki CTF hazırlık oturumu hangi gün olsun?")} /></label>
      <label className="field">{t("Seçenekler (satır başına bir, 2–8)")}<textarea className="textarea" rows={4} value={options} onChange={(e) => setOptions(e.target.value)} /></label>
      <div className="row">
        <label className="field"><span className="tiny faint">{t("Kapanış (isteğe bağlı)")}</span><input className="input" type="datetime-local" value={closes} onChange={(e) => setCloses(e.target.value)} /></label>
        <label className="check" style={{ alignSelf: "flex-end" }}><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />{" "}{t("Anonim")}</label>
      </div>
      <div><button type="button" className="btn btn-sm btn-primary" disabled={question.trim().length < 5 || list.length < 2 || list.length > 8} onClick={async () => { if (await act({ action: "poll.create", data: { question, options: list, anonymous, closesAt: closes ? new Date(closes).toISOString() : null } }, t("Anket yayınlandı."))) { setQuestion(""); setOptions(""); } }}>{t("Yayınla")}</button></div>
    </section>
  );
}

export function Polls({ rows, staff }: { rows: Poll[]; staff: boolean }) {
  const t = useT();
  const act = useClubAction();
  return (
    <div className="stack">
      {staff && <NewPoll />}
      {rows.length === 0 ? <EmptyState icon={Vote} title={t("Henüz anket yok")} /> : rows.map((p) => (
        <article key={p.id} className="card card-b stack-sm" aria-label={p.question}>
          <div className="row-between"><strong>{p.question}</strong>{p.open ? <StatusPill tone="info">{t("açık")}{p.closesAt ? ` · ${new Date(p.closesAt).toLocaleDateString(t.intl)}` : ""}</StatusPill> : <StatusPill tone="neutral">{t("kapandı")}</StatusPill>}</div>
          <span className="tiny faint">{t("{by} · {total} oy", { by: p.by, total: p.total })}{p.anonymous ? t(" · anonim") : ""}</span>
          {p.options.map((o, i) => {
            const pct = p.counts && p.total ? Math.round((p.counts[i]! / p.total) * 100) : 0;
            return p.counts ? (
              <div key={i} className="dist"><span className={`dist-label${p.mine === i ? " is-correct" : ""}`}>{p.mine === i ? "✓ " : ""}{o}</span><div className="bar"><span style={{ width: `${pct}%` }} /></div><span className="tiny mono">{p.counts[i]} · %{pct}</span></div>
            ) : <div key={i}><button type="button" className="btn btn-sm" disabled={!p.open} onClick={() => act({ action: "poll.vote", id: p.id, choice: i }, "Oyun kaydedildi.")}>{o}</button></div>;
          })}
          {p.open && p.mine !== null && <span className="tiny faint">{t("Kapanana kadar oyunu değiştirebilirsin:")}{" "}<span className="chips" style={{ display: "inline-flex" }}>{p.options.map((o, i) => <button key={i} type="button" className="chip" aria-pressed={p.mine === i} onClick={() => act({ action: "poll.vote", id: p.id, choice: i })}>{o}</button>)}</span></span>}
          {p.voters && <details><summary className="tiny">{t("Oy verenler")}</summary><ul className="small">{p.voters.map((v, i) => <li key={i}>{v.name}: {p.options[v.choice]}</li>)}</ul></details>}
        </article>
      ))}
    </div>
  );
}
