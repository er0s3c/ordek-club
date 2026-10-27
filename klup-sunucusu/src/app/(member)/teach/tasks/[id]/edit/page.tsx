import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { getAssignmentForStaff } from "@/server/classroom/assignments";
import { HttpError } from "@/server/errors";
import { toLocalInput } from "@/components/classroom/form-values";
import { TaskForm } from "../../TaskForm";
import { taskGroupOptions, taskXpDefaults } from "../../xp";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Görevi düzenle") };
}

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const tl = await getT();
  const { user } = await requirePageSession(STAFF_ROLES);
  const { id } = await params;
  const a = await getAssignmentForStaff({ id: user.id, role: user.role, status: user.status }, id).catch((e) => {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  });
  if (!a.canEdit) redirect(`/teach/tasks/${id}`);
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow"><Link href={`/teach/tasks/${id}`}>{a.title}</Link></div>
        <h1 className="page-title">{tl("Görevi düzenle")}</h1>
      </div>
      <TaskForm
        id={id}
        xpDefaults={await taskXpDefaults()}
        groups={await taskGroupOptions()}
        locked={a.submissions.length > 0}
        initial={{
          title: a.title,
          description: a.description,
          kind: a.kind,
          difficulty: a.difficulty,
          audience: a.audience,
          targetUsernames: a.teamMode ? "" : a.targets.map((t) => t.user.username).join(", "),
          groupId: a.groupId ?? "",
          startsAt: toLocalInput(a.startsAt),
          dueAt: toLocalInput(a.dueAt),
          allowLate: a.allowLate,
          allowResubmit: a.allowResubmit,
          requireText: a.requireText,
          requireFile: a.requireFile,
          maxScore: a.maxScore,
          rubric: (Array.isArray(a.rubric) ? a.rubric : []) as { criterion: string; points: number }[],
          xpRuleKey: a.xpRuleKey,
          xpAmount: a.xpAmount === null ? "" : String(a.xpAmount),
          teamMode: a.teamMode,
          teams: a.teams.map((t) => `${t.name}: ${t.members.map((m) => m.user.username).join(", ")}`).join("\n"),
          quiz: (Array.isArray(a.quiz) ? a.quiz : []) as unknown[],
          passPercent: a.passPercent,
          maxAttempts: a.maxAttempts === null ? "" : String(a.maxAttempts),
          checklist: a.checklist.join("\n"),
          skills: a.skills,
          peerReviewEnabled: a.peerReviewEnabled,
          peerReviewCount: a.peerReviewCount,
        }}
      />
    </div>
  );
}
