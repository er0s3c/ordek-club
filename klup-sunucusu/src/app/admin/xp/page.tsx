import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import { ensureGamificationDefaults } from "@/server/xp/defaults";
import { suspiciousActivity } from "@/server/xp/admin";
import { monthRange, periodLabel, periodOf } from "@/server/xp/time";
import { formatDateTime } from "@/components/ui/format";
import { AdjustForm, LevelsForm, ResetHint, ReverseButton, RulesForm } from "./XpForms";

export const metadata: Metadata = { title: "XP ve seviyeler" };

const SOURCE: Record<string, string> = { LESSON: "Ders", QUIZ: "Quiz", TRACK: "Yol", LIVE: "Canlı", TASK: "Görev", MANUAL: "Düzeltme", REVERSAL: "Geri alma" };

export default async function AdminXpPage() {
  await requirePageSession(ADMIN_ROLES);
  await ensureGamificationDefaults();
  const s = await getSettings();
  const period = periodOf(new Date(), s.timezone);
  const range = monthRange(period, s.timezone);
  const [rules, levels, recent, month, flagged] = await Promise.all([
    db.xpRewardRule.findMany({ orderBy: { key: "asc" } }),
    db.level.findMany({ orderBy: { number: "asc" } }),
    db.xpTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { user: { select: { username: true, displayName: true } }, createdBy: { select: { username: true } }, reversedBy: { select: { id: true } } },
    }),
    db.xpTransaction.aggregate({ where: { createdAt: { gte: range.start, lt: range.end } }, _sum: { amount: true }, _count: true }),
    suspiciousActivity(),
  ]);

  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">Yönetim paneli</div>
        <h1 className="page-title">XP ve seviyeler</h1>
        <p className="page-sub">
          XP yalnız sunucudaki kurallarla verilir; her kazanım ayrı bir kayıttır ve aynı ödül iki kez verilemez.
          Ay sınırları kulüp saat dilimine (<span className="mono">{s.timezone}</span>) göre hesaplanır.
        </p>
      </div>

      <div className="grid-stats">
        <div className="card stat accent"><div className="label">{periodLabel(period)}</div><div className="value">{(month._sum.amount ?? 0).toLocaleString("tr-TR")}</div><div className="hint">XP · {month._count} işlem</div></div>
        <Link href="/leaderboard" className="card stat" style={{ color: "inherit", textDecoration: "none" }}><div className="label">Liderlik</div><div className="value" style={{ fontSize: 20, marginTop: 10 }}>Tabloya git →</div><div className="hint">aylık · genel · arşiv</div></Link>
        <div className={`card stat${flagged.length ? " warn" : ""}`}><div className="label">Şüpheli</div><div className="value">{flagged.length}</div><div className="hint">son 7 gün</div></div>
      </div>

      {flagged.length > 0 && (
        <section className="card" aria-labelledby="sus-h" style={{ borderColor: "rgba(217,164,65,.55)" }}>
          <div className="card-h"><h2 id="sus-h"><AlertTriangle size={16} color="var(--amber)" aria-hidden /> Şüpheli etkinlik</h2></div>
          <div className="card-b">
            <ul className="list-tight">
              {flagged.map((f) => (
                <li key={f.userId}><Link href={`/u/${f.user.username}`}>{f.user.displayName}</Link> <span className="tiny faint mono">@{f.user.username}</span> <span style={{ marginLeft: "auto" }} className="small">{f.reason}</span></li>
              ))}
            </ul>
            <p className="tiny faint" style={{ marginBottom: 0 }}>Kişinin XP geçmişini profilinden incele; gerekirse işlemleri tek tek geri al veya düzeltme yaz.</p>
          </div>
        </section>
      )}

      <div className="grid-2">
        <section className="card" aria-labelledby="rules-h">
          <div className="card-h"><h2 id="rules-h">Ödül kuralları</h2></div>
          <RulesForm initial={rules.map((r) => ({ key: r.key, label: r.label, amount: r.amount, enabled: r.enabled }))} />
        </section>
        <section className="card" aria-labelledby="levels-h">
          <div className="card-h"><h2 id="levels-h">Seviye eşikleri</h2></div>
          <LevelsForm initial={levels.map((l) => ({ number: l.number, minXp: l.minXp, title: l.title }))} />
        </section>
      </div>

      <section className="card" aria-labelledby="adj-h">
        <div className="card-h"><h2 id="adj-h">Puan düzeltme</h2><ResetHint /></div>
        <div className="card-b"><AdjustForm /></div>
      </section>

      <section className="card" aria-labelledby="tx-h">
        <div className="card-h"><h2 id="tx-h">Son işlemler</h2><Link className="small" href="/admin/audit">Denetim kaydı →</Link></div>
        <div className="card-b flush">
          {recent.length === 0 ? <div className="empty">Henüz XP işlemi yok.</div> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Tarih</th><th>Üye</th><th>Kaynak</th><th>Açıklama</th><th className="num">XP</th><th><span className="sr-only">İşlem</span></th></tr></thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t.id} className={t.reversedBy ? "is-reversed" : undefined}>
                      <td className="tiny faint">{formatDateTime(t.createdAt, s.timezone)}</td>
                      <td><Link href={`/u/${t.user.username}`}>{t.user.displayName}</Link></td>
                      <td><span className="badge">{SOURCE[t.source] ?? t.source}</span></td>
                      <td className="small">{t.reason}{t.createdBy ? <span className="tiny faint"> · @{t.createdBy.username}</span> : null}{t.reversedBy ? <span className="tiny faint"> · geri alındı</span> : null}</td>
                      <td className={`num mono ${t.amount < 0 ? "xp-neg" : "xp-pos"}`}>{t.amount > 0 ? "+" : ""}{t.amount}</td>
                      <td style={{ textAlign: "right" }}>{t.source !== "REVERSAL" && !t.reversedBy && <ReverseButton id={t.id} label={`${t.user.username} ${t.amount} XP`} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
