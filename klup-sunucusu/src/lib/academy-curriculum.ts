export const CORE_MODULES=[
 {id:"m1",title:"Güvenliğe giriş",skill:"ethics"},
 {id:"m2",title:"Ağın dili",skill:"network"},
 {id:"m3",title:"Web nasıl çalışır",skill:"web"},
 {id:"m4",title:"Linux kabuğu",skill:"linux"},
 {id:"m5",title:"Windows temelleri",skill:"windows"},
 {id:"m6",title:"Kriptografinin özü",skill:"crypto"},
 {id:"m7",title:"Savunmanın ilk yarım saati",skill:"incident"},
] as const;
export const CORE_LESSON_IDS=CORE_MODULES.flatMap(m=>Array.from({length:4},(_,i)=>`sk101-${m.id}-0${i+1}`));
export const CORE_LAB_IDS=CORE_MODULES.map(m=>`sk101-${m.id}-lab`);
export const SPECIALIZATION_WAVES=[
 {wave:1,codes:["SK-121","SK-211","SK-221","SK-231"]},
 {wave:2,codes:["SK-241","SK-251","SK-261","SK-291","SK-301","SK-225"]},
 {wave:3,codes:["SK-271","SK-281","SK-311","SK-245","SK-285","SK-295","SK-305"]},
];
export function coreReadiness(lessons:{slug:string;kind:string;english:unknown;reviewed:boolean;activities:unknown[]}[]){
 const missing:string[]=[];
 for(const id of [...CORE_LESSON_IDS,...CORE_LAB_IDS]){
  const lesson=lessons.find(l=>l.slug===id);
  if(!lesson){missing.push(`${id}: içerik eksik`);continue;}
  if(!lesson.reviewed)missing.push(`${id}: Türkçe inceleme onayı eksik`);
  if(!lesson.english)missing.push(`${id}: onaylı İngilizce sürüm eksik`);
  if(CORE_LESSON_IDS.includes(id)&&(lesson.kind!=="LESSON"||lesson.activities.length<3||lesson.activities.length>6))missing.push(`${id}: ders ve 3–6 etkinlik gerekli`);
  if(CORE_LAB_IDS.includes(id)&&lesson.kind!=="PRACTICE")missing.push(`${id}: uygulama türünde olmalı`);
 }
 return{ready:missing.length===0,lessons:CORE_LESSON_IDS.filter(id=>lessons.some(l=>l.slug===id)).length,labs:CORE_LAB_IDS.filter(id=>lessons.some(l=>l.slug===id)).length,missing};
}
