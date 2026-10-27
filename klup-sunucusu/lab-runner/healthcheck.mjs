import https from "node:https";
import fs from "node:fs";
const req=https.get("https://127.0.0.1:9443/health",{
  ca:fs.readFileSync(process.env.LAB_TLS_CA),
  cert:fs.readFileSync(process.env.LAB_HEALTH_CERT),
  key:fs.readFileSync(process.env.LAB_HEALTH_KEY),
  rejectUnauthorized:true,minVersion:"TLSv1.3",timeout:5000,
},res=>{
  let body="";res.setEncoding("utf8");
  res.on("data",chunk=>{body+=chunk;if(body.length>4096)req.destroy();});
  res.on("end",()=>{try{const data=JSON.parse(body);process.exit(res.statusCode===200&&data.ready===true&&data.runtime==="runsc"&&data.capacity===20?0:1);}catch{process.exit(1);}});
  res.on("error",()=>process.exit(1));
});
req.on("timeout",()=>req.destroy());req.on("error",()=>process.exit(1));
