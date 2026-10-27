import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Download, MapPin } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { pageFeature } from "@/server/learning/page-features";
import { eventCalendar } from "@/server/club/events";
import { getSettings } from "@/server/settings";
import { formatDateTime } from "@/components/ui/format";
import { EmptyState, StatusPill } from "@/components/ui/states";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Etkinlik takvimi") };
}

export default async function EventsPage() {
  const t = await getT();
  const { user } = await requirePageSession();
  await pageFeature("club-ops");
  const [{ events, history }, s] = await Promise.all([eventCalendar(user.id), getSettings()]);
  const now = Date.now();
  const upcoming = events.filter((e) => !e.startsAt || Date.parse(e.endsAt ?? e.startsAt) >= now);
  const past = events.filter((e) => e.startsAt && Date.parse(e.endsAt ?? e.startsAt) < now).reverse();
  // Ay ay gruplanmış liste (takvim görünümü); dar ekranda da okunur.
  const months = new Map<string, typeof upcoming>();
  for (const e of upcoming) { const k = e.startsAt ? new Date(e.startsAt).toLocaleDateString(t.intl, { month: "long", year: "numeric", timeZone: s.timezone }) : "Tarihi belirsiz"; months.set(k, [...(months.get(k) ?? []), e]); }
  return (
    <div className="stack fade-up">
      <header className="page-head row-between">
        <div><div className="eyebrow">{t("Kulüp")}</div><h1 className="page-title">{t("Etkinlik takvimi")}</h1><p className="page-sub">{t("Yaklaşan etkinlikler ve katılım geçmişin. Takvimi kendi uygulamana aktarabilirsin.")}</p></div>
        <a className="btn btn-sm" href="/api/events/calendar" download><Download size={14} aria-hidden />{" "}{t("Takvime ekle (.ics)")}</a>
      </header>
      {upcoming.length === 0 ? <EmptyState icon={CalendarDays} title={t("Yaklaşan etkinlik yok")} /> : [...months.entries()].map(([month, list]) => (
        <section key={month} className="stack-sm" aria-label={month}>
          <h2 className="section-title">{month}</h2>
          <div className="grid-2">
            {list.map((e) => (
              <Link key={e.id} href={`/groups/${e.id}`} className="card card-b stack-sm workshop-card">
                <div className="row-between"><strong>{e.name}</strong>{e.joined ? <StatusPill tone="ok">{t("kayıtlısın")}</StatusPill> : e.capacity !== null && e.members >= e.capacity ? <StatusPill tone="warn">{t("dolu · bekleme listesi")}</StatusPill> : e.selfJoin ? <StatusPill tone="info">{t("kayıt açık")}</StatusPill> : null}</div>
                <span className="small muted"><CalendarDays size={13} aria-hidden /> {e.startsAt ? formatDateTime(new Date(e.startsAt), s.timezone, t.intl) : t("tarih belirsiz")}{e.location && <> · <MapPin size={13} aria-hidden /> {e.location}</>}</span>
                <span className="tiny faint">{e.members}{e.capacity !== null ? ` / ${e.capacity}` : ""}{" "}{t("katılımcı")}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
      <div className="grid-2" style={{ alignItems: "start" }}>
        <section className="card" aria-labelledby="hist-h">
          <div className="card-h"><h2 id="hist-h">{t("Katılım geçmişim")}</h2><span className="tiny faint">{t("öğrenme başarımından ayrı")}</span></div>
          <div className="card-b">{history.length ? <ul className="timeline">{history.map((h) => <li key={h.id + h.at}><time>{new Date(h.at).toLocaleDateString(t.intl)}</time><span><Link href={`/groups/${h.id}`}>{h.name}</Link> <span className="tiny faint">{h.method === "MANUAL" ? t("· elle") : t("· kodla")}</span></span></li>)}</ul> : <p className="small muted" style={{ margin: 0 }}>{t("Henüz doğrulanmış katılımın yok.")}</p>}</div>
        </section>
        <section className="card card-quiet" aria-labelledby="past-h">
          <div className="card-h"><h2 id="past-h">{t("Geçmiş etkinlikler")}</h2></div>
          <div className="card-b">{past.length ? <ul className="list-tight">{past.slice(0, 10).map((e) => <li key={e.id}><Link href={`/groups/${e.id}`} style={{ flex: 1 }}>{e.name}</Link><span className="tiny faint">{e.startsAt ? new Date(e.startsAt).toLocaleDateString(t.intl) : ""}</span></li>)}</ul> : <p className="small muted" style={{ margin: 0 }}>{t("Son 30 günde etkinlik yok.")}</p>}</div>
        </section>
      </div>
    </div>
  );
}
