"use client";
// Rapor Atölyesi rubrikli geri bildirimi: kanıt kalitesi, açıklık, etki ve çözüm önerisi ayrı değerlendirilir;
// öğrenci hangi kısmı geliştirmesi gerektiğini görür.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { StatusPill } from "@/components/ui/states";
import { useT } from "@/i18n/client";

export const REPORT_RUBRIC = [
  { key: "evidence", label: "Kanıt kalitesi", hint: "Bulgu tekrar üretilebilir mi, kanıt yeterli mi?" },
  { key: "clarity", label: "Açıklık", hint: "Teknik olmayan biri ne olduğunu anlayabilir mi?" },
  { key: "impact", label: "Etki", hint: "Etki ve sınırlar abartısız, gerçekçi mi?" },
  { key: "fix", label: "Çözüm önerisi", hint: "Uygulanabilir, en az ayrıcalığa uygun bir düzeltme var mı?" },
] as const;
export const REPORT_MAX = 5;

export function ReportReview({ status, scores, feedback }: { status: string; scores: number[] | null; feedback: string }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  async function submit() {
    setBusy(true);
    try { await api("/api/learning/practice", { body: { action: "report.submit" } }); toast("ok", t("Raporun incelemeye gönderildi.")); router.refresh(); }
    catch (e) { toast("error", (e as Error).message); } finally { setBusy(false); }
  }
  return (
    <section className="card" aria-labelledby="rr-h">
      <div className="card-h"><h2 id="rr-h">{t("Rapor değerlendirmesi")}</h2>{status === "REVIEWED" ? <StatusPill tone="ok">{t("değerlendirildi")}</StatusPill> : status === "SUBMITTED" ? <StatusPill tone="warn">{t("incelemede")}</StatusPill> : <StatusPill tone="neutral">{t("taslak")}</StatusPill>}</div>
      <div className="card-b stack">
        {status === "REVIEWED" && scores ? (
          <>
            <ul className="list-tight">
              {REPORT_RUBRIC.map((r, i) => (
                <li key={r.key} className="stack-sm" style={{ alignItems: "stretch" }}>
                  <div className="row-between"><strong>{t(r.label)}</strong><span className="mono">{scores[i] ?? 0}/{REPORT_MAX}</span></div>
                  <div className="bar" role="img" aria-label={`${t(r.label)}: ${scores[i] ?? 0}/${REPORT_MAX}`}><span style={{ width: `${((scores[i] ?? 0) / REPORT_MAX) * 100}%` }} /></div>
                  {(scores[i] ?? 0) < 3 && <span className="tiny faint">{t("Geliştir: {hint}", { hint: t(r.hint) })}</span>}
                </li>
              ))}
            </ul>
            {feedback && <div className="alert alert-info small"><span style={{ whiteSpace: "pre-wrap" }}><strong>{t("Öğretmen notu:")}</strong> {feedback}</span></div>}
            <p className="tiny faint" style={{ margin: 0 }}>{t("Raporu düzenleyip yeniden kaydedersen taslağa döner ve tekrar incelemeye gönderebilirsin.")}</p>
          </>
        ) : status === "SUBMITTED" ? <p className="small muted" style={{ margin: 0 }}>{t("Öğretmenin raporunu dört ölçütle değerlendirecek: {v0}.", { v0: REPORT_RUBRIC.map((r) => t(r.label)).join(", ") })}</p> : (
          <>
            <p className="small muted" style={{ margin: 0 }}>{t("Taslağın hazırsa öğretmenine gönder;")}{" "}{REPORT_RUBRIC.map((r) => t(r.label).toLocaleLowerCase()).join(", ")}{" "}{t("ayrı ayrı değerlendirilir.")}</p>
            <div><button type="button" className="btn btn-sm btn-primary" disabled={busy} onClick={submit}><Send size={14} aria-hidden />{" "}{t("İncelemeye gönder")}</button></div>
          </>
        )}
      </div>
    </section>
  );
}
