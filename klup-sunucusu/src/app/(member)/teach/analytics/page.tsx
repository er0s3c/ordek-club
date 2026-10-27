import type { Metadata } from "next";
import Link from "next/link";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { clubAnalytics } from "@/server/analytics";
import { KIND_LABEL } from "@/components/classroom/labels";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Analitik") };
}

const SOURCE: Record<string, string> = { LESSON: "Ders", QUIZ: "Quiz", TRACK: "Yol", LIVE: "Canlı ders", TASK: "Görev", MANUAL: "Elle düzeltme", REVERSAL: "Geri alma" };

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="card stat">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

// Yatay çubuk: değer / en büyük (erişilebilir metinle)
function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  const w = max ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return <div className="an-bar" role="img" aria-label={label}><span style={{ width: `${w}%` }} /></div>;
}

export default async function AnalyticsPage() {
  const tl = await getT();
  const { user } = await requirePageSession(STAFF_ROLES);
  const a = await clubAnalytics({ id: user.id, role: user.role, status: user.status });
  const maxWeek = Math.max(1, ...a.members.weekly.map((w) => w.active));
  const maxXp = Math.max(1, ...a.xp.map((x) => x.amount));
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow"><Link href="/teach">{tl("Eğitmen paneli")}</Link></div>
        <h1 className="page-title">{tl("Analitik")}</h1>
        <p className="page-sub">{tl("Yalnız aktif öğrenciler sayılır; bireysel öğrenci listesi gösterilmez.")}</p>
      </div>

      <div className="grid-stats">
        <Stat label={tl("Aktif öğrenci")} value={a.members.students} hint={tl("son 30 günde {newStudents} yeni", { newStudents: a.members.newStudents })} />
        <Stat label={tl("Son 7 gün giriş")} value={a.members.loggedIn7} hint={tl("30 gün: {loggedIn30}", { loggedIn30: a.members.loggedIn30 })} />
        <Stat label={tl("Quiz geçme oranı")} value={`%${a.academy.quizPassRate}`} hint={tl("{quizAttempts} deneme", { quizAttempts: a.academy.quizAttempts })} />
        <Stat label={tl("Görev onay oranı")} value={`%${a.tasks.approvalRate}`} hint={tl("{pending} değerlendirme bekliyor", { pending: a.tasks.pending })} />
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <section className="card" aria-labelledby="wk-h">
          <div className="card-h"><h2 id="wk-h">{tl("Haftalık aktif öğrenci")}</h2><span className="tiny faint">{tl("son 8 hafta · ders, quiz, canlı ders, görev")}</span></div>
          <div className="card-b an-cols" role="list">
            {a.members.weekly.map((w) => (
              <div key={w.label} role="listitem" className="an-col" aria-label={tl("{label} haftası: {active} öğrenci", { label: w.label, active: w.active })}>
                <span className="mono tiny">{w.active}</span>
                <div className="an-colbar"><span style={{ height: `${Math.round((w.active / maxWeek) * 100)}%` }} /></div>
                <span className="tiny faint">{w.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="card" aria-labelledby="live-h">
          <div className="card-h"><h2 id="live-h">{tl("Canlı dersler")}</h2><span className="tiny faint">{tl("son 30 gün")}</span></div>
          <div className="card-b">
            <dl className="kv">
              <dt>{tl("Ders sayısı")}</dt><dd>{a.live.sessions}</dd>
              <dt>{tl("Ortalama katılımcı")}</dt><dd>{a.live.avgParticipants}</dd>
              <dt>{tl("Ortalama katılım süresi")}</dt><dd>{tl("{avgMinutes} dk", { avgMinutes: a.live.avgMinutes })}</dd>
              <dt>{tl("Quiz / anket")}</dt><dd>{tl("{polls} soru · ortalama {avgAnswers} cevap", { polls: a.live.polls, avgAnswers: a.live.avgAnswers })}</dd>
            </dl>
          </div>
        </section>
      </div>

      <section className="card" aria-labelledby="ac-h">
        <div className="card-h"><h2 id="ac-h">{tl("Akademi yolları")}</h2></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>{tl("Yol")}</th><th className="num">{tl("Ders")}</th><th className="num">{tl("Öğrenen")}</th><th>{tl("Tamamlanma")}</th></tr></thead>
            <tbody>
              {a.academy.tracks.map((t) => (
                <tr key={t.code}>
                  <td><strong>{t.code}</strong> <span className="small muted">{t.title}</span></td>
                  <td className="num mono">{t.lessons}</td>
                  <td className="num mono">{t.learners}</td>
                  <td style={{ minWidth: 140 }}><div className="row" style={{ gap: 8 }}><Bar value={t.completion} max={100} label={`%${t.completion}`} /><span className="mono small">%{t.completion}</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <section className="card" aria-labelledby="hard-h">
          <div className="card-h"><h2 id="hard-h">{tl("En zorlayan quizler")}</h2><span className="tiny faint">{tl("en az 3 deneme")}</span></div>
          {a.academy.hardest.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>{tl("Ders")}</th><th className="num">{tl("Deneme")}</th><th className="num">{tl("Geçme")}</th><th className="num">{tl("Ort.")}</th></tr></thead>
                <tbody>
                  {a.academy.hardest.map((h) => (
                    <tr key={h.slug}><td><Link href={`/academy/lesson/${h.slug}`}>{h.title}</Link></td><td className="num mono">{h.attempts}</td><td className="num mono">%{h.passRate}</td><td className="num mono">%{h.avgScore}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="card-b small muted">{tl("Yeterli veri yok.")}</div>}
        </section>
        <section className="card" aria-labelledby="xp-h">
          <div className="card-h"><h2 id="xp-h">{tl("XP kaynakları")}</h2><span className="tiny faint">{tl("son 30 gün")}</span></div>
          <div className="card-b stack-sm">
            {a.xp.length ? a.xp.map((x) => (
              <div key={x.source} className="row" style={{ gap: 8 }}>
                <span className="small" style={{ width: 110 }}>{tl(SOURCE[x.source] ?? x.source)}</span>
                <Bar value={Math.max(0, x.amount)} max={maxXp} label={tl("{amount} XP", { amount: x.amount })} />
                <span className="mono small" style={{ width: 70, textAlign: "right" }}>{x.amount.toLocaleString(tl.intl)}</span>
              </div>
            )) : <p className="small muted" style={{ margin: 0 }}>{tl("Henüz XP yok.")}</p>}
          </div>
        </section>
      </div>

      <section className="card" aria-labelledby="tk-h">
        <div className="card-h"><h2 id="tk-h">{tl("Görevler")}</h2><span className="tiny faint">{tl("{submissions} teslim · geç %{lateRate} · onaylı ortalama puan %{avgScore}", { submissions: a.tasks.submissions, lateRate: a.tasks.lateRate, avgScore: a.tasks.avgScore })}</span></div>
        {a.tasks.recent.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>{tl("Görev")}</th><th>{tl("Katılım")}</th><th className="num">{tl("Onaylı")}</th><th className="num">{tl("Bekleyen")}</th></tr></thead>
              <tbody>
                {a.tasks.recent.map((t) => (
                  <tr key={t.id}>
                    <td><Link href={`/teach/tasks/${t.id}`}>{t.title}</Link><div className="tiny faint">{tl(KIND_LABEL[t.kind])}</div></td>
                    <td style={{ minWidth: 160 }}><div className="row" style={{ gap: 8 }}><Bar value={t.submitted} max={Math.max(t.targeted, t.submitted, 1)} label={`${t.submitted}/${t.targeted}`} /><span className="mono small">{t.submitted}/{t.targeted}</span></div></td>
                    <td className="num mono">{t.approved}</td>
                    <td className="num mono">{t.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="card-b small muted">{tl("Henüz yayınlanmış görev yok.")}</div>}
      </section>
    </div>
  );
}
