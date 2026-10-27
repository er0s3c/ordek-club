import { pilotReadiness } from "@/server/academy/pilot";
import { requirePageSession } from "@/server/auth/page-guard";
import { isAdmin } from "@/server/auth/policy";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { FEATURE_KEYS, AVAILABLE_FEATURE_KEYS } from "@/server/learning/features";
import { FeatureControls } from "./FeatureControls";
import { PilotReadiness } from "./PilotReadiness";
import { labConfigurationStatus } from "@/server/learning/lab-client";
import { getT } from "@/i18n/server";
const labels = { learning: "Öğrenme alanı, streak ve tekrar", "academy-v2": "İki dilli akademi", "teacher-tools": "Öğretmen araçları", operations: "Canlı operasyonlar", ai: "Yapay zekâ", labs: "Gerçek Linux laboratuvarları", community: "Topluluk uygulamaları, rozet yol haritası ve kulüp hedefi", study: "Çalışma araçları: oturumlar, ders soruları, çalışma arkadaşı", workshops: "Atölyeler: güvenli kod, ağ, sorgu, zaman çizelgesi, kanıt haritası", "teacher-plus": "Öğretmen+: değerlendirme kuyruğu, içerik onayı, analizler", "club-ops": "Kulüp işleri: görüşme saatleri, katılım, anketler" };
export default async function Page() {
  const t = await getT();
  const { user } = await requirePageSession(); if (!isAdmin(user.role)) notFound();
  const rows=await db.featureSwitch.findMany();
  const pilot=pilotReadiness();
  const lab=labConfigurationStatus();
  return <div className="stack">
    <header className="page-head"><div className="eyebrow">{t("Yönetim")}</div><h1 className="page-title">{t("Özellik yönetimi")}</h1></header>
    <PilotReadiness pilot={pilot} />
    <section className="card card-b"><h2>{t("Linux lab bağlantısı")}</h2><p role="status">{lab.message}</p>{lab.missing.length>0&&<><p>{t("Eksik sunucu ayarları:")}</p><ul>{lab.missing.map(key=><li key={key}><code>{key}</code></li>)}</ul></>}<p className="small muted">{t("Ayrı Linux sunucusu ve karşılıklı TLS sertifikaları gerekir. Kurulumdan sonra uygulama sunucusunu yeniden başlatın ve")}{" "}<code>npm run lab:check</code>{" "}{t("ile erişimi doğrulayın. Bu kontrol 20 eşzamanlı oturum yük testinin yerine geçmez.")}</p></section>
    <FeatureControls features={FEATURE_KEYS.map(key=>({key,label:t(labels[key]),enabled:rows.find(r=>r.key===key)?.enabled??false,available:AVAILABLE_FEATURE_KEYS.includes(key)}))} />
  </div>;
}
