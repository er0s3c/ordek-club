import { notFound } from "next/navigation";
import { requirePageSession } from "@/server/auth/page-guard";
import { featureEnabled } from "@/server/learning/features";
import { placementQuestions } from "@/server/academy/placement";
import { PlacementForm } from "@/components/academy/PlacementForm";
import { getT } from "@/i18n/server";
export const metadata={title:"Başlangıç değerlendirmesi"};
export default async function Page(){
const t = await getT();await requirePageSession();if(!await featureEnabled("learning"))notFound();return <div className="stack"><header className="page-head hero-galaxy"><div className="eyebrow">{t("Ördek Akademi · Yönünü bul")}</div><h1 className="page-title">{t("Nereden başlamalıyım?")}</h1><p className="page-sub">{t("10 soruyla başlangıç önerisi al. Bu test dersleri tamamlamaz veya XP vermez.")}</p></header><PlacementForm questions={placementQuestions.map(q=>({text:q.text,options:q.options}))}/></div>;}
