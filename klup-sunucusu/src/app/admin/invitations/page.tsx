import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { assignableRoles } from "@/server/auth/policy";
import { getSettings } from "@/server/settings";
import { getMessages } from "@/i18n";
import { InvitationManager } from "./InvitationManager";

export const metadata: Metadata = { title: "Davetler" };

export default async function InvitationsPage() {
  const { user } = await requirePageSession(ADMIN_ROLES);
  const s = await getSettings();
  const m = getMessages(s.locale);
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">Yönetim paneli</div>
        <h1 className="page-title">Davet kodları</h1>
        <p className="page-sub">
          Kayıt politikası şu an <strong>{m.policies[s.registrationPolicy].label}</strong>. Davet kodları tahmin edilemez
          (12 karakter, ~59 bit), yalnızca oluşturulduğunda bir kez gösterilir ve sunucuda hash&apos;lenmiş saklanır.
        </p>
      </div>
      <InvitationManager roles={assignableRoles({ id: user.id, role: user.role, status: user.status }).filter((r) => r !== "OWNER")} timezone={s.timezone} appUrl={s.appUrl} />
    </div>
  );
}
