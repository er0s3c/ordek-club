import Link from"next/link";
import{notFound}from"next/navigation";
import{requirePageSession}from"@/server/auth/page-guard";
import{featureEnabled}from"@/server/learning/features";
import{db}from"@/server/db";
import{dailyQuestion,weeklyLeague}from"@/server/learning/community";
import{socAlerts,reportExample}from"@/server/learning/practice-data";
import{DailyPanel,TeamPanel,SocPanel,ReportPanel}from"@/components/academy/PracticePanels";
import{ReportReview}from"@/components/academy/ReportReview";
import{SocPlayer}from"@/components/academy/SocScenarios";
import{publishedScenarios}from"@/server/learning/soc-scenarios";
import { getT } from "@/i18n/server";
export const metadata={title:"Uygulama meydanı"};
export default async function Page({searchParams}:{searchParams:Promise<{department?:string}>}){
 const t = await getT();
 const{user}=await requirePageSession();if(!await featureEnabled("community"))notFound();
 const[question,team,attempts,draft,unlocked,league]=await Promise.all([dailyQuestion(user.id),db.ctfTeamMember.findUnique({where:{userId:user.id},include:{team:{include:{members:{include:{user:{select:{displayName:true}}}}}}}}),db.socAttempt.findMany({where:{userId:user.id}}),db.reportDraft.findUnique({where:{userId_labKey:{userId:user.id,labKey:"linux-permissions"}}}),db.learningEvent.findUnique({where:{userId_key:{userId:user.id,key:"lab:linux-permissions"}}}),weeklyLeague({id:user.id,role:user.role,status:user.status},(await searchParams).department==="mine")]);
 return <div className="stack"><header className="page-head hero-galaxy"><div className="eyebrow">{t("Ördek Akademi · Birlikte öğren")}</div><h1 className="page-title">{t("Uygulama meydanı")}</h1><p className="page-sub">{t("Bir kanıtı yorumla, takımınla hazırlan, bulgunu raporla.")}</p></header><div className="grid-2"><DailyPanel daily={question}/>{user.role === "STUDENT" ? <TeamPanel team={team?.team??null}/> : <section className="card card-b"><h2>{t("Takım çalışmaları")}</h2><p>{t("CTF takımları öğrenci üyeler içindir. Sınıfın için takım görevlerini eğitmen panelinden yönetebilirsin.")}</p><Link className="btn" href="/teach/tasks">{t("Görevler")}</Link></section>}</div><section className="card card-b stack"><h2>{t("Haftalık lig · {week}", { week: league.week })}</h2><nav className="learning-tabs"><Link className="btn" href="?department=all">{t("Kulüp")}</Link><Link className="btn" href="?department=mine">{t("Bölümüm")}</Link></nav><p className="small muted">{t("Kulüp saat diliminde pazartesi başlayan haftanın XP toplamı. Eşit puanlar aynı sırayı paylaşır.")}</p>{!league.rows.length?<p className="muted">{t("Bu görünümde henüz sıralanacak puan yok. Bölüm liginde profilindeki bölüm bilgisi kullanılır.")}</p>:<ol className="list-tight">{league.rows.map(r=><li className="learning-agenda" key={r.userId}><strong>{r.rank}</strong><span><Link href={`/u/${r.user.username}`}>{r.user.displayName}</Link></span><span>{r.xp} XP</span></li>)}</ol>}</section><SocPlayer scenarios={await publishedScenarios(user.id)}/><SocPanel alerts={socAlerts.map(a=>({id:a.id,title:a.title,evidence:a.evidence,attempt:attempts.find(x=>x.alertKey===a.id)??null}))}/><ReportPanel draft={draft} example={reportExample} unlocked={!!unlocked}/>{draft&&<ReportReview status={draft.status} scores={(draft.rubricScores as number[]|null)??null} feedback={draft.feedback}/>}</div>;
}
