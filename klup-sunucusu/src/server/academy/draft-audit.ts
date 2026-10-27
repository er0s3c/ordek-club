import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import {z}from"zod";
import{activitiesSchema,translationCompatible}from"@/lib/academy-activities";
import{CORE_LESSON_IDS,CORE_LAB_IDS}from"@/lib/academy-curriculum";
const meta=z.object({id:z.string(),tur:z.enum(["ders","uygulama"]),baslik:z.string().min(3),hedefler:z.array(z.string().min(2)).min(2),etkinlikler:activitiesSchema,inceleme:z.object({yazar:z.string(),teknik:z.string(),dil:z.string(),onayli:z.boolean()})});
function read(file:string){const raw=fs.readFileSync(file,"utf8").replace(/\r\n/g,"\n");const match=raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);if(!match)throw new Error("Markdown ön bilgisi eksik");const value=meta.parse(YAML.parse(match[1]!));if(match[2]!.trim().length<150)throw new Error("Ders gövdesi eksik");return value;}
export function auditPilotDrafts(root:string){
 const problems:string[]=[],kinds=new Set<string>();let lessons=0,labs=0,reviewed=0;
 for(const id of[...CORE_LESSON_IDS,...CORE_LAB_IDS])try{
  const tr=read(path.join(root,"sk101",`${id}.md`)),en=read(path.join(root,"translations/en",`${id}.md`));
  if(tr.id!==id||en.id!==id)throw new Error("TR/EN kimlikleri farklı");
  if(!translationCompatible(tr.etkinlikler,en.etkinlikler))throw new Error("TR/EN etkinlik yapısı farklı");
  if(tr.etkinlikler.length<3||tr.etkinlikler.length>6)throw new Error("3–6 etkinlik gerekli");
  if(CORE_LESSON_IDS.includes(id)){if(tr.tur!=="ders")throw new Error("Ders türü yanlış");lessons++;}else{if(tr.tur!=="uygulama")throw new Error("Lab türü yanlış");labs++;}
  tr.etkinlikler.forEach(a=>kinds.add(a.kind));
  if([tr,en].every(v=>v.inceleme.onayli&&v.inceleme.teknik.trim().length>1&&v.inceleme.dil.trim().length>1&&v.inceleme.yazar!==v.inceleme.teknik))reviewed++;
 }catch(error){problems.push(`${id}: ${(error as Error).message}`);}
 return{lessons,labs,bilingualPairs:lessons+labs,activityKinds:[...kinds].sort(),reviewedPairs:reviewed,publishable:reviewed===35&&problems.length===0,problems};
}
