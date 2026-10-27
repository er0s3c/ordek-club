import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { featureUsage } from "@/server/usage";
import { StatusPill } from "@/components/ui/states";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Özellik kullanımı") };
}

const LABEL: Record<string, string> = { learning: "Öğrenme alanı", labs: "Gerçek Linux labları", community: "Topluluk", study: "Çalışma araçları", workshops: "Atölyeler", "teacher-plus": "Öğretmen+", "club-ops": "Kulüp işleri" };

export default async function UsagePage() {
  const t = await getT();
  await requirePageSession(ADMIN_ROLES);
  const rows = await featureUsage();
  return (
    <div className="stack fade-up">
      <header className="page-head"><div className="eyebrow">{t("Yönetim")}</div><h1 className="page-title">{t("Özellik kullanımı")}</h1><p className="page-sub">{t("Pilot sırasında hangi paketin gerçekten kullanıldığını görmek için toplu sayılar. Kişi bazında ayrıntı gösterilmez.")}</p></header>
      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>{t("Paket")}</th><th>{t("Ölçü")}</th><th className="num">{t("Son 7 gün")}</th><th className="num">{t("Son 30 gün")}</th><th className="num">{t("Kişi (30 gün)")}</th></tr></thead>
          <tbody>
            {rows.flatMap((r) => r.metrics.map((m, i) => (
              <tr key={`${r.key}-${m.label}`}>
                {i === 0 && <td rowSpan={r.metrics.length}><strong>{t(LABEL[r.key] ?? r.key)}</strong><br />{r.enabled ? <StatusPill tone="ok">{t("açık")}</StatusPill> : <StatusPill tone="neutral">{t("kapalı")}</StatusPill>}</td>}
                <td>{m.label}</td><td className="num">{m.d7}</td><td className="num">{m.d30}</td><td className="num">{m.people30 || "—"}</td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
