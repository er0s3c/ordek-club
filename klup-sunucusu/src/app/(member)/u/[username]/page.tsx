import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Flame, Lock, Trophy } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { HttpError } from "@/server/errors";
import { publicProfile } from "@/server/xp/profile";
import { getSettings } from "@/server/settings";
import { formatDate, formatDateTime, initials } from "@/components/ui/format";
import { BadgeIcon } from "@/components/xp/BadgeIcon";
import { LevelBar } from "@/components/xp/LevelBar";
import { getT, getServerMessages, translateFor } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Profil") };
}

const SOURCE: Record<string, string> = { LESSON: "Ders", QUIZ: "Quiz", TRACK: "Yol", LIVE: "Canlı ders", TASK: "Görev", MANUAL: "Düzeltme", REVERSAL: "Geri alma" };

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const tl = await getT();
  const { user } = await requirePageSession();
  const username = (await params).username;
  if (!/^[a-z0-9._-]{1,40}$/i.test(username)) notFound();
  const p = await publicProfile({ id: user.id, role: user.role, status: user.status }, username).catch((e) => {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  });
  if (!p) notFound();
  const s = await getSettings();
  const m = await getServerMessages();
  const sum = p.summary;

  return (
    <div className="stack fade-up">
      <div className="page-head profile-head">
        <span className="avatar avatar-lg" aria-hidden>{initials(p.user.displayName)}</span>
        <div style={{ minWidth: 0 }}>
          <div className="eyebrow">{p.own ? tl("Profilim") : tl("Üye profili")} · {m.roles[p.user.role]}</div>
          <h1 className="page-title">{p.user.displayName}</h1>
          <p className="page-sub mono">{tl("@{username} · üye: {v0}", { username: p.user.username, v0: formatDate(p.user.joinedAt, s.timezone, tl.intl) })}</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <section className="card" aria-labelledby="lvl-h">
          <div className="card-h"><h2 id="lvl-h">{tl("Seviye")}</h2></div>
          <div className="card-b"><LevelBar level={sum.level} total={sum.total} /></div>
        </section>
        <div className="grid-stats">
          <div className="card stat accent"><div className="label">{tl("Bu ay")}</div><div className="value">{sum.month.toLocaleString(tl.intl)}</div><div className="hint">XP{sum.monthlyRank ? ` · #${sum.monthlyRank}` : ""}</div></div>
          <div className="card stat"><div className="label">{tl("Genel sıra")}</div><div className="value">{sum.overallRank ? `#${sum.overallRank}` : "—"}</div><div className="hint">{sum.ranked ? <Link href="/leaderboard?tab=all">{tl("tabloya git")}</Link> : tl("sıralama dışı (personel)")}</div></div>
          <div className="card stat"><div className="label"><Flame size={13} aria-hidden />{" "}{tl("Seri")}</div><div className="value">{sum.streak.current}</div><div className="hint">{tl("gün · en uzun {longest}", { longest: sum.streak.longest })}</div></div>
        </div>
      </div>

      <section className="card" aria-labelledby="badges-h">
        <div className="card-h"><h2 id="badges-h">{tl("Rozetler")}</h2><span className="tiny faint">{p.badges.length}/{p.badges.length + p.locked.length}</span></div>
        <div className="card-b">
          <ul className="badge-grid">
            {p.badges.map((b) => (
              <li key={b.id} className="badge-tile is-earned" title={tl(b.description)}>
                <span className="badge-medal"><BadgeIcon icon={b.icon} /></span>
                <strong>{tl(b.name)}</strong>
                <span className="tiny faint">{formatDate(b.awardedAt, s.timezone, tl.intl)}</span>
              </li>
            ))}
            {p.locked.map((b) => (
              <li key={b.id} className="badge-tile is-locked" title={tl(b.description)}>
                <span className="badge-medal"><Lock size={18} aria-hidden /></span>
                <strong>{tl(b.name)}</strong>
                <span className="tiny faint">{translateFor(tl.locale, b.how)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {p.tracks.length > 0 && (
        <section className="card" aria-labelledby="tracks-h">
          <div className="card-h"><h2 id="tracks-h"><Trophy size={16} color="var(--gold)" aria-hidden />{" "}{tl("Kapatılan dosyalar")}</h2></div>
          <div className="card-b row">
            {p.tracks.map((t) => <Link key={t.key} className="stamp stamp-ok" href={`/academy/${t.key}`}>{t.code}</Link>)}
          </div>
        </section>
      )}

      {p.history && (
        <section className="card" aria-labelledby="hist-h">
          <div className="card-h"><h2 id="hist-h">{tl("XP geçmişi")}</h2><span className="tiny faint">{tl("son 50 işlem · yalnız")}{" "}{p.own ? "sen" : tl("yöneticiler")}{" "}{tl("görür")}</span></div>
          <div className="card-b flush">
            {p.history.length === 0 ? <div className="empty">{tl("Henüz XP yok. İlk dersini tamamla.")}</div> : (
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>{tl("Tarih")}</th><th>{tl("Kaynak")}</th><th>{tl("Açıklama")}</th><th className="num">XP</th></tr></thead>
                  <tbody>
                    {p.history.map((t) => (
                      <tr key={t.id} className={t.reversedBy ? "is-reversed" : undefined}>
                        <td className="tiny faint">{formatDateTime(t.createdAt, s.timezone, tl.intl)}</td>
                        <td><span className="badge">{tl(SOURCE[t.source] ?? t.source)}</span></td>
                        <td className="small">{t.reason}{t.reversedBy ? <span className="tiny faint">{" "}{tl("· geri alındı")}</span> : null}</td>
                        <td className={`num mono ${t.amount < 0 ? "xp-neg" : "xp-pos"}`}>{t.amount > 0 ? "+" : ""}{t.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
