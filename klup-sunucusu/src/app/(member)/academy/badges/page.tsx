import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { pageFeature } from "@/server/learning/page-features";
import { badgeRoadmap } from "@/server/xp/badges";
import { db } from "@/server/db";
import { BadgeRoadmap } from "./BadgeRoadmap";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Rozet yol haritası") };
}

export default async function BadgesPage() {
  const t = await getT();
  const { user } = await requirePageSession();
  await pageFeature("community");
  const [badges, certs] = await Promise.all([badgeRoadmap(user.id), db.learningCertificate.findMany({ where: { userId: user.id }, select: { trackTitle: true, awardedAt: true } })]);
  return (
    <div className="stack fade-up">
      <header className="page-head"><div className="eyebrow">{t("Topluluk")}</div><h1 className="page-title">{t("Rozet yol haritası")}</h1><p className="page-sub">{t("Kazandığın rozetler, henüz kazanmadıklarının koşulu ve sana ne kadar kaldığı. Başarı kartını istersen adınla, istersen adsız indirebilirsin.")}</p></header>
      <BadgeRoadmap badges={badges} certs={certs.map((c) => ({ title: c.trackTitle, at: c.awardedAt.toISOString() }))} name={user.displayName} />
    </div>
  );
}
