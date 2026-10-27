import{z}from"zod";
import{memberContext}from"@/server/api-auth";
import{json,readJson,route}from"@/server/http";
import{operationView,controlOperation}from"@/server/learning/operations";
type Context={params:Promise<{code:string}>};
const code=z.string().transform(s=>s.toUpperCase()).pipe(z.string().regex(/^[A-Z0-9]{6}$/));
export const GET=route<Context>(async(req,ctx)=>{const{actor}=await memberContext(req);return json(await operationView(actor,code.parse((await ctx.params).code)));});
export const POST=route<Context>(async(req,ctx)=>{const{actor}=await memberContext(req,{write:true});const input=await readJson(req,z.object({action:z.enum(["start","pause","resume","advance","end","vote"]),version:z.number().int().min(0).optional(),choice:z.number().int().min(0).max(2).optional()}));return json(await controlOperation(actor,code.parse((await ctx.params).code),input));});
