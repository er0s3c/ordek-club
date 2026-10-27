"use client";
import { useCallback,useEffect,useRef,useState } from "react";
import { TerminalSquare,RefreshCw,Play,Square,CheckCircle2,CircleX,Clock,FileText } from "lucide-react";
import { api } from "@/lib/api-client";
import type { LabResult } from "@/server/learning/lab-client";
import { SplitPane } from "@/components/ui/SplitPane";
import { ModuleAccordion } from "@/components/motion/ModuleAccordion";
import { Feedback } from "@/components/motion/Feedback";
import { useT } from "@/i18n/client";

type Conn="closed"|"connecting"|"open"|"reconnecting"|"expired"|"error";
const CONN:Record<Conn,[string,string]>={closed:["Kapalı","neutral"],connecting:["Bağlanıyor…","info"],open:["Bağlı","ok"],reconnecting:["Yeniden bağlanıyor…","warn"],expired:["Süre doldu","err"],error:["Bağlantı hatası","err"]};
type History={kind:string;passed:boolean;action:string|null;at:string}[];

// Komut Hattı: solda brifing ve kontroller, sağda terminal (bölünebilir; dar ekranda sekmeler).
// Durum çubuğu bağlantı durumunu, kalan süreyi ve okunabilir metin görünümünü aynı yerde gösterir.
export function LinuxLab({history=[]}:{history?:History}){
  const tl = useT();
  const [session,setSession]=useState<LabResult>({state:"STOPPED"}),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[conn,setConn]=useState<Conn>("closed"),[transcript,setTranscript]=useState(""),[readable,setReadable]=useState(false),[now,setNow]=useState(()=>Date.now());
  const mount=useRef<HTMLDivElement>(null);const [epoch,setEpoch]=useState(0);const retries=useRef(0);
  const refresh=useCallback(async()=>{try{setSession(await api<LabResult>("/api/academy/lab"));}catch(e){setMessage((e as Error).message);}},[]);
  useEffect(()=>{void refresh();const timer=setInterval(()=>void refresh(),10000);return()=>clearInterval(timer);},[refresh]);
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t);},[]);
  const left=session.expiresAt?Math.max(0,session.expiresAt-now):null;
  useEffect(()=>{if(left===0&&session.state==="RUNNING")setConn("expired");},[left,session.state]);
  useEffect(()=>{
    if(session.state!=="RUNNING"||!mount.current)return;
    let disposed=false;let cleanup=()=>{};
    void Promise.all([import("@xterm/xterm"),import("@xterm/addon-fit")]).then(([{Terminal},{FitAddon}])=>{
      if(disposed||!mount.current)return;
      const term=new Terminal({cursorBlink:true,fontFamily:'"JetBrains Mono", monospace',fontSize:14,screenReaderMode:true,scrollback:2000,theme:{background:"#181225",foreground:"#fffcf2",cursor:"#17ff74"}});
      const fit=new FitAddon();term.loadAddon(fit);term.open(mount.current);fit.fit();
      const ws=new WebSocket(`${location.protocol==="https:"?"wss":"ws"}://${location.host}/ws/lab`);
      setConn(retries.current?"reconnecting":"connecting");
      ws.onopen=()=>{retries.current=0;setConn("open");};
      ws.onmessage=e=>{const text=String(e.data);term.write(text);setTranscript(t=>(t+text).slice(-20000));};
      ws.onerror=()=>setConn("error");
      // Kopan bağlantı en fazla 3 kez kendiliğinden yeniden kurulur (artan bekleme).
      ws.onclose=()=>{if(disposed)return;if(retries.current<3){retries.current++;setConn("reconnecting");setTimeout(()=>{if(!disposed)setEpoch(n=>n+1);},1000*retries.current);}else setConn("error");};
      const input=term.onData(d=>{if(ws.readyState===WebSocket.OPEN)ws.send(d);});
      const resize=new ResizeObserver(()=>{try{fit.fit();}catch{/* disposed */}});resize.observe(mount.current);
      cleanup=()=>{resize.disconnect();input.dispose();ws.onclose=null;ws.close();term.dispose();};
    }).catch(()=>setConn("error"));
    return()=>{disposed=true;cleanup();};
  },[session.state,session.id,epoch]);
  useEffect(()=>{if(session.state!=="RUNNING"&&conn!=="expired")setConn("closed");},[session.state,conn]);
  async function act(action:string){setBusy(true);setMessage("");try{const r=await api<LabResult>("/api/academy/lab",{body:{action}});if(action==="check")setMessage(r.passed?tl("Doğrulandı: dosyaya yalnız sahibi erişebiliyor. Öğrenme etkinliğin kaydedildi."):tl("İzinler henüz doğru değil. Dosya sahibinin okuma ve yazma yetkisi olmalı; diğerlerine izin verilmemeli."));else setSession(r);if(action==="reset")setEpoch(n=>n+1);}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
  const [label0,tone]=CONN[conn];const label=tl(label0);
  const mm=left===null?null:`${String(Math.floor(left/60000)).padStart(2,"0")}:${String(Math.floor(left/1000)%60).padStart(2,"0")}`;
  const brief=<div className="stack" style={{paddingRight:8}}>
    <ModuleAccordion title={tl("Brifing / Briefing")} defaultOpen headingLevel={2}><p><code>/home/student/incident.txt</code>{" "}{tl("dosyasının izinlerini incele ve düzelt. / Inspect and fix permissions so only its owner can read and write.")}</p><p className="small muted">{tl("Gerçek Linux · 30 dakika oturum · 10 dakika hareketsizlik sınırı · İnternet erişimi yok")}</p></ModuleAccordion>
    <div className="learning-tabs"><button className="btn btn-primary" disabled={busy||session.state==="RUNNING"||session.state==="QUEUED"} onClick={()=>void act("start")}><Play size={16} />{tl("Başlat")}</button><button className="btn" disabled={busy||session.state!=="RUNNING"} onClick={()=>{retries.current=0;setEpoch(n=>n+1);}}><RefreshCw size={16} />{tl("Yeniden bağlan")}</button><button className="btn" disabled={busy||session.state!=="RUNNING"} onClick={()=>void act("check")}>{tl("Çözümü doğrula")}</button><button className="btn" disabled={busy||session.state==="STOPPED"} onClick={()=>void act("stop")}><Square size={16} />{tl("Bitir")}</button></div>
    {message&&<Feedback stateKey={message} className="alert">{message}</Feedback>}
    {session.state==="QUEUED"&&<p role="status">{tl("Lab sırası bekleniyor. Sıran: {position}", { position: session.position })}</p>}
    {session.state==="FAILED"&&<p role="alert">{tl("Lab başlatılamadı. Oturumu bitirip yeniden dene.")}</p>}
    <ModuleAccordion title={tl("Çalışma alanını sıfırla")}><p>{tl("Bu oturumdaki dosya değişiklikleri silinir; doğrulanmış ilerlemen korunur.")}</p><button className="btn" disabled={busy||session.state!=="RUNNING"} onClick={()=>void act("reset")}>{tl("Dosyaları başlangıca döndür")}</button></ModuleAccordion>
    {history.length>0&&<ModuleAccordion title={tl("Deneme geçmişim ({length} doğrulama)", { length: history.filter(h=>h.kind==="lab").length })}><ol className="timeline">{history.map((h,i)=><li key={i}><time>{new Date(h.at).toLocaleString(tl.intl)}</time><span>{h.kind==="lab"?(h.passed?<><CheckCircle2 size={13} color="var(--ok)" aria-hidden/>{" "}{tl("Doğrulama geçti")}</>:<><CircleX size={13} color="var(--err)" aria-hidden/>{" "}{tl("Doğrulama geçmedi")}</>):h.action==="start"?tl("Oturum başlatıldı"):tl("Oturum bitirildi")}</span></li>)}</ol></ModuleAccordion>}
  </div>;
  const terminal=<section className="card" style={{marginLeft:8}}>
    <div className="lab-status">
      <Feedback stateKey={conn} className="row"><TerminalSquare size={16} aria-hidden /><span className={`pill pill-${tone}`}>{label}</span></Feedback>
      {mm&&session.state==="RUNNING"&&<span className={`pill pill-${left!<5*60000?"warn":"neutral"}`}><Clock size={13} aria-hidden />{" "}{tl("{mm} kaldı", { mm })}</span>}
      <button type="button" className="btn btn-ghost btn-sm" aria-pressed={readable} onClick={()=>setReadable(v=>!v)}><FileText size={14} aria-hidden /> {readable?tl("Terminale dön"):tl("Okunabilir metin")}</button>
    </div>
    <div ref={mount} className="linux-terminal" aria-label={tl("Etkileşimli Linux terminali")} hidden={readable} />
    {readable&&<pre className="learning-note" style={{margin:12,maxHeight:420,overflow:"auto"}}>{transcript||"Henüz çıktı yok."}</pre>}
    {session.state!=="RUNNING"&&!readable&&<p className="card-b muted">{tl("Terminal, lab sunucusunda oturum başladığında açılır.")}</p>}
  </section>;
  return <div className="stack"><header className="page-head hero-galaxy"><div className="eyebrow">{tl("Komut Hattı · MF-014")}</div><h1 className="page-title">{tl("Unutulan izinler")}</h1><p className="page-sub">{tl("Mavi Fener’in rapor dosyasını yalnız sahibinin okuyup yazabileceği hâle getir.")}</p></header>
    <SplitPane storageKey="lab-split" initial={40} leftLabel="Brifing ve kontroller" rightLabel="Terminal" left={brief} right={terminal} />
  </div>;
}
