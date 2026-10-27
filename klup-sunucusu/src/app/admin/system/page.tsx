import type { Metadata } from "next";
import { Fragment } from "react";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { systemReport } from "@/server/health";
import { storageUsage } from "@/server/files/service";
import { SCOPE_LABEL } from "@/components/classroom/labels";
import { getSettings } from "@/server/settings";
import { formatBytes, formatDateTime } from "@/components/ui/format";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Sistem durumu") };
}

const Dot = ({ ok }: { ok: boolean }) => <span style={{ color: ok ? "var(--term)" : "var(--red)" }}>●</span>;

export default async function SystemPage() {
  const t = await getT();
  await requirePageSession(ADMIN_ROLES);
  const [r, s, files] = await Promise.all([systemReport(), getSettings(), storageUsage()]);
  const pct = files.quota ? Math.min(100, Math.round((files.total / files.quota) * 100)) : 0;
  const upH = Math.floor(r.uptimeSec / 3600), upM = Math.floor((r.uptimeSec % 3600) / 60);

  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">{t("Yönetim paneli")}</div>
        <h1 className="page-title">{t("Sistem durumu")}</h1>
        <p className="page-sub">{t("Sunucu, veritabanı ve depolama sağlığı. Yedekleme ve güncelleme sunucu komut satırından yapılır.")}</p>
      </div>
      <div className="grid-stats">
        <div className="card stat"><div className="label">{t("Veritabanı")}</div><div className="value" style={{ fontSize: 20, marginTop: 8 }}><Dot ok={r.database.ok} /> {r.database.ok ? t("{latencyMs} ms", { latencyMs: r.database.latencyMs }) : t("erişilemiyor")}</div><div className="hint">{r.database.version}</div></div>
        <div className="card stat"><div className="label">{t("Depolama")}</div><div className="value" style={{ fontSize: 20, marginTop: 8 }}><Dot ok={r.storage.ok} /> {formatBytes(r.storage.usedBytes)}</div><div className="hint">{t("boş disk: {v0} / {v1}", { v0: formatBytes(r.storage.diskFreeBytes), v1: formatBytes(r.storage.diskTotalBytes) })}</div></div>
        <div className="card stat"><div className="label">{t("Bellek (RSS)")}</div><div className="value" style={{ fontSize: 20, marginTop: 8 }}>{r.memory.rssMb} MB</div><div className="hint">{t("sistem: {systemFreeMb} / {systemTotalMb} MB boş", { systemFreeMb: r.memory.systemFreeMb, systemTotalMb: r.memory.systemTotalMb })}</div></div>
        <div className="card stat"><div className="label">{t("Çalışma süresi")}</div><div className="value" style={{ fontSize: 20, marginTop: 8 }}>{t("{upH} sa {upM} dk", { upH, upM })}</div><div className="hint">{t("v{version} · Node {node}", { version: r.version, node: r.node })}</div></div>
      </div>
      <div className="grid-2">
        <section className="card" aria-labelledby="sec-h">
          <div className="card-h"><h2 id="sec-h">{t("Güvenlik yapılandırması")}</h2></div>
          <div className="card-b">
            <dl className="kv">
              <dt>{t("Secure çerez (HTTPS)")}</dt><dd><Dot ok={r.secureCookies} /> {r.secureCookies ? t("Açık") : t("Kapalı — APP_URL https:// değil")}</dd>
              <dt>{t("Ters vekil güveni")}</dt><dd>{r.trustProxy ? t("Açık (X-Forwarded-For okunuyor)") : t("Kapalı (soket adresi)")}</dd>
              <dt>{t("Kurulum tarihi")}</dt><dd>{formatDateTime(s.setupCompletedAt, s.timezone, t.intl)}</dd>
              <dt>{t("Oturum ömrü")}</dt><dd>{t("{sessionMaxAgeDays} gün · boşta {sessionIdleHours} saat", { sessionMaxAgeDays: s.sessionMaxAgeDays, sessionIdleHours: s.sessionIdleHours })}</dd>
            </dl>
            {r.storage.error && <div className="alert alert-error small" style={{ marginTop: 12 }}>{t("Depolama yazılamıyor: {error}", { error: r.storage.error })}</div>}
          </div>
        </section>
        <section className="card" aria-labelledby="mig-h">
          <div className="card-h"><h2 id="mig-h">{t("Veritabanı migration'ları")}</h2></div>
          <div className="card-b">
            {r.migrations.length === 0 ? <p className="muted">{t("Bilgi alınamadı.")}</p> : (
              <ul className="timeline">
                {r.migrations.map((mg) => (
                  <li key={mg.migration_name}><time>{formatDateTime(mg.finished_at, s.timezone, t.intl)}</time><span className="mono small"><Dot ok={mg.finished_at !== null} /> {mg.migration_name}</span></li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
      <section className="card" aria-labelledby="files-h">
        <div className="card-h"><h2 id="files-h">{t("Paylaşılan dosyalar")}</h2><span className="tiny faint">{t("kota: Kulüp ayarları")}</span></div>
        <div className="card-b stack-sm">
          <div className="row-between small"><span>{t("{v0} / {v1} kullanılıyor", { v0: formatBytes(files.total), v1: formatBytes(files.quota) })}</span><span className="mono">%{pct}</span></div>
          <div className={pct >= 85 ? "meter is-high" : "meter"} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={t("Dosya kotası doluluğu")}><span style={{ width: `${pct}%` }} /></div>
          <dl className="kv">
            {files.byScope.map((b) => <Fragment key={b.scope}><dt>{t(SCOPE_LABEL[b.scope])}</dt><dd>{t("{count} dosya · {v0}", { count: b.count, v0: formatBytes(b.bytes) })}</dd></Fragment>)}
            <dt>{t("Öğrenci başına")}</dt><dd>{t("en fazla {v0}", { v0: formatBytes(files.userQuota) })}</dd>
          </dl>
        </div>
      </section>
      <section className="card" aria-labelledby="ops-h">
        <div className="card-h"><h2 id="ops-h">{t("Yedekleme ve güncelleme")}</h2></div>
        <div className="card-b stack small">
          <p className="muted" style={{ margin: 0 }}>{t("Sunucuda")}{" "}<code>klup-sunucusu/</code>{" "}{t("klasöründe çalıştırın:")}</p>
          <pre className="code-box" style={{ fontSize: 13, display: "block", whiteSpace: "pre-wrap", margin: 0 }}>{`./scripts/club.sh backup            # veritabanı + dosyalar → backups/
./scripts/club.sh restore <dosya>   # yedekten geri yükle
./scripts/club.sh update            # yeni sürümü al, yedekle, migration uygula, yeniden başlat
./scripts/club.sh status            # servis durumu`}</pre>
        </div>
      </section>
    </div>
  );
}
