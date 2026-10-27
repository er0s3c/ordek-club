import {notFound} from "next/navigation";
import {requirePageSession} from "@/server/auth/page-guard";
import {STAFF_ROLES} from "@/server/auth/guard";
import {isAdmin} from "@/server/auth/policy";
import {db} from "@/server/db";
import {featureEnabled} from "@/server/learning/features";
import {learningRadar} from "@/server/learning/teacher-tools";
import { getT } from "@/i18n/server";
export const metadata={title:"Öğrenme radarı"};
export default async function Page({searchParams}:{searchParams:Promise<{group?:string}>}){
  const t = await getT();
  const{user}=await requirePageSession(STAFF_ROLES);if(!await featureEnabled("teacher-tools"))notFound();
  const groups=await db.classGroup.findMany({where:{kind:"CLASS",archivedAt:null,...(!isAdmin(user.role)?{createdById:user.id}:{})},select:{id:true,name:true},orderBy:{name:"asc"}});
  const requested=(await searchParams).group;const selected=requested??groups[0]?.id;if(requested&&!groups.some(g=>g.id===requested))notFound();
  const radar=selected?await learningRadar({id:user.id,role:user.role,status:user.status},selected):null;
  return <div className="stack"><header className="page-head"><div className="eyebrow">{t("Sınıf · Beceri matrisi")}</div><h1 className="page-title">{t("Öğrenme radarı")}</h1><p className="page-sub">{t("Tamamlanan çalışmalar ve başlanan dersler. Katılım süresi yeterlilik puanı sayılmaz.")}</p></header>{!groups.length?<p className="card card-b muted">{t("Önce bir sınıf oluşturup öğrenci ekle.")}</p>:<><form className="learning-plan-form"><label>{t("Sınıf")}<select className="input" name="group" defaultValue={selected}>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label><button className="btn btn-primary">{t("Göster")}</button></form>{radar&&<section className="card card-b"><div className="learning-table-wrap"><table><caption>{t("{name} — tamamlanan/mevcut beceri dersi", { name: radar.group.name })}</caption><thead><tr><th scope="col">{t("Öğrenci")}</th>{radar.skills.map(s=><th scope="col" key={s.key}>{s.tr}</th>)}</tr></thead><tbody>{radar.rows.map((r,i)=><tr key={i}><th scope="row">{r.name}</th>{r.skills.map(s=><td key={s.key}>{s.started?`${s.completed}/${s.total}`:t("Veri yok")}</td>)}</tr>)}</tbody></table></div>{!radar.rows.length&&<p className="muted">{t("Sınıfta aktif öğrenci yok.")}</p>}</section>}</>}</div>;
}
