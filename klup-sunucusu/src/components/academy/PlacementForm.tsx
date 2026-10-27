"use client";
import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { useT } from "@/i18n/client";
export function PlacementForm({questions}:{questions:{text:string;options:string[]}[]}){
  const t = useT();
  const [answers,setAnswers]=useState<number[]>(questions.map(()=>-1)),[busy,setBusy]=useState(false),[message,setMessage]=useState("");
  const [result,setResult]=useState<{score:number;recommendation:string;results:{correct:boolean;explanation:string}[]}|null>(null);
  return <form className="stack" onSubmit={async e=>{e.preventDefault();setBusy(true);setMessage("");try{setResult(await api("/api/learning/placement",{body:{answers}}));}catch(err){setMessage((err as Error).message);}finally{setBusy(false);}}}>
    {questions.map((q,i)=><fieldset className="card card-b stack" key={i}><legend>{i+1}. {q.text}</legend>{q.options.map((o,n)=><label className="activity-option" key={n}><input type="radio" name={`q-${i}`} required checked={answers[i]===n} disabled={busy||!!result} onChange={()=>setAnswers(a=>a.map((v,j)=>i===j?n:v))}/><span>{o}</span></label>)}{result&&<p>{result.results[i]!.correct?t("Doğru"):t("Tekrar et")} · {result.results[i]!.explanation}</p>}</fieldset>)}
    {message&&<p role="alert">{message}</p>}{result?<section className="card card-b"><h2>{t("Sonucun: %{score}", { score: result.score })}</h2><p>{result.recommendation}</p><Link className="btn btn-primary" href="/academy/skills">{t("Beceri haritama git")}</Link></section>:<button className="btn btn-primary" disabled={busy}>{busy?t("Değerlendiriliyor…"):t("Başlangıç önerimi göster")}</button>}
  </form>;
}
