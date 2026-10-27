import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageSession } from "@/server/auth/page-guard";
import { featureEnabled } from "@/server/learning/features";
import { SKILLS, gradePlacement } from "@/server/academy/placement";
import { db } from "@/server/db";
import { LAB_CATALOG } from "@/lib/labs-catalog";
import { SkillMap, type SkillCard } from "./SkillMap";
import { CHALLENGES } from "@/server/workshops/challenges";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Beceri haritam") };
}

// Beceri haritası: gösterilen ilerlemenin dayanağı görünür. Her beceri; tamamlanan dersler, lab/atölyeler,
// incelenmiş raporlar, onaylı teslimler ve öğretmen onaylı yetkinlik gösterimleriyle desteklenir.
export default async function Page() {
  const t = await getT();
  const { user } = await requirePageSession();
  if (!await featureEnabled("learning")) notFound();
  const [lessons, placement, labEvents, workshops, reports, submissions, challenges] = await Promise.all([
    db.lesson.findMany({ where: { archivedAt: null, track: { archivedAt: null }, skills: { isEmpty: false } }, select: { title: true, slug: true, skills: true, progress: { where: { userId: user.id, status: "COMPLETED" }, select: { completedAt: true } } } }),
    db.placementAttempt.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    db.learningEvent.findMany({ where: { userId: user.id, kind: "lab" }, select: { key: true, createdAt: true } }),
    db.workshopAttempt.findMany({ where: { userId: user.id, passed: true }, select: { kind: true, key: true, createdAt: true }, orderBy: { createdAt: "desc" } }),
    db.reportDraft.findMany({ where: { userId: user.id, status: "REVIEWED" }, select: { labKey: true, title: true, reviewedAt: true } }),
    db.submission.findMany({ where: { userId: user.id, status: "APPROVED", assignment: { skills: { isEmpty: false } } }, select: { id: true, reviewedAt: true, assignment: { select: { id: true, title: true, skills: true } } } }),
    db.challengeAttempt.findMany({ where: { userId: user.id, status: "ACCEPTED" }, select: { challengeKey: true, decidedAt: true } }),
  ]);
  const diagnostic = placement ? gradePlacement(placement.answers as number[]) : null;

  const cards: SkillCard[] = SKILLS.map((s) => {
    const related = lessons.filter((l) => l.skills.includes(s.key));
    const labs = LAB_CATALOG.filter((l) => l.skills.includes(s.key));
    const evidence = [
      ...related.filter((l) => l.progress.length).map((l) => ({ kind: "Ders", title: l.title, href: `/academy/lesson/${l.slug}`, at: l.progress[0]!.completedAt?.toISOString() ?? null })),
      ...labs.flatMap((lab) => labEvents.filter((e) => e.key === `lab:${lab.key}`).map((e) => ({ kind: "Lab", title: lab.title, href: lab.href, at: e.createdAt.toISOString() }))),
      ...labs.flatMap((lab) => { const w = workshops.find((x) => x.kind === lab.key); return w ? [{ kind: "Atölye", title: lab.title, href: lab.href, at: w.createdAt.toISOString() }] : []; }),
      ...(s.key === "linux" ? reports.map((r) => ({ kind: "Rapor", title: r.title || t("Rapor Atölyesi"), href: "/academy/practice", at: r.reviewedAt?.toISOString() ?? null })) : []),
      ...submissions.filter((x) => x.assignment.skills.includes(s.key)).map((x) => ({ kind: "Onaylı teslim", title: x.assignment.title, href: `/tasks/${x.assignment.id}`, at: x.reviewedAt?.toISOString() ?? null })),
      ...challenges.filter((c) => CHALLENGES.find((d) => d.key === c.challengeKey)?.skill === s.key).map((c) => ({ kind: "Yetkinlik gösterimi", title: CHALLENGES.find((d) => d.key === c.challengeKey)!.title, href: "/academy/workshops#challenges", at: c.decidedAt?.toISOString() ?? null })),
    ];
    const score = diagnostic?.skills.find((k) => k.key === s.key);
    return { key: s.key, tr: t.locale === "en" ? s.en : s.tr, en: s.en, done: related.filter((l) => l.progress.length).length, total: related.length, evidence, todo: related.filter((l) => !l.progress.length).slice(0, 3).map((l) => ({ title: l.title, href: `/academy/lesson/${l.slug}` })), diagnostic: score ? t("{correct}/{total} doğru · {v0}", { correct: score.correct, total: score.total, v0: placement!.createdAt.toISOString().slice(0, 10) }) : null };
  });
  return (
    <div className="stack">
      <header className="page-head hero-galaxy"><div className="eyebrow">{t("Ördek Akademi · Kazanımlar")}</div><h1 className="page-title">{t("Beceri haritam")}</h1><p className="page-sub">{t("İlerlemen tamamlanmış çalışmalara dayanır. Bir beceriye tıklayınca onu destekleyen ders, lab, rapor ve teslimleri görürsün. Başlangıç testi yalnız yön gösterir.")}</p></header>
      <div className="learning-tabs"><Link className="btn" href="/academy/placement">{t("Başlangıç değerlendirmesi")}</Link><Link className="btn" href={`/u/${user.username}/portfolio`}>{t("Portfolyom")}</Link></div>
      <SkillMap cards={cards} />
    </div>
  );
}
