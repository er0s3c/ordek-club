import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { getSettings } from "@/server/settings";
import { SettingsForm } from "./SettingsForm";
import { LogoUploader } from "@/components/admin/LogoUploader";
import { OwnershipCard } from "./OwnershipCard";
import { mailMode } from "@/server/mail/outbox";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Kulüp ayarları") };
}

export default async function SettingsPage() {
  const t = await getT();
  const { user } = await requirePageSession(ADMIN_ROLES);
  const s = await getSettings();
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">{t("Yönetim paneli")}</div>
        <h1 className="page-title">{t("Kulüp ayarları")}</h1>
        <p className="page-sub">{t("Değişiklikler denetim kaydına (önceki ve yeni değerleriyle) yazılır.")}</p>
      </div>
      <section className="card" aria-labelledby="logo-h">
        <div className="card-h"><h2 id="logo-h">{t("Logo")}</h2><span className="tiny faint">{t("PNG / JPEG / WebP · en fazla 1 MB")}</span></div>
        <div className="card-b"><LogoUploader initialHasLogo={Boolean(s.logoFile)} initialVersion={s.logoUpdatedAt?.getTime() ?? 0} /></div>
      </section>
      <SettingsForm
        initial={{
          clubName: s.clubName,
          universityName: s.universityName,
          description: s.description,
          appUrl: s.appUrl,
          timezone: s.timezone,
          locale: s.locale as "tr" | "en",
          registrationPolicy: s.registrationPolicy,
          maxUploadMb: s.maxUploadMb,
          storageQuotaMb: s.storageQuotaMb,
          userQuotaMb: s.userQuotaMb,
          sessionMaxAgeDays: s.sessionMaxAgeDays,
          sessionIdleHours: s.sessionIdleHours,
        }}
      />
      <section className="card" aria-labelledby="mailcfg-h">
        <div className="card-h"><h2 id="mailcfg-h">{t("E-posta")}</h2><span className={mailMode() === "smtp" ? "badge badge-lime" : "badge"}>{mailMode() === "smtp" ? t("SMTP açık") : mailMode() === "file" ? t("geliştirme: dosyaya yazılıyor") : t("kapalı")}</span></div>
        <div className="card-b small muted">{t("SMTP ayarları güvenlik nedeniyle sunucudaki")}{" "}<code>.env</code>{" "}{t("dosyasında tutulur (SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM). Açıkken parola sıfırlama ve bildirim e-postaları gönderilir.")}</div>
      </section>
      {user.role === "OWNER" && <OwnershipCard />}
    </div>
  );
}
