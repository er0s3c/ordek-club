import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList, Flame, GraduationCap, Megaphone, Pin, Radio, ShieldCheck, Trophy, Users } from "lucide-react";
import { listActiveSessions } from "@/server/live/service";
import { requirePageSession } from "@/server/auth/page-guard";
import { isAdmin } from "@/server/auth/policy";
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import { getMessages } from "@/i18n";
import { formatDate, formatDateTime } from "@/components/ui/format";
import { continueTarget, firstMission, progressSummary } from "@/server/academy/service";
import { ProgressBar } from "@/components/academy/Progress";
import { xpSummary } from "@/server/xp/profile";
import { LevelBar } from "@/components/xp/LevelBar";
import { isStaff } from "@/server/auth/policy";
import { listAssignmentsForStudent, pendingReviewCount } from "@/server/classroom/assignments";
import { listAnnouncements } from "@/server/classroom/announcements";

export const metadata: Metadata = { title: "Ana sayfa" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { user } = await requirePageSession();
  const denied = (await searchParams).denied === "1";
  const s = await getSettings();
  const m = getMessages(s.locale);
  const me = await db.user.findUniqueOrThrow({ where: { id: user.id }, select: { joinedAt: true, lastLoginAt: true, createdAt: true } });
  const pending = isAdmin(user.role) ? await db.user.count({ where: { status: "PENDING" } }) : 0;
  const live = await listActiveSessions();
  const actor = { id: user.id, role: user.role, status: user.status };
  const staff = isStaff(user.role);
  const [next, academy, xp, anns, tasks, toReview] = await Promise.all([
    continueTarget(actor), progressSummary(actor), xpSummary(user.id, user.role), listAnnouncements(actor, 3),
    staff ? Promise.resolve([]) : listAssignmentsForStudent(actor), staff ? pendingReviewCount(actor) : Promise.resolve(0),
  ]);
  const todo = tasks.filter((a) => a.status === "PUBLISHED" && (!a.mine || a.mine.status === "RETURNED")).slice(0, 4);
  const firstName = user.displayName.split(" ")[0];

  // İlk kullanım (04 §6.1): hiç ders bitirmemiş öğrenciye tek kart, tek yeşil düğme. Lig, sıra, seri, XP toplamı yok;
  // kulüp haberleri katlı şeritte. Personel her zaman tam paneli görür.
  const first = !staff && academy.completed === 0 ? await firstMission(actor) : null;
  if (first) {
    const news = live.length + todo.length + anns.length;
    return (
      <div className="stack fade-up first-run">
        {denied && <div className="alert alert-warn" role="alert">Bu sayfaya erişim yetkin yok.</div>}
        <div className="first-head">
          <div className="eyebrow">{s.clubName}</div>
          <h1 className="page-title">Merhaba, <em>{firstName}</em></h1>
          <p className="page-sub">Burada kimse &quot;bunu bilmen gerekirdi&quot; demez.</p>
        </div>
        <section className="card first-card" aria-labelledby="first-h">
          <div className="first-tag">İlk görev · ≈{first.minutes} dk · +XP</div>
          <h2 id="first-h" className="first-title">Şüpheli mesaj</h2>
          <p className="first-text">Bir mesaj geldi. Gerçek mi? Sen karar ver.</p>
          <Link className="btn btn-primary first-cta" href={`/academy/lesson/${first.slug}`}>Mesajı aç <ArrowRight size={16} aria-hidden /></Link>
        </section>
        <Link className="first-how" href="/academy">Akademi nasıl işler?</Link>
        {news > 0 && (
          <details className="first-news" open={live.length > 0}>
            <summary>Kulüpte bu hafta ({news})</summary>
            <ul className="list-tight">
              {live.map((x) => <li key={x.id}><Radio size={14} aria-hidden /> <span style={{ flex: 1 }}><strong>Canlı:</strong> {x.title}</span><Link className="btn btn-sm" href={`/live/${x.code}`}>Katıl</Link></li>)}
              {todo.map((a) => <li key={a.id}><ClipboardList size={14} aria-hidden /> <span style={{ flex: 1, minWidth: 0 }}><Link href={`/tasks/${a.id}`}>{a.title}</Link></span></li>)}
              {anns.map((a) => <li key={a.id}><Megaphone size={14} aria-hidden /> <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}><Link href="/announcements">{a.title}</Link></span></li>)}
            </ul>
          </details>
        )}
      </div>
    );
  }

  return (
    <div className="stack fade-up">
      {denied && <div className="alert alert-warn" role="alert">Bu sayfaya erişim yetkin yok.</div>}
      <div className="page-head hero-galaxy">
        <div className="eyebrow">{s.clubName}</div>
        <h1 className="page-title">Merhaba, <em>{firstName}</em><span className="dot-red" aria-hidden style={{ marginLeft: 8, verticalAlign: "0.1em" }} /></h1>
        {s.description && <p className="page-sub">{s.description}</p>}
      </div>

      {live.length > 0 && (
        <section className="card card-featured" data-tag="Canlı" aria-labelledby="live-h">
          <div className="card-h"><h2 id="live-h"><Radio size={16} color="var(--term)" aria-hidden /> Şu an canlı</h2></div>
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
        <section className="card" aria-labelledby="tasks-h">
          <div className="card-h"><h2 id="tasks-h"><ClipboardList size={16} color="var(--gold)" aria-hidden /> Görevler</h2><Link className="small" href={staff ? "/teach/tasks" : "/tasks"}>Tümü →</Link></div>
          <div className="card-b">
            {staff ? (
              <p className="muted" style={{ margin: 0 }}>{toReview ? <><strong style={{ color: "var(--amber)" }}>{toReview}</strong> teslim değerlendirme bekliyor.</> : "Değerlendirme bekleyen teslim yok."}</p>
            ) : todo.length ? (
              <ul className="list-tight">
                {todo.map((a) => (
                  <li key={a.id}>
                    <span style={{ flex: 1, minWidth: 0 }}><Link href={`/tasks/${a.id}`}>{a.title}</Link>{a.mine?.status === "RETURNED" && <span className="badge badge-red" style={{ marginLeft: 6 }}>düzeltme</span>}</span>
                    <span className="tiny faint">{a.dueAt ? formatDateTime(a.dueAt, s.timezone) : "süresiz"}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="muted" style={{ margin: 0 }}>Bekleyen görevin yok.</p>}
          </div>
        </section>
        <section className="card" aria-labelledby="ann-h">
          <div className="card-h"><h2 id="ann-h"><Megaphone size={16} color="var(--gold)" aria-hidden /> Duyurular</h2><Link className="small" href="/announcements">Tümü →</Link></div>
          <div className="card-b">
            {anns.length ? (
              <ul className="list-tight">
                {anns.map((a) => (
                  <li key={a.id}>
                    {a.pinned && <Pin size={13} color="var(--gold)" aria-label="sabitlenmiş" />}
                    <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}><Link href="/announcements">{a.title}</Link></span>
                    <span className="tiny faint">{formatDate(a.createdAt, s.timezone)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="muted" style={{ margin: 0 }}>Henüz duyuru yok.</p>}
          </div>
        </section>
      </div>

      {academy.total > 0 && (
        <section className="card" aria-labelledby="academy-h">
          <div className="card-h"><h2 id="academy-h"><GraduationCap size={16} color="var(--gold)" aria-hidden /> Akademi</h2><span className="tiny faint">{academy.completed}/{academy.total} ders</span></div>
          <div className="card-b continue-body">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="eyebrow">{next?.resume ? "Kaldığın yer" : next ? "Sıradaki ders" : "Bütün dosyalar kapandı"}</div>
              {next && <div className="continue-title">{next.title} <span className="tiny faint">· {next.track.code}</span></div>}
              <div style={{ marginTop: 8 }}><ProgressBar value={academy.completed} max={academy.total} label="Akademi ilerlemesi" /></div>
            </div>
            <Link className="btn btn-primary" href={next ? `/academy/lesson/${next.slug}` : "/academy"}>
              {next?.resume ? "Devam et" : next ? "Başla" : "Akademi"} <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </section>
      )}

      <section className="card" aria-labelledby="xp-h">
        <div className="card-h">
          <h2 id="xp-h"><Trophy size={16} color="var(--gold)" aria-hidden /> Kalkan dosyan</h2>
          <Link className="small" href={`/u/${user.username}`}>Profilim →</Link>
        </div>
        <div className="card-b xp-card">
          <div style={{ flex: 2, minWidth: 220 }}><LevelBar level={xp.level} total={xp.total} /></div>
          <dl className="kv xp-kv">
            <dt>Bu ay</dt><dd><strong>{xp.month.toLocaleString("tr-TR")} XP</strong>{xp.monthlyRank ? <span className="tiny faint"> · #{xp.monthlyRank}</span> : null}</dd>
            <dt>Genel sıra</dt><dd>{xp.overallRank ? <Link href="/leaderboard?tab=all">#{xp.overallRank}</Link> : <span className="faint">{xp.ranked ? "henüz yok" : "sıralama dışı"}</span>}</dd>
            <dt><Flame size={13} aria-hidden /> Seri</dt><dd>{xp.streak.current} gün</dd>
          </dl>
        </div>
      </section>

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
            <div className="card-h"><h2 id="admin-h">Yönetim</h2><ShieldCheck size={18} color="var(--gold)" aria-hidden /></div>
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
                verdiği 6 haneli kodla da katılabilirsin. Kendi hızında ilerlemek için <Link href="/academy">Akademi</Link>{"'"}ye göz at; kazandığın XP ile <Link href="/leaderboard">liderlik tablosunda</Link> yerini al. Eğitmenlerin verdiği görevler <Link href="/tasks">Görevler</Link> sayfasında.
              </p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
