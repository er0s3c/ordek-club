import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { getAssignmentForStaff } from "@/server/classroom/assignments";
import { HttpError } from "@/server/errors";
import { TaskForm, toLocalInput } from "../../TaskForm";
import { taskXpDefaults } from "../../xp";

export const metadata: Metadata = { title: "Görevi düzenle" };

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requirePageSession(STAFF_ROLES);
  const { id } = await params;
  const a = await getAssignmentForStaff({ id: user.id, role: user.role, status: user.status }, id).catch((e) => {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  });
  if (!a.canEdit) redirect(`/teach/tasks/${id}`);
  return (
    <div className="stack fade-up" style={{ maxWidth: 900 }}>
      <div className="page-head">
        <div className="eyebrow"><Link href={`/teach/tasks/${id}`}>{a.title}</Link></div>
        <h1 className="page-title">Görevi düzenle</h1>
      </div>
      <TaskForm
        id={id}
        xpDefaults={await taskXpDefaults()}
        initial={{
          title: a.title,
          description: a.description,
          kind: a.kind,
          difficulty: a.difficulty,
          audience: a.audience,
          targetUsernames: a.targets.map((t) => t.user.username).join(", "),
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
        }}
      />
    </div>
  );
}
