import type { Metadata } from "next";
import Link from "next/link";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { academyStats } from "@/server/academy/service";
import { getSettings } from "@/server/settings";
import { formatDateTime } from "@/components/ui/format";
import { ImportButton } from "./ImportButton";

export const metadata: Metadata = { title: "Akademi" };

export default async function AdminAcademyPage() {
  const { user } = await requirePageSession(ADMIN_ROLES);
  const [stats, s] = await Promise.all([academyStats({ id: user.id, role: user.role, status: user.status }), getSettings()]);
  const meta = (stats.lastImport?.meta ?? null) as { lessons?: number; created?: number; updated?: number; archived?: number } | null;

  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">Yönetim paneli</div>
        <h1 className="page-title">Akademi</h1>
        <p className="page-sub">
          Dersler <span className="mono">content/academy</span> klasöründeki Markdown dosyalarından gelir. İçerik değişince yeniden içe aktar;
          öğrencilerin ilerlemesi korunur, kaldırılan dersler silinmez, arşivlenir.
        </p>
      </div>

      <section className="card" aria-labelledby="imp-h">
        <div className="card-h"><h2 id="imp-h">İçe aktarma</h2></div>
        <div className="card-b stack-sm">
          <p className="small muted" style={{ margin: 0 }}>
            Son içe aktarma: {stats.lastImport ? formatDateTime(stats.lastImport.createdAt, s.timezone) : "hiç yapılmadı"}
            {meta?.lessons !== undefined && <> · {meta.lessons} ders ({meta.created ?? 0} yeni, {meta.updated ?? 0} güncellenen, {meta.archived ?? 0} arşivlenen)</>}
          </p>
          <ImportButton />
          <p className="tiny faint" style={{ margin: 0 }}>
            Sunucuda komut satırından da yapılabilir: <span className="mono">node dist/cli.js academy-import</span>. Docker imajı başlarken içeriği kendiliğinden aktarır.
          </p>
        </div>
      </section>

      <section className="card" aria-labelledby="st-h">
        <div className="card-h"><h2 id="st-h">Yollar ve katılım</h2></div>
        <div className="card-b flush">
          {stats.tracks.length === 0 ? (
            <div className="empty">Henüz içerik yok.</div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Yol</th><th className="num">Ders</th><th className="num">Başlayan</th><th className="num">Bitiren</th></tr></thead>
                <tbody>
                  {stats.tracks.map((t) => (
                    <tr key={t.key}>
                      <td><Link href={`/academy/${t.key}`}><span className="mono small">{t.code}</span> · {t.title}</Link></td>
                      <td className="num">{t.lessons}</td>
                      <td className="num">{t.learners}</td>
                      <td className="num">{t.finished}</td>
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
