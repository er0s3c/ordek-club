import{notFound}from"next/navigation";
import{db}from"@/server/db";
import{featureEnabled}from"@/server/learning/features";
import { getT } from "@/i18n/server";
export const metadata={title:"Belge doğrulama",robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{token:string}>}){
const t = await getT();const{token}=await params;if(!/^[a-zA-Z0-9_-]{43}$/.test(token)||!await featureEnabled("academy-v2"))notFound();const cert=await db.learningCertificate.findUnique({where:{token},select:{trackTitle:true,ownerName:true,shareName:true,awardedAt:true}});if(!cert)notFound();return <main className="auth-wrap"><section className="card card-b stack"><div className="eyebrow">{t("Ördek Akademi")}</div><h1 className="page-title">{t("Belge doğrulandı")}</h1><h2>{cert.trackTitle}</h2><p>{cert.shareName?cert.ownerName:t("Belge sahibi adını herkese açık göstermeyi seçmedi.")}</p><p>{t("Düzenlenme: {v0}", { v0: cert.awardedAt.toISOString().slice(0,10) })}</p><p>{t("Akredite değildir; bilgi düzeyini gösterir.")}</p></section></main>;}
