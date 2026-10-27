import {db} from "@/server/db";
import {badRequest,conflict,forbidden,notFound} from "@/server/errors";
import {canHostSession,type Actor} from "@/server/auth/policy";
import {requireFeature} from "./features";
import {scenario,visibleEvidence} from "./operation-scenario";
import {hub} from "@/server/live/hub";
async function context(actor:Actor,code:string){
  await requireFeature("operations");
  const session=await db.liveSession.findUnique({where:{code},include:{participants:{where:{userId:actor.id},select:{userId:true}}}});
  if(!session)throw notFound();
  const host=canHostSession(actor,session);
  if(!host&&!session.participants.length)throw forbidden("Önce canlı derse katıl.");
  return{session,host};
}
export async function operationView(actor:Actor,code:string){
  const{session,host}=await context(actor,code);
  const op=await db.classroomOperation.findUnique({where:{sessionId:session.id},include:{participants:true,votes:true}});
  if(!op)return{enabled:true,host,operation:null};
  const member=op.participants.find(p=>p.userId===actor.id);
  const ended=op.status==="ENDED"||session.status!=="ACTIVE";
  const stage=scenario.stages[Math.min(op.stage,1)]!;
  // Rol değişimi: öğrenciler analiz, iletişim ve müdahale rollerini aşama aşama sırayla üstlenir.
  const role=member?(member.team+op.stage)%3:null;
  const roleSummary=host?op.participants.map(p=>({userId:p.userId,history:(p.roleHistory as {stage:number;role:number}[]).map(h=>scenario.roles[h.role]??null)})):null;
  return{enabled:true,host,roleSummary,operation:{id:op.id,version:op.version,title:scenario.title,briefing:scenario.briefing,status:ended?"ENDED":op.status,stage:op.stage,stageTitle:stage.title,question:stage.question,choices:[...stage.choices],team:role!==null?scenario.roles[role]:null,observer:!member&&!host,evidence:host?scenario.evidence:member?visibleEvidence(role!,op.participants.length===1,op.stage):[],vote:op.votes.find(v=>v.userId===actor.id&&v.stage===op.stage)?.choice??null,tally:host||ended?stage.choices.map((_,i)=>op.votes.filter(v=>v.stage===op.stage&&v.choice===i).length):null,history:op.history as {stage:number;choice:number;outcome:string}[],debrief:ended?scenario.debrief:null}};
}
export async function controlOperation(actor:Actor,code:string,input:{action:"start"|"pause"|"resume"|"advance"|"end"|"vote";version?:number;choice?:number}){
  const{session,host}=await context(actor,code);
  if(session.status!=="ACTIVE")throw conflict("Canlı ders sona erdi.");
  if(input.action!=="vote"&&!host)throw forbidden();
  await db.$transaction(async tx=>{
    await tx.$queryRaw`SELECT id FROM "LiveSession" WHERE id = ${session.id} FOR UPDATE`;
    const currentSession=await tx.liveSession.findUniqueOrThrow({where:{id:session.id}});if(currentSession.status!=="ACTIVE")throw conflict("Canlı ders sona erdi.");
    const op=await tx.classroomOperation.findUnique({where:{sessionId:session.id},include:{participants:true}});
    if(input.action==="start"){
      if(op)throw conflict("Bu dersin operasyonu zaten oluşturuldu.");
      const learners=await tx.sessionParticipant.findMany({where:{sessionId:session.id,user:{role:"STUDENT",status:"ACTIVE"}},orderBy:{firstJoinAt:"asc"}});
      if(!learners.length)throw badRequest("Önce en az bir öğrencinin katılmasını bekle.");
      await tx.classroomOperation.create({data:{sessionId:session.id,participants:{create:learners.map((p,i)=>({userId:p.userId,team:i%3}))}}});return;
    }
    if(!op)throw notFound();if(op.status==="ENDED")throw conflict("Operasyon sona erdi.");
    if(op.version!==input.version)throw conflict("Durum değişti. Güncel ekranla tekrar dene.");
    if(input.action==="vote"){
      if(op.status!=="ACTIVE")throw conflict("Operasyon duraklatıldı.");
      if(!op.participants.some(p=>p.userId===actor.id))throw forbidden("Bu operasyonun başlangıç kadrosunda değilsin; gözlemci olarak izleyebilirsin.");
      if(input.choice===undefined||!Number.isInteger(input.choice)||input.choice<0||input.choice>2)throw badRequest("Geçersiz karar.");
      await tx.operationVote.createMany({data:[{operationId:op.id,userId:actor.id,stage:op.stage,choice:input.choice}],skipDuplicates:true});return;
    }
    if(input.action==="pause"||input.action==="resume"){await tx.classroomOperation.update({where:{id:op.id},data:{status:input.action==="pause"?"PAUSED":"ACTIVE",version:{increment:1}}});return;}
    if(input.action==="end"){await tx.classroomOperation.update({where:{id:op.id},data:{status:"ENDED",version:{increment:1}}});return;}
    if(op.status!=="ACTIVE"||input.choice===undefined||!Number.isInteger(input.choice)||input.choice<0||input.choice>2)throw badRequest("Devam eden aşama için bir karar seç.");
    const stage=scenario.stages[op.stage];if(!stage)throw conflict("Son aşamaya ulaşıldı.");
    const history=[...(op.history as {stage:number;choice:number;outcome:string}[]),{stage:op.stage,choice:input.choice,outcome:stage.outcomes[input.choice]!}];
    await tx.classroomOperation.update({where:{id:op.id},data:{stage:op.stage+1,status:op.stage===1?"ENDED":"ACTIVE",history,version:{increment:1}}});
    // Tamamlanan aşamada üstlenilen rol kaydedilir (oturum sonu rol dağılımı).
    const parts=await tx.operationParticipant.findMany({where:{operationId:op.id}});
    for(const p of parts)await tx.operationParticipant.update({where:{operationId_userId:{operationId:op.id,userId:p.userId}},data:{roleHistory:[...(p.roleHistory as {stage:number;role:number}[]),{stage:op.stage,role:(p.team+op.stage)%3}]}});
  });
  hub.notifyOperation(session.id);
  return operationView(actor,code);
}
export type OperationView=Awaited<ReturnType<typeof operationView>>;
