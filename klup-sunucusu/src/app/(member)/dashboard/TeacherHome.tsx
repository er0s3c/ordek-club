// Öğretmen ana sayfası: bugünkü oturumlar, bekleyen değerlendirmeler, öğrenci talepleri (yardım, ek süre, görüşme)
// ve açık sorun bildirimleri öne çıkar. Sayılar yalnız öğretmenin kendi görev/oturumlarından gelir (yönetici hepsini görür).
import Link from "next/link";
import type { ClubSettings } from "@prisma/client";
import { ArrowRight, Bug, CalendarClock, ClipboardCheck, Hourglass, LifeBuoy, Presentation, Radio, ShieldCheck, Users } from "lucide-react";
import { db } from "@/server/db";
import { isAdmin } from "@/server/auth/policy";
import { listActiveSessions } from "@/server/live/service";
import { pendingReviewCount } from "@/server/classroom/assignments";
import { enabledFeatures } from "@/server/learning/features";
import { StatusPill } from "@/components/ui/states";
import { formatDateTime } from "@/components/ui/format";
import { getT } from "@/i18n/server";

type User = { id: string; role: "OWNER" | "ADMIN" | "INSTRUCTOR" | "STUDENT"; status: "ACTIVE" | "PENDING" | "REJECTED" | "DISABLED"; username: string; displayName: string };

