import type { Metadata } from "next";
import { Megaphone, Pin } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { isAdmin, isStaff } from "@/server/auth/policy";
import { listAnnouncements } from "@/server/classroom/announcements";
import { getSettings } from "@/server/settings";
import { formatDateTime } from "@/components/ui/format";
import { AnnouncementForm, DeleteAnnouncement } from "./AnnouncementsClient";

export const metadata: Metadata = { title: "Duyurular" };

export default async function AnnouncementsPage() {
  const { user } = await requirePageSession();
  const [items, s] = await Promise.all([listAnnouncements({ id: user.id, role: user.role, status: user.status }), getSettings()]);
  const staff = isStaff(user.role);
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">Kulüp</div>
        <h1 className="page-title">Duyurular</h1>
        <p className="page-sub">Ders, etkinlik ve kulüp duyuruları. Yeni duyurular bildirim olarak da gelir.</p>
      </div>
      {staff && <AnnouncementForm />}
      <section className="card">
        {!items.length ? (
          <div className="empty"><Megaphone size={28} aria-hidden /><div>Henüz duyuru yok.</div></div>
        ) : (
          items.map((a) => (
            <article key={a.id} className={a.pinned ? "ann is-pinned" : "ann"}>
              <div className="row-between">
                <h3>{a.pinned && <Pin size={15} color="var(--gold)" aria-label="sabitlenmiş" />} {a.title}</h3>
                <div className="row small">
                  {a.audience === "STAFF" && <span className="badge badge-violet">yalnız personel</span>}
                  {(isAdmin(user.role) || (staff && a.createdById === user.id)) && <DeleteAnnouncement id={a.id} title={a.title} />}
                </div>
              </div>
              {a.body && <div className="prose-plain">{a.body}</div>}
              <div className="tiny faint">{a.createdBy?.displayName ?? "—"} · {formatDateTime(a.createdAt, s.timezone)}{a.expiresAt && ` · ${formatDateTime(a.expiresAt, s.timezone)} tarihine kadar`}</div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
