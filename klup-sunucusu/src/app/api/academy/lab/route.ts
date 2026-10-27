import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json,readJson,route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { labRequest } from "@/server/learning/lab-client";
import { recordLearning } from "@/server/learning/events";
import { db } from "@/server/db";
export const GET=route(async req=>{const {actor}=await memberContext(req);await requireFeature("labs");return json(await labRequest(actor.id,"status"));});
export const POST=route(async req=>{
  const {actor}=await memberContext(req,{write:true});await requireFeature("labs");
  const {action}=await readJson(req,z.object({action:z.enum(["start","stop","reset","check"])}));
  const result=await labRequest(actor.id,action);
  if(action==="check"&&result.passed===true&&result.lab==="linux-permissions"&&result.sessionId)await db.$transaction(tx=>recordLearning(tx,actor.id,"lab:linux-permissions","lab"));
  // Lab deneme geçmişi: her doğrulama denemesi süre ve sonucuyla kaydedilir.
  if(action==="check"&&typeof result.passed==="boolean")await db.workshopAttempt.create({data:{userId:actor.id,kind:"lab",key:"linux-permissions",payload:{sessionId:result.sessionId??null},score:result.passed?100:0,passed:result.passed}});
  if(action==="start"||action==="stop")await db.workshopAttempt.create({data:{userId:actor.id,kind:"lab-session",key:"linux-permissions",payload:{action,state:result.state??null},score:0,passed:false}});
  return json(result);
});
