import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/server/db";
import { badRequest, forbidden, notFound } from "@/server/errors";
import { isAdmin, isStaff, type Actor } from "@/server/auth/policy";
import { quizSchema } from "@/server/classroom/autograde";
import { assignmentInputSchema, createAssignment } from "@/server/classroom/assignments";
import { createPresentation, parseDeck } from "@/server/presentations";
import { SKILLS } from "@/server/academy/placement";
export const skillKey=z.enum(["ethics","network","web","linux","windows","crypto","incident","ai"]);
export const bankInput=z.object({id:z.string().optional(),skill:skillKey,difficulty:z.enum(["EASY","MEDIUM","HARD"]),question:z.unknown()});
export async function saveBankQuestion(actor:Actor,input:z.output<typeof bankInput>){
  if(!isStaff(actor.role))throw forbidden();
  const question=quizSchema.parse([input.question])[0]!;
  return db.$transaction(async tx=>{
    let id=input.id;
    if(id){
      await tx.$queryRaw`SELECT id FROM "BankQuestion" WHERE id = ${id} FOR UPDATE`;
      const old=await tx.bankQuestion.findUnique({where:{id}});if(!old||(!isAdmin(actor.role)&&old.ownerId!==actor.id))throw notFound();
      await tx.bankQuestion.update({where:{id},data:{skill:input.skill,difficulty:input.difficulty}});
    }else id=(await tx.bankQuestion.create({data:{ownerId:actor.id,skill:input.skill,difficulty:input.difficulty}})).id;
    const last=await tx.questionRevision.findFirst({where:{questionId:id},orderBy:{number:"desc"}});
    return tx.questionRevision.create({data:{questionId:id,number:(last?.number??0)+1,content:question as Prisma.InputJsonValue}});
  });
}
export async function listBank(actor:Actor){
  if(!isStaff(actor.role))throw forbidden();
  return db.bankQuestion.findMany({where:isAdmin(actor.role)?{}:{ownerId:actor.id},include:{revisions:{orderBy:{number:"desc"},take:20}},orderBy:{createdAt:"desc"},take:200});
}
export async function bankToQuiz(actor:Actor,title:string,revisionIds:string[],ip:string){
  if(!isStaff(actor.role))throw forbidden();
  if(new Set(revisionIds).size!==revisionIds.length)throw badRequest("Bir soru sürümünü bir kez seç.");
  const rows=await db.questionRevision.findMany({where:{id:{in:revisionIds},question:isAdmin(actor.role)?{}:{ownerId:actor.id}}});
  if(rows.length!==revisionIds.length)throw notFound();
  const quiz=quizSchema.parse(revisionIds.map(id=>rows.find(r=>r.id===id)!.content));
  return createAssignment(actor,assignmentInputSchema.parse({title,kind:"QUIZ",quiz,requireText:false,passPercent:80,maxAttempts:3}),ip);
}

