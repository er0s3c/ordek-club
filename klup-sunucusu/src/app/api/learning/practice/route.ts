import{z}from"zod";
import{memberContext}from"@/server/api-auth";
import{json,readJson,route}from"@/server/http";
import{db}from"@/server/db";
import{forbidden}from"@/server/errors";
import{requireFeature}from"@/server/learning/features";
import{answerDaily,createCtfTeam,joinCtfTeam,leaveCtfTeam,socDecision}from"@/server/learning/community";
const schema=z.discriminatedUnion("action",[
 z.object({action:z.literal("daily"),day:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),answer:z.number().int().min(0).max(2)}),
 z.object({action:z.literal("team.create"),name:z.string().trim().min(3).max(60)}),
 z.object({action:z.literal("team.join"),code:z.string().trim().min(20).max(50)}),
 z.object({action:z.literal("team.leave")}),
 z.object({action:z.literal("soc"),id:z.string().max(50),decision:z.enum(["benign","investigate","contain"])}),
 z.object({action:z.literal("report.submit")}),
 z.object({action:z.literal("report"),title:z.string().trim().min(3).max(160),evidence:z.string().trim().min(10).max(5000),impact:z.string().trim().min(10).max(5000),recommendation:z.string().trim().min(10).max(5000)}),
]);
export const POST=route(async req=>{const{actor}=await memberContext(req,{write:true});await requireFeature("community");const input=await readJson(req,schema);
 if(input.action==="daily")return json(await answerDaily(actor,input.day,input.answer));
 if(input.action==="team.create")return json(await createCtfTeam(actor,input.name));
 if(input.action==="team.join")return json(await joinCtfTeam(actor,input.code));
 if(input.action==="team.leave"){await leaveCtfTeam(actor);return json({ok:true});}
 if(input.action==="soc")return json(await socDecision(actor,input.id,input.decision));
 if(!await db.learningEvent.findUnique({where:{userId_key:{userId:actor.id,key:"lab:linux-permissions"}}}))throw forbidden("Önce ilgili laboratuvarı doğrula.");
 // İncelemeye gönder: öğretmen rubrikle (kanıt, açıklık, etki, çözüm) değerlendirir.
 if(input.action==="report.submit"){const r=await db.reportDraft.updateMany({where:{userId:actor.id,labKey:"linux-permissions"},data:{status:"SUBMITTED",submittedAt:new Date()}});if(!r.count)throw forbidden("Önce rapor taslağını kaydet.");return json({ok:true});}
 const{action:_,...data}=input;void _;
 return json(await db.reportDraft.upsert({where:{userId_labKey:{userId:actor.id,labKey:"linux-permissions"}},create:{userId:actor.id,labKey:"linux-permissions",...data},update:{...data,status:"DRAFT"}}));
});
