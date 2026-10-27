import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { pageFeature } from "@/server/learning/page-features";
import { groupPlans, myGroups } from "@/server/teaching/insights";
import { precheckResults } from "@/server/teaching/precheck";
import { clubGoalProgress } from "@/server/community/goals";
import { SKILLS } from "@/server/academy/placement";
import { db } from "@/server/db";
import { PlanningBoard } from "./PlanningBoard";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Planlama ve yoklama") };
}

export default async function PlanningPage({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  const t = await getT();
  const { user } = await requirePageSession(STAFF_ROLES);
  await pageFeature("teacher-plus");
  const actor = { id: user.id, role: user.role, status: user.status };
  const groups = await myGroups(actor);
  const groupId = (await searchParams).group ?? groups[0]?.id ?? null;
  const [plans, prechecks, goals, bank] = await Promise.all([
    groupId ? groupPlans(groupId) : Promise.resolve([]),
    precheckResults(actor),
    clubGoalProgress(),
    db.bankQuestion.groupBy({ by: ["skill", "difficulty"], _count: true }),
  ]);
  return (
    <div className="stack fade-up">
      <header className="page-head"><div className="eyebrow">{t("Eğitmen")}</div><h1 className="page-title">{t("Planlama ve yoklama")}</h1><p className="page-sub">{t("Dönem ders planı, ders öncesi yoklama, takım önerisi, kulüp ortak hedefi ve soru bankasından quiz formu.")}</p></header>
      <PlanningBoard
        groups={groups.map((g) => ({ id: g.id, name: g.name }))}
        groupId={groupId}
        plans={plans.map((p) => ({ week: p.week, startsOn: p.startsOn, title: p.title, lessonSlugs: p.lessonSlugs, note: p.note }))}
        prechecks={prechecks}
        goals={goals}
        skills={SKILLS.map((s) => ({ key: s.key, tr: t.locale === "en" ? s.en : s.tr }))}
        bank={bank.map((b) => ({ skill: b.skill, difficulty: b.difficulty, count: b._count }))}
      />
    </div>
  );
}
