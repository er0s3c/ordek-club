// Dedicated Linux host only. Importing this module does not start a service.
import https from "node:https";
import fs from "node:fs";
import crypto from "node:crypto";
import {execFile,spawn} from "node:child_process";
import {promisify} from "node:util";
import {WebSocketServer,WebSocket} from "ws";
import {CAPACITY,TTL_MS,containerArgs,validateImage,mayRemoveContainer,expired,reservedSlots} from "./policy.mjs";
const exec=promisify(execFile);
export async function createRunner(config) {
  const image=validateImage(config.image),instance=crypto.randomUUID();
  const sessions=new Map(),tickets=new Map();
  const docker=async args=>(await exec("docker",args,{timeout:20000,maxBuffer:65536})).stdout.trim();
  const runtimes=JSON.parse(await docker(["info","--format","{{json .Runtimes}}"]));
  if(!runtimes.runsc)throw new Error("gVisor runsc is required; fallback is forbidden");
  await docker(["image","inspect",image]);
  // No startup deletion or adoption. An operator must reconcile stale sessions explicitly.
  const existing=await docker(["ps","-aq","--filter","label=ordek.club.instance"]);
  if(existing)throw new Error("Existing lab containers require operator reconciliation; nothing was deleted");
  let serial=Promise.resolve();
  const exclusive=fn=>{const job=serial.then(fn);serial=job.catch(()=>{});return job;};
  const view=s=>({id:s.id,state:s.state,expiresAt:s.createdAt+TTL_MS,position:s.state==="QUEUED"?[...sessions.values()].filter(x=>x.state==="QUEUED").findIndex(x=>x.id===s.id)+1:0});
  async function stop(s){
    if(sessions.get(s.userId)!==s)throw new Error("Session not owned by this runner");
    s.socket?.close(1000,"session ended");
    if(!s.containerId && s.state !== "QUEUED") {
      const candidate=await docker(["ps","-aq","--no-trunc","--filter",`name=^/${s.name}$`]);
      if(candidate && !/^[a-f0-9]{64}$/.test(candidate))throw new Error("Uncertain container identity");
      if(candidate)s.containerId=candidate;
    }
    if(s.containerId){const info=JSON.parse(await docker(["inspect",s.containerId]))[0];if(!mayRemoveContainer(s,info,instance))throw new Error("Container ownership mismatch");await docker(["rm","-f",s.containerId]);}
    sessions.delete(s.userId);
  }
  async function promote(){for(const s of sessions.values()){if(reservedSlots(sessions.values())>=CAPACITY)break;if(s.state!=="QUEUED")continue;try{s.containerId=await docker(containerArgs(s.name,image,instance));s.state="RUNNING";s.createdAt=Date.now();s.lastInput=Date.now();}catch{s.state="FAILED";}}}
  async function body(req){let size=0;const chunks=[];for await(const c of req){size+=c.length;if(size>4096)throw new Error("too large");chunks.push(c);}return JSON.parse(Buffer.concat(chunks).toString());}
  const server=https.createServer({key:fs.readFileSync(config.key),cert:fs.readFileSync(config.cert),ca:fs.readFileSync(config.ca),requestCert:true,rejectUnauthorized:true,minVersion:"TLSv1.3"},async(req,res)=>{
    res.setHeader("Content-Type","application/json");res.setHeader("Cache-Control","no-store");
    try{
      if(!req.socket.authorized){res.writeHead(403);return res.end('{}');}
      if(req.method==="GET"&&req.url==="/health")return res.end(JSON.stringify({ready:true,runtime:"runsc",capacity:CAPACITY}));
      if(req.method!=="POST"||req.url!=="/session"){res.writeHead(404);return res.end('{}');}
      const input=await body(req);
      if(!/^[a-zA-Z0-9_-]{8,80}$/.test(input.userId??"")||!["start","status","stop","reset","ticket","check"].includes(input.action))throw new Error("invalid request");
      const result=await exclusive(async()=>{
        let s=sessions.get(input.userId);
        if(s&&s.state==="RUNNING"&&expired(s,Date.now())){await stop(s);s=undefined;}
        if(input.action==="stop"){if(s)await stop(s);await promote();return {state:"STOPPED"};}
        if(input.action==="reset"&&s){await stop(s);s=undefined;}
        if(input.action==="start"||input.action==="reset"){
          if(input.lab!=="linux-permissions")throw new Error("unknown lab");
          if(!s){if(sessions.size>=100)throw new Error("queue full");const id=crypto.randomUUID();s={id,userId:input.userId,name:`ordek-lab-${id}`,state:"QUEUED",createdAt:Date.now(),lastInput:Date.now()};sessions.set(input.userId,s);}await promote();
        }
        if(!s)return {state:"STOPPED"};
        if(input.action==="ticket"){
          if(s.state!=="RUNNING")throw new Error("not running");
          const token=crypto.randomBytes(32).toString("base64url");tickets.set(token,{userId:s.userId,id:s.id,expires:Date.now()+30000});return {ticket:token};
        }
        if(input.action==="check"){
          if(s.state!=="RUNNING")throw new Error("not running");
          const mode=await docker(["exec",s.name,"stat","-c","%a","/home/student/incident.txt"]);
          return {passed:mode==="600",lab:"linux-permissions",sessionId:s.id};
        }
        return view(s);
      });res.end(JSON.stringify(result));
    }catch{res.writeHead(503);res.end(JSON.stringify({error:"Lab request could not be completed"}));}
  });
  const wss=new WebSocketServer({noServer:true,maxPayload:8192,perMessageDeflate:false});
  server.on("upgrade",(req,socket,head)=>{
    const url=new URL(req.url??"/","https://runner.invalid"),token=url.searchParams.get("ticket"),t=tickets.get(token);tickets.delete(token);
    const s=t?sessions.get(t.userId):null;
    if(!req.socket.authorized||url.pathname!=="/terminal"||!t||t.expires<Date.now()||!s||s.id!==t.id||s.state!=="RUNNING"||expired(s,Date.now()))return socket.destroy();
    wss.handleUpgrade(req,socket,head,ws=>{
      s.socket?.close(1000,"new connection");s.socket=ws;
      const child=spawn("docker",["exec","-i",s.name,"script","-qefc","/bin/bash --noprofile --norc","/dev/null"],{stdio:["pipe","pipe","pipe"]});
      let windowAt=Date.now(),bytes=0;
      const output=data=>{if(ws.readyState!==WebSocket.OPEN)return;if(ws.bufferedAmount>1048576)return ws.close(1009,"slow consumer");ws.send(data.toString());};
      child.stdout.on("data",output);child.stderr.on("data",output);child.stdin.on("error",()=>ws.close(1011,"stdin failed"));
      ws.on("message",(data,binary)=>{if(binary)return ws.close(1003,"text only");if(Date.now()-windowAt>1000){windowAt=Date.now();bytes=0;}bytes+=data.length;if(bytes>32768)return ws.close(1008,"rate limit");s.lastInput=Date.now();child.stdin.write(data.toString());});
      child.on("error",()=>ws.close(1011,"terminal failed"));child.on("exit",()=>ws.close(1000,"shell exited"));
      ws.on("close",()=>{child.kill();if(s.socket===ws)s.socket=null;});ws.on("error",()=>child.kill());
    });
  });
  const timer=setInterval(()=>void exclusive(async()=>{const now=Date.now();for(const[token,t]of tickets)if(t.expires<=now)tickets.delete(token);for(const s of [...sessions.values()])if(expired(s,now)){try{await stop(s);}catch{console.error("[lab] one session requires operator reconciliation");}}await promote();}).catch(()=>console.error("[lab] session cleanup requires attention")),5000);timer.unref();
  return {server,close:async()=>{clearInterval(timer);server.close();await exclusive(async()=>{for(const s of [...sessions.values()])await stop(s);});}};
}
