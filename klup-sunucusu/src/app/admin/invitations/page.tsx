import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { assignableRoles } from "@/server/auth/policy";
import { getSettings } from "@/server/settings";
import { InvitationManager } from "./InvitationManager";
import { getT, getServerMessages } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Davetler") };
}

export default async function InvitationsPage() {
  const t = await getT();
  const { user } = await requirePageSession(ADMIN_ROLES);
  const s = await getSettings();
  const m = await getServerMessages();
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">{t("Yönetim paneli")}</div>
        <h1 className="page-title">{t("Davet kodları")}</h1>
        <p className="page-sub">
          {t("Kayıt politikası şu an")}{" "}<strong>{m.policies[s.registrationPolicy].label}</strong>{t(". Davet kodları tahmin edilemez (12 karakter, ~59 bit), yalnızca oluşturulduğunda bir kez gösterilir ve sunucuda hash'lenmiş saklanır.")}
        </p>
      </div>
      <InvitationManager roles={assignableRoles({ id: user.id, role: user.role, status: user.status }).filter((r) => r !== "OWNER")} timezone={s.timezone} appUrl={s.appUrl} />
    </div>
  );
}
