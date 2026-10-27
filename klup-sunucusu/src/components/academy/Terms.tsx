"use client";
import {useEffect,useLayoutEffect,useRef,useState}from"react";
import{api}from"@/lib/api-client";
import{TERMS}from"@/lib/academy-terms";
import { useT } from "@/i18n/client";
// Terim kartı: masaüstünde kelimenin hemen yanında (ekran kenarına taşmadan), dar ekranda alttan açılan panel.
export function TermCard({id}:{id:string}){
  const tl = useT();
  const[open,setOpen]=useState(false);const[pos,setPos]=useState<{left:number;top:number;below:boolean}|null>(null);const btn=useRef<HTMLButtonElement>(null);const card=useRef<HTMLSpanElement>(null);
  const term=TERMS.find(t=>t.id===id);
  useLayoutEffect(()=>{if(!open||!btn.current)return;const place=()=>{const r=btn.current!.getBoundingClientRect();const w=Math.min(340,window.innerWidth-24);const left=Math.min(Math.max(12,r.left+r.width/2-w/2),window.innerWidth-w-12);const h=card.current?.offsetHeight??220;const below=r.bottom+h+12<window.innerHeight||r.top<h+12;setPos({left,top:below?r.bottom+8:r.top-h-8,below});};place();window.addEventListener("resize",place);window.addEventListener("scroll",place,true);return()=>{window.removeEventListener("resize",place);window.removeEventListener("scroll",place,true);};},[open]);
  useEffect(()=>{if(!open)return;const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape"){setOpen(false);btn.current?.focus();}};const onDown=(e:MouseEvent)=>{if(!card.current?.contains(e.target as Node)&&!btn.current?.contains(e.target as Node))setOpen(false);};document.addEventListener("keydown",onKey);document.addEventListener("mousedown",onDown);return()=>{document.removeEventListener("keydown",onKey);document.removeEventListener("mousedown",onDown);};},[open]);
  if(!term)return <span>{id}</span>;
  return <span className="term-inline"><button ref={btn} type="button" className="term-trigger" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>{term.tr}</button>{open&&<span ref={card} className="term-popover term-floating" role="dialog" aria-label={term.tr} style={pos?{left:pos.left,top:pos.top}:{visibility:"hidden"}}><span className="row-between"><strong>{term.tr}</strong><button type="button" className="btn btn-ghost btn-sm" onClick={()=>{setOpen(false);btn.current?.focus();}} aria-label={tl("Kapat")}>×</button></span><em lang="en">{term.en}</em><span>{term.definitionTr}</span><span lang="en" className="small muted">{term.definitionEn}</span><small>{term.example}</small><SaveTermButton id={term.id}/></span>}</span>;
}
// Kişisel terim listesine ekle (çalışma araçları açıksa sunucu kabul eder; kapalıysa sessizce gizlenir).
function SaveTermButton({id}:{id:string}){
const t = useT();const[state,setState]=useState<"idle"|"saved"|"off">("idle");if(state==="off")return null;return <button type="button" className="btn btn-sm" disabled={state==="saved"} onClick={()=>api("/api/study/terms",{body:{termId:id}}).then(()=>setState("saved")).catch(()=>setState("off"))}>{state==="saved"?t("Listene eklendi"):t("Terim listeme ekle")}</button>;}
export function TermText({text}:{text:string}){return <>{text.split(/(::terim\[[a-z0-9-]+\])/g).map((s,i)=>{const m=s.match(/^::terim\[([a-z0-9-]+)\]$/);return m?<TermCard key={i} id={m[1]!}/>:s;})}</>;}
export function Glossary(){
const tl = useT();const[query,setQuery]=useState("");const rows=TERMS.filter(t=>`${t.tr} ${t.en}`.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")));return <div className="stack"><label>{tl("Terim ara")}<input className="input" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={tl("DNS, yetkilendirme, phishing…")}/></label><div className="grid-2">{rows.map(t=><article className="card card-b stack" key={t.id} id={t.id}><div className="eyebrow">{t.en}</div><h2>{t.tr}</h2><p>{t.definitionTr}</p><p className="small muted" lang="en">{t.definitionEn}</p><p className="small">{tl("Örnek: {example}", { example: t.example })}</p></article>)}</div>{!rows.length&&<p className="muted">{tl("Bu aramayla eşleşen terim yok.")}</p>}</div>;}
