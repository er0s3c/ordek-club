import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { db } from "@/server/db";
import { badRequest } from "@/server/errors";
import { requireFeature } from "@/server/learning/features";
import { gradePlacement, placementQuestions } from "@/server/academy/placement";
export const GET=route(async req=>{await memberContext(req);await requireFeature("learning");return json({questions:placementQuestions.map(q=>({text:q.text,options:q.options}))});});
export const POST=route(async req=>{
  const {actor}=await memberContext(req,{write:true});await requireFeature("learning");
  const {answers}=await readJson(req,z.object({answers:z.array(z.number().int().min(0).max(2)).length(10)}));
  let result;try{result=gradePlacement(answers);}catch{throw badRequest("Tüm soruları yanıtla.");}
  await db.placementAttempt.create({data:{userId:actor.id,answers,score:result.score}});
  return json(result);
});
