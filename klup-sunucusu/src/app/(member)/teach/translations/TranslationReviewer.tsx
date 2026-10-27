"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronRight, Download, Loader2, Save, X } from "lucide-react";
import { api, ApiError } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { useT } from "@/i18n/client";
import { lineDiff, type DiffLine } from "@/lib/text";

type Review = { stage: "TECH" | "LANGUAGE"; decision: "APPROVED" | "CHANGES"; byName: string; at: string; note: string } | null;
type Row = {
  slug: string;
  title: string;
  track: string;
  trackTitle: string;
  status: "missing" | "draft" | "reviewed";
  review: Review;
  enTitle: string | null;
  enWords: number;
  trWords: number;
  goals: { tr: number; en: number };
  quiz: { tr: number; en: number } | null;
  missions: { tr: number; en: number } | null;
  changedLines: number;
  missingSections: string[];
  bodyHashChanged: boolean;
};
type Detail = {
  slug: string;
  track: string;
  trackTitle: string;
  tr: { title: string; body: string; goals: string[] };
  en: { title: string; body: string; goals: string[]; contentHash: string } | null;
  review: Review;
  reviewed: boolean;
  headings: { tr: string[]; en: string[] };
};

const STATUS_LABEL: Record<Row["status"], string> = { missing: "Çeviri yok", draft: "Taslak", reviewed: "Onaylı" };
const STATUS_CLASS: Record<Row["status"], string> = { missing: "badge badge-warn", draft: "badge", reviewed: "badge badge-ok" };