export async function TeacherHome({ user, firstName, settings: s }: { user: User; firstName: string; settings: ClubSettings }) {
  const t = await getT();
  const actor = { id: user.id, role: user.role, status: user.status };
  const admin = isAdmin(user.role);
  const mine = admin ? {} : { assignment: { createdById: user.id } };
  const now = new Date();
  const dayEnd = new Date(now.getTime() + 24 * 3600_000);
  const f = await enabledFeatures(["teacher-plus", "club-ops"]);
  const [live, toReview, extensions, help, issues, bookings, pending, recentDue] = await Promise.all([
    listActiveSessions(),
    pendingReviewCount(actor),
    db.extensionRequest.findMany({ where: { status: "PENDING", ...mine }, include: { user: { select: { displayName: true } }, assignment: { select: { id: true, title: true } } }, orderBy: { createdAt: "asc" }, take: 5 }),
    db.helpRequest.count({ where: { resolvedAt: null, session: { status: "ACTIVE", ...(admin ? {} : { hostId: user.id }) } } }),
    db.issueReport.count({ where: { status: { in: ["RECEIVED", "REVIEWING"] } } }),
    f["club-ops"] ? db.officeHourBooking.findMany({ where: { status: "BOOKED", slot: { hostId: user.id, startsAt: { gte: now, lte: new Date(now.getTime() + 7 * 86_400_000) } } }, include: { user: { select: { displayName: true } }, slot: { select: { startsAt: true } } }, orderBy: { slot: { startsAt: "asc" } }, take: 5 }) : Promise.resolve([]),
    admin ? db.user.count({ where: { status: "PENDING" } }) : Promise.resolve(0),
    db.assignment.findMany({ where: { status: "PUBLISHED", dueAt: { gte: now, lte: dayEnd }, ...(admin ? {} : { createdById: user.id }) }, select: { id: true, title: true, dueAt: true }, orderBy: { dueAt: "asc" }, take: 5 }),
  ]);
  const myLive = live.filter((x) => admin || x.hostId === user.id);

  return (
    <div className="stack-lg fade-up">
      <header className="page-head row-between" style={{ marginBottom: 0 }}>
        <div>
          <div className="eyebrow">{t("{clubName} · Eğitmen", { clubName: s.clubName })}</div>
          <h1 className="page-title">{t("Merhaba,")}{" "}<em>{firstName}</em></h1>
        </div>
        <Link className="btn btn-primary" href="/teach"><Presentation size={16} aria-hidden />{" "}{t("Ders başlat")}</Link>
      </header>

      <div className="grid-stats">
        <Link href={f["teacher-plus"] ? "/teach/queue" : "/teach/tasks"} className="card stat card-stat home-stat"><div className="label"><ClipboardCheck size={14} aria-hidden />{" "}{t("Bekleyen değerlendirme")}</div><div className="value">{toReview}</div><div className="hint">{toReview ? t("Kuyruğu aç →") : t("Hepsi tamam")}</div></Link>
        <div className="card stat card-stat"><div className="label"><Hourglass size={14} aria-hidden />{" "}{t("Ek süre talebi")}</div><div className="value">{extensions.length}</div><div className="hint">{extensions.length ? t("Aşağıda listelendi") : t("Bekleyen yok")}</div></div>
        <div className="card stat card-stat"><div className="label"><LifeBuoy size={14} aria-hidden />{" "}{t("Canlı yardım talebi")}</div><div className="value">{help}</div><div className="hint">{myLive.length ? t("Oturum konsolunda") : t("Aktif oturum yok")}</div></div>
        <Link href="/teach/issues" className="card stat card-stat home-stat"><div className="label"><Bug size={14} aria-hidden />{" "}{t("Açık sorun bildirimi")}</div><div className="value">{issues}</div><div className="hint">{t("İncele →")}</div></Link>
      </div>

      <section className="card card-primary" aria-labelledby="today-h">
        <div className="card-h"><h2 id="today-h"><Radio size={16} aria-hidden />{" "}{t("Bugünkü oturumlar")}</h2><Link className="small" href="/teach">{t("Eğitmen paneli →")}</Link></div>
        <div className="card-b">
          {myLive.length ? (
            <ul className="list-tight">
              {myLive.map((x) => (
                <li key={x.id}>
                  <span className="dot on" aria-hidden />
                  <span style={{ flex: 1 }}><strong>{x.title}</strong><span className="tiny faint">{" "}{t("· kod {code} · {online} çevrimiçi", { code: x.code, online: x.online })}</span></span>
                  <Link className="btn btn-sm btn-primary" href={`/teach/live/${x.id}`}>{t("Konsolu aç")}{" "}<ArrowRight size={14} aria-hidden /></Link>
                </li>
              ))}
            </ul>
          ) : <p className="muted" style={{ margin: 0 }}>{t("Şu an yürüttüğün canlı oturum yok. Bir sunum seçip ders başlatabilirsin.")}</p>}
          {recentDue.length > 0 && (
            <>
              <div className="eyebrow" style={{ marginTop: 16 }}>{t("24 saat içinde son tarihi gelen görevler")}</div>
              <ul className="list-tight">{recentDue.map((a) => <li key={a.id}><span style={{ flex: 1 }}><Link href={`/teach/tasks/${a.id}`}>{a.title}</Link></span><span className="tiny faint">{formatDateTime(a.dueAt, s.timezone, t.intl)}</span></li>)}</ul>
            </>
          )}
        </div>
      </section>

      <div className="grid-2">
        <section className="card" aria-labelledby="ext-h">
          <div className="card-h"><h2 id="ext-h"><Hourglass size={16} aria-hidden />{" "}{t("Ek süre talepleri")}</h2></div>
          <div className="card-b">
            {extensions.length ? (
              <ul className="list-tight">
                {extensions.map((e) => (
                  <li key={e.id}>
                    <span style={{ flex: 1, minWidth: 0 }}><strong>{e.user.displayName}</strong> · <Link href={`/teach/tasks/${e.assignment.id}#extensions`}>{e.assignment.title}</Link><span className="tiny faint" style={{ display: "block", overflowWrap: "anywhere" }}>{e.reason.slice(0, 120)}</span></span>
                    <StatusPill tone="warn">{t("karar bekliyor")}</StatusPill>
                  </li>
                ))}
              </ul>
            ) : <p className="muted small" style={{ margin: 0 }}>{t("Bekleyen ek süre talebi yok.")}</p>}
          </div>
        </section>
        <section className="card" aria-labelledby="oh-h">
          <div className="card-h"><h2 id="oh-h"><CalendarClock size={16} aria-hidden />{" "}{t("Yaklaşan görüşmeler")}</h2>{f["club-ops"] && <Link className="small" href="/club/office-hours">{t("Saatlerim →")}</Link>}</div>
          <div className="card-b">
            {!f["club-ops"] ? <p className="muted small" style={{ margin: 0 }}>{t("Görüşme saatleri “Kulüp işleri” özelliği açılınca kullanılabilir.")}</p>
              : bookings.length ? <ul className="list-tight">{bookings.map((b) => <li key={b.id}><span style={{ flex: 1, minWidth: 0 }}><strong>{b.user.displayName}</strong><span className="tiny faint" style={{ display: "block" }}>{b.topic}</span></span><span className="tiny faint">{formatDateTime(b.slot.startsAt, s.timezone, t.intl)}</span></li>)}</ul>
              : <p className="muted small" style={{ margin: 0 }}>{t("Önümüzdeki 7 günde görüşme kaydı yok.")}</p>}
          </div>
        </section>
      </div>

      {admin && (
        <section className="card card-quiet" aria-labelledby="admin-h">
          <div className="card-h"><h2 id="admin-h"><ShieldCheck size={14} aria-hidden />{" "}{t("Yönetim")}</h2></div>
          <div className="card-b row-between">
            <span className="muted">{pending > 0 ? <><strong>{pending}</strong>{" "}{t("üyelik başvurusu onay bekliyor.")}</> : t("Bekleyen üyelik başvurusu yok.")}</span>
            <Link className="btn btn-sm" href={pending > 0 ? "/admin/members?status=PENDING" : "/admin"}><Users size={14} aria-hidden /> {pending > 0 ? t("Başvuruları incele") : t("Yönetim paneli")}</Link>
          </div>
        </section>
      )}
    </div>
  );
}
