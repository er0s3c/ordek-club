import type { Metadata } from "next";
import Link from "next/link";
import { Bug } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { ISSUE_KIND_LABEL, ISSUE_LABEL, myIssues } from "@/server/issues";
import { EmptyState, StatusPill, type Tone } from "@/components/ui/states";
import { IssueButton } from "@/components/academy/LessonExtras";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Sorun bildirimlerim") };
}
const TONE: Record<string, Tone> = { RECEIVED: "info", REVIEWING: "warn", FIXED: "ok", REJECTED: "neutral" };

export default async function ReportsPage() {
  const t = await getT();
  const { user } = await requirePageSession();
  const rows = await myIssues({ id: user.id, role: user.role, status: user.status });
  return (
    <div className="stack fade-up">
      <header className="page-head row-between">
        <div><div className="eyebrow">{t("Destek")}</div><h1 className="page-title">{t("Sorun bildirimlerim")}</h1><p className="page-sub">{t("Ders hatası ve teknik sorun bildirimlerinin takip numarası ve durumu.")}</p></div>
        <IssueButton location="/reports" />
      </header>
      {rows.length === 0 ? <div className="card"><EmptyState duck="sleep" title={t("Henüz bildirimin yok")} text={t("Bir derste hata görürsen ders başlığındaki “Hata bildir” düğmesini kullan.")} /></div> : (
        <div className="stack">
          {rows.map((r) => (
            <article key={r.id} className="card" aria-labelledby={`i-${r.id}`}>
              <div className="card-h"><h2 id={`i-${r.id}`}><Bug size={15} aria-hidden /> {r.no} · {t(ISSUE_KIND_LABEL[r.kind as keyof typeof ISSUE_KIND_LABEL] ?? r.kind)}</h2><StatusPill tone={TONE[r.status] ?? "neutral"}>{ISSUE_LABEL[r.status as keyof typeof ISSUE_LABEL] ?? r.status}</StatusPill></div>
              <div className="card-b stack-sm">
                {r.lesson && <span className="tiny faint">{t("Ders:")}{" "}<Link href={`/academy/lesson/${r.lesson.slug}`}>{r.lesson.title}</Link></span>}
                <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{r.body}</p>
                <ol className="timeline">{r.history.map((h, i) => <li key={i}><time>{new Date(h.at).toLocaleString(t.intl)}</time><span><strong>{ISSUE_LABEL[h.status as keyof typeof ISSUE_LABEL] ?? h.status}</strong>{h.note && <> · {h.note}</>}</span></li>)}</ol>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
