import type { Metadata } from "next";
import { Megaphone, Pin } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { isAdmin, isStaff } from "@/server/auth/policy";
import { listAnnouncements, markAnnouncementsRead, readRates } from "@/server/classroom/announcements";
import { StatusPill } from "@/components/ui/states";
import { getSettings } from "@/server/settings";
import { formatDateTime } from "@/components/ui/format";
import { AnnouncementForm, DeleteAnnouncement } from "./AnnouncementsClient";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Duyurular") };
}

export default async function AnnouncementsPage() {
  const t = await getT();
  const { user } = await requirePageSession();
  const [items, s] = await Promise.all([listAnnouncements({ id: user.id, role: user.role, status: user.status }), getSettings()]);
  const staff = isStaff(user.role);
  // Görünen duyurular okundu sayılır; personel okunma oranını ve planlı duyuruları görür.
  await markAnnouncementsRead(user.id, items.filter((a) => a.publishAt <= new Date()).map((a) => a.id));
  const rates = staff ? await readRates(items.map((a) => a.id)) : new Map<string, { read: number; total: number }>();
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">{t("Kulüp")}</div>
        <h1 className="page-title">{t("Duyurular")}</h1>
        <p className="page-sub">{t("Ders, etkinlik ve kulüp duyuruları. Yeni duyurular bildirim olarak da gelir.")}</p>
      </div>
      {staff && <AnnouncementForm />}
      <section className="card">
        {!items.length ? (
          <div className="empty"><Megaphone size={28} aria-hidden /><div>{t("Henüz duyuru yok.")}</div></div>
        ) : (
          items.map((a) => (
            <article key={a.id} id={`a-${a.id}`} className={a.pinned ? "ann is-pinned" : "ann"}>
              <div className="row-between">
                <h3>{a.pinned && <Pin size={15} color="var(--gold)" aria-label={t("sabitlenmiş")} />} {a.title}</h3>
                <div className="row small">
                  {a.audience === "STAFF" && <span className="badge badge-violet">{t("yalnız personel")}</span>}
                  {(isAdmin(user.role) || (staff && a.createdById === user.id)) && <DeleteAnnouncement id={a.id} title={a.title} />}
                </div>
              </div>
              {a.body && <div className="prose-plain">{a.body}</div>}
              <div className="tiny faint">{a.createdBy?.displayName ?? "—"} · {formatDateTime(a.createdAt, s.timezone, t.intl)}{a.expiresAt && t(" · {v0} tarihine kadar", { v0: formatDateTime(a.expiresAt, s.timezone, t.intl) })}
                {staff && a.publishAt > new Date() && <> <StatusPill tone="info">{t("{v0} yayınlanacak", { v0: formatDateTime(a.publishAt, s.timezone, t.intl) })}</StatusPill></>}
                {staff && rates.get(a.id) && a.publishAt <= new Date() && <>{" "}{t("· okunma %{v0} ({read}/{total})", { v0: Math.round((rates.get(a.id)!.read / Math.max(1, rates.get(a.id)!.total)) * 100), read: rates.get(a.id)!.read, total: rates.get(a.id)!.total })}</>}</div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
