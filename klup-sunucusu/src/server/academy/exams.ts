import { recordLearning } from "@/server/learning/events";
import crypto from "node:crypto";
import{Prisma}from"@prisma/client";
import{db}from"@/server/db";
import{badRequest,conflict,notFound}from"@/server/errors";
import{type Actor,isAdmin}from"@/server/auth/policy";
import{gradeQuiz,publicQuestions,type QuizAnswer}from"./service";
import type{QuizQuestion}from"./content";
export async function examState(actor:Actor,key:string){
 const track=await db.track.findFirst({where:{key,archivedAt:null},include:{exam:true,lessons:{where:{archivedAt:null,kind:{not:"INFO"}},select:{id:true,progress:{where:{userId:actor.id,status:"COMPLETED"},select:{id:true}}}}}});if(!track)throw notFound();
 const[attempt,certificate]=await Promise.all([db.trackExamAttempt.findFirst({where:{userId:actor.id,trackId:track.id},orderBy:{createdAt:"desc"}}),db.learningCertificate.findUnique({where:{userId_trackId:{userId:actor.id,trackId:track.id}}})]);
 const total=track.lessons.length,completed=track.lessons.filter(l=>l.progress.length).length;
 let issued=certificate;
 if(!issued&&total>0&&completed===total&&await db.trackExamAttempt.findFirst({where:{userId:actor.id,trackId:track.id,passed:true}})){
  const owner=await db.user.findUniqueOrThrow({where:{id:actor.id},select:{displayName:true}});
  issued=await db.learningCertificate.upsert({where:{userId_trackId:{userId:actor.id,trackId:track.id}},create:{token:crypto.randomBytes(32).toString("base64url"),userId:actor.id,trackId:track.id,ownerName:owner.displayName,trackTitle:track.title},update:{}});
 }
 return{track:{id:track.id,key:track.key,title:track.title},configured:!!track.exam,total,completed,eligible:total>0&&completed/total>=.75,attempt:attempt?{id:attempt.id,createdAt:attempt.createdAt,submittedAt:attempt.submittedAt,score:attempt.score,passed:attempt.passed,questions:attempt.submittedAt?null:publicQuestions(attempt.questions as unknown as QuizQuestion[])}:null,certificate:issued};
}
export async function beginExam(actor:Actor,key:string){
 return db.$transaction(async tx=>{
  await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${actor.id} FOR UPDATE`;
  const track=await tx.track.findFirst({where:{key,archivedAt:null},include:{exam:true,lessons:{where:{archivedAt:null,kind:{not:"INFO"}},select:{id:true,progress:{where:{userId:actor.id,status:"COMPLETED"},select:{id:true}}}}}});if(!track?.exam)throw notFound("Bu yolun sınavı henüz yayımlanmadı.");
  const total=track.lessons.length,done=track.lessons.filter(l=>l.progress.length).length;if(!total||done/total<.75)throw badRequest("Sınav için zorunlu çalışmaların en az %75'ini tamamla.");
  const last=await tx.trackExamAttempt.findFirst({where:{userId:actor.id,trackId:track.id},orderBy:{createdAt:"desc"}});
  if(last&&Date.now()-last.createdAt.getTime()<86400000){if(!last.submittedAt)return{id:last.id,questions:publicQuestions(last.questions as unknown as QuizQuestion[])};throw conflict("Denemeler arasında 24 saat olmalı.");}
  const pool=track.exam.questions as unknown as QuizQuestion[];if(pool.length<30)throw badRequest("Sınav havuzunda en az 30 soru olmalı.");
  const shuffled=[...pool];for(let i=shuffled.length-1;i>0;i--){const j=crypto.randomInt(i+1);[shuffled[i],shuffled[j]]=[shuffled[j]!,shuffled[i]!];}
  const questions=shuffled.slice(0,10);
  const attempt=await tx.trackExamAttempt.create({data:{userId:actor.id,trackId:track.id,examVersion:track.exam.version,questions:questions as unknown as Prisma.InputJsonValue}});
  return{id:attempt.id,questions:publicQuestions(questions)};
 });
}
export async function submitExam(actor:Actor,id:string,answers:QuizAnswer[]){
 return db.$transaction(async tx=>{
  await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${actor.id} FOR UPDATE`;
  const attempt=await tx.trackExamAttempt.findFirst({where:{id,userId:actor.id}});if(!attempt)throw notFound();if(attempt.submittedAt)throw conflict("Bu deneme zaten değerlendirildi.");if(Date.now()-attempt.createdAt.getTime()>=86400000)throw conflict("Denemenin süresi doldu; yeni bir deneme başlat.");
  const result=gradeQuiz(attempt.questions as unknown as QuizQuestion[],answers,80);
  await tx.trackExamAttempt.update({where:{id},data:{score:result.score,passed:result.passed,submittedAt:new Date()}});
  if(result.passed)await recordLearning(tx,actor.id,`exam:${attempt.trackId}:${attempt.examVersion}`,"exam");
  const track=await tx.track.findFirst({where:{id:attempt.trackId,archivedAt:null},include:{lessons:{where:{archivedAt:null,kind:{not:"INFO"}},select:{id:true,progress:{where:{userId:actor.id,status:"COMPLETED"},select:{id:true}}}}}});
  if(!track)throw notFound();
  if(result.passed&&track.lessons.length>0&&track.lessons.every(l=>l.progress.length)){
   const user=await tx.user.findUniqueOrThrow({where:{id:actor.id}});
   await tx.learningCertificate.upsert({where:{userId_trackId:{userId:actor.id,trackId:track.id}},create:{token:crypto.randomBytes(32).toString("base64url"),userId:actor.id,trackId:track.id,ownerName:user.displayName,trackTitle:track.title},update:{}});
  }
  return result;
 });
}
export async function configureExam(actor:Actor,trackId:string,revisionIds:string[]){
 if(!isAdmin(actor.role))throw notFound();
 if(revisionIds.length<30||new Set(revisionIds).size!==revisionIds.length)throw badRequest("En az 30 ayrı soru sürümü seç.");
 const rows=await db.questionRevision.findMany({where:{id:{in:revisionIds}}});if(rows.length!==revisionIds.length)throw notFound();
 const questions=rows.map(r=>r.content as unknown as QuizQuestion);
 if(questions.some(q=>q.kind!=="choice"&&q.kind!=="truefalse"))throw badRequest("Yol sınavında tek seçim ve doğru/yanlış soruları kullanılabilir.");
 if(!await db.track.findFirst({where:{id:trackId,archivedAt:null}}))throw notFound();
 return db.trackExam.upsert({where:{trackId},create:{trackId,questions:questions as unknown as Prisma.InputJsonValue},update:{questions:questions as unknown as Prisma.InputJsonValue,version:{increment:1}}});
}
