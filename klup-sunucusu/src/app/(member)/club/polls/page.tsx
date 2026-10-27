import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { pageFeature } from "@/server/learning/page-features";
import { canManageClassroom } from "@/server/auth/policy";
import { polls } from "@/server/club/ops";
import { Polls } from "./Polls";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Kulüp anketleri") };
}

export default async function PollsPage() {
  const t = await getT();
  const { user } = await requirePageSession();
  await pageFeature("club-ops");
  const actor = { id: user.id, role: user.role, status: user.status };
  return (
    <div className="stack fade-up">
      <header className="page-head"><div className="eyebrow">{t("Kulüp")}</div><h1 className="page-title">{t("Anketler")}</h1><p className="page-sub">{t("Etkinlik saatleri, atölye konuları ve kulüp kararları için görüşünü ver. Sonuçlar oy verdikten sonra görünür.")}</p></header>
      <Polls rows={await polls(actor)} staff={canManageClassroom(actor)} />
    </div>
  );
}
