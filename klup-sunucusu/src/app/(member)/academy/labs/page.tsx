import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePageSession } from "@/server/auth/page-guard";
import { featureEnabled } from "@/server/learning/features";
import { db } from "@/server/db";
import { LinuxLab } from "@/components/academy/LinuxLab";
import { labConfigurationStatus } from "@/server/learning/lab-client";
import { isAdmin } from "@/server/auth/policy";
import { getT } from "@/i18n/server";
export const metadata={title:"Komut Hattı"};
export default async function Page(){
  const t = await getT();
  const{user}=await requirePageSession();if(!await featureEnabled("labs"))notFound();
  if (!labConfigurationStatus().configured) return <div className="stack"><header className="page-head"><div className="eyebrow">{t("Komut Hattı")}</div><h1 className="page-title">{t("Linux laboratuvarı hazırlanıyor")}</h1></header><section className="card card-b" role="status"><h2>{t("Terminal henüz kullanıma açık değil")}</h2><p>{t("Ayrı Linux lab sunucusunun bağlantı kurulumu tamamlandığında burada kişisel çalışma oturumunu başlatabileceksin.")}</p><div className="learning-tabs"><Link className="btn btn-primary" href="/academy">{t("Akademiye dön")}</Link>{isAdmin(user.role)&&<Link className="btn" href="/admin/features">{t("Lab kurulum durumunu incele")}</Link>}</div></section></div>;
  // Lab deneme geçmişi: oturum başlat/bitir ve doğrulama denemeleri (son 20).
  const rows=await db.workshopAttempt.findMany({where:{userId:user.id,kind:{in:["lab","lab-session"]},key:"linux-permissions"},orderBy:{createdAt:"desc"},take:20,select:{kind:true,passed:true,payload:true,createdAt:true}});
  return <LinuxLab history={rows.map(r=>({kind:r.kind,passed:r.passed,action:(r.payload as {action?:string}).action??null,at:r.createdAt.toISOString()}))}/>;
}
