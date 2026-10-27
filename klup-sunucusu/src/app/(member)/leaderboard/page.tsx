import type { Metadata } from "next";
import Link from "next/link";
import { Crown, History, Trophy } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { archivedBoard, archivedPeriods, ensureArchived, monthlyBoard, overallBoard, type BoardRow } from "@/server/xp/leaderboard";
import { isPeriod, periodLabel } from "@/server/xp/time";
import { LevelChip } from "@/components/xp/LevelBar";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Liderlik tablosu") };
}

type Tab = "month" | "all" | "history";
const SHOW = { "10": 10, "50": 50, all: Infinity } as const;

async function Podium({ rows }: { rows: BoardRow[] }) {
  const t = await getT();
  const top = rows.filter((r) => r.rank <= 3).slice(0, 3);
  if (!top.length) return null;
  const order = [top[1], top[0], top[2]].filter(Boolean) as BoardRow[];
  return (
    <div className="podium" aria-label={t("İlk üç")}>
      {order.map((r) => (
        <Link key={r.userId} href={`/u/${r.username}`} className={`podium-spot podium-${r.rank}`}>
          {r.rank === 1 && <Crown size={22} className="podium-crown" aria-hidden />}
          <span className="podium-rank">{r.rank}</span>
          <strong className="podium-name">{r.displayName}</strong>
          <span className="tiny faint mono">@{r.username}</span>
          <span className="podium-xp">{r.xp.toLocaleString(t.intl)} XP</span>
          <LevelChip level={r.level} />
        </Link>
      ))}
    </div>
  );
}

async function Board({ rows, me, limit, empty }: { rows: BoardRow[]; me: string; limit: number; empty: string }) {
  const t = await getT();
  if (!rows.length) return <div className="empty"><Trophy size={28} aria-hidden /><div>{empty}</div></div>;
  const shown = rows.slice(0, limit);
  const mine = rows.find((r) => r.userId === me);
  return (
    <>
      <Podium rows={rows} />
      <div className="table-wrap">
        <table className="table board">
          <thead><tr><th className="num">#</th><th>{t("Üye")}</th><th>{t("Seviye")}</th><th className="num">XP</th></tr></thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.userId} className={r.userId === me ? "is-me" : undefined}>
                <td className="num mono">{r.rank}</td>
                <td><Link href={`/u/${r.username}`}>{r.displayName}</Link> <span className="tiny faint mono">@{r.username}</span></td>
                <td><LevelChip level={r.level} /></td>
                <td className="num mono">{r.xp.toLocaleString(t.intl)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {mine && !shown.includes(mine) && (
        <p className="small" style={{ margin: "12px 18px" }}>{t("Senin sıran:")}{" "}<strong>#{mine.rank}</strong> · {mine.xp.toLocaleString(t.intl)} XP</p>
      )}
    </>
  );
}

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const tl = await getT();
  const { user } = await requirePageSession();
  await ensureArchived();
  const sp = await searchParams;
  const tab: Tab = sp.tab === "all" || sp.tab === "history" ? sp.tab : "month";
  const showKey = sp.show === "50" || sp.show === "all" ? sp.show : "10";
  const limit = SHOW[showKey];
  const href = (t: Tab, extra = "") => `/leaderboard?tab=${t}${extra}`;

  let title = "";
  let content: React.ReactNode;
  if (tab === "month") {
    const b = await monthlyBoard();
    title = tl("{v0} · aylık sıralama", { v0: periodLabel(b.period) });
    content = <Board rows={b.rows} me={user.id} limit={limit} empty={tl("Bu ay henüz XP kazanılmadı. İlk dersi tamamlayan zirveye yerleşir.")} />;
  } else if (tab === "all") {
    title = tl("Genel sıralama · kulübe katıldığından beri");
    content = <Board rows={await overallBoard()} me={user.id} limit={limit} empty={tl("Henüz kimse XP kazanmadı.")} />;
  } else if (sp.period && isPeriod(sp.period)) {
    const b = await archivedBoard(sp.period);
    title = tl("{v0} · arşiv", { v0: periodLabel(sp.period) });
    content = b ? <Board rows={b.rows} me={user.id} limit={limit} empty={tl("Bu ayda XP kazanılmamış.")} /> : <div className="empty">{tl("Bu ay arşivde yok.")}</div>;
  } else {
    const periods = await archivedPeriods();
    title = tl("Geçmiş ayların liderleri");
    content = periods.length ? (
      <ul className="list-tight history-list">
        {periods.map((p) => (
          <li key={p.period}>
            <History size={16} aria-hidden />
            <Link href={href("history", `&period=${p.period}`)} style={{ flex: 1 }}>{periodLabel(p.period)}</Link>
            <span className="small">{p.entries.length ? <>{tl("👑 {v0} · {xp} XP", { v0: p.entries.map((e) => e.user.displayName).join(", "), xp: p.entries[0]!.xp })}</> : <span className="faint">{tl("kazanan yok")}</span>}</span>
          </li>
        ))}
      </ul>
    ) : (
      <div className="empty">{tl("Henüz kapanmış bir ay yok. Ay bittiğinde sıralama burada arşivlenir.")}</div>
    );
  }

  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">{tl("Gölge Ağ · Kalkan sıralaması")}</div>
        <h1 className="page-title">{tl("Liderlik tablosu")}</h1>
        <p className="page-sub">{tl("Aylık tablo her ay sıfırlanır; genel tablo hiç sıfırlanmaz. Sıralamada öğrenci üyeler yer alır.")}</p>
      </div>
      <nav className="tabs" aria-label={tl("Tablo seçimi")}>
        <Link href={href("month")} aria-current={tab === "month" ? "page" : undefined}>{tl("Bu ay")}</Link>
        <Link href={href("all")} aria-current={tab === "all" ? "page" : undefined}>{tl("Genel")}</Link>
        <Link href={href("history")} aria-current={tab === "history" ? "page" : undefined}>{tl("Geçmiş aylar")}</Link>
      </nav>
      <section className="card" aria-labelledby="board-h">
        <div className="card-h">
          <h2 id="board-h">{title}</h2>
          {tab !== "history" || sp.period ? (
            <div className="row" style={{ gap: 6 }}>
              {(["10", "50", "all"] as const).map((k) => (
                <Link key={k} className={`btn btn-sm${showKey === k ? " btn-primary" : ""}`} href={href(tab, `${sp.period ? `&period=${sp.period}` : ""}&show=${k}`)}>
                  {k === "all" ? tl("Tümü") : tl("Top {k}", { k })}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        <div className="card-b flush">{content}</div>
      </section>
    </div>
  );
}
