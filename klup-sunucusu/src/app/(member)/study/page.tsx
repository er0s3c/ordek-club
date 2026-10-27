import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { pageFeature } from "@/server/learning/page-features";
import { mistakeBook, studyOverview } from "@/server/study/sessions";
import { weekCompare } from "@/server/learning/insights";
import { db } from "@/server/db";
import { StudyCenter } from "./StudyCenter";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Çalışma merkezi") };
}

export default async function StudyPage() {
  const t = await getT();
  const { user } = await requirePageSession();
  await pageFeature("study");
  const actor = { id: user.id, role: user.role, status: user.status };
  const [o, mistakes, compare, tracks] = await Promise.all([
    studyOverview(actor), mistakeBook(actor), weekCompare(user.id),
    db.track.findMany({ where: { archivedAt: null, kind: { not: "PROGRAM" } }, orderBy: { position: "asc" }, select: { key: true, code: true, title: true } }),
  ]);
  return (
    <div className="stack fade-up">
      <header className="page-head"><div className="eyebrow">{t("Öğrenme")}</div><h1 className="page-title">{t("Çalışma merkezi")}</h1><p className="page-sub">{t("Odaklı çalışma oturumları, hedef planın, kendi kartların, terim listen ve hata defterin.")}</p></header>
      <StudyCenter
        data={JSON.parse(JSON.stringify(o))}
        mistakes={mistakes}
        compare={compare}
        tracks={tracks}
      />
    </div>
  );
}
