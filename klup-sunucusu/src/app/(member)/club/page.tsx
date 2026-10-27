import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, CalendarClock, HandHeart, LifeBuoy, Vote } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { pageFeature } from "@/server/learning/page-features";
import { canManageClassroom } from "@/server/auth/policy";
import { db } from "@/server/db";
import { Newsletter } from "./Newsletter";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Kulüp panosu") };
}

export default async function ClubHub() {
  const tl = await getT();
  const { user } = await requirePageSession();
  await pageFeature("club-ops");
  const staff = canManageClassroom({ id: user.id, role: user.role, status: user.status });
  const now = new Date();
  const [events, slots, polls, tasks] = await Promise.all([
    db.classGroup.count({ where: { kind: "EVENT", archivedAt: null, startsAt: { gte: now } } }),
    db.officeHourSlot.count({ where: { startsAt: { gte: now } } }),
    db.clubPoll.count({ where: { OR: [{ closesAt: null }, { closesAt: { gt: now } }], votes: { none: { userId: user.id } } } }),
    db.clubTask.count({ where: { status: "OPEN" } }),
  ]);
  const tiles = [
    { href: "/club/events", icon: CalendarClock, title: tl("Etkinlik takvimi"), text: tl("{events} yaklaşan etkinlik", { events }) },
    { href: "/club/office-hours", icon: LifeBuoy, title: tl("Görüşme saatleri"), text: tl("{slots} açık dilim", { slots }) },
    { href: "/club/polls", icon: Vote, title: tl("Anketler"), text: polls ? `${polls} anket oyunu bekliyor` : "Bekleyen anket yok" },
    { href: "/club/tasks", icon: HandHeart, title: tl("Gönüllü görevler"), text: tl("{tasks} açık görev", { tasks }) },
  ];
  return (
    <div className="stack-lg fade-up">
      <header className="page-head"><div className="eyebrow">{tl("Kulüp")}</div><h1 className="page-title"><Boxes size={28} aria-hidden />{" "}{tl("Kulüp panosu")}</h1><p className="page-sub">{tl("Etkinlikler, görüşmeler, anketler ve gönüllülük tek yerde.")}</p></header>
      <div className="grid-3">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="card card-b stack-sm workshop-card">
            <strong><t.icon size={16} aria-hidden /> {t.title}</strong>
            <span className="small muted">{t.text}</span>
            <span className="small skill-more">{tl("Aç")}{" "}<ArrowRight size={14} aria-hidden /></span>
          </Link>
        ))}
      </div>
      {staff && <Newsletter />}
    </div>
  );
}
