import { db } from "@/server/db";
import { isAdmin } from "@/server/auth/policy";
import Link from "next/link";
import {notFound} from "next/navigation";
import {requirePageSession} from "@/server/auth/page-guard";
import {STAFF_ROLES} from "@/server/auth/guard";
import {featureEnabled} from "@/server/learning/features";
import {listBank,PACKS} from "@/server/learning/teacher-tools";
import {SKILLS} from "@/server/academy/placement";
import {TeacherTools} from "./TeacherTools";
import { getT } from "@/i18n/server";
export const metadata={title:"Ders araçları"};
export default async function Page(){
const t = await getT();const{user}=await requirePageSession(STAFF_ROLES);if(!await featureEnabled("teacher-tools"))notFound();return <div className="stack"><header className="page-head hero-galaxy"><div className="eyebrow">{t("Öğretmen çalışma alanı")}</div><h1 className="page-title">{t("Dersini hazırla")}</h1><p className="page-sub">{t("Hazır bir akışla başla, soru bankanı geliştir, öğrenmeyi görünür kıl.")}</p></header><Link className="btn" href="/teach/radar">{t("Öğrenme radarı")}</Link><TeacherTools bank={await listBank({id:user.id,role:user.role,status:user.status})} tracks={isAdmin(user.role) ? await db.track.findMany({ where: { archivedAt: null }, select: { id: true, title: true } }) : []} skills={[...SKILLS]} packs={PACKS.map(p=>({key:p.key,title:p.title}))}/></div>;}
