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

export const metadata: Metadata = { title: "Görev" };

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
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
  const past = !!a.dueAt && a.dueAt.getTime() < Date.now();
  const isQuiz = a.kind === "QUIZ" && !!a.quiz;
  const attemptsLeft = a.maxAttempts === null ? null : a.maxAttempts - (mine?.attempts ?? 0);
  const canSubmit = a.status === "PUBLISHED" && (!past || a.allowLate) && !(mine && (mine.status === "APPROVED" || mine.status === "REJECTED")) && !(mine?.status === "RETURNED" && !a.allowResubmit);

  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow"><Link href="/tasks">Görevler</Link> · {KIND_LABEL[a.kind]} · {DIFFICULTY_LABEL[a.difficulty]}</div>
        <h1 className="page-title">{a.title}</h1>
        <p className="page-sub">
          {a.createdBy?.displayName ?? "Eğitmen"} · son teslim {a.dueAt ? formatDateTime(a.dueAt, s.timezone) : "yok"}
          {a.allowLate && " · geç teslim kabul (işaretlenir)"} · en fazla {a.maxScore} puan
          {isQuiz && ` · geçme %${a.passPercent}${a.maxAttempts !== null ? ` · ${a.maxAttempts} deneme hakkı` : ""}`}
          {a.group && <> · <Link href={`/groups/${a.group.id}`}>{a.group.name}</Link></>}
        </p>
      </div>
      {a.myTeam && (
        <div className="alert alert-info small">
          <div><strong>Takım görevi · {a.myTeam.name}:</strong> {a.myTeam.members.join(", ")}. Takım adına bir kişi teslim eder; herkes teslimi görür ve günceller. Onayda XP takımdaki herkese verilir.</div>
        </div>
      )}

      <div className="grid-2" style={{ alignItems: "start" }}>
        <section className="card" aria-labelledby="desc-h">
          <div className="card-h"><h2 id="desc-h">Görev</h2></div>
          <div className="card-b stack-sm">
            <div className="prose-plain">{a.description || "—"}</div>
            {rubric.length > 0 && (
              <div className="stack-sm">
                <div className="eyebrow">Değerlendirme ölçütleri</div>
                <ul className="list-tight">
                  {rubric.map((r, i) => <li key={i}><span style={{ flex: 1 }}>{r.criterion}</span><span className="mono small">{scores[i] !== undefined ? `${scores[i]}/` : ""}{r.points}</span></li>)}
                </ul>
              </div>
            )}
            <div className="eyebrow">Ekler</div>
            <FileList files={a.files} empty="Bu görevde ek dosya yok." />
          </div>
        </section>

        <section className="card" aria-labelledby="sub-h">
          <div className="card-h">
            <h2 id="sub-h">{a.myTeam ? "Takımın teslimi" : isQuiz ? "Sonucun" : "Teslimin"}</h2>
            {mine && <span className={SUBMISSION_STATUS[mine.status]!.cls}>{SUBMISSION_STATUS[mine.status]!.label}</span>}
          </div>
          <div className="card-b stack-sm">
            {mine ? (
              <>
                <dl className="kv">
                  <dt>Teslim</dt><dd>{formatDateTime(mine.submittedAt, s.timezone)}{mine.late && <span className="badge" style={{ marginLeft: 6 }}>geç</span>}</dd>
                  {a.myTeam && <><dt>Teslim eden</dt><dd>{mine.user.displayName}</dd></>}
                  <dt>Deneme</dt><dd>{mine.attempts}{a.maxAttempts !== null ? ` / ${a.maxAttempts}` : ""}</dd>
                  {mine.score !== null && <><dt>Puan</dt><dd><strong>{mine.score}</strong> / {a.maxScore}</dd></>}
                </dl>
                {mine.feedback && <div className="alert alert-info small"><div style={{ whiteSpace: "pre-wrap" }}><strong>{isQuiz ? "Sonuç:" : "Eğitmen notu:"}</strong> {mine.feedback}</div></div>}
                {mine.text && <div className="notes small">{mine.text}</div>}
                {!isQuiz && <FileList files={mine.files} empty="Dosya eklenmedi." />}
                {a.quizReview && (
                  <ol className="quiz-review">
                    {a.quizReview.map((r, i) => (
                      <li key={i} className={r.ok ? "is-ok" : "is-bad"}>
                        <strong>{r.ok ? "Doğru" : "Yanlış"}</strong>{r.explanation && <span className="small muted"> — {r.explanation}</span>}
                      </li>
                    ))}
                  </ol>
                )}
              </>
            ) : <p className="small muted" style={{ margin: 0 }}>Henüz teslim etmedin.</p>}
            {canSubmit && isQuiz ? (
              <QuizTake id={a.id} questions={a.quiz!} attemptsLeft={attemptsLeft} />
            ) : canSubmit ? (
              <TaskSubmit id={a.id} requireText={a.requireText} requireFile={a.requireFile} existingFiles={mine?.files.length ?? 0} resubmit={!!mine} />
            ) : (
              <p className="small muted" style={{ margin: 0 }}>
                {a.status !== "PUBLISHED" ? "Bu görev teslime kapalı." : mine && (mine.status === "APPROVED" || mine.status === "REJECTED") ? "Teslimin değerlendirildi; değiştirilemez." : mine?.status === "RETURNED" ? "Bu görevde yeniden teslim kapalı." : "Son teslim tarihi geçti."}
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
