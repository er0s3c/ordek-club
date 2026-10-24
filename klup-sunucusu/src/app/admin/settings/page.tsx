import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { getSettings } from "@/server/settings";
import { SettingsForm } from "./SettingsForm";
import { LogoUploader } from "@/components/admin/LogoUploader";
import { OwnershipCard } from "./OwnershipCard";
import { mailMode } from "@/server/mail/outbox";

export const metadata: Metadata = { title: "Kulüp ayarları" };

export default async function SettingsPage() {
  const { user } = await requirePageSession(ADMIN_ROLES);
  const s = await getSettings();
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">Yönetim paneli</div>
        <h1 className="page-title">Kulüp ayarları</h1>
        <p className="page-sub">Değişiklikler denetim kaydına (önceki ve yeni değerleriyle) yazılır.</p>
      </div>
      <section className="card" aria-labelledby="logo-h">
        <div className="card-h"><h2 id="logo-h">Logo</h2><span className="tiny faint">PNG / JPEG / WebP · en fazla 1 MB</span></div>
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
        <div className="card-h"><h2 id="mailcfg-h">E-posta</h2><span className={mailMode() === "smtp" ? "badge badge-lime" : "badge"}>{mailMode() === "smtp" ? "SMTP açık" : mailMode() === "file" ? "geliştirme: dosyaya yazılıyor" : "kapalı"}</span></div>
        <div className="card-b small muted">SMTP ayarları güvenlik nedeniyle sunucudaki <code>.env</code> dosyasında tutulur (SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM). Açıkken parola sıfırlama ve bildirim e-postaları gönderilir.</div>
      </section>
      {user.role === "OWNER" && <OwnershipCard />}
    </div>
  );
}
