import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { pageFeature } from "@/server/learning/page-features";
import { isStaff } from "@/server/auth/policy";
import { officeHours } from "@/server/club/ops";
import { OfficeHours } from "./OfficeHours";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Görüşme saatleri") };
}

export default async function OfficeHoursPage() {
  const t = await getT();
  const { user } = await requirePageSession();
  await pageFeature("club-ops");
  const slots = await officeHours({ id: user.id, role: user.role, status: user.status });
  return (
    <div className="stack fade-up">
      <header className="page-head"><div className="eyebrow">{t("Kulüp")}</div><h1 className="page-title">{t("Görüşme saatleri")}</h1><p className="page-sub">{t("Öğretmeninle birebir görüşmek için bir zaman dilimine kaydol ve konunu yaz; öğretmen hazırlıklı gelir.")}</p></header>
      <OfficeHours slots={slots} staff={isStaff(user.role)} />
    </div>
  );
}
