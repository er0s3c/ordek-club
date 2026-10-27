import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { pageFeature } from "@/server/learning/page-features";
import { contentStatus, feedbackSummary, questionAnalytics } from "@/server/teaching/content";
import { db } from "@/server/db";
import { ContentCenter } from "./ContentCenter";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("İçerik merkezi") };
}

export default async function ContentPage() {
  const t = await getT();
  await requirePageSession(STAFF_ROLES);
  await pageFeature("teacher-plus");
  const [status, analytics, feedback, questions] = await Promise.all([
    contentStatus(),
    questionAnalytics(),
    feedbackSummary(),
    db.lessonQuestion.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "asc" }, take: 100, include: { lesson: { select: { slug: true, title: true } }, user: { select: { displayName: true } } } }),
  ]);
  return (
    <div className="stack fade-up">
      <header className="page-head"><div className="eyebrow">{t("Eğitmen")}</div><h1 className="page-title">{t("İçerik merkezi")}</h1><p className="page-sub">{t("Onay adımları, soru kalitesi, öğrenci geri bildirimi, yanıt bekleyen ders soruları ve son içerik değişiklikleri.")}</p></header>
      <ContentCenter
        status={status}
        analytics={analytics}
        feedback={feedback}
        questions={questions.map((q) => ({ id: q.id, body: q.body, author: q.user.displayName, slug: q.lesson.slug, title: q.lesson.title, createdAt: q.createdAt.toISOString() }))}
      />
    </div>
  );
}
