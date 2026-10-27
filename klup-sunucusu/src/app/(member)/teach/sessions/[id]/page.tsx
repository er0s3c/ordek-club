import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { getSummary } from "@/server/live/service";
import { RoleSummary, MissedSummaryButton } from "./SessionExtras";
import { HttpError } from "@/server/errors";
import { getSettings } from "@/server/settings";
import { formatDateTime } from "@/components/ui/format";
import { getT, getServerMessages } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Ders özeti") };
}

const mins = (ms: number) => `${Math.round(ms / 60000)} dk`;

export default async function SessionSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getT();
  const { user } = await requirePageSession(STAFF_ROLES);
  const { id } = await params;
  const s = await getSummary({ id: user.id, role: user.role, status: user.status }, id).catch((e) => {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  });
  if (!s) notFound();
  const settings = await getSettings();
  const m = await getServerMessages();
  const tz = settings.timezone;
  const students = s.participants.filter((p) => p.role === "STUDENT");

  return (
    <div className="stack fade-up">
      <Link href="/teach" className="small row" style={{ gap: 6 }}><ArrowLeft size={14} aria-hidden />{" "}{t("Eğitmen paneli")}</Link>
      <div className="page-head">
        <div className="eyebrow">{t("Ders özeti ·")}{" "}{s.status === "ACTIVE" ? t("devam ediyor") : t("tamamlandı")}</div>
        <h1 className="page-title">{s.title}</h1>
        <p className="page-sub">{t("{v0} · {v1} · eğitmen: {v2} · kod", { v0: formatDateTime(s.startedAt, tz, t.intl), v1: mins(s.durationMs), v2: s.host?.displayName ?? "—" })}{" "}<span className="mono">{s.code}</span></p>
      </div>
      {s.exitTickets.length > 0 && <section className="card card-b stack"><h2>{t("Çıkış biletleri")}</h2>{s.exitTickets.map(q => <p key={q.id}><strong>{q.question}</strong><br />{t("{correct}/{total} doğru yanıt", { correct: q.correct, total: q.total })}</p>)}</section>}
      {s.operation && <RoleSummary operationId={s.operation.id} />}
      <MissedSummaryButton sessionId={s.id} />
      {s.operation && <section className="card card-b"><h2>{t("Operasyon zaman çizelgesi")}</h2><ol>{(s.operation.history as { stage: number; outcome: string }[]).map(h => <li key={h.stage}>{h.outcome}</li>)}</ol></section>}
      <div className="grid-stats">
        <div className="card stat accent"><div className="label">{t("Katılımcı")}</div><div className="value">{s.participants.length}</div><div className="hint">{t("öğrenci: {length}", { length: students.length })}</div></div>
        <div className="card stat"><div className="label">{t("Ort. katılım")}</div><div className="value">{s.participants.length ? Math.round(s.participants.reduce((a, p) => a + p.attendancePct, 0) / s.participants.length) : 0}%</div><div className="hint">{t("bağlı kalınan süre / ders süresi")}</div></div>
        <div className="card stat"><div className="label">{t("Soru")}</div><div className="value">{s.questions.length}</div><div className="hint">{t("yanıtlanan: {length}", { length: s.questions.filter((q) => q.resolved).length })}</div></div>
        <div className="card stat"><div className="label">{t("El kaldırma")}</div><div className="value">{s.handRaises}</div><div className="hint">{t("duyuru: {length}", { length: s.announcements.length })}</div></div>
      </div>
      <section className="card">
        <div className="card-h"><h2>{t("Katılım listesi")}</h2></div>
        <div className="card-b flush">
          {s.participants.length === 0 ? <div className="empty">{t("Katılan olmadı.")}</div> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>{t("Üye")}</th><th>{t("Rol")}</th><th>{t("İlk katılım")}</th><th className="num">{t("Süre")}</th><th className="num">{t("Katılım")}</th><th className="num">{t("Bağlantı")}</th></tr></thead>
                <tbody>
                  {s.participants.map((p) => (
                    <tr key={p.userId}>
                      <td>{p.displayName}<div className="tiny faint mono">@{p.username}</div></td>
                      <td className="small">{m.roles[p.role]}</td>
                      <td className="tiny faint">{formatDateTime(p.firstJoinAt, tz, t.intl)}</td>
                      <td className="num">{mins(p.connectedMs)}</td>
                      <td className="num"><span className={p.attendancePct >= 75 ? "badge badge-lime" : p.attendancePct >= 40 ? "badge badge-amber" : "badge badge-red"}>{p.attendancePct}%</span></td>
                      <td className="num">{p.connectCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      <div className="grid-2">
        <section className="card">
          <div className="card-h"><h2>{t("Sorular")}</h2></div>
          <div className="card-b">
            {s.questions.length === 0 ? <p className="muted" style={{ margin: 0 }}>{t("Soru gelmedi.")}</p> : (
              <ul className="list-tight">
                {s.questions.map((q) => (
                  <li key={q.id} style={{ alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}><div style={{ whiteSpace: "pre-wrap" }}>{q.text}</div><div className="tiny faint">{q.by} · {formatDateTime(q.at, tz, t.intl)}</div></div>
                    {q.resolved && <span className="badge badge-lime">{t("yanıtlandı")}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <section className="card">
          <div className="card-h"><h2>{t("Duyurular")}</h2></div>
          <div className="card-b">
            {s.announcements.length === 0 ? <p className="muted" style={{ margin: 0 }}>{t("Duyuru yapılmadı.")}</p> : (
              <ul className="timeline">{s.announcements.map((a) => <li key={a.id}><time>{formatDateTime(a.at, tz, t.intl)}</time><span>{a.text}</span></li>)}</ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
