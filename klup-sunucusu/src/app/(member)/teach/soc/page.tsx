import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { pageFeature } from "@/server/learning/page-features";
import { listScenariosForStaff } from "@/server/learning/soc-scenarios";
import { SocEditor, type StaffScenario } from "@/components/academy/SocScenarios";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Nöbet Masası senaryoları") };
}

export default async function SocEditorPage() {
  const t = await getT();
  const { user } = await requirePageSession(STAFF_ROLES);
  await pageFeature("community");
  const rows = await listScenariosForStaff({ id: user.id, role: user.role, status: user.status });
  return (
    <div className="stack fade-up">
      <header className="page-head"><div className="eyebrow">{t("Eğitmen · Topluluk")}</div><h1 className="page-title">{t("Nöbet Masası senaryoları")}</h1><p className="page-sub">{t("Alarm, kanıt, doğru karar ve açıklamayı tanımla; aynı senaryonun kolay, orta ve zor sürümlerini hazırla. Kurgusal veriler kullan; gerçek kişi veya kurum bilgisi ekleme.")}</p></header>
      <SocEditor scenarios={rows.map((r) => ({ id: r.id, title: r.title, summary: r.summary, status: r.status, version: r.version, variants: r.variants as StaffScenario["variants"] }))} />
    </div>
  );
}
