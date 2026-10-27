import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocket,WebSocketServer } from "ws";
import { env } from "@/server/env";
import { SESSION_COOKIE,readCookie,validateSessionToken } from "@/server/auth/session";
import { hit } from "@/server/rate-limit";
import { requireFeature,featureEnabled } from "./features";
import { labConnection,labRequest } from "./lab-client";
export function createLabUpgradeHandler(){
  const wss=new WebSocketServer({noServer:true,maxPayload:8192,perMessageDeflate:false});
  return {wss,handleUpgrade(req:IncomingMessage,socket:Duplex,head:Buffer){
    if(new URL(req.url??"/","http://localhost").pathname!=="/ws/lab")return false;
    void(async()=>{
      try{
        if(req.headers.origin!==new URL(env().APP_URL).origin)throw new Error("origin");
        const token=readCookie(req.headers.cookie??null,SESSION_COOKIE),session=await validateSessionToken(token);
        if(!session||!hit(`lab:ws:${session.user.id}`,6,60000).ok)throw new Error("auth");
        await requireFeature("labs");
        const ticket=await labRequest(session.user.id,"ticket");if(!ticket.ticket)throw new Error("ticket");
        const {base,tls}=labConnection(),url=new URL("/terminal",base);url.protocol="wss:";url.searchParams.set("ticket",ticket.ticket);
        wss.handleUpgrade(req,socket,head,ws=>{
          const upstream=new WebSocket(url,{...tls,maxPayload:65536,handshakeTimeout:10000,perMessageDeflate:false});
          let rechecking=false;
          const timer=setInterval(()=>{if(rechecking)return;rechecking=true;void Promise.all([validateSessionToken(token),featureEnabled("labs")]).then(([s,enabled])=>{if(!s||!enabled)ws.close(1008,"session expired");}).catch(()=>ws.close(1011,"validation failed")).finally(()=>{rechecking=false;});},30000);
          let bytes=0,at=Date.now();
          ws.on("message",(data,binary)=>{if(binary)return ws.close(1003,"text only");if(Date.now()-at>1000){at=Date.now();bytes=0;}bytes+=Buffer.byteLength(data.toString());if(bytes>32768||upstream.bufferedAmount>1048576)return ws.close(1008,"rate limit");if(upstream.readyState===WebSocket.OPEN)upstream.send(data.toString());});
          upstream.on("open",()=>{if(ws.readyState===WebSocket.OPEN)ws.send("\r\n[Ördek Lab — bağlantı kuruldu]\r\n");else upstream.close();});
          upstream.on("message",data=>{if(ws.readyState===WebSocket.OPEN){if(ws.bufferedAmount>1048576)ws.close(1009,"slow consumer");else ws.send(data.toString());}});
          upstream.on("error",()=>ws.close(1011,"runner unavailable"));upstream.on("close",()=>ws.close(1000,"terminal ended"));
          ws.on("error",()=>upstream.close());ws.on("close",()=>{clearInterval(timer);upstream.close();});
        });
      }catch{socket.write("HTTP/1.1 403 Forbidden\r\nConnection: close\r\nContent-Length: 0\r\n\r\n");socket.destroy();}
    })();return true;
  }};
}
