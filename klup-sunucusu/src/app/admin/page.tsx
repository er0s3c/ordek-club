import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { adminDashboardStats } from "@/server/members";
import { checkDatabase } from "@/server/health";
import { getSettings } from "@/server/settings";
import { getMessages } from "@/i18n";
import { formatDateTime } from "@/components/ui/format";
import { actionLabel } from "@/components/admin/audit-labels";

export const metadata: Metadata = { title: "Yönetim" };

export default async function AdminHome() {
  await requirePageSession(ADMIN_ROLES); // layout'a ek olarak: veri okuyan her sayfa kendini korur
  const s = await getSettings();
  const m = getMessages(s.locale);
  const [stats, db] = await Promise.all([adminDashboardStats(s.timezone), checkDatabase()]);

  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">Yönetim paneli</div>
        <h1 className="page-title">Genel bakış</h1>
        <p className="page-sub">{s.clubName} üyelik ve sistem durumunun özeti.</p>
      </div>

      <div className="grid-stats">
        <div className="card stat accent"><div className="label">Aktif üye</div><div className="value">{stats.members.active}</div><div className="hint">son 30 günde giriş: {stats.members.activeLast30Days}</div></div>
        <Link href="/admin/members?status=PENDING" className={`card stat${stats.members.pending ? " warn" : ""}`} style={{ color: "inherit", textDecoration: "none" }}>
          <div className="label">Bekleyen başvuru</div><div className="value">{stats.members.pending}</div><div className="hint">incelemek için tıkla</div>
        </Link>
        <div className="card stat"><div className="label">Eğitmen</div><div className="value">{stats.roles.INSTRUCTOR ?? 0}</div><div className="hint">yönetici: {(stats.roles.ADMIN ?? 0) + (stats.roles.OWNER ?? 0)}</div></div>
        <div className="card stat"><div className="label">Açık oturum</div><div className="value">{stats.openSessions}</div><div className="hint">devre dışı üye: {stats.members.disabled}</div></div>
        <Link href="/admin/system" className="card stat" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="label">Sistem</div>
          <div className="value" style={{ fontSize: 20, marginTop: 10, color: db.ok ? "var(--term)" : "var(--red)" }}>{db.ok ? "● Sağlıklı" : "● Sorunlu"}</div>
          <div className="hint">veritabanı {db.latencyMs} ms</div>
        </Link>
      </div>

      <div className="grid-2">
        <section className="card" aria-labelledby="pending-h">
          <div className="card-h"><h2 id="pending-h">Onay bekleyen başvurular</h2><Link className="small" href="/admin/members?status=PENDING">Tümü →</Link></div>
          <div className="card-b flush">
            {stats.pendingList.length === 0 ? (
              <div className="empty"><Inbox size={28} aria-hidden /><div>Bekleyen başvuru yok.</div></div>
            ) : (
              <table className="table">
                <tbody>
                  {stats.pendingList.map((u) => (
                    <tr key={u.id}>
                      <td><Link href={`/admin/members/${u.id}`}>{u.displayName}</Link><div className="tiny faint mono">@{u.username}{u.department ? ` · ${u.department}` : ""}</div></td>
                      <td className="tiny faint" style={{ textAlign: "right" }}>{formatDateTime(u.createdAt, s.timezone)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
        <section className="card" aria-labelledby="recent-h">
          <div className="card-h"><h2 id="recent-h">Son etkinlikler</h2><Link className="small" href="/admin/audit">Denetim kaydı →</Link></div>
          <div className="card-b">
            {stats.recent.length === 0 ? (
              <div className="empty">Henüz kayıt yok.</div>
            ) : (
              <ul className="timeline">
                {stats.recent.map((r) => (
                  <li key={r.id}>
                    <time dateTime={r.createdAt.toISOString()}>{formatDateTime(r.createdAt, s.timezone)}</time>
                    <span>{actionLabel(r.action)}{r.actor ? <span className="faint"> · @{r.actor.username}</span> : null}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      <p className="tiny faint">{m.roles.OWNER} ve {m.roles.ADMIN} rolleri bu paneli görebilir. Etkinlik, eğitim, görev, XP ve dosya yönetimi sonraki fazlarda bu menüye eklenecek.</p>
    </div>
  );
}
