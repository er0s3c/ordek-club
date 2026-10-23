import type { Metadata } from "next";
import Link from "next/link";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { clubAnalytics } from "@/server/analytics";
import { KIND_LABEL } from "@/components/classroom/labels";

export const metadata: Metadata = { title: "Analitik" };

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
  const { user } = await requirePageSession(STAFF_ROLES);
  const a = await clubAnalytics({ id: user.id, role: user.role, status: user.status });
  const maxWeek = Math.max(1, ...a.members.weekly.map((w) => w.active));
  const maxXp = Math.max(1, ...a.xp.map((x) => x.amount));
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow"><Link href="/teach">Eğitmen paneli</Link></div>
        <h1 className="page-title">Analitik</h1>
        <p className="page-sub">Yalnız aktif öğrenciler sayılır; bireysel öğrenci listesi gösterilmez.</p>
      </div>

      <div className="grid-stats">
        <Stat label="Aktif öğrenci" value={a.members.students} hint={`son 30 günde ${a.members.newStudents} yeni`} />
        <Stat label="Son 7 gün giriş" value={a.members.loggedIn7} hint={`30 gün: ${a.members.loggedIn30}`} />
        <Stat label="Quiz geçme oranı" value={`%${a.academy.quizPassRate}`} hint={`${a.academy.quizAttempts} deneme`} />
        <Stat label="Görev onay oranı" value={`%${a.tasks.approvalRate}`} hint={`${a.tasks.pending} değerlendirme bekliyor`} />
      </div>

      <div className="grid-2" style={{ alignItems: "start" }}>
        <section className="card" aria-labelledby="wk-h">
          <div className="card-h"><h2 id="wk-h">Haftalık aktif öğrenci</h2><span className="tiny faint">son 8 hafta · ders, quiz, canlı ders, görev</span></div>
          <div className="card-b an-cols" role="list">
            {a.members.weekly.map((w) => (
              <div key={w.label} role="listitem" className="an-col" aria-label={`${w.label} haftası: ${w.active} öğrenci`}>
                <span className="mono tiny">{w.active}</span>
                <div className="an-colbar"><span style={{ height: `${Math.round((w.active / maxWeek) * 100)}%` }} /></div>
                <span className="tiny faint">{w.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="card" aria-labelledby="live-h">
          <div className="card-h"><h2 id="live-h">Canlı dersler</h2><span className="tiny faint">son 30 gün</span></div>
          <div className="card-b">
            <dl className="kv">
              <dt>Ders sayısı</dt><dd>{a.live.sessions}</dd>
              <dt>Ortalama katılımcı</dt><dd>{a.live.avgParticipants}</dd>
              <dt>Ortalama katılım süresi</dt><dd>{a.live.avgMinutes} dk</dd>
              <dt>Quiz / anket</dt><dd>{a.live.polls} soru · ortalama {a.live.avgAnswers} cevap</dd>
            </dl>
          </div>
        </section>
      </div>

      <section className="card" aria-labelledby="ac-h">
        <div className="card-h"><h2 id="ac-h">Akademi yolları</h2></div>
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Yol</th><th className="num">Ders</th><th className="num">Öğrenen</th><th>Tamamlanma</th></tr></thead>
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
          <div className="card-h"><h2 id="hard-h">En zorlayan quizler</h2><span className="tiny faint">en az 3 deneme</span></div>
          {a.academy.hardest.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Ders</th><th className="num">Deneme</th><th className="num">Geçme</th><th className="num">Ort.</th></tr></thead>
                <tbody>
                  {a.academy.hardest.map((h) => (
                    <tr key={h.slug}><td><Link href={`/academy/lesson/${h.slug}`}>{h.title}</Link></td><td className="num mono">{h.attempts}</td><td className="num mono">%{h.passRate}</td><td className="num mono">%{h.avgScore}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="card-b small muted">Yeterli veri yok.</div>}
        </section>
        <section className="card" aria-labelledby="xp-h">
          <div className="card-h"><h2 id="xp-h">XP kaynakları</h2><span className="tiny faint">son 30 gün</span></div>
          <div className="card-b stack-sm">
            {a.xp.length ? a.xp.map((x) => (
              <div key={x.source} className="row" style={{ gap: 8 }}>
                <span className="small" style={{ width: 110 }}>{SOURCE[x.source] ?? x.source}</span>
                <Bar value={Math.max(0, x.amount)} max={maxXp} label={`${x.amount} XP`} />
                <span className="mono small" style={{ width: 70, textAlign: "right" }}>{x.amount.toLocaleString("tr-TR")}</span>
              </div>
            )) : <p className="small muted" style={{ margin: 0 }}>Henüz XP yok.</p>}
          </div>
        </section>
      </div>

      <section className="card" aria-labelledby="tk-h">
        <div className="card-h"><h2 id="tk-h">Görevler</h2><span className="tiny faint">{a.tasks.submissions} teslim · geç %{a.tasks.lateRate} · onaylı ortalama puan %{a.tasks.avgScore}</span></div>
        {a.tasks.recent.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Görev</th><th>Katılım</th><th className="num">Onaylı</th><th className="num">Bekleyen</th></tr></thead>
              <tbody>
                {a.tasks.recent.map((t) => (
                  <tr key={t.id}>
                    <td><Link href={`/teach/tasks/${t.id}`}>{t.title}</Link><div className="tiny faint">{KIND_LABEL[t.kind]}</div></td>
                    <td style={{ minWidth: 160 }}><div className="row" style={{ gap: 8 }}><Bar value={t.submitted} max={Math.max(t.targeted, t.submitted, 1)} label={`${t.submitted}/${t.targeted}`} /><span className="mono small">{t.submitted}/{t.targeted}</span></div></td>
                    <td className="num mono">{t.approved}</td>
                    <td className="num mono">{t.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="card-b small muted">Henüz yayınlanmış görev yok.</div>}
      </section>
    </div>
  );
}
