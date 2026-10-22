import type { Metadata } from "next";
import Link from "next/link";
import { Radio, ShieldCheck, Users } from "lucide-react";
import { listActiveSessions } from "@/server/live/service";
import { requirePageSession } from "@/server/auth/page-guard";
import { isAdmin } from "@/server/auth/policy";
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import { getMessages } from "@/i18n";
import { formatDate, formatDateTime } from "@/components/ui/format";

export const metadata: Metadata = { title: "Ana sayfa" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { user } = await requirePageSession();
  const denied = (await searchParams).denied === "1";
  const s = await getSettings();
  const m = getMessages(s.locale);
  const me = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { joinedAt: true, lastLoginAt: true, createdAt: true } });
  const pending = isAdmin(user.role) ? await db.user.count({ where: { status: "PENDING" } }) : 0;
  const live = await listActiveSessions();
  const firstName = user.displayName.split(" ")[0];

  return (
    <div className="stack fade-up">
      {denied && <div className="alert alert-warn" role="alert">Bu sayfaya erişim yetkin yok.</div>}
      <div className="page-head">
        <div className="eyebrow">{s.clubName}</div>
        <h1 className="page-title">Merhaba, {firstName} 👋</h1>
        {s.description && <p className="page-sub">{s.description}</p>}
      </div>

      {live.length > 0 && (
        <section className="card" aria-labelledby="live-h" style={{ borderColor: "var(--lime-deep)" }}>
          <div className="card-h"><h2 id="live-h"><Radio size={16} color="var(--lime)" aria-hidden /> Şu an canlı</h2></div>
          <div className="card-b">
            <ul className="list-tight">
              {live.map((x) => (
                <li key={x.id}>
                  <span className="dot on" aria-hidden />
                  <span style={{ flex: 1 }}><strong>{x.title}</strong><span className="tiny faint"> · {x.host?.displayName ?? "—"} · {x.online} çevrimiçi</span></span>
                  <Link className="btn btn-sm btn-primary" href={`/live/${x.code}`}>Derse katıl</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <div className="grid-2">
        <section className="card" aria-labelledby="membership-h">
          <div className="card-h"><h2 id="membership-h">Üyelik</h2><span className="badge badge-lime">{m.roles[user.role]}</span></div>
          <div className="card-b">
            <dl className="kv">
              <dt>Kullanıcı adı</dt><dd className="mono">@{user.username}</dd>
              <dt>{m.account.memberSince}</dt><dd>{formatDate(me.joinedAt ?? me.createdAt, s.timezone)}</dd>
              <dt>{m.account.lastLogin}</dt><dd>{formatDateTime(me.lastLoginAt, s.timezone)}</dd>
            </dl>
          </div>
        </section>

        {isAdmin(user.role) ? (
          <section className="card" aria-labelledby="admin-h">
            <div className="card-h"><h2 id="admin-h">Yönetim</h2><ShieldCheck size={18} color="var(--lime)" aria-hidden /></div>
            <div className="card-b stack">
              <p className="muted" style={{ margin: 0 }}>
                {pending > 0 ? <><strong style={{ color: "var(--amber)" }}>{pending}</strong> üyelik başvurusu onay bekliyor.</> : "Bekleyen üyelik başvurusu yok."}
              </p>
              <div className="row">
                <Link className="btn btn-primary" href={pending > 0 ? "/admin/members?status=PENDING" : "/admin"}>
                  <Users size={16} aria-hidden /> {pending > 0 ? "Başvuruları incele" : "Yönetim paneli"}
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="card" aria-labelledby="next-h">
            <div className="card-h"><h2 id="next-h">Kulüpte seni neler bekliyor</h2></div>
            <div className="card-b">
              <p className="muted" style={{ margin: 0 }}>
                Canlı dersler başladığında burada ve <Link href="/live">Canlı ders</Link> sayfasında görünür; eğitmenin
                verdiği 6 haneli kodla da katılabilirsin. Club Academy, görevler ve liderlik tablosu sonraki sürümlerde eklenecek.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
