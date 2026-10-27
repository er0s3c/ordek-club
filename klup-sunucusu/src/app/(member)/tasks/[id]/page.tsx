import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requirePageSession } from "@/server/auth/page-guard";
import { isStaff } from "@/server/auth/policy";
import { getAssignmentForStudent } from "@/server/classroom/assignments";
import { HttpError } from "@/server/errors";
import { getSettings } from "@/server/settings";
import { formatDateTime } from "@/components/ui/format";
import { FileList } from "@/components/classroom/FileList";
import { DIFFICULTY_LABEL, KIND_LABEL, SUBMISSION_STATUS } from "@/components/classroom/labels";
import { TaskSubmit } from "./TaskSubmit";
import { QuizTake } from "./QuizTake";
import { db } from "@/server/db";
import { listExtensions, myPeerTasks, receivedPeerReviews } from "@/server/classroom/extensions";
import { ExtensionPanel, PeerPanel, VersionCompare } from "@/components/classroom/TaskExtras";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Görev") };
}

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getT();
  const { user } = await requirePageSession();
  const { id } = await params;
  if (isStaff(user.role)) redirect(`/teach/tasks/${encodeURIComponent(id)}`);
  const a = await getAssignmentForStudent({ id: user.id, role: user.role, status: user.status }, id).catch((e) => {
    if (e instanceof HttpError && e.status === 404) notFound();
    throw e;
  });
  const s = await getSettings();
  const rubric = (Array.isArray(a.rubric) ? a.rubric : []) as { criterion: string; points: number }[];
  const mine = a.mine;
  const scores = (mine && Array.isArray(mine.rubricScores) ? mine.rubricScores : []) as number[];
  const actor = { id: user.id, role: user.role, status: user.status };
  const [override, extensions, versions, peerTasks, peerReceived] = await Promise.all([
    db.deadlineOverride.findUnique({ where: { assignmentId_userId: { assignmentId: a.id, userId: user.id } } }),
    listExtensions(a.id).then((rows) => rows.filter((r) => r.userId === user.id)),
    mine ? db.submissionVersion.findMany({ where: { submissionId: mine.id }, orderBy: { number: "asc" }, select: { number: true, text: true, createdAt: true } }) : Promise.resolve([]),
    myPeerTasks(actor, a.id),
    receivedPeerReviews(actor, a.id),
  ]);
  const dueAt = override?.dueAt ?? a.dueAt;
  const past = !!dueAt && dueAt.getTime() < Date.now();
  const isQuiz = a.kind === "QUIZ" && !!a.quiz;
  const attemptsLeft = a.maxAttempts === null ? null : a.maxAttempts - (mine?.attempts ?? 0);
  const canSubmit = a.status === "PUBLISHED" && (!past || a.allowLate) && !(mine && (mine.status === "APPROVED" || mine.status === "REJECTED")) && !(mine?.status === "RETURNED" && !a.allowResubmit);

  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow"><Link href="/tasks">{t("Görevler")}</Link> · {t(KIND_LABEL[a.kind])} · {t(DIFFICULTY_LABEL[a.difficulty])}</div>
        <h1 className="page-title">{a.title}</h1>
        <p className="page-sub">
          {a.createdBy?.displayName ?? t("Eğitmen")}{" "}{t("· son teslim")}{" "}{a.dueAt ? formatDateTime(a.dueAt, s.timezone, t.intl) : "yok"}
          {a.allowLate && t(" · geç teslim kabul (işaretlenir)")}{" "}{t("· en fazla {maxScore} puan", { maxScore: a.maxScore })}
          {isQuiz && t(" · geçme %{passPercent}{v0}", { passPercent: a.passPercent, v0: a.maxAttempts !== null ? ` · ${a.maxAttempts} deneme hakkı` : "" })}
          {a.group && <> · <Link href={`/groups/${a.group.id}`}>{a.group.name}</Link></>}
        </p>
      </div>
      {a.myTeam && (
        <div className="alert alert-info small">
          <div><strong>{t("Takım görevi · {name}:", { name: a.myTeam.name })}</strong>{" "}{t("{v0}. Takım adına bir kişi teslim eder; herkes teslimi görür ve günceller. Onayda XP takımdaki herkese verilir.", { v0: a.myTeam.members.join(", ") })}</div>
        </div>
      )}

      <div className="grid-2" style={{ alignItems: "start" }}>
        <section className="card" aria-labelledby="desc-h">
          <div className="card-h"><h2 id="desc-h">{t("Görev")}</h2></div>
          <div className="card-b stack-sm">
            <div className="prose-plain">{a.description || "—"}</div>
            {rubric.length > 0 && (
              <div className="stack-sm">
                <div className="eyebrow">{t("Değerlendirme ölçütleri")}</div>
                <ul className="list-tight">
                  {rubric.map((r, i) => <li key={i}><span style={{ flex: 1 }}>{r.criterion}</span><span className="mono small">{scores[i] !== undefined ? `${scores[i]}/` : ""}{r.points}</span></li>)}
                </ul>
              </div>
            )}
            <div className="eyebrow">{t("Ekler")}</div>
            <FileList files={a.files} empty={t("Bu görevde ek dosya yok.")} />
          </div>
        </section>

        <section className="card" aria-labelledby="sub-h">
          <div className="card-h">
            <h2 id="sub-h">{a.myTeam ? t("Takımın teslimi") : isQuiz ? t("Sonucun") : t("Teslimin")}</h2>
            {mine && <span className={SUBMISSION_STATUS[mine.status]!.cls}>{t(SUBMISSION_STATUS[mine.status]!.label)}</span>}
          </div>
          <div className="card-b stack-sm">
            {mine ? (
              <>
                <dl className="kv">
                  <dt>{t("Teslim")}</dt><dd>{formatDateTime(mine.submittedAt, s.timezone, t.intl)}{mine.late && <span className="badge" style={{ marginLeft: 6 }}>{t("geç")}</span>}</dd>
                  {a.myTeam && <><dt>{t("Teslim eden")}</dt><dd>{mine.user.displayName}</dd></>}
                  <dt>{t("Deneme")}</dt><dd>{mine.attempts}{a.maxAttempts !== null ? ` / ${a.maxAttempts}` : ""}</dd>
                  {mine.score !== null && <><dt>{t("Puan")}</dt><dd><strong>{mine.score}</strong> / {a.maxScore}</dd></>}
                </dl>
                {mine.feedback && <div className="alert alert-info small"><div style={{ whiteSpace: "pre-wrap" }}><strong>{isQuiz ? t("Sonuç:") : t("Eğitmen notu:")}</strong> {mine.feedback}</div></div>}
                {mine.text && <div className="notes small">{mine.text}</div>}
                {!isQuiz && <FileList files={mine.files} empty={t("Dosya eklenmedi.")} />}
                {!isQuiz && <VersionCompare versions={versions.map((v) => ({ ...v, createdAt: v.createdAt.toISOString() }))} />}
                {a.quizReview && (
                  <ol className="quiz-review">
                    {a.quizReview.map((r, i) => (
                      <li key={i} className={r.ok ? "is-ok" : "is-bad"}>
                        <strong>{r.ok ? t("Doğru") : t("Yanlış")}</strong>{r.explanation && <span className="small muted"> — {r.explanation}</span>}
                      </li>
                    ))}
                  </ol>
                )}
              </>
            ) : <p className="small muted" style={{ margin: 0 }}>{t("Henüz teslim etmedin.")}</p>}
            {canSubmit && isQuiz ? (
              <QuizTake id={a.id} questions={a.quiz!} attemptsLeft={attemptsLeft} />
            ) : canSubmit ? (
              <TaskSubmit id={a.id} requireText={a.requireText} requireFile={a.requireFile} existingFiles={mine?.files.length ?? 0} resubmit={!!mine} checklist={a.checklist} />
            ) : (
              <p className="small muted" style={{ margin: 0 }}>
                {a.status !== "PUBLISHED" ? t("Bu görev teslime kapalı.") : mine && (mine.status === "APPROVED" || mine.status === "REJECTED") ? t("Teslimin değerlendirildi; değiştirilemez.") : mine?.status === "RETURNED" ? t("Bu görevde yeniden teslim kapalı.") : t("Son teslim tarihi geçti.")}
              </p>
            )}
            {!isQuiz && a.status === "PUBLISHED" && !(mine && (mine.status === "APPROVED" || mine.status === "REJECTED")) && (
              <ExtensionPanel taskId={a.id} dueAt={a.dueAt?.toISOString() ?? null} override={override?.dueAt.toISOString() ?? null} history={extensions.map((e) => ({ id: e.id, reason: e.reason, requestedDue: e.requestedDue.toISOString(), status: e.status, decisionNote: e.decisionNote, createdAt: e.createdAt.toISOString() }))} />
            )}
          </div>
        </section>
      </div>
      <PeerPanel tasks={peerTasks} received={peerReceived} rubric={rubric} />
    </div>
  );
}
