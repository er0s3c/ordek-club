import {notFound} from "next/navigation";
import {requirePageSession} from "@/server/auth/page-guard";
import {featureEnabled} from "@/server/learning/features";
import {db} from "@/server/db";
import {PortfolioToggle} from "@/components/academy/PortfolioToggle";
import {PortfolioStory,StoryView} from "@/components/academy/PortfolioStory";
import { getT } from "@/i18n/server";
export const metadata={title:"Öğrenme portfolyosu"};
export default async function Page({params}:{params:Promise<{username:string}>}){
  const t = await getT();
  const{user:viewer}=await requirePageSession();if(!await featureEnabled("learning"))notFound();
  const username=(await params).username.toLowerCase();const user=await db.user.findFirst({where:{username,status:"ACTIVE"},select:{id:true,displayName:true}});if(!user)notFound();
  const own=viewer.id===user.id;const choices=await db.portfolioWork.findMany({where:{userId:user.id}});
  const works=await db.submission.findMany({where:{status:"APPROVED",OR:[{userId:user.id},{team:{members:{some:{userId:user.id}}}}],...(!own?{id:{in:choices.filter(c=>c.visible).map(c=>c.submissionId)}}:{})},include:{assignment:{select:{title:true}}},orderBy:{reviewedAt:"desc"},take:50});
  return <div className="stack"><header className="page-head"><div className="eyebrow">{t("Öğrenme portfolyosu")}</div><h1 className="page-title">{user.displayName}</h1><p className="page-sub">{t("Öğretmen tarafından onaylanmış çalışmalar.")}{own?t(" Seçtiğin çalışmaların metni giriş yapmış kulüp üyeleri tarafından okunabilir."):""}</p></header>{!works.length&&<section className="card card-b"><p className="muted">{t("Henüz gösterilen onaylı çalışma yok.")}</p></section>}{works.map(w=><article className="card card-b stack" key={w.id}><h2>{w.assignment.title}</h2><span className="badge">{t("Onaylandı · {v0}", { v0: w.reviewedAt?.toISOString().slice(0,10) })}</span><p className="learning-note">{w.text}</p>{(()=>{const c=choices.find(x=>x.submissionId===w.id);const st={problem:c?.problem??"",approach:c?.approach??"",result:c?.result??"",learned:c?.learned??""};return own?<><PortfolioStory submissionId={w.id} initial={st}/><PortfolioToggle submissionId={w.id} visible={c?.visible??false}/></>:<StoryView story={st}/>;})()}</article>)}</div>;
}
