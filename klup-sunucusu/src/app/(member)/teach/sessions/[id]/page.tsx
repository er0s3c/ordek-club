import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { getSummary } from "@/server/live/service";
import { HttpError } from "@/server/errors";
import { getSettings } from "@/server/settings";
import { getMessages } from "@/i18n";
import { formatDateTime } from "@/components/ui/format";

export const metadata: Metadata = { title: "Ders özeti" };

const mins = (ms: number) => `${Math.round(ms / 60000)} dk`;

export default async function SessionSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requirePageSession(STAFF_ROLES);
  const { id } = await params;
  const s = await getSummary({ id: user.id, role: user.role, status: user.status }, id).catch((e) => {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  });
  if (!s) notFound();
  const settings = await getSettings();
  const m = getMessages(settings.locale);
  const tz = settings.timezone;
  const students = s.participants.filter((p) => p.role === "STUDENT");

  return (
    <div className="stack fade-up">
      <Link href="/teach" className="small row" style={{ gap: 6 }}><ArrowLeft size={14} aria-hidden /> Eğitmen paneli</Link>
      <div className="page-head">
        <div className="eyebrow">Ders özeti · {s.status === "ACTIVE" ? "devam ediyor" : "tamamlandı"}</div>
        <h1 className="page-title">{s.title}</h1>
        <p className="page-sub">{formatDateTime(s.startedAt, tz)} · {mins(s.durationMs)} · eğitmen: {s.host?.displayName ?? "—"} · kod <span className="mono">{s.code}</span></p>
      </div>
      <div className="grid-stats">
        <div className="card stat accent"><div className="label">Katılımcı</div><div className="value">{s.participants.length}</div><div className="hint">öğrenci: {students.length}</div></div>
        <div className="card stat"><div className="label">Ort. katılım</div><div className="value">{s.participants.length ? Math.round(s.participants.reduce((a, p) => a + p.attendancePct, 0) / s.participants.length) : 0}%</div><div className="hint">bağlı kalınan süre / ders süresi</div></div>
        <div className="card stat"><div className="label">Soru</div><div className="value">{s.questions.length}</div><div className="hint">yanıtlanan: {s.questions.filter((q) => q.resolved).length}</div></div>
        <div className="card stat"><div className="label">El kaldırma</div><div className="value">{s.handRaises}</div><div className="hint">duyuru: {s.announcements.length}</div></div>
      </div>
      <section className="card">
        <div className="card-h"><h2>Katılım listesi</h2></div>
        <div className="card-b flush">
          {s.participants.length === 0 ? <div className="empty">Katılan olmadı.</div> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Üye</th><th>Rol</th><th>İlk katılım</th><th className="num">Süre</th><th className="num">Katılım</th><th className="num">Bağlantı</th></tr></thead>
                <tbody>
                  {s.participants.map((p) => (
                    <tr key={p.userId}>
                      <td>{p.displayName}<div className="tiny faint mono">@{p.username}</div></td>
                      <td className="small">{m.roles[p.role]}</td>
                      <td className="tiny faint">{formatDateTime(p.firstJoinAt, tz)}</td>
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
          <div className="card-h"><h2>Sorular</h2></div>
          <div className="card-b">
            {s.questions.length === 0 ? <p className="muted" style={{ margin: 0 }}>Soru gelmedi.</p> : (
              <ul className="list-tight">
                {s.questions.map((q) => (
                  <li key={q.id} style={{ alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}><div style={{ whiteSpace: "pre-wrap" }}>{q.text}</div><div className="tiny faint">{q.by} · {formatDateTime(q.at, tz)}</div></div>
                    {q.resolved && <span className="badge badge-lime">yanıtlandı</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
        <section className="card">
          <div className="card-h"><h2>Duyurular</h2></div>
          <div className="card-b">
            {s.announcements.length === 0 ? <p className="muted" style={{ margin: 0 }}>Duyuru yapılmadı.</p> : (
              <ul className="timeline">{s.announcements.map((a) => <li key={a.id}><time>{formatDateTime(a.at, tz)}</time><span>{a.text}</span></li>)}</ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
