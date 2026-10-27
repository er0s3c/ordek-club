import type { Metadata } from "next";
import { Suspense } from "react";
import { requirePageSession } from "@/server/auth/page-guard";
import { ADMIN_ROLES } from "@/server/auth/guard";
import { getSettings } from "@/server/settings";
import { MembersTable } from "./MembersTable";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Üyeler") };
}

export default async function MembersPage() {
  const t = await getT();
  await requirePageSession(ADMIN_ROLES);
  const s = await getSettings();
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">{t("Yönetim paneli")}</div>
        <h1 className="page-title">{t("Üyeler")}</h1>
        <p className="page-sub">{t("Başvuruları onayla, rolleri yönet, hesapları devre dışı bırak. Her işlem denetim kaydına yazılır.")}</p>
      </div>
      <Suspense fallback={<div className="card skeleton" style={{ height: 240 }} />}>
        <MembersTable timezone={s.timezone} />
      </Suspense>
    </div>
  );
}
