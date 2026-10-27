import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { pageFeature } from "@/server/learning/page-features";
import { gradingQueue, library } from "@/server/classroom/grading";
import { pendingChallenges } from "@/server/workshops/challenges";
import { db } from "@/server/db";
import { GradingQueue } from "./GradingQueue";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Değerlendirme kuyruğu") };
}

export default async function QueuePage() {
  const t = await getT();
  const { user } = await requirePageSession(STAFF_ROLES);
  await pageFeature("teacher-plus");
  const actor = { id: user.id, role: user.role, status: user.status };
  const [queue, lib, reports, challenges, workshops] = await Promise.all([
    gradingQueue(actor),
    library(actor),
    db.reportDraft.findMany({ where: { status: "SUBMITTED" }, orderBy: { submittedAt: "asc" }, include: { user: { select: { id: true, displayName: true } } } }),
    pendingChallenges(),
    db.workshopAttempt.findMany({ where: { kind: "evidence-map", passed: true, reviewedAt: null }, orderBy: { createdAt: "asc" }, take: 50, include: { user: { select: { displayName: true } } } }),
  ]);
  return (
    <div className="stack fade-up">
      <header className="page-head"><div className="eyebrow">{t("Eğitmen")}</div><h1 className="page-title">{t("Değerlendirme kuyruğu")}</h1><p className="page-sub">{t("Bekleyen teslimler en eskiden başlar.")}{" "}<span className="kbd">j</span>/<span className="kbd">k</span>{" "}{t("ile sıradaki/önceki teslime geç; rubrik ve yorum bankası aynı ekranda.")}</p></header>
      <GradingQueue
        queue={queue}
        snippets={lib.snippets.map((s) => ({ id: s.id, label: s.label, text: s.text }))}
        reports={reports.map((r) => ({ userId: r.user.id, labKey: r.labKey, student: r.user.displayName, title: r.title, evidence: r.evidence, impact: r.impact, recommendation: r.recommendation, submittedAt: r.submittedAt?.toISOString() ?? null }))}
        challenges={challenges}
        workshops={workshops.map((w) => ({ id: w.id, student: w.user.displayName, key: w.key, payload: w.payload as { links?: { from: string; to: string; reason: string }[] }, score: w.score, createdAt: w.createdAt.toISOString() }))}
      />
    </div>
  );
}
