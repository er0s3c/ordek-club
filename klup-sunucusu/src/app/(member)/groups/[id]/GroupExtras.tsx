// Grup sayfası ekleri: sınıfta dönem ders planı; etkinlikte katılım doğrulaması, bekleme listesi ve geri bildirim.
import Link from "next/link";
import { CalendarRange } from "lucide-react";
import { db } from "@/server/db";
import { enabledFeatures } from "@/server/learning/features";
import { formatDate } from "@/components/ui/format";
import { EventTools } from "./EventTools";
import { getT } from "@/i18n/server";

export async function GroupExtras({ groupId, kind, canSee, isMember, staff, canEdit, full, timezone, userId, startsAt, endsAt }: { groupId: string; kind: "CLASS" | "EVENT"; canSee: boolean; isMember: boolean; staff: boolean; canEdit: boolean; full: boolean; timezone: string; userId: string; startsAt: Date | null; endsAt: Date | null }) {
  const t = await getT();
  const f = await enabledFeatures(["teacher-plus", "club-ops"]);
  const plans = f["teacher-plus"] && canSee && kind === "CLASS" ? await db.coursePlan.findMany({ where: { groupId }, orderBy: { week: "asc" } }) : [];
  let event: React.ReactNode = null;
  if (f["club-ops"] && kind === "EVENT") {
    const [checkIn, waiting, feedback, counts, group] = await Promise.all([
      db.eventCheckIn.findUnique({ where: { groupId_userId: { groupId, userId } } }),
      db.eventWaitlist.findUnique({ where: { groupId_userId: { groupId, userId } } }),
      db.eventFeedback.findUnique({ where: { groupId_userId: { groupId, userId } } }),
      staff ? Promise.all([db.eventCheckIn.count({ where: { groupId } }), db.eventWaitlist.count({ where: { groupId } }), db.eventFeedback.aggregate({ where: { groupId }, _avg: { rating: true }, _count: true })]) : Promise.resolve(null),
      db.classGroup.findUnique({ where: { id: groupId }, select: { checkInExpiresAt: true } }),
    ]);
    const ended = !!(endsAt ?? startsAt) && (endsAt ?? startsAt)!.getTime() < Date.now();
    event = <EventTools groupId={groupId} staff={staff} canEdit={canEdit} isMember={isMember} full={full} checkedIn={!!checkIn} waiting={!!waiting} feedbackGiven={!!feedback} ended={ended} codeOpenUntil={group?.checkInExpiresAt && group.checkInExpiresAt > new Date() ? group.checkInExpiresAt.toISOString() : null} stats={counts ? { checkIns: counts[0], waitlist: counts[1], avg: counts[2]._avg.rating, feedback: counts[2]._count } : null} />;
  }
  if (!plans.length && !event) return null;
  return (
    <>
      {event}
      {plans.length > 0 && (
        <section className="card" aria-labelledby="plan-h">
          <div className="card-h"><h2 id="plan-h"><CalendarRange size={16} aria-hidden />{" "}{t("Dönem ders planı")}</h2></div>
          <ol className="timeline card-b">
            {plans.map((p) => <li key={p.id}><time>{t("{week}. hafta ·", { week: p.week })}{" "}{formatDate(new Date(`${p.startsOn}T12:00:00Z`), timezone, t.intl)}</time><span><strong>{p.title}</strong>{p.lessonSlugs.length > 0 && <span className="tiny" style={{ display: "block" }}>{p.lessonSlugs.map((s) => <Link key={s} href={`/academy/lesson/${s}`} style={{ marginRight: 8 }}>{s}</Link>)}</span>}{p.note && <span className="tiny faint" style={{ display: "block" }}>{p.note}</span>}</span></li>)}
          </ol>
        </section>
      )}
    </>
  );
}
