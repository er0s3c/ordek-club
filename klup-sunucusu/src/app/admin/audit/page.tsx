import type { Metadata } from "next";
import { Suspense } from "react";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { getSettings } from "@/server/settings";
import { AuditTable } from "./AuditTable";

export const metadata: Metadata = { title: "Denetim kaydı" };

export default async function AuditPage() {
  await requirePageSession(ADMIN_ROLES);
  const s = await getSettings();
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">Yönetim paneli</div>
        <h1 className="page-title">Denetim kaydı</h1>
        <p className="page-sub">Girişler, başarısız denemeler, üyelik kararları, rol ve ayar değişiklikleri. Kayıtlar arayüzden silinemez.</p>
      </div>
      <Suspense fallback={<div className="card skeleton" style={{ height: 240 }} />}>
        <AuditTable timezone={s.timezone} />
      </Suspense>
    </div>
  );
}
