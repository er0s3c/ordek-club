import { featureEnabled } from "@/server/learning/features";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList, Megaphone, Radio } from "lucide-react";
import { listActiveSessions } from "@/server/live/service";
import { requirePageSession } from "@/server/auth/page-guard";
import { getSettings } from "@/server/settings";
import { continueTarget, firstMission, progressSummary } from "@/server/academy/service";
import { isStaff } from "@/server/auth/policy";
import { listAssignmentsForStudent } from "@/server/classroom/assignments";
import { listAnnouncements } from "@/server/classroom/announcements";
import { Duck } from "@/components/ui/Duck";
import { StudentHome } from "./StudentHome";
import { TeacherHome } from "./TeacherHome";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Ana sayfa") };
}

export default async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const t = await getT();
  const { user } = await requirePageSession();
  const denied = (await searchParams).denied === "1";
  const s = await getSettings();
  const actor = { id: user.id, role: user.role, status: user.status };
  const staff = isStaff(user.role);
  const firstName = user.displayName.split(" ")[0]!;
  const deniedAlert = denied && <div className="alert alert-warn" role="alert">{t("Bu sayfaya erişim yetkin yok.")}</div>;

  if (staff) return <>{deniedAlert}<TeacherHome user={user} firstName={firstName} settings={s} /></>;

  const academy = await progressSummary(actor);
  // İlk kullanım (04 §6.1): hiç ders bitirmemiş öğrenciye tek kart, tek yeşil düğme. Lig, sıra, seri, XP toplamı yok;
  // kulüp haberleri katlı şeritte.
  const first = academy.completed === 0 ? await firstMission(actor, t.locale) : null;
  if (first) {
    const [live, tasks, anns] = await Promise.all([listActiveSessions(), listAssignmentsForStudent(actor), listAnnouncements(actor, 3)]);
    const todo = tasks.filter((a) => a.status === "PUBLISHED" && (!a.mine || a.mine.status === "RETURNED")).slice(0, 4);
    const news = live.length + todo.length + anns.length;
    return (
      <div className="stack fade-up first-run">
        {deniedAlert}
        <div className="first-head row" style={{ alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <div className="eyebrow">{s.clubName}</div>
            <h1 className="page-title">{t("Merhaba,")}{" "}<em>{firstName}</em></h1>
            <p className="page-sub">{t("Burada kimse \"bunu bilmen gerekirdi\" demez.")}</p>
          </div>
          <Duck pose="wave" size={84} label={t("Ördek el sallıyor")} />
        </div>
        <section className="card first-card" aria-labelledby="first-h">
          <div className="first-tag">{t("İlk görev · ≈{minutes} dk · +XP", { minutes: first.minutes })}</div>
          <h2 id="first-h" className="first-title">{t("Şüpheli mesaj")}</h2>
          <p className="first-text">{t("Bir mesaj geldi. Gerçek mi? Sen karar ver.")}</p>
          <Link className="btn btn-primary first-cta" href={`/academy/lesson/${first.slug}`}>{t("Mesajı aç")}{" "}<ArrowRight size={16} aria-hidden /></Link>
        </section>
        <Link className="first-how" href="/academy">{t("Akademi nasıl işler?")}</Link>
        {news > 0 && (
          <details className="first-news" open={live.length > 0}>
            <summary>{t("Kulüpte bu hafta ({news})", { news })}</summary>
            <ul className="list-tight">
              {live.map((x) => <li key={x.id}><Radio size={14} aria-hidden /> <span style={{ flex: 1 }}><strong>{t("Canlı:")}</strong> {x.title}</span><Link className="btn btn-sm" href={`/live/${x.code}`}>{t("Katıl")}</Link></li>)}
              {todo.map((a) => <li key={a.id}><ClipboardList size={14} aria-hidden /> <span style={{ flex: 1, minWidth: 0 }}><Link href={`/tasks/${a.id}`}>{a.title}</Link></span></li>)}
              {anns.map((a) => <li key={a.id}><Megaphone size={14} aria-hidden /> <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}><Link href={`/announcements#a-${a.id}`}>{a.title}</Link></span></li>)}
            </ul>
          </details>
        )}
      </div>
    );
  }
  const next = await continueTarget(actor, t.locale);
  return <>{deniedAlert}<StudentHome user={user} firstName={firstName} settings={s} academy={academy} next={next} learning={await featureEnabled("learning")} /></>;
}
