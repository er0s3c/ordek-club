import { requirePageSession } from "@/server/auth/page-guard";
import { isAdmin,isStaff } from "@/server/auth/policy";
import { notFound } from "next/navigation";
import { db } from "@/server/db";
import { featureEnabled } from "@/server/learning/features";
import { ProtectionForm } from "./ProtectionForm";
import { getT } from "@/i18n/server";
export default async function Page() {
  const t = await getT();
  const {user}=await requirePageSession(); if(!isStaff(user.role)||!await featureEnabled("learning"))notFound();
  const groups=await db.classGroup.findMany({where:{kind:"CLASS",archivedAt:null,...(!isAdmin(user.role)?{createdById:user.id}:{})},include:{examProtections:true},orderBy:{name:"asc"}});
  return <div className="stack"><header className="page-head"><div className="eyebrow">{t("Öğretmen araçları")}</div><h1 className="page-title">{t("Öğrenme dönemleri")}</h1></header><ProtectionForm groups={groups.map(g=>({id:g.id,name:g.name}))} />{groups.map(g=><section className="card card-b" key={g.id}><h2>{g.name}</h2>{g.examProtections.length?g.examProtections.map(p=><p key={p.id}>{p.startsOn} — {p.endsOn}</p>):<p className="muted">{t("Tanımlı sınav koruması yok.")}</p>}</section>)}</div>;
}
