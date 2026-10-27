import{z}from"zod";
import{memberContext}from"@/server/api-auth";
import{json,readJson,route}from"@/server/http";
import{requireFeature}from"@/server/learning/features";
import{beginExam,submitExam,configureExam}from"@/server/academy/exams";
const schema=z.discriminatedUnion("action",[
 z.object({action:z.literal("begin"),key:z.string().regex(/^[a-z0-9-]{1,40}$/)}),
 z.object({action:z.literal("submit"),id:z.string().max(80),answers:z.array(z.union([z.number().int().min(0).max(10),z.boolean(),z.null()])).length(10)}),
 z.object({action:z.literal("configure"),trackId:z.string().max(80),revisionIds:z.array(z.string()).min(30).max(300)}),
]);
export const POST=route(async req=>{const{actor}=await memberContext(req,{write:true});await requireFeature("academy-v2");const body=await readJson(req,schema);if(body.action==="begin")return json(await beginExam(actor,body.key));if(body.action==="configure")return json(await configureExam(actor,body.trackId,body.revisionIds));return json(await submitExam(actor,body.id,body.answers));});
