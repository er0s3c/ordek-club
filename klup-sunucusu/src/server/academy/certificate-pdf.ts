import fs from "node:fs/promises";
import path from "node:path";
import {PDFDocument,rgb,type PDFFont} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import QRCode from "qrcode";
export async function certificatePdf(input:{name:string;track:string;date:string;code:string;verificationUrl:string;sample?:boolean}){
 input={...input,name:input.name.replace(/\s+/g," ").trim(),track:input.track.replace(/\s+/g," ").trim()};
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);pdf.setTitle("Ördek Club - Yol Tamamlama Belgesi");pdf.setCreator("Ördek Club");
 const fontDir=path.join(process.cwd(),"node_modules","@fontsource","readex-pro","files");
 const fonts:PDFFont[]=[];for(const part of["latin","latin-ext","arabic","vietnamese"])fonts.push(await pdf.embedFont(await fs.readFile(path.join(fontDir,`readex-pro-${part}-400-normal.woff`)),{subset:true}));
 const charsets=fonts.map(f=>new Set(f.getCharacterSet()));
 const chunks=(text:string)=>{const out:{font:PDFFont;text:string}[]=[];for(const char of text.normalize("NFC")){const index=charsets.findIndex(set=>set.has(char.codePointAt(0)!));const font=fonts[Math.max(0,index)]!;const value=index<0?"?":char;const last=out[out.length-1];if(last?.font===font)last.text+=value;else out.push({font,text:value});}return out;};
 const width=(text:string,size:number)=>chunks(text).reduce((n,c)=>n+c.font.widthOfTextAtSize(c.text,size),0);
 const page=pdf.addPage([842,595]),purple=rgb(.36,.12,.89),ink=rgb(.18,.18,.18),muted=rgb(.37,.37,.4);
 const draw=(text:string,x:number,y:number,size:number,color=ink)=>{for(const c of chunks(text)){page.drawText(c.text,{x,y,size,font:c.font,color});x+=c.font.widthOfTextAtSize(c.text,size);}};
 const fit=(text:string,size:number,max:number)=>Math.min(size,size*max/Math.max(1,width(text,size)));
 page.drawRectangle({x:0,y:0,width:842,height:595,color:rgb(1,.988,.949)});page.drawRectangle({x:0,y:573,width:842,height:22,color:purple});page.drawRectangle({x:52,y:74,width:4,height:446,color:purple});
 draw("ÖRDEK CLUB",76,517,16,purple);draw(input.sample?"ÖRNEK - GEÇERLİ BELGE DEĞİLDİR":"ÖRDEK AKADEMİ",76,486,10,muted);
 draw("YOL TAMAMLAMA BELGESİ",76,411,fit("YOL TAMAMLAMA BELGESİ",29,680),purple);
 draw(input.name,76,342,fit(input.name,31,680));draw("aşağıdaki öğrenme yolunun zorunlu çalışmalarını ve sınavını tamamladı.",76,309,11,muted);
 draw(input.track,76,253,fit(input.track,22,670),purple);
 draw(`Düzenlenme tarihi: ${input.date}`,76,200,11);
 draw("Akredite değildir; bilgi düzeyini gösterir.",76,163,12,muted);
 draw(`Belge no: ${input.code}`,76,112,9,muted);draw("Doğrulama: /dogrula/"+input.code,76,91,8,muted);
 const qr=await pdf.embedPng(await QRCode.toBuffer(input.verificationUrl,{type:"png",width:180,margin:1}));page.drawImage(qr,{x:702,y:80,width:74,height:74});
 return pdf.save();
}
