import {z} from "zod";
import {memberContext} from "@/server/api-auth";
import {json,readJson,route} from "@/server/http";
import {requireFeature} from "@/server/learning/features";
import {bankInput,saveBankQuestion,bankToQuiz,createLessonPack} from "@/server/learning/teacher-tools";
const input=z.discriminatedUnion("action",[
  z.object({action:z.literal("question"),value:bankInput}),
  z.object({action:z.literal("quiz"),title:z.string().trim().min(3).max(140),revisionIds:z.array(z.string()).min(1).max(50)}),
  z.object({action:z.literal("pack"),key:z.enum(["phishing","network","logs"]),minutes:z.union([z.literal(15),z.literal(30),z.literal(45)])}),
]);
export const POST=route(async req=>{
  const {actor,ip}=await memberContext(req,{write:true});await requireFeature("teacher-tools");const body=await readJson(req,input);
  if(body.action==="question")return json(await saveBankQuestion(actor,body.value));
  if(body.action==="quiz")return json(await bankToQuiz(actor,body.title,body.revisionIds,ip));
  return json(await createLessonPack(actor,body.key,body.minutes,ip));
});
