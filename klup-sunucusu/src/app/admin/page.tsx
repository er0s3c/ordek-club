import type { Metadata } from "next";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { adminDashboardStats } from "@/server/members";
import { checkDatabase } from "@/server/health";
import { getSettings } from "@/server/settings";
import { formatDateTime } from "@/components/ui/format";
import { actionLabel } from "@/components/admin/audit-labels";
import { db as prisma } from "@/server/db";
import { monthRange, periodOf } from "@/server/xp/time";
import { getT, getServerMessages } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Yönetim") };
}

export default async function AdminHome() {
  const t = await getT();
  await requirePageSession(ADMIN_ROLES); // layout'a ek olarak: veri okuyan her sayfa kendini korur
  const s = await getSettings();
  const m = await getServerMessages();
  const range = monthRange(periodOf(new Date(), s.timezone), s.timezone);
  const [stats, db, monthXp] = await Promise.all([
    adminDashboardStats(s.timezone),
    checkDatabase(),
    prisma.xpTransaction.aggregate({ where: { createdAt: { gte: range.start, lt: range.end } }, _sum: { amount: true } }),
  ]);

  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">{t("Yönetim paneli")}</div>
        <h1 className="page-title">{t("Genel bakış")}</h1>
        <p className="page-sub">{t("{clubName} üyelik ve sistem durumunun özeti.", { clubName: s.clubName })}</p>
      </div>

      <div className="grid-stats">
        <div className="card stat accent"><div className="label">{t("Aktif üye")}</div><div className="value">{stats.members.active}</div><div className="hint">{t("son 30 günde giriş: {activeLast30Days}", { activeLast30Days: stats.members.activeLast30Days })}</div></div>
        <Link href="/admin/members?status=PENDING" className={`card stat${stats.members.pending ? " warn" : ""}`} style={{ color: "inherit", textDecoration: "none" }}>
          <div className="label">{t("Bekleyen başvuru")}</div><div className="value">{stats.members.pending}</div><div className="hint">{t("incelemek için tıkla")}</div>
        </Link>
        <div className="card stat"><div className="label">{t("Eğitmen")}</div><div className="value">{stats.roles.INSTRUCTOR ?? 0}</div><div className="hint">{t("yönetici: {v0}", { v0: (stats.roles.ADMIN ?? 0) + (stats.roles.OWNER ?? 0) })}</div></div>
        <Link href="/admin/xp" className="card stat" style={{ color: "inherit", textDecoration: "none" }}><div className="label">{t("Bu ay XP")}</div><div className="value">{(monthXp._sum.amount ?? 0).toLocaleString(t.intl)}</div><div className="hint">{t("kulüp genelinde")}</div></Link>
        <div className="card stat"><div className="label">{t("Açık oturum")}</div><div className="value">{stats.openSessions}</div><div className="hint">{t("devre dışı üye: {disabled}", { disabled: stats.members.disabled })}</div></div>
        <Link href="/admin/system" className="card stat" style={{ color: "inherit", textDecoration: "none" }}>
          <div className="label">{t("Sistem")}</div>
          <div className="value" style={{ fontSize: 20, marginTop: 10, color: db.ok ? "var(--term)" : "var(--red)" }}>{db.ok ? t("● Sağlıklı") : t("● Sorunlu")}</div>
          <div className="hint">{t("veritabanı {latencyMs} ms", { latencyMs: db.latencyMs })}</div>
        </Link>
      </div>

      <div className="grid-2">
        <section className="card" aria-labelledby="pending-h">
          <div className="card-h"><h2 id="pending-h">{t("Onay bekleyen başvurular")}</h2><Link className="small" href="/admin/members?status=PENDING">{t("Tümü →")}</Link></div>
          <div className="card-b flush">
            {stats.pendingList.length === 0 ? (
              <div className="empty"><Inbox size={28} aria-hidden /><div>{t("Bekleyen başvuru yok.")}</div></div>
            ) : (
              <table className="table">
                <tbody>
                  {stats.pendingList.map((u) => (
                    <tr key={u.id}>
                      <td><Link href={`/admin/members/${u.id}`}>{u.displayName}</Link><div className="tiny faint mono">@{u.username}{u.department ? ` · ${u.department}` : ""}</div></td>
                      <td className="tiny faint" style={{ textAlign: "right" }}>{formatDateTime(u.createdAt, s.timezone, t.intl)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
        <section className="card" aria-labelledby="recent-h">
          <div className="card-h"><h2 id="recent-h">{t("Son etkinlikler")}</h2><Link className="small" href="/admin/audit">{t("Denetim kaydı →")}</Link></div>
          <div className="card-b">
            {stats.recent.length === 0 ? (
              <div className="empty">{t("Henüz kayıt yok.")}</div>
            ) : (
              <ul className="timeline">
                {stats.recent.map((r) => (
                  <li key={r.id}>
                    <time dateTime={r.createdAt.toISOString()}>{formatDateTime(r.createdAt, s.timezone, t.intl)}</time>
                    <span>{actionLabel(r.action)}{r.actor ? <span className="faint"> · @{r.actor.username}</span> : null}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      <p className="tiny faint">{t("{OWNER} ve {ADMIN} rolleri bu paneli görebilir. Etkinlik, eğitim, görev, XP ve dosya yönetimi sonraki fazlarda bu menüye eklenecek.", { OWNER: m.roles.OWNER, ADMIN: m.roles.ADMIN })}</p>
    </div>
  );
}
