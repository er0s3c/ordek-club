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
import { db } from "@/server/db";
import { listExtensions, peerReviewsForStaff } from "@/server/classroom/extensions";
import { ExtensionDecisions } from "@/components/classroom/TaskExtras";
import { TeacherTaskTools } from "@/components/classroom/TeacherTaskTools";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Görev") };
}

export default async function TeachTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const tl = await getT();
  const { user } = await requirePageSession(STAFF_ROLES);
  const { id } = await params;
  const a = await getAssignmentForStaff({ id: user.id, role: user.role, status: user.status }, id).catch((e) => {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  });
  const s = await getSettings();
  const rubric = (Array.isArray(a.rubric) ? a.rubric : []) as { criterion: string; points: number }[];
  const [extensions, peers, groups] = await Promise.all([listExtensions(a.id), peerReviewsForStaff(a.id), db.classGroup.findMany({ where: { archivedAt: null }, select: { id: true, name: true }, orderBy: { name: "asc" } })]);
  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow"><Link href="/teach/tasks">{tl("Görev yönetimi")}</Link> · {tl(KIND_LABEL[a.kind])} · {tl(DIFFICULTY_LABEL[a.difficulty])}</div>
        <h1 className="page-title">{a.title} <span className={ASSIGNMENT_STATUS[a.status]!.cls} style={{ verticalAlign: "middle" }}>{tl(ASSIGNMENT_STATUS[a.status]!.label)}</span></h1>
        <p className="page-sub">
          {a.createdBy?.displayName ?? "—"} · {a.audience === "ALL" ? tl("tüm öğrenciler") : a.audience === "GROUP" ? <Link href={`/groups/${a.group?.id}`}>{a.group?.name ?? tl("silinmiş grup")}{" "}{tl("({v0} üye)", { v0: a.group?._count.members ?? 0 })}</Link> : a.teamMode ? tl("{length} takım", { length: a.teams.length }) : tl("{length} öğrenci", { length: a.targets.length })}{" "}{tl("· son teslim")}{" "}{a.dueAt ? formatDateTime(a.dueAt, s.timezone, tl.intl) : "yok"}
          {a.liveSessionId && tl(" · canlı ders uygulama molası")}
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
          targets: a.teamMode ? [] : a.targets.map((t) => t.user.displayName),
          kind: a.kind,
          passPercent: a.passPercent,
          teams: a.teams.map((t) => ({ name: t.name, members: t.members.map((m) => m.user.displayName) })),
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
            team: x.team?.name ?? null,
            files: x.files,
          })),
        }}
      />
      <TeacherTaskTools taskId={a.id} canEdit={a.canEdit} peerEnabled={a.peerReviewEnabled} peerCount={a.peerReviewCount} groups={groups} peers={peers} />
      <section id="extensions" className="card" aria-labelledby="ext-h">
        <div className="card-h"><h2 id="ext-h">{tl("Ek süre talepleri")}</h2><span className="tiny faint">{extensions.filter((e) => e.status === "PENDING").length}{" "}{tl("bekliyor")}</span></div>
        <div className="card-b"><ExtensionDecisions rows={extensions.map((e) => ({ id: e.id, reason: e.reason, requestedDue: e.requestedDue.toISOString(), status: e.status, decisionNote: e.decisionNote, createdAt: e.createdAt.toISOString(), user: e.user.displayName }))} /></div>
      </section>
    </div>
  );
}
