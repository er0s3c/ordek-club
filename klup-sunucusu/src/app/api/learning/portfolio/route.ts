import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json,readJson,route } from "@/server/http";
import { db } from "@/server/db";
import { notFound } from "@/server/errors";
import { requireFeature } from "@/server/learning/features";
export const PATCH=route(async req=>{
  const {actor}=await memberContext(req,{write:true});await requireFeature("learning");
  // Görünürlük ve/veya gelişim hikâyesi (problem, yaklaşım, sonuç, öğrendiklerim) güncellenir.
  const story=z.string().trim().max(2000);
  const {submissionId,visible,...rest}=await readJson(req,z.object({submissionId:z.string().max(80),visible:z.boolean().optional(),problem:story.optional(),approach:story.optional(),result:story.optional(),learned:story.optional()}));
  const data={...(visible===undefined?{}:{visible}),...rest};
  await db.$transaction(async tx=>{
    const work=await tx.submission.findFirst({where:{id:submissionId,status:"APPROVED",OR:[{userId:actor.id},{team:{members:{some:{userId:actor.id}}}}]},select:{id:true}});
    if(!work)throw notFound();
    await tx.portfolioWork.upsert({where:{userId_submissionId:{userId:actor.id,submissionId}},create:{userId:actor.id,submissionId,...data},update:data});
  });return json({ok:true});
});
