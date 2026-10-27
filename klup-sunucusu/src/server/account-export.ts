// Kişisel veri dışa aktarma: yalnız kişinin kendi kayıtları; parola özeti, oturum belirteçleri ve başkalarının verisi yok.
import { db } from "@/server/db";

export async function exportMyData(userId: string) {
  const u = { where: { userId } };
  const [user, progress, quizzes, personal, submissions, xp, badges, events, studies, plans, cards, questions, feedback, issues, portfolio, notifications, checkIns] = await Promise.all([
    db.user.findUniqueOrThrow({ where: { id: userId }, select: { username: true, displayName: true, email: true, role: true, status: true, studentNumber: true, department: true, joinedAt: true, createdAt: true, emailNotifications: true } }),
    db.lessonProgress.findMany({ ...u, select: { status: true, startedAt: true, completedAt: true, lesson: { select: { slug: true, title: true } } } }),
    db.quizAttempt.findMany({ ...u, select: { score: true, passed: true, createdAt: true, lesson: { select: { slug: true } } } }),
    db.lessonPersonal.findMany({ ...u, select: { note: true, bookmarked: true, lastSection: true, updatedAt: true, lesson: { select: { slug: true } } } }),
    db.submission.findMany({ ...u, select: { text: true, status: true, score: true, feedback: true, submittedAt: true, assignment: { select: { title: true } }, versions: { select: { number: true, text: true, createdAt: true } } } }),
    db.xpTransaction.findMany({ ...u, select: { amount: true, source: true, reason: true, createdAt: true } }),
    db.userBadge.findMany({ ...u, select: { awardedAt: true, badge: { select: { name: true } } } }),
    db.learningEvent.findMany({ ...u, select: { key: true, kind: true, day: true } }),
    db.studySession.findMany({ ...u, select: { minutes: true, topic: true, status: true, startedAt: true, reflection: true } }),
    db.learningPlan.findMany({ ...u, select: { title: true, day: true, completed: true } }),
    db.personalCard.findMany({ ...u, select: { front: true, back: true, source: true, createdAt: true } }),
    db.lessonQuestion.findMany({ ...u, select: { body: true, status: true, createdAt: true, lesson: { select: { slug: true } } } }),
    db.lessonFeedback.findMany({ ...u, select: { rating: true, comment: true, unclear: true, lesson: { select: { slug: true } } } }),
    db.issueReport.findMany({ ...u, select: { number: true, kind: true, body: true, status: true, createdAt: true } }),
    db.portfolioWork.findMany({ ...u, select: { submissionId: true, visible: true, problem: true, approach: true, result: true, learned: true } }),
    db.notification.findMany({ ...u, select: { title: true, body: true, createdAt: true, readAt: true }, orderBy: { createdAt: "desc" }, take: 500 }),
    db.eventCheckIn.findMany({ ...u, select: { at: true, group: { select: { name: true } } } }),
  ]);
  return { exportedAt: new Date().toISOString(), user, progress, quizzes, personal, submissions, xp, badges, events, studies, plans, cards, questions, feedback, issues, portfolio, notifications, checkIns };
}
