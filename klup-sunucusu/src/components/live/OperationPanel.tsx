"use client";
import {useCallback,useEffect,useState} from "react";
import {api} from "@/lib/api-client";
import type{OperationView}from"@/server/learning/operations";
import { AnimatedList } from "@/components/motion/AnimatedList";
import { useT } from "@/i18n/client";
export function OperationPanel({code,revision,projection=false}:{code:string;revision:number;projection?:boolean}){
  const t = useT();
  const[data,setData]=useState<OperationView|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  const load=useCallback(async()=>{try{setData(await api<OperationView>(`/api/live/operation/${code}`));}catch{setData(null);}},[code]);
  useEffect(()=>{void load();},[load,revision]);
  async function control(action:string,choice?:number){setBusy(true);setMessage("");try{setData(await api<OperationView>(`/api/live/operation/${code}`,{body:{action,version:data?.operation?.version,choice}}));}catch(e){setMessage((e as Error).message);await load();}finally{setBusy(false);}}
  if(!data||(!data.operation&&(!data.host||projection)))return null;
  const op=data.operation;
  return <section className="card operation-panel"><div className="card-h"><h2>{op?.title??t("Canlı operasyon")}</h2>{op&&<span className="badge">{op.status==="ENDED"?t("Tamamlandı"):op.status==="PAUSED"?t("Duraklatıldı"):t("Aşama {v0}", { v0: op.stage+1 })}</span>}</div><div className="card-b stack">
    {message&&<p role="alert">{message}</p>}
    {!op?<><p>{t("Mavi Fener’in şüpheli mesaj olayını sınıfla çöz. Başlangıçta katılmış öğrenciler üç inceleme rolüne ayrılır; tek öğrenci varsa tüm kanıtlar açılır.")}</p><button className="btn btn-primary" disabled={busy} onClick={()=>void control("start")}>{t("Şüpheli Mesaj operasyonunu başlat")}</button></>:<>
    <p>{op.briefing}</p>{op.team&&<span className="badge">{t("Takım rolün: {team}", { team: op.team })}</span>}{op.observer&&<p className="muted">{t("Operasyon başladıktan sonra katıldın; bu turu gözlemci olarak izliyorsun.")}</p>}
    {(!projection||op.stage>=1)&&<AnimatedList className="grid-2">{op.evidence.map(e=><article className="card card-b" key={e.title}><h3>{e.title}</h3><pre className="learning-note">{e.text}</pre></article>)}</AnimatedList>}
    {op.history.length>0&&<ol>{op.history.map(h=><li key={h.stage}>{h.outcome}</li>)}</ol>}
    {op.status==="ENDED"?<section><h3>{t("Ne öğrendik?")}</h3><p>{op.debrief}</p></section>:<><h3>{op.stageTitle}</h3><p>{op.question}</p><div className="stack">{op.choices.map((c,i)=><button className="btn learning-answer" key={i} disabled={busy||projection||op.status!=="ACTIVE"||(!data.host&&(op.observer||op.vote!==null))} onClick={()=>void control(data.host?"advance":"vote",i)}>{c}{op.vote===i?t(" · Kararın"):null}{data.host&&!projection&&op.tally?t(" · {v0} oy", { v0: op.tally[i] }):null}</button>)}</div>{data.host&&!projection&&<><p className="small muted">{t("Sınıfın oylarını değerlendirdikten sonra seçtiğin karar senaryoyu ilerletir. Eşitlikte kararı sen verirsin.")}</p><div className="learning-tabs"><button className="btn" disabled={busy} onClick={()=>void control(op.status==="PAUSED"?"resume":"pause")}>{op.status==="PAUSED"?t("Devam et"):t("Duraklat")}</button><button className="btn" disabled={busy} onClick={()=>void control("end")}>{t("Operasyonu bitir ve çözümle")}</button></div></>}</>}
    </>}
  </div></section>;
}