export function TranslationReviewer({ rows, counts }: { rows: Row[]; counts: { total: number; missing: number; draft: number; reviewed: number } }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [filter, setFilter] = useState<"all" | Row["status"] | "drift">("draft");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState<"TECH" | "LANGUAGE">("LANGUAGE");
  const [note, setNote] = useState("");
  const [onlyDrift, setOnlyDrift] = useState(false);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "drift" ? !(r.missingSections.length || r.bodyHashChanged) : filter !== "all" && r.status !== filter) return false;
      if (onlyDrift && !(r.missingSections.length || r.bodyHashChanged)) return false;
      if (!q) return true;
      return r.slug.includes(q) || r.title.toLowerCase().includes(q) || (r.enTitle ?? "").toLowerCase().includes(q);
    });
  }, [rows, filter, query, onlyDrift]);

  const diff: DiffLine[] = useMemo(() => (detail?.en ? lineDiff(detail.tr.body, detail.en.body) : []), [detail]);

  async function load(slug: string) {
    setOpen(slug);
    setDetail(null);
    setNote("");
    try {
      const d = await api<Detail>(`/api/teach/translations/${slug}`);
      setDetail(d);
      setStage(d.review?.stage ?? "LANGUAGE");
    } catch (e) {
      toast("error", e instanceof ApiError ? e.message : t("Beklenmeyen bir hata oluştu."));
    }
  }

  async function decide(decision: "APPROVED" | "CHANGES") {
    if (!detail) return;
    if (decision === "CHANGES" && note.trim().length < 5) {
      toast("error", t("Geri göndermek için neyin düzeltilmesi gerektiğini yaz."));
      return;
    }
    setBusy(true);
    try {
      await api("/api/teach/translations", { method: "POST", body: { slug: detail.slug, stage, decision, note } });
      toast("ok", decision === "APPROVED" ? t("Çeviri onaylandı.") : t("Çeviri geri gönderildi."));
      setDetail(null);
      setOpen(null);
      router.refresh();
    } catch (e) {
      toast("error", e instanceof ApiError ? e.message : t("Beklenmeyen bir hata oluştu."));
    } finally {
      setBusy(false);
    }
  }

  function downloadPair() {
    if (!detail?.en) return;
    const text = `# ${detail.tr.title}\n\n${detail.tr.body}\n\n---\n\n# ${detail.en.title}\n\n${detail.en.body}\n`;
    const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${detail.slug}.tr-en.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="stack">
      <div className="chips" role="group" aria-label={t("Durum")}>
        {(
          [
            ["draft", `${t("Taslak")} (${counts.draft})`],
            ["missing", `${t("Çeviri yok")} (${counts.missing})`],
            ["reviewed", `${t("Onaylı")} (${counts.reviewed})`],
            ["drift", t("Yapı sapması")],
            ["all", `${t("Tümü")} (${counts.total})`],
          ] as const
        ).map(([k, label]) => (
          <button key={k} type="button" role="radio" aria-checked={filter === k} className={`chip ${filter === k ? "chip-active" : ""}`} onClick={() => setFilter(k)}>{label}</button>
        ))}
        <label className="chip" style={{ gap: 6 }}>
          <input type="checkbox" checked={onlyDrift} onChange={(e) => setOnlyDrift(e.target.checked)} /> {t("Yalnız sapmalı")}
        </label>
        <input className="input" style={{ maxWidth: 280 }} placeholder={t("Ders ara…")} value={query} onChange={(e) => setQuery(e.target.value)} aria-label={t("Ders ara")} />
      </div>

      {open && (
        <div className="card card-b stack">
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <button className="btn btn-sm btn-ghost" onClick={() => { setOpen(null); setDetail(null); }}><ArrowLeft size={15} aria-hidden /> {t("Listeye dön")}</button>
            {detail?.en && (
              <button className="btn btn-sm" onClick={downloadPair}><Download size={15} aria-hidden /> {t("İki dili indir")}</button>
            )}
          </div>
          {!detail ? (
            <p className="row" style={{ gap: 8 }}><Loader2 size={16} className="spin" aria-hidden /> {t("Yükleniyor…")}</p>
          ) : (
            <>
              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <span className="badge">{detail.track}</span>
                <strong>{detail.tr.title}</strong>
                {detail.reviewed && <span className="badge badge-ok"><Check size={12} aria-hidden /> {t("Onaylı")}</span>}
                {detail.review && (
                  <span className="tiny faint">
                    {detail.review.decision === "APPROVED" ? t("Onay") : t("Geri gönderildi")} · {detail.review.byName} · {new Date(detail.review.at).toLocaleDateString()}
                    {detail.review.note ? ` — ${detail.review.note}` : ""}
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
                <section className="stack" style={{ gap: 6 }}>
                  <h2 className="h3">Türkçe · {detail.tr.body.split(/\s+/).length} {t("kelime")}</h2>
                  {detail.tr.goals.length > 0 && <ul className="list-tight tiny">{detail.tr.goals.map((g, i) => <li key={i}>{g}</li>)}</ul>}
                  <pre className="markdown-preview" style={{ maxHeight: 460, overflow: "auto", whiteSpace: "pre-wrap" }}>{detail.tr.body}</pre>
                </section>
                <section className="stack" style={{ gap: 6 }}>
                  <h2 className="h3">English · {detail.en?.body.split(/\s+/).length ?? 0} {t("kelime")}</h2>
                  {detail.en ? (
                    <>
                      {detail.en.goals.length > 0 && <ul className="list-tight tiny">{detail.en.goals.map((g, i) => <li key={i}>{g}</li>)}</ul>}
                      <pre className="markdown-preview" style={{ maxHeight: 460, overflow: "auto", whiteSpace: "pre-wrap" }}>{detail.en.body}</pre>
                    </>
                  ) : (
                    <p className="alert alert-info">{t("Bu dersin İngilizce çevirisi yok.")}</p>
                  )}
                </section>
              </div>

              {detail.en && (detail.headings.tr.length !== detail.headings.en.length) && (
                <p className="alert alert-warn">
                  {t("Başlık sayısı uyuşmuyor: TR {tr}, EN {en}.", { tr: detail.headings.tr.length, en: detail.headings.en.length })}
                </p>
              )}

              {detail.en && (
                <details>
                  <summary className="small muted">{t("Satır farkı ({n} değişen satır)", { n: diff.filter((d) => d.kind !== "same").length })}</summary>
                  <div className="diff" style={{ maxHeight: 320, overflow: "auto" }}>
                    {diff.map((d, i) => (
                      <div key={i} className={`diff-line diff-${d.kind}`}><span>{d.kind === "add" ? "+" : d.kind === "del" ? "−" : " "}</span> {d.text}</div>
                    ))}
                  </div>
                </details>
              )}

              {detail.en && (
                <div className="card card-b stack" style={{ gap: 8 }}>
                  <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                    <label className="tiny faint" htmlFor="stage">{t("Aşama")}</label>
                    <select id="stage" className="input" style={{ maxWidth: 220 }} value={stage} onChange={(e) => setStage(e.target.value as "TECH" | "LANGUAGE")}>
                      <option value="LANGUAGE">{t("Dil incelemesi")}</option>
                      <option value="TECH">{t("Teknik inceleme")}</option>
                    </select>
                  </div>
                  <textarea className="input" rows={3} placeholder={t("Not (geri gönderirken zorunlu)")} value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} />
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn btn-sm btn-primary" disabled={busy} onClick={() => decide("APPROVED")}>
                      {busy ? <Loader2 size={15} className="spin" aria-hidden /> : <Save size={15} aria-hidden />} {t("Onayla")}
                    </button>
                    <button className="btn btn-sm" disabled={busy} onClick={() => decide("CHANGES")}><X size={15} aria-hidden /> {t("Geri gönder")}</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>{t("Ders")}</th>
            <th>{t("Yol")}</th>
            <th>{t("Durum")}</th>
            <th>{t("Kelime TR/EN")}</th>
            <th>{t("Yapı")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {shown.map((r) => (
            <tr key={r.slug} style={{ cursor: "pointer" }} onClick={() => load(r.slug)}>
              <td>
                <div style={{ fontWeight: 550 }}>{r.title}</div>
                <div className="tiny faint">{r.enTitle ?? "—"}</div>
              </td>
              <td className="tiny">{r.track}</td>
              <td><span className={STATUS_CLASS[r.status]}>{t(STATUS_LABEL[r.status])}</span></td>
              <td className="tiny mono">{r.trWords} / {r.enWords}</td>
              <td className="tiny">
                {r.missingSections.length > 0 && <div className="badge badge-warn">{r.missingSections.join(" · ")}</div>}
                {r.bodyHashChanged && <div className="badge badge-warn">{t("Türkçe sürüm değişti")}</div>}
                {r.quiz && r.quiz.tr !== r.quiz.en && <div className="badge badge-warn">{t("Quiz soruları eksik")}</div>}
                {r.missions && r.missions.tr !== r.missions.en && <div className="badge badge-warn">{t("Görevler eksik")}</div>}
                {r.goals.tr !== r.goals.en && <div className="badge badge-warn">{t("Hedefler eksik")}</div>}
                {!r.missingSections.length && !r.bodyHashChanged && r.goals.tr === r.goals.en && !(r.quiz && r.quiz.tr !== r.quiz.en) && !(r.missions && r.missions.tr !== r.missions.en) && <span className="faint">—</span>}
              </td>
              <td><ChevronRight size={16} aria-hidden /></td>
            </tr>
          ))}
        </tbody>
      </table>

      {shown.length === 0 && <p className="muted">{t("Bu süzgeçle eşleşen ders yok.")}</p>}
      <p className="tiny faint">
        {t("Onay, içerik değişmediği sürece korunur. Türkçe metin güncellenirse çeviri yeniden incelemeye düşer.")}
      </p>
    </div>
  );
}
