import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { availableImages, labIconUrl } from "@/server/academy/images";
import { LabIcon } from "@/components/academy/LabIcon";
import { requirePageSession } from "@/server/auth/page-guard";
import { pageFeature } from "@/server/learning/page-features";
import { LAB_CATALOG } from "@/lib/labs-catalog";
import { workshopProgress } from "@/server/workshops/service";
import { myChallenges, publicChallenges } from "@/server/workshops/challenges";
import { featureEnabled } from "@/server/learning/features";
import { StatusPill } from "@/components/ui/states";
import { ChallengeList } from "./ChallengeList";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Atölyeler") };
}

export default async function WorkshopsHub() {
  const t = await getT();
  const { user } = await requirePageSession();
  await pageFeature("workshops");
  const [progress, mine, labs] = await Promise.all([workshopProgress(user.id), myChallenges(user.id), featureEnabled("labs")]);
  const cards = LAB_CATALOG.filter((l) => l.feature === "workshops" || labs);
  const images = availableImages();
  return (
    <div className="stack-lg fade-up">
      <header className="page-head"><div className="eyebrow">{t("Ördek Akademi · Uygulama")}</div><h1 className="page-title">{t("Atölyeler")}</h1><p className="page-sub">{t("Tarayıcıda çalışan, gerçek bir hedefe dokunmayan uygulamalı alıştırmalar. Önizleme anında; puanlama sunucuda.")}</p></header>
      <div className="grid-2">
        {cards.map((c) => {
          const rows = progress.filter((p) => p.kind === c.key);
          const passed = new Set(rows.filter((p) => p.passed).map((p) => p.key)).size;
          return (
            <Link key={c.key} href={c.href} className="card card-b stack-sm workshop-card">
              <div className="workshop-card-head"><LabIcon src={labIconUrl(c.key, images)} kind={c.kind} size={56} /><div className="stack-sm" style={{ gap: 4, flex: 1, minWidth: 0 }}><strong>{c.title}</strong>{passed ? <StatusPill tone="ok">{t("{passed} senaryo tamam", { passed })}</StatusPill> : rows.length ? <StatusPill tone="info">{t("denendi")}</StatusPill> : null}</div></div>
              <span className="small muted">{c.summary}</span>
              <span className="small skill-more">{t("Aç")}{" "}<ArrowRight size={14} aria-hidden /></span>
            </Link>
          );
        })}
      </div>
      <section id="challenges" aria-labelledby="ch-h" className="stack-sm">
        <h2 id="ch-h" className="section-title">{t("Yetkinlik gösterme")}</h2>
        <p className="small muted" style={{ margin: 0 }}>{t("Konuyu zaten biliyorsan doğrudan uygulamalı değerlendirmeye başvur. Otomatik puan ön elemedir; kabul ve olası ders muafiyeti öğretmen kararıdır. Kabul edilen gösterim beceri haritana kanıt olarak eklenir.")}</p>
        <ChallengeList challenges={publicChallenges()} mine={mine.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))} />
      </section>
    </div>
  );
}
