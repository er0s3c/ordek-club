import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageSession } from "@/server/auth/page-guard";
import { pageFeature } from "@/server/learning/page-features";
import { LAB_CATALOG } from "@/lib/labs-catalog";
import { publicWorkshop, workshopProgress, WORKSHOP_KINDS, type WorkshopKind } from "@/server/workshops/service";
import { db } from "@/server/db";
import { availableImages, labIconUrl } from "@/server/academy/images";
import { LabIcon } from "@/components/academy/LabIcon";
import { EvidenceMapWorkshop, NetworkWorkshop, QueryWorkshop, SecureCodeWorkshop, TimelineWorkshop } from "@/components/workshops/Workshops";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Atölye") };
}

export default async function WorkshopPage({ params }: { params: Promise<{ kind: string }> }) {
  const t = await getT();
  const { user } = await requirePageSession();
  await pageFeature("workshops");
  const kind = (await params).kind;
  if (!(WORKSHOP_KINDS as readonly string[]).includes(kind)) notFound();
  const k = kind as WorkshopKind;
  const meta = LAB_CATALOG.find((l) => l.key === k)!;
  const [progress, reviews] = await Promise.all([workshopProgress(user.id), db.workshopAttempt.findMany({ where: { userId: user.id, kind: k, reviewedAt: { not: null } }, orderBy: { reviewedAt: "desc" }, take: 3, select: { key: true, review: true, reviewedAt: true } })]);
  const done = progress.filter((p) => p.kind === k && p.passed).map((p) => p.key);
  const items = publicWorkshop(k);
  return (
    <div className="stack fade-up">
      <header className="page-head workshop-card-head"><LabIcon src={labIconUrl(k, availableImages())} kind={meta.kind} size={72} /><div><div className="eyebrow"><Link href="/academy/workshops">{t("Atölyeler")}</Link></div><h1 className="page-title">{meta.title}</h1><p className="page-sub">{meta.summary}</p></div></header>
      {reviews.map((r) => <div key={r.key} className="alert alert-info small"><span><strong>{t("Öğretmen geri bildirimi ({key}):", { key: r.key })}</strong> {r.review}</span></div>)}
      {k === "secure-code" && <SecureCodeWorkshop items={items as Parameters<typeof SecureCodeWorkshop>[0]["items"]} done={done} />}
      {k === "network" && <NetworkWorkshop items={items as Parameters<typeof NetworkWorkshop>[0]["items"]} done={done} />}
      {k === "query" && <QueryWorkshop items={items as Parameters<typeof QueryWorkshop>[0]["items"]} done={done} />}
      {k === "timeline" && <TimelineWorkshop items={items as Parameters<typeof TimelineWorkshop>[0]["items"]} done={done} />}
      {k === "evidence-map" && <EvidenceMapWorkshop items={items as Parameters<typeof EvidenceMapWorkshop>[0]["items"]} done={done} />}
    </div>
  );
}
