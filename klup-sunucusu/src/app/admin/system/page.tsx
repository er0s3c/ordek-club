import type { Metadata } from "next";
import { Fragment } from "react";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { systemReport } from "@/server/health";
import { storageUsage } from "@/server/files/service";
import { SCOPE_LABEL } from "@/components/classroom/labels";
import { getSettings } from "@/server/settings";
import { formatBytes, formatDateTime } from "@/components/ui/format";

export const metadata: Metadata = { title: "Sistem durumu" };

const Dot = ({ ok }: { ok: boolean }) => <span style={{ color: ok ? "var(--term)" : "var(--red)" }}>●</span>;

export default async function SystemPage() {
  await requirePageSession(ADMIN_ROLES);
  const [r, s, files] = await Promise.all([systemReport(), getSettings(), storageUsage()]);
  const pct = files.quota ? Math.min(100, Math.round((files.total / files.quota) * 100)) : 0;
  const upH = Math.floor(r.uptimeSec / 3600), upM = Math.floor((r.uptimeSec % 3600) / 60);

  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">Yönetim paneli</div>
        <h1 className="page-title">Sistem durumu</h1>
        <p className="page-sub">Sunucu, veritabanı ve depolama sağlığı. Yedekleme ve güncelleme sunucu komut satırından yapılır.</p>
      </div>
      <div className="grid-stats">
        <div className="card stat"><div className="label">Veritabanı</div><div className="value" style={{ fontSize: 20, marginTop: 8 }}><Dot ok={r.database.ok} /> {r.database.ok ? `${r.database.latencyMs} ms` : "erişilemiyor"}</div><div className="hint">{r.database.version}</div></div>
        <div className="card stat"><div className="label">Depolama</div><div className="value" style={{ fontSize: 20, marginTop: 8 }}><Dot ok={r.storage.ok} /> {formatBytes(r.storage.usedBytes)}</div><div className="hint">boş disk: {formatBytes(r.storage.diskFreeBytes)} / {formatBytes(r.storage.diskTotalBytes)}</div></div>
        <div className="card stat"><div className="label">Bellek (RSS)</div><div className="value" style={{ fontSize: 20, marginTop: 8 }}>{r.memory.rssMb} MB</div><div className="hint">sistem: {r.memory.systemFreeMb} / {r.memory.systemTotalMb} MB boş</div></div>
        <div className="card stat"><div className="label">Çalışma süresi</div><div className="value" style={{ fontSize: 20, marginTop: 8 }}>{upH} sa {upM} dk</div><div className="hint">v{r.version} · Node {r.node}</div></div>
      </div>
      <div className="grid-2">
        <section className="card" aria-labelledby="sec-h">
          <div className="card-h"><h2 id="sec-h">Güvenlik yapılandırması</h2></div>
          <div className="card-b">
            <dl className="kv">
              <dt>Secure çerez (HTTPS)</dt><dd><Dot ok={r.secureCookies} /> {r.secureCookies ? "Açık" : "Kapalı — APP_URL https:// değil"}</dd>
              <dt>Ters vekil güveni</dt><dd>{r.trustProxy ? "Açık (X-Forwarded-For okunuyor)" : "Kapalı (soket adresi)"}</dd>
              <dt>Kurulum tarihi</dt><dd>{formatDateTime(s.setupCompletedAt, s.timezone)}</dd>
              <dt>Oturum ömrü</dt><dd>{s.sessionMaxAgeDays} gün · boşta {s.sessionIdleHours} saat</dd>
            </dl>
            {r.storage.error && <div className="alert alert-error small" style={{ marginTop: 12 }}>Depolama yazılamıyor: {r.storage.error}</div>}
          </div>
        </section>
        <section className="card" aria-labelledby="mig-h">
          <div className="card-h"><h2 id="mig-h">Veritabanı migration&apos;ları</h2></div>
          <div className="card-b">
            {r.migrations.length === 0 ? <p className="muted">Bilgi alınamadı.</p> : (
              <ul className="timeline">
                {r.migrations.map((mg) => (
                  <li key={mg.migration_name}><time>{formatDateTime(mg.finished_at, s.timezone)}</time><span className="mono small"><Dot ok={mg.finished_at !== null} /> {mg.migration_name}</span></li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      <section className="card" aria-labelledby="files-h">
        <div className="card-h"><h2 id="files-h">Paylaşılan dosyalar</h2><span className="tiny faint">kota: Kulüp ayarları</span></div>
        <div className="card-b stack-sm">
          <div className="row-between small"><span>{formatBytes(files.total)} / {formatBytes(files.quota)} kullanılıyor</span><span className="mono">%{pct}</span></div>
          <div className={pct >= 85 ? "meter is-high" : "meter"} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Dosya kotası doluluğu"><span style={{ width: `${pct}%` }} /></div>
          <dl className="kv">
            {files.byScope.map((b) => <Fragment key={b.scope}><dt>{SCOPE_LABEL[b.scope]}</dt><dd>{b.count} dosya · {formatBytes(b.bytes)}</dd></Fragment>)}
            <dt>Öğrenci başına</dt><dd>en fazla {formatBytes(files.userQuota)}</dd>
          </dl>
        </div>
      </section>
      <section className="card" aria-labelledby="ops-h">
        <div className="card-h"><h2 id="ops-h">Yedekleme ve güncelleme</h2></div>
        <div className="card-b stack small">
          <p className="muted" style={{ margin: 0 }}>Sunucuda <code>klup-sunucusu/</code> klasöründe çalıştırın:</p>
          <pre className="code-box" style={{ fontSize: 13, display: "block", whiteSpace: "pre-wrap", margin: 0 }}>{`./scripts/club.sh backup            # veritabanı + dosyalar → backups/
./scripts/club.sh restore <dosya>   # yedekten geri yükle
./scripts/club.sh update            # yeni sürümü al, yedekle, migration uygula, yeniden başlat
./scripts/club.sh status            # servis durumu`}</pre>
        </div>
      </section>
    </div>
  );
}