export const PACKS=[
  {key:"phishing",title:"Şüpheli mesajı incele",skill:"web",brief:"Mavi Fener çalışanına gelen mesajda parola yenileme isteniyor. Göndereni, alan adını ve istenen işlemi ayrı ayrı incele.",evidence:"From: IT Help <support@mavi-fener-help.example>\nLink: https://mavi-fener-help.example/reset\nRequest: Enter your current password to prevent closure.",question:{kind:"choice",text:"Mesajdaki bağlantıyı açmadan önce en uygun adım hangisi?",options:["Parolayı mesajdaki forma yazmak","Kurumun bilinen adresinden veya doğrulanmış kanaldan isteği kontrol etmek","Mesajı tüm sınıfa iletmek"],answer:1,explanation:"Gönderen adı doğrulama değildir; bağımsız ve bilinen bir kanaldan kontrol edilir."}},
  {key:"network",title:"Paketin yolculuğunu izle",skill:"network",brief:"Bir öğrenci portalına erişim sorununu DNS, bağlantı ve HTTP katmanlarına ayır. Her gözlemin neyi kanıtladığını ve neyi kanıtlamadığını yaz.",evidence:"DNS: portal.mavifener.example -> 192.0.2.40\nTCP: connection established to port 443\nHTTP: 403 Forbidden",question:{kind:"choice",text:"Bu kanıtlardan en doğrudan çıkarım hangisidir?",options:["DNS hiç çalışmamış","Sunucu isteğe bir HTTP yanıtı vermiş","Bilgisayarda kesin zararlı var"],answer:1,explanation:"403 bir HTTP yanıtıdır; erişim kuralı ve kullanıcı bağlamı ayrıca incelenmelidir."}},
  {key:"logs",title:"Giriş kayıtlarından olay çıkar",skill:"incident",brief:"Kurgusal bir hesap için ardışık başarısız girişleri ve sonraki başarılı girişi incele. Bulguyu, varsayımı ve ek kanıt ihtiyacını ayır.",evidence:"09:01 account=service result=failed src=192.0.2.12\n09:02 account=service result=failed src=192.0.2.12\n09:04 account=service result=success src=192.0.2.12",question:{kind:"choice",text:"Bu kayıtlar tek başına neyi gösterir?",options:["Hesap kesin ele geçirilmiş","Hiçbir giriş olmamış","Aynı kaynaktan başarısız ve başarılı giriş gözlenmiş"],answer:2,explanation:"Kimlik, cihaz ve normal kullanım bağlamı olmadan kesin ihlal sonucu çıkarılmaz."}},
] as const;
export async function createLessonPack(actor:Actor,key:string,minutes:15|30|45,ip:string){
  if(!isStaff(actor.role))throw forbidden();
  const p=PACKS.find(p=>p.key===key);if(!p)throw notFound();
  const deck=parseDeck({title:`${p.title} · ${minutes} dk`,description:p.brief,slides:[
    {title:p.title,layout:"title",blocks:[{type:"text",text:p.brief}],notes:`Önerilen süre ${minutes} dakika. Önce öğrencilerden kanıttan çıkarılabilen ve çıkarılamayan sonuçları ayırmalarını iste.`},
    {title:"Kanıtı incele",blocks:[{type:"code",language:"text",code:p.evidence}]},
    {title:"Gerekçeni kur",blocks:[{type:"bullets",items:["Hangi gözlem doğrudan kanıtta var?","Hangi varsayım için ek kanıt gerekli?","Güvenli ilk adım ne?"],reveal:true}]},
    {title:"Uygulama ve çıkış bileti",blocks:[{type:"text",text:"Bağlı uygulamada kanıtlarını yaz. Çıkış biletini ayrı tamamla."}]},
  ]});
  return db.$transaction(async tx=>{
    const presentation=await createPresentation(actor,deck,ip,`pack:${key}:${minutes}`,tx);
    const task=await createAssignment(actor,assignmentInputSchema.parse({title:`${p.title} — uygulama`,description:`${p.brief}\n\n${p.evidence}\n\nÜç başlıkla teslim et: kanıt, yorum, önerilen adım.`,kind:"TEXT",rubric:[{criterion:"Kanıtın doğru okunması",points:40},{criterion:"Varsayım ve gözlemin ayrılması",points:30},{criterion:"Gerekçeli güvenli adım",points:30}]}),ip,{},tx);
    const exit=await createAssignment(actor,assignmentInputSchema.parse({title:`${p.title} — çıkış bileti`,kind:"QUIZ",quiz:[p.question],requireText:false,passPercent:100,maxAttempts:1}),ip,{},tx);
    return{presentationId:presentation.id,taskId:task.id,exitId:exit.id};
  },{maxWait:10000,timeout:15000});
}

export async function learningRadar(actor:Actor,groupId:string){
  if(!isStaff(actor.role))throw forbidden();
  const group=await db.classGroup.findFirst({where:{id:groupId,kind:"CLASS",archivedAt:null,...(!isAdmin(actor.role)?{createdById:actor.id}:{})},include:{members:{where:{user:{status:"ACTIVE"}},select:{userId:true,user:{select:{displayName:true}}}}}});
  if(!group)throw notFound();
  const ids=group.members.map(m=>m.userId);
  const lessons=await db.lesson.findMany({where:{archivedAt:null,track:{archivedAt:null},skills:{isEmpty:false}},select:{id:true,skills:true,progress:{where:{userId:{in:ids}},select:{userId:true,status:true}}}});
  return{group:{id:group.id,name:group.name},skills:SKILLS,rows:group.members.map(m=>({name:m.user.displayName,skills:SKILLS.map(s=>{const related=lessons.filter(l=>l.skills.includes(s.key));const started=related.filter(l=>l.progress.some(p=>p.userId===m.userId));const done=related.filter(l=>l.progress.some(p=>p.userId===m.userId&&p.status==="COMPLETED"));return{key:s.key,total:related.length,started:started.length,completed:done.length};})}))};
}
