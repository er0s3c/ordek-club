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
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("XP ve seviyeler") };
}

const SOURCE: Record<string, string> = { LESSON: "Ders", QUIZ: "Quiz", TRACK: "Yol", LIVE: "Canlı", TASK: "Görev", MANUAL: "Düzeltme", REVERSAL: "Geri alma" };

export default async function AdminXpPage() {
  const tl = await getT();
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
        <div className="eyebrow">{tl("Yönetim paneli")}</div>
        <h1 className="page-title">{tl("XP ve seviyeler")}</h1>
        <p className="page-sub">
          {tl("XP yalnız sunucudaki kurallarla verilir; her kazanım ayrı bir kayıttır ve aynı ödül iki kez verilemez. Ay sınırları kulüp saat dilimine (")}<span className="mono">{s.timezone}</span>{tl(") göre hesaplanır.")}
        </p>
      </div>

      <div className="grid-stats">
        <div className="card stat accent"><div className="label">{periodLabel(period)}</div><div className="value">{(month._sum.amount ?? 0).toLocaleString(tl.intl)}</div><div className="hint">{tl("XP · {_count} işlem", { _count: month._count })}</div></div>
        <Link href="/leaderboard" className="card stat" style={{ color: "inherit", textDecoration: "none" }}><div className="label">{tl("Liderlik")}</div><div className="value" style={{ fontSize: 20, marginTop: 10 }}>{tl("Tabloya git →")}</div><div className="hint">{tl("aylık · genel · arşiv")}</div></Link>
        <div className={`card stat${flagged.length ? " warn" : ""}`}><div className="label">{tl("Şüpheli")}</div><div className="value">{flagged.length}</div><div className="hint">{tl("son 7 gün")}</div></div>
      </div>

      {flagged.length > 0 && (
        <section className="card card-featured" data-tag="Dikkat" aria-labelledby="sus-h">
          <div className="card-h"><h2 id="sus-h"><AlertTriangle size={16} color="var(--amber)" aria-hidden />{" "}{tl("Şüpheli etkinlik")}</h2></div>
          <div className="card-b">
            <ul className="list-tight">
              {flagged.map((f) => (
                <li key={f.userId}><Link href={`/u/${f.user.username}`}>{f.user.displayName}</Link> <span className="tiny faint mono">@{f.user.username}</span> <span style={{ marginLeft: "auto" }} className="small">{f.reason}</span></li>
              ))}
            </ul>
            <p className="tiny faint" style={{ marginBottom: 0 }}>{tl("Kişinin XP geçmişini profilinden incele; gerekirse işlemleri tek tek geri al veya düzeltme yaz.")}</p>
          </div>
        </section>
      )}

      <div className="grid-2">
        <section className="card" aria-labelledby="rules-h">
          <div className="card-h"><h2 id="rules-h">{tl("Ödül kuralları")}</h2></div>
          <RulesForm initial={rules.map((r) => ({ key: r.key, label: r.label, amount: r.amount, enabled: r.enabled }))} />
        </section>
        <section className="card" aria-labelledby="levels-h">
          <div className="card-h"><h2 id="levels-h">{tl("Seviye eşikleri")}</h2></div>
          <LevelsForm initial={levels.map((l) => ({ number: l.number, minXp: l.minXp, title: l.title }))} />
        </section>
      </div>

      <section className="card" aria-labelledby="adj-h">
        <div className="card-h"><h2 id="adj-h">{tl("Puan düzeltme")}</h2><ResetHint /></div>
        <div className="card-b"><AdjustForm /></div>
      </section>

      <section className="card" aria-labelledby="tx-h">
        <div className="card-h"><h2 id="tx-h">{tl("Son işlemler")}</h2><Link className="small" href="/admin/audit">{tl("Denetim kaydı →")}</Link></div>
        <div className="card-b flush">
          {recent.length === 0 ? <div className="empty">{tl("Henüz XP işlemi yok.")}</div> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>{tl("Tarih")}</th><th>{tl("Üye")}</th><th>{tl("Kaynak")}</th><th>{tl("Açıklama")}</th><th className="num">XP</th><th><span className="sr-only">{tl("İşlem")}</span></th></tr></thead>
                <tbody>
                  {recent.map((t) => (
                    <tr key={t.id} className={t.reversedBy ? "is-reversed" : undefined}>
                      <td className="tiny faint">{formatDateTime(t.createdAt, s.timezone, tl.intl)}</td>
                      <td><Link href={`/u/${t.user.username}`}>{t.user.displayName}</Link></td>
                      <td><span className="badge">{tl(SOURCE[t.source] ?? t.source)}</span></td>
                      <td className="small">{t.reason}{t.createdBy ? <span className="tiny faint"> · @{t.createdBy.username}</span> : null}{t.reversedBy ? <span className="tiny faint">{" "}{tl("· geri alındı")}</span> : null}</td>
                      <td className={`num mono ${t.amount < 0 ? "xp-neg" : "xp-pos"}`}>{t.amount > 0 ? "+" : ""}{t.amount}</td>
                      <td style={{ textAlign: "right" }}>{t.source !== "REVERSAL" && !t.reversedBy && <ReverseButton id={t.id} label={tl("{username} {amount} XP", { username: t.user.username, amount: t.amount })} />}</td>
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
