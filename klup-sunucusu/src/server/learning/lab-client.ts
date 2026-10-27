import fs from "node:fs";
import https from "node:https";
import { createSecureContext } from "node:tls";
import { z } from "zod";
import { HttpError } from "@/server/errors";
export const LAB_ENV_KEYS = ["CLUB_LAB_URL", "CLUB_LAB_CA", "CLUB_LAB_CERT", "CLUB_LAB_KEY"] as const;
export function labConnection() {
  const {CLUB_LAB_URL:url,CLUB_LAB_CA:ca,CLUB_LAB_CERT:cert,CLUB_LAB_KEY:key}=process.env;
  if(!url||!ca||!cert||!key)throw new HttpError(503,"LAB_NOT_CONFIGURED","Linux lab sunucusu henüz yapılandırılmadı.");
  let base: URL;
  try { base = new URL(url); } catch { throw new HttpError(503,"LAB_CONFIG","Lab adresi geçersiz."); }
  if(base.protocol!=="https:"||base.username||base.password||base.search||base.hash||base.pathname!=="/")throw new HttpError(503,"LAB_CONFIG","Lab adresi geçersiz.");
  try {
    const tls={ca:fs.readFileSync(ca),cert:fs.readFileSync(cert),key:fs.readFileSync(key),rejectUnauthorized:true,minVersion:"TLSv1.3" as const};
    createSecureContext(tls);
    return {base,tls};
  } catch { throw new HttpError(503,"LAB_CONFIG","Lab sertifikaları okunamıyor veya geçersiz. Yönetici bağlantı ayarlarını kontrol etmeli."); }
}
// Yalnız yapılandırmayı denetler; sunucuya istek göndermez veya oturum başlatmaz.
export function labConfigurationStatus() {
  const missing = LAB_ENV_KEYS.filter(key => !process.env[key]?.trim());
  try { labConnection(); return { configured: true as const, missing, message: "Yerel bağlantı ayarları hazır. Sunucu erişimi ayrıca doğrulanmalı." }; }
  catch (error) {
    if (!(error instanceof HttpError)) throw error;
    return { configured: false as const, missing, message: error.message };
  }
}
export const labResultSchema=z.object({state:z.enum(["RUNNING","QUEUED","FAILED","STOPPED"]).optional(),id:z.string().optional(),expiresAt:z.number().optional(),position:z.number().optional(),passed:z.boolean().optional(),lab:z.literal("linux-permissions").optional(),sessionId:z.string().optional(),ticket:z.string().optional()});
export type LabResult=z.infer<typeof labResultSchema>;
export async function labHealth() {
  const {base,tls}=labConnection();
  return new Promise<{ready:true;runtime:"runsc";capacity:20}>((resolve,reject)=>{
    const req=https.get(new URL("/health",base),{...tls,timeout:5000},res=>{
      let body="";res.setEncoding("utf8");
      res.on("data",chunk=>{body+=chunk;if(body.length>4096)req.destroy(new Error("response too large"));});
      res.on("error",()=>reject(new HttpError(503,"LAB_UNAVAILABLE","Lab sağlık kontrolü tamamlanamadı.")));
      res.on("end",()=>{try{const result=z.object({ready:z.literal(true),runtime:z.literal("runsc"),capacity:z.literal(20)}).parse(JSON.parse(body));if(res.statusCode!==200)throw new Error("status");resolve(result);}catch{reject(new HttpError(503,"LAB_UNAVAILABLE","Lab çalıştırıcısı hazır değil."));}});
    });
    req.on("timeout",()=>req.destroy());
    req.on("error",()=>reject(new HttpError(503,"LAB_UNAVAILABLE","Lab sunucusuna güvenli bağlantı kurulamadı.")));
  });
}
export async function labRequest(userId:string,action:string):Promise<LabResult> {
  const {base,tls}=labConnection();
  return new Promise((resolve,reject)=>{
    const payload=JSON.stringify({userId,action,lab:"linux-permissions"});
    const req=https.request(new URL("/session",base),{...tls,method:"POST",headers:{"Content-Type":"application/json","Content-Length":Buffer.byteLength(payload)},timeout:25000},res=>{
      let data="";res.setEncoding("utf8");res.on("data",chunk=>{data+=chunk;if(data.length>65536)req.destroy(new Error("response too large"));});
      res.on("end",()=>{try{if(res.statusCode!==200)throw new Error("runner error");resolve(labResultSchema.parse(JSON.parse(data)));}catch{reject(new HttpError(503,"LAB_UNAVAILABLE","Lab işlemi tamamlanamadı. Oturum durumunu kontrol et."));}});
      res.on("error",()=>reject(new HttpError(503,"LAB_UNAVAILABLE","Lab bağlantısı kesildi.")));
    });
    req.on("timeout",()=>req.destroy(new Error("timeout")));req.on("error",()=>reject(new HttpError(503,"LAB_UNAVAILABLE","Lab sunucusuna ulaşılamadı.")));req.end(payload);
  });
}
