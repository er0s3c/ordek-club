import{notFound}from"next/navigation";
import{requirePageSession}from"@/server/auth/page-guard";
import{featureEnabled}from"@/server/learning/features";
import{Glossary}from"@/components/academy/Terms";
import { getT } from "@/i18n/server";
export const metadata={title:"Terimler · TR/EN"};
export default async function Page(){
const t = await getT();await requirePageSession();if(!await featureEnabled("academy-v2"))notFound();return <div className="stack"><header className="page-head"><div className="eyebrow">{t("Ördek Akademi · Cep sözlüğü")}</div><h1 className="page-title">{t("Terimler")}</h1><p className="page-sub">{t("Türkçe ve İngilizce kavramlar, kısa açıklamalar ve örnekler.")}</p></header><Glossary/></div>;}
