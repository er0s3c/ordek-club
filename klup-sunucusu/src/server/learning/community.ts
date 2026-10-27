import crypto from "node:crypto";
import{db}from"@/server/db";
import{badRequest,conflict,forbidden,notFound}from"@/server/errors";
import type{Actor}from"@/server/auth/policy";
import{getSettings}from"@/server/settings";
import{dayKey,zonedToUtc}from"@/server/xp/time";
import{weekOf,shiftDay}from"./calendar";
import{recordLearning}from"./events";
import{award}from"@/server/xp/engine";
import{dailyEvidence,evidenceIndex,socAlerts}from"./practice-data";
export async function dailyQuestion(userId:string){const{timezone}=await getSettings();const day=dayKey(new Date(),timezone);const q=dailyEvidence[evidenceIndex(day)]!;const done=await db.learningEvent.findUnique({where:{userId_key:{userId,key:`daily:${day}`}}});return{day,title:q.title,evidence:q.evidence,question:q.question,options:q.options,solved:!!done};}
export async function answerDaily(actor:Actor,day:string,answer:number){const current=await dailyQuestion(actor.id);if(current.day!==day)throw conflict("Yeni günün sorusu açıldı. Ekranı yenile.");const q=dailyEvidence[evidenceIndex(day)]!;if(answer<0||answer>=q.options.length)throw badRequest("Geçersiz seçenek.");const correct=answer===q.answer;if(correct)await db.$transaction(async tx=>{await recordLearning(tx,actor.id,`daily:${day}`,"daily");await award(tx,{userId:actor.id,ruleKey:"task.daily",key:`daily:${actor.id}:${day}`,source:"TASK",reason:q.title});});return{correct,explanation:correct?q.explanation:"Kanıttan doğrudan çıkarılabilen sonucu yeniden düşün."};}
const hashCode=(s:string)=>crypto.createHash("sha256").update(s).digest("hex");
export async function createCtfTeam(actor:Actor,name:string){
  if(actor.role!=="STUDENT")throw forbidden("Takımlar öğrenci üyeler içindir.");
  const code=crypto.randomBytes(16).toString("base64url");
  const team=await db.$transaction(async tx=>{await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${actor.id} FOR UPDATE`;if(await tx.ctfTeamMember.findUnique({where:{userId:actor.id}}))throw conflict("Zaten bir takıma üyesin.");if(await tx.ctfTeam.findUnique({where:{name}}))throw conflict("Bu takım adı kullanılıyor.");return tx.ctfTeam.create({data:{name,captainId:actor.id,joinCodeHash:hashCode(code),members:{create:{userId:actor.id}}}});});return{id:team.id,code};
}
export async function joinCtfTeam(actor:Actor,code:string){
  if(actor.role!=="STUDENT")throw forbidden();
  return db.$transaction(async tx=>{await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${actor.id} FOR UPDATE`;const team=await tx.ctfTeam.findUnique({where:{joinCodeHash:hashCode(code)}});if(!team)throw notFound("Takım kodu bulunamadı.");await tx.$queryRaw`SELECT id FROM "CtfTeam" WHERE id = ${team.id} FOR UPDATE`;const count=await tx.ctfTeamMember.count({where:{teamId:team.id}});if(count>=6)throw conflict("Takım altı kişilik kapasiteye ulaştı.");if(await tx.ctfTeamMember.findUnique({where:{userId:actor.id}}))throw conflict("Zaten bir takıma üyesin.");return tx.ctfTeamMember.create({data:{teamId:team.id,userId:actor.id}});});
}
export async function leaveCtfTeam(actor:Actor){return db.$transaction(async tx=>{const m=await tx.ctfTeamMember.findUnique({where:{userId:actor.id}});if(!m)throw notFound();await tx.$queryRaw`SELECT id FROM "CtfTeam" WHERE id = ${m.teamId} FOR UPDATE`;const team=await tx.ctfTeam.findUniqueOrThrow({where:{id:m.teamId}});await tx.ctfTeamMember.deleteMany({where:{userId:actor.id}});const next=await tx.ctfTeamMember.findFirst({where:{teamId:m.teamId},orderBy:{joinedAt:"asc"}});if(!next)await tx.ctfTeam.delete({where:{id:m.teamId}});else if(team.captainId===actor.id)await tx.ctfTeam.update({where:{id:m.teamId},data:{captainId:next.userId}});});}
export async function weeklyLeague(actor:Actor,departmentOnly:boolean){
  const{timezone}=await getSettings();const week=weekOf(dayKey(new Date(),timezone));const toDate=(day:string)=>{const[y,m,d]=day.split("-").map(Number) as[number,number,number];return zonedToUtc(y,m,d,timezone);};
  const me=await db.user.findUniqueOrThrow({where:{id:actor.id},select:{department:true}});
  if(departmentOnly&&!me.department)return{week,rows:[],department:null};
  const sums=await db.xpTransaction.groupBy({by:["userId"],where:{createdAt:{gte:toDate(week),lt:toDate(shiftDay(week,7))},user:{role:"STUDENT",status:"ACTIVE",...(departmentOnly?{department:me.department}:{})}},_sum:{amount:true}});
  const sorted=sums.map(s=>({userId:s.userId,xp:s._sum.amount??0})).filter(s=>s.xp>0).sort((a,b)=>b.xp-a.xp||a.userId.localeCompare(b.userId));
  const users=await db.user.findMany({where:{id:{in:sorted.slice(0,50).map(s=>s.userId)}},select:{id:true,displayName:true,username:true}});
  return{week,department:departmentOnly?me.department:null,rows:sorted.slice(0,50).map(s=>({...s,rank:sorted.findIndex(r=>r.xp===s.xp)+1,user:users.find(u=>u.id===s.userId)!}))};
}
export async function socDecision(actor:Actor,id:string,decision:string){const alert=socAlerts.find(a=>a.id===id);if(!alert)throw notFound();const correct=alert.answer===decision;return db.$transaction(async tx=>{await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${actor.id} FOR UPDATE`;const previous=await tx.socAttempt.findUnique({where:{userId_alertKey:{userId:actor.id,alertKey:id}}});if(previous)return{correct:previous.correct,explanation:alert.explanation};await tx.socAttempt.create({data:{userId:actor.id,alertKey:id,decision,correct}});if(correct)await recordLearning(tx,actor.id,`soc:${id}`,"soc");return{correct,explanation:alert.explanation};});}
