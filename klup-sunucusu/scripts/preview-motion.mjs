// Real UI components, synthetic data, production-like CSP. No DB/API writes.
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { build } from "esbuild";
const root = path.resolve(import.meta.dirname, ".."), out = path.join(root, "test-results/motion-preview");
await fs.mkdir(out, { recursive: true });
await build({
  stdin: { resolveDir: root, loader: "tsx", contents: `
import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import{Providers}from'@/components/providers';import{AppShell}from'@/components/shell/AppShell';import{getMessages}from'@/i18n';
import{Tabs}from'@/components/ui/Tabs';import{Drawer}from'@/components/ui/Drawer';import{ProgressBar}from'@/components/academy/Progress';
import{ModuleAccordion}from'@/components/motion/ModuleAccordion';import{AnimatedList}from'@/components/motion/AnimatedList';import{DuckMascot}from'@/components/motion/DuckMascot';import{Feedback}from'@/components/motion/Feedback';
import{LearningWorkspace}from'@/components/academy/LearningWorkspace';
import'@/styles/globals.css';import'@/styles/gamification.css';import'@/styles/academy.css';import'@/styles/ui.css';import'@/styles/motion.css';
const q=new URLSearchParams(location.search),m=getMessages(q.get('locale')==='en'?'en':'tr');
window.__motionErrors=[];for(const method of ['error','warn']){const previous=console[method];console[method]=(...args)=>{window.__motionErrors.push(args.map(String).join(' '));previous.apply(console,args)}}
const links=['Ana sayfa','Akademi','Canlı ders','Liderlik','Öğrenme','Kulüp','Yönetim'];
const groups=[{items:links.slice(0,4).map((label,i)=>({href:'/page-'+i,label,icon:'GraduationCap'}))},...links.slice(4).map((label,i)=>({label,items:Array.from({length:6},(_,j)=>({href:'/group-'+i+'/'+j,label:label+' · Ayrıntılı araç '+(j+1),icon:'Settings',count:j===0?123:0}))}))];
const workspace={today:'2026-10-24',timezone:'Europe/Istanbul',prefs:{dailyGoal:2,reminderEnabled:false,reminderTime:'18:00',reminderEmail:false,locale:'tr'},streak:{current:7,longest:7,remainingProtection:1},completedToday:0,week:{activeDays:3,activities:9},days:[{day:'2026-10-24',state:'pending'}],plans:[{id:'p1',title:'Ağ kayıtlarını incele',day:'2026-10-25',completed:false}],schedule:[],personal:[{lessonId:'l1',lesson:{slug:'ornek',title:'Güven sınırları'},bookmarked:true,note:'Kontrol sırasında korunan not'}],reviews:[]};
function App(){const[open,setOpen]=useState(false),[reduced,setReduced]=useState(false),[rows,setRows]=useState([1,2,3]),[pct,setPct]=useState(36),[pose,setPose]=useState('wave'),[epoch,setEpoch]=useState(0);
return <Providers messages={m}><AppShell brand={<><span className="brand-logo">ÖC</span><div><div className="brand-name">{q.has('long')?'Uluslararası Kıbrıs Üniversitesi Siber Güvenlik Araştırma ve Öğrenci Kulübü':'Ördek Club'}</div><div className="brand-sub">Yönetim paneli</div></div></>} groups={groups} staff user={{role:'OWNER',username:'motion-test',displayName:'Deneme Yöneticisi Uzun Soyadı'}} userMenu={[{href:'/account',label:'Hesap ayarları',icon:'Settings'}]} bell={{href:'/notifications',count:32}}>
{q.has('workspace')?<LearningWorkspace data={workspace}/>:<div className="stack" style={{maxWidth:1100,margin:'0 auto'}}><header className="page-head"><div className="eyebrow">Ördek Club · Örnek veriler</div><h1 className="page-title">Bir sonraki adımın hazır</h1><p className="page-sub">Gerçek bileşenlerin hareket ve erişilebilirlik kontrolü</p></header>
<section className="card card-b stack"><div className="row-between"><label className="check"><input id="reduce" type="checkbox" checked={reduced} onChange={e=>{setReduced(e.target.checked);if(e.target.checked)document.documentElement.dataset.motion='reduce';else delete document.documentElement.dataset.motion;}}/>Hareketi azalt</label><button id="open-drawer" className="btn btn-primary" onClick={()=>setOpen(true)}>Not panelini aç</button></div>
<Tabs label="Öğrenme araçları" tabs={[{id:'notes',label:'Notlarım',content:<label className="field">Kişisel not<input className="input" id="persist-note" defaultValue="DNS incelemesini tamamla"/></label>},{id:'terms',label:'Terimler · TR/EN',content:<p>Güven sınırı · Trust boundary</p>},{id:'saved',label:'Kaydedilenler',content:<p>Öğrenme planına eklediğin içerikler</p>}]} /></section>
<div className="grid-2"><section className="card card-b stack"><div className="row-between"><h2>Bugünkü çalışmalar</h2><button id="add-row" className="btn btn-sm" onClick={()=>setRows(r=>[Math.max(0,...r)+1,...r])}>Görev ekle</button></div><AnimatedList id="animated-rows" className="stack-sm">{rows.map(id=><div className="row-between" key={id} data-row={id}><span>Kanıt incelemesi {id}</span><button className="btn btn-sm" aria-label={'Görev '+id+' sil'} onClick={()=>setRows(r=>r.filter(n=>n!==id))}>Sil</button></div>)}</AnimatedList></section>
<section className="card card-b stack"><div className="row-between"><h2>Öğrenme ilerlemesi</h2><button id="progress-up" className="btn btn-sm" onClick={()=>setPct(p=>Math.min(100,p+12))}>İlerlemeyi güncelle</button></div><ProgressBar value={pct} max={100} label="Örnek ilerleme"/><Feedback stateKey={String(pct)}>{pct}/100 tamamlandı</Feedback><div className="row"><DuckMascot key={epoch} pose={pose} size={112}/><div className="stack-sm"><label className="field">Maskot durumu<select id="pose" className="select" value={pose} onChange={e=>{setPose(e.target.value);setEpoch(n=>n+1)}}>{['wave','cheer','search','sleep','level','streak','encourage'].map(p=><option key={p}>{p}</option>)}</select></label><button id="replay" className="btn btn-sm" onClick={()=>setEpoch(n=>n+1)}>Tepkiyi yeniden göster</button></div></div></section></div>
<ModuleAccordion title="Modül 1 · Güvenliğe giriş" defaultOpen headingLevel={2}><p>Kanıtları incele, güven sınırını belirle ve kararını gerekçelendir.</p><label className="field">Modül notu<input id="module-note" className="input" defaultValue="Özgün içerik"/></label></ModuleAccordion>
<ModuleAccordion title="Lab ipucu ve çalışma alanı" headingLevel={2}><p>Dosyanın sahibi, grubu ve diğer kullanıcıların izinlerini karşılaştır.</p><button className="btn btn-sm">Kanıt dosyasını aç</button></ModuleAccordion>
</div>}<Drawer open={open} onClose={()=>setOpen(false)} title="Çalışma notların"><label className="field">Notun<input id="drawer-note" className="input" defaultValue="Ders notum"/></label><button id="close-drawer" className="btn" onClick={()=>setOpen(false)}>Kaydet ve kapat</button></Drawer>
</AppShell></Providers>};createRoot(document.getElementById('root')).render(<App/>);
` },
  bundle: true, splitting: true, format: "esm", platform: "browser", jsx: "automatic", outdir: out, entryNames: "preview", chunkNames: "chunks/[name]-[hash]",
  define: { "process.env.NODE_ENV": '"production"', "process.env.NEXT_PUBLIC_MOTION_ENABLED": '"true"' },
  loader: { ".woff2": "file", ".woff": "file" }, assetNames: "assets/[name]-[hash]", alias: { "@": path.join(root, "src") },
  plugins: [{ name: "fixture", setup(b) {
    b.onResolve({ filter: /^next\/(navigation|link|dynamic)$/ }, a => ({ path: a.path, namespace: "fixture" }));
    b.onResolve({ filter: /^@\/lib\/api-client$/ }, () => ({ path: "api", namespace: "fixture" }));
    b.onLoad({ filter: /.*/, namespace: "fixture" }, a => ({ contents: a.path === "next/navigation" ? 'export const usePathname=()=>location.pathname;export const useRouter=()=>({push(h){location.assign(h)},replace(h){location.assign(h)},refresh(){}});' : a.path === "api" ? 'export async function api(){throw new Error("Önizlemede kayıt ve arama API işlemleri kapalı.")}' : a.path === "next/dynamic" ? 'import React,{lazy,Suspense}from"react";export default function dynamic(load){const C=lazy(load);return p=>React.createElement(Suspense,{fallback:null},React.createElement(C,p))}' : 'import React from"react";export default function Link({href,children,prefetch,replace,...p}){return React.createElement("a",{href,...p},children)}', loader: "js", resolveDir: root }));
  } }],
});
await fs.writeFile(path.join(out, "index.html"), '<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ördek Club · Hareket kontrolü</title><link rel="stylesheet" href="/preview.css"></head><body><div id="root"></div><script nonce="motion-fixture" type="module" src="/preview.js"></script></body></html>');
http.createServer(async (req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://fixture").pathname);
  const base = pathname.startsWith("/animations/") ? path.join(root, "public") : out;
  const asset = /\.(js|css|woff2?|wasm|riv)$/.test(pathname);
  const file = asset ? path.resolve(base, "." + pathname) : path.join(out, "index.html");
  if (!file.startsWith(base + path.sep)) { res.writeHead(404); res.end(); return; }
  try {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'nonce-motion-fixture' 'strict-dynamic' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'");
    const types = { ".js": "text/javascript", ".css": "text/css", ".wasm": "application/wasm", ".riv": "application/octet-stream", ".woff2": "font/woff2", ".woff": "font/woff" };
    res.setHeader("Content-Type", types[path.extname(file)] ?? "text/html; charset=utf-8");
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404); res.end(); }
}).listen(3189, "127.0.0.1", () => console.log("Motion fixture: http://127.0.0.1:3189/dashboard?long=1"));
