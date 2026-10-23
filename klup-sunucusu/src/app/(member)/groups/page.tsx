import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, School, Users } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { isStaff } from "@/server/auth/policy";
import { listGroups } from "@/server/classroom/groups";
import { getSettings } from "@/server/settings";
import { formatDateTime } from "@/components/ui/format";
import { GroupForm, JoinButton } from "./GroupsClient";

export const metadata: Metadata = { title: "Sınıflar ve etkinlikler" };

export default async function GroupsPage() {
  const { user } = await requirePageSession();
  const [items, s] = await Promise.all([listGroups({ id: user.id, role: user.role, status: user.status }), getSettings()]);
  const staff = isStaff(user.role);
  const classes = items.filter((g) => g.kind === "CLASS");
  const events = items.filter((g) => g.kind === "EVENT");
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">Sınıf</div>
        <h1 className="page-title">Sınıflar ve etkinlikler</h1>
        <p className="page-sub">{staff ? "Görev ve dosyaları bir sınıfa ya da etkinliğin katılımcılarına hedefleyebilirsin." : "Üyesi olduğun sınıflar ve kayıt olabileceğin etkinlikler."}</p>
      </div>
      {staff && <GroupForm />}
      <section className="card" aria-labelledby="cls-h">
        <div className="card-h"><h2 id="cls-h"><School size={16} aria-hidden /> Sınıflar</h2><span className="badge">{classes.length}</span></div>
        {classes.length ? (
          <ul className="group-list">
            {classes.map((g) => (
              <li key={g.id}>
                <Link href={`/groups/${g.id}`}><strong>{g.name}</strong></Link>
                {g.description && <div className="small muted clamp-2">{g.description}</div>}
                <div className="tiny faint"><Users size={12} aria-hidden /> {g._count.members} üye · {g.createdBy?.displayName ?? "—"}</div>
              </li>
            ))}
          </ul>
        ) : <div className="card-b"><p className="small muted" style={{ margin: 0 }}>{staff ? "Henüz sınıf yok." : "Bir sınıfa eklenmedin."}</p></div>}
      </section>
      <section className="card" aria-labelledby="ev-h">
        <div className="card-h"><h2 id="ev-h"><CalendarDays size={16} aria-hidden /> Etkinlikler</h2><span className="badge">{events.length}</span></div>
        {events.length ? (
          <ul className="group-list">
            {events.map((g) => {
              const full = g.capacity !== null && g._count.members >= g.capacity;
              return (
                <li key={g.id}>
                  <div className="row-between">
                    <Link href={`/groups/${g.id}`}><strong>{g.name}</strong></Link>
                    {!staff && g.selfJoin && <JoinButton id={g.id} joined={g.isMember} full={full} />}
                  </div>
                  <div className="small">{g.startsAt ? formatDateTime(g.startsAt, s.timezone) : "tarih belirsiz"}{g.location && ` · ${g.location}`}</div>
                  <div className="tiny faint">
                    {g._count.members}{g.capacity !== null ? ` / ${g.capacity}` : ""} katılımcı
                    {g.selfJoin ? " · kayıt açık" : " · katılımcıları eğitmen belirler"}
                    {g.isMember && " · kayıtlısın"}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : <div className="card-b"><p className="small muted" style={{ margin: 0 }}>Yaklaşan etkinlik yok.</p></div>}
      </section>
    </div>
  );
}
