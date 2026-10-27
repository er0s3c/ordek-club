import type { Metadata } from "next";
import { Suspense } from "react";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { getSettings } from "@/server/settings";
import { AuditTable } from "./AuditTable";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Denetim kaydı") };
}

export default async function AuditPage() {
  const t = await getT();
  await requirePageSession(ADMIN_ROLES);
  const s = await getSettings();
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">{t("Yönetim paneli")}</div>
        <h1 className="page-title">{t("Denetim kaydı")}</h1>
        <p className="page-sub">{t("Girişler, başarısız denemeler, üyelik kararları, rol ve ayar değişiklikleri. Kayıtlar arayüzden silinemez.")}</p>
      </div>
      <Suspense fallback={<div className="card skeleton" style={{ height: 240 }} />}>
        <AuditTable timezone={s.timezone} />
      </Suspense>
    </div>
  );
}
