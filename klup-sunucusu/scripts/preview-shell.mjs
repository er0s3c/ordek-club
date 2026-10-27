// Real shell/dialog components with synthetic role data; no DB or authenticated APIs.
import fs from "node:fs/promises";
import path from "node:path";
import http from "node:http";
import { build } from "esbuild";
const root=path.resolve(import.meta.dirname,".."),out=path.join(root,"test-results/shell-preview");
await fs.mkdir(out,{recursive:true});
await build({stdin:{contents:`
import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import{AppShell}from'@/components/shell/AppShell';import{Providers}from'@/components/providers';import{getMessages}from'@/i18n';import{Drawer}from'@/components/ui/Drawer';
import '@/styles/globals.css';import '@/styles/ui.css';import '@/styles/learning.css';
const q=new URLSearchParams(location.search),admin=q.get('mode')==='admin',en=q.get('locale')==='en',m=getMessages(en?'en':'tr');
const item=(href,label,icon='School')=>({href,label,icon});
const groups=admin?[
{items:[item('/admin',m.nav.dashboard,'LayoutDashboard'),{...item('/admin/members',m.nav.members,'Users'),count:123},item('/admin/invitations',m.nav.invitations,'Ticket')]},
{label:m.nav.content,items:[item('/admin/academy',m.nav.academy),item('/admin/xp',m.nav.xp,'Gauge'),item('/admin/badges',m.nav.badges,'Medal')]},
{label:m.nav.systemGroup,items:[item('/admin/features','Özellik yönetimi','Settings'),item('/admin/settings',m.nav.settings,'Settings'),item('/admin/audit',m.nav.audit,'ScrollText'),item('/admin/system',m.nav.system,'Activity')]}
]:[
{items:[item('/dashboard',m.nav.home,'Home'),item('/academy',m.nav.academy,'GraduationCap'),item('/live',m.nav.live,'Radio')]},
{label:m.nav.classroom,items:[{...item('/tasks',m.nav.tasks,'ClipboardList'),count:24},item('/groups',m.nav.groups),item('/files',m.nav.files,'FolderOpen'),item('/announcements',m.nav.announcements,'Megaphone'),item('/academy/terms','Terimler · TR/EN'),item('/academy/practice','Uygulama meydanı'),item('/academy/labs','Komut Hattı','HardDrive')]},
{items:[item('/leaderboard',m.nav.leaderboard,'Trophy')]},
{label:m.nav.instructor,items:[item('/teach',m.nav.teach,'Presentation'),item('/teach/analytics',m.nav.analytics,'BarChart3'),item('/teach/queue','Değerlendirme kuyruğu','Inbox'),item('/teach/content','İçerik merkezi','CheckSquare'),item('/teach/planning','Planlama ve yoklama','CalendarClock')]},
{label:'Ders araçları',items:[item('/teach/tools','Ders paketleri ve sorular','Presentation'),item('/teach/radar','Öğrenme radarı','BarChart3')]},
{label:'Öğrenme',items:[item('/academy/workspace','Öğrenme alanım','GraduationCap'),item('/study','Çalışma merkezi','Timer'),item('/academy/workshops','Atölyeler','FlaskConical')]},
{label:'Kulüp',items:[item('/club','Kulüp panosu','Boxes'),item('/club/events','Etkinlik takvimi','CalendarClock')]},
{items:[item('/admin',m.nav.admin,'Shield'),item('/admin/features','Özellikler','Settings')]}
];
function App(){const[open,setOpen]=useState(false),[side,setSide]=useState('right');return <Providers messages={m}><AppShell
user={{displayName:'Deneme Yöneticisi Uzun Soyadı',username:'ui-test',role:'OWNER'}} groups={groups} staff bell={{href:'/notifications',count:32}}
home={admin?'/admin':'/dashboard'} brand={<><span className="brand-logo">ÖC</span><div><div className="brand-name">{q.has('long')?'Uluslararası Kıbrıs Üniversitesi Siber Güvenlik Araştırma ve Öğrenci Kulübü':'UKÜ Siber Güvenlik Kulübü'}</div><div className="brand-sub">Yönetim paneli</div></div></>}
userMenu={[item('/u/ui-test','Profilim','Medal'),item('/account','Hesap ayarları','UserRound'),item('/dashboard','Uygulamaya dön','ArrowLeft')]}
bottomNav={admin?undefined:[item('/dashboard','Ana sayfa','Home'),item('/academy','Akademi','GraduationCap'),item('/tasks','Görevler','ClipboardList'),item('/u/ui-test','Profilim','Medal')]}>
<div className="stack fade-up"><div className="page-head"><div className="eyebrow">Görsel test · Örnek veriler</div><h1 className="page-title">{admin?'Yönetim paneli':'Merhaba, yönetici'}</h1><p className="page-sub">Gerçek üst menü, arama ve panel bileşenleri. Bu önizleme üye verisi içermez.</p></div>
<section className="card card-b stack"><h2>Arayüz kontrolleri</h2><div className="row"><button id="preview-drawer" className="btn btn-primary" onClick={()=>{setSide('right');setOpen(true)}}>Yan paneli aç</button><button id="preview-bottom" className="btn" onClick={()=>{setSide('bottom');setOpen(true)}}>Alt paneli aç</button></div></section>
<div className="grid-2"><section className="card card-b"><h2>Değerlendirme bekleyenler</h2><p>12 teslim · 3 sınıf</p></section><section className="card card-b"><h2>Bugünkü dersler</h2><p>Ağ güvenliği · Linux izinleri</p></section></div>
<section className="card card-b"><h2>Kontrol listesi</h2>{Array.from({length:14},(_,i)=><p key={i}>Örnek satır {i+1}: Uzun içerikte sayfanın ve panelin kaydırma davranışı.</p>)}</section></div>
<Drawer open={open} onClose={()=>setOpen(false)} side={side} title="Çalışma notları ve erişilebilirlik denetimi"><label className="field">Notun<input className="input" aria-label="Notun" defaultValue="Örnek kişisel not"/></label>{Array.from({length:18},(_,i)=><p key={i}>Panel örnek satırı {i+1}</p>)}<button className="btn" onClick={()=>setOpen(false)}>Tamamla</button></Drawer>
</AppShell></Providers>};createRoot(document.getElementById('root')).render(<App/>);`,resolveDir:root,loader:"tsx"},bundle:true,platform:"browser",jsx:"automatic",outfile:path.join(out,"preview.js"),loader:{".woff2":"file",".woff":"file"},assetNames:"assets/[name]-[hash]",alias:{"@":path.join(root,"src")},plugins:[{name:"fixture",setup(b){b.onResolve({filter:/^next\/(navigation|link)$/},a=>({path:a.path,namespace:"fixture"}));b.onResolve({filter:/^@\/lib\/api-client$/},()=>({path:"api",namespace:"fixture"}));b.onLoad({filter:/.*/,namespace:"fixture"},a=>({contents:a.path==="next/navigation"?'export const usePathname=()=>location.pathname;export const useRouter=()=>({push(h){location.assign(h)},replace(h){location.assign(h)},refresh(){location.reload()}});':a.path==="api"?'export async function api(){throw new Error("Görsel testte kayıt ve arama API işlemleri kapalı.")}':'import React from "react";export default function Link({href,children,prefetch,replace,...p}){return React.createElement("a",{href,...p},children)}',loader:"js",resolveDir:root}));}}]});
await fs.writeFile(path.join(out,"index.html"),'<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ördek Club · UI test</title><link rel="stylesheet" href="/preview.css"></head><body><div id="root"></div><script src="/preview.js"></script></body></html>');
http.createServer(async(req,res)=>{
  try {const pathname=new URL(req.url,"http://fixture").pathname;const file=pathname.startsWith("/assets/")||["/preview.js","/preview.css"].includes(pathname)?path.resolve(out,"."+pathname):path.join(out,"index.html");if(!file.startsWith(out+path.sep)){res.writeHead(404);return res.end();}res.setHeader("Cache-Control","no-store");res.setHeader("Content-Type",file.endsWith(".js")?"text/javascript":file.endsWith(".css")?"text/css":file.endsWith(".woff2")?"font/woff2":file.endsWith(".woff")?"font/woff":"text/html; charset=utf-8");res.end(await fs.readFile(file));}
  catch {res.writeHead(404);res.end();}
}).listen(3188,"127.0.0.1",()=>console.log("Real shell fixture: http://127.0.0.1:3188/dashboard (mode=admin, locale=en, long=1)"));
