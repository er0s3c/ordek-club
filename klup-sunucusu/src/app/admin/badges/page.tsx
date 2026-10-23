import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { db } from "@/server/db";
import { ensureGamificationDefaults } from "@/server/xp/defaults";
import { BADGE_ICONS, badgeRuleSchema, describeRule } from "@/server/xp/badges";
import { BadgeIcon } from "@/components/xp/BadgeIcon";
import { BadgeRowActions, CreateBadgeForm } from "./BadgeForms";

export const metadata: Metadata = { title: "Rozetler" };

export default async function AdminBadgesPage() {
  await requirePageSession(ADMIN_ROLES);
  await ensureGamificationDefaults();
  const [badges, tracks] = await Promise.all([
    db.badge.findMany({ orderBy: { createdAt: "asc" }, include: { _count: { select: { awards: true } } } }),
    db.track.findMany({ where: { archivedAt: null }, orderBy: { position: "asc" }, select: { key: true, code: true } }),
  ]);

  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">Yönetim paneli</div>
        <h1 className="page-title">Rozetler</h1>
        <p className="page-sub">Otomatik rozetler öğrenci ders/quiz tamamladıkça kendiliğinden verilir. “Yönetici verir” türündeki rozetleri buradan elle verebilirsin.</p>
      </div>

      <section className="card" aria-labelledby="new-h">
        <div className="card-h"><h2 id="new-h">Yeni rozet</h2></div>
        <div className="card-b"><CreateBadgeForm icons={BADGE_ICONS} tracks={tracks} /></div>
      </section>

      <section className="card" aria-labelledby="list-h">
        <div className="card-h"><h2 id="list-h">Tüm rozetler</h2><span className="tiny faint">{badges.length}</span></div>
        <div className="card-b flush">
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Rozet</th><th>Nasıl kazanılır</th><th className="num">Sahibi</th><th><span className="sr-only">İşlemler</span></th></tr></thead>
              <tbody>
                {badges.map((b) => {
                  const r = badgeRuleSchema.safeParse(b.rule);
                  return (
                    <tr key={b.id} className={b.active ? undefined : "is-reversed"}>
                      <td>
                        <div className="row" style={{ gap: 10, flexWrap: "nowrap" }}>
                          <span className="badge-medal" aria-hidden><BadgeIcon icon={b.icon} size={18} /></span>
                          <div><strong>{b.name}</strong>{!b.active && <span className="badge" style={{ marginLeft: 6 }}>kapalı</span>}<div className="tiny faint">{b.description}</div></div>
                        </div>
                      </td>
                      <td className="small">{r.success ? describeRule(r.data) : "geçersiz kural"}</td>
                      <td className="num">{b._count.awards}</td>
                      <td><BadgeRowActions id={b.id} name={b.name} active={b.active} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
