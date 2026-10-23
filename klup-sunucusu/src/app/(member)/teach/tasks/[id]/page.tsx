import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { getAssignmentForStaff } from "@/server/classroom/assignments";
import { HttpError } from "@/server/errors";
import { getSettings } from "@/server/settings";
import { formatDateTime } from "@/components/ui/format";
import { ASSIGNMENT_STATUS, DIFFICULTY_LABEL, KIND_LABEL } from "@/components/classroom/labels";
import { TaskAdmin } from "./TaskAdmin";

export const metadata: Metadata = { title: "Görev" };

export default async function TeachTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requirePageSession(STAFF_ROLES);
  const { id } = await params;
  const a = await getAssignmentForStaff({ id: user.id, role: user.role, status: user.status }, id).catch((e) => {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  });
  const s = await getSettings();
  const rubric = (Array.isArray(a.rubric) ? a.rubric : []) as { criterion: string; points: number }[];
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow"><Link href="/teach/tasks">Görev yönetimi</Link> · {KIND_LABEL[a.kind]} · {DIFFICULTY_LABEL[a.difficulty]}</div>
        <h1 className="page-title">{a.title} <span className={ASSIGNMENT_STATUS[a.status]!.cls} style={{ verticalAlign: "middle" }}>{ASSIGNMENT_STATUS[a.status]!.label}</span></h1>
        <p className="page-sub">
          {a.createdBy?.displayName ?? "—"} · {a.audience === "ALL" ? "tüm öğrenciler" : `${a.targets.length} öğrenci`} · son teslim {a.dueAt ? formatDateTime(a.dueAt, s.timezone) : "yok"}
          {a.liveSessionId && " · canlı ders uygulama molası"}
        </p>
      </div>
      <TaskAdmin
        timezone={s.timezone}
        task={{
          id: a.id,
          status: a.status,
          canEdit: a.canEdit,
          description: a.description,
          maxScore: a.maxScore,
          rubric,
          targets: a.targets.map((t) => t.user.displayName),
          files: a.files,
          submissions: a.submissions.map((x) => ({
            id: x.id,
            status: x.status,
            late: x.late,
            attempts: x.attempts,
            submittedAt: x.submittedAt.toISOString(),
            text: x.text,
            score: x.score,
            feedback: x.feedback,
            rubricScores: (Array.isArray(x.rubricScores) ? x.rubricScores : null) as number[] | null,
            user: x.user,
            files: x.files,
          })),
        }}
      />
    </div>
  );
}
