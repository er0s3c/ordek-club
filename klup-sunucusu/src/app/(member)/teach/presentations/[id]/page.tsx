import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { getPresentation } from "@/server/presentations";
import { HttpError } from "@/server/errors";
import { DeckPlayer } from "@/components/presentation/DeckPlayer";
import { PresentationActions } from "./PresentationActions";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Sunum") };
}

export default async function PresentationPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getT();
  const { user } = await requirePageSession(STAFF_ROLES);
  const { id } = await params;
  const p = await getPresentation({ id: user.id, role: user.role, status: user.status }, id).catch((e) => {
    if (e instanceof HttpError && (e.status === 404 || e.status === 403)) return null;
    throw e;
  });
  if (!p) notFound();

  return (
    <div className="stack fade-up">
      <Link href="/teach" className="small row" style={{ gap: 6 }}><ArrowLeft size={14} aria-hidden />{" "}{t("Eğitmen paneli")}</Link>
      <div className="page-head row-between">
        <div>
          <div className="eyebrow">{t("Sunum · v{version} · {length} slayt", { version: p.version, length: p.deck.slides.length })}</div>
          <h1 className="page-title">{p.deck.title}</h1>
          {p.deck.description && <p className="page-sub">{p.deck.description}</p>}
        </div>
      </div>
      <PresentationActions id={p.id} status={p.status} canEdit={p.canEdit} isTemplate={p.isTemplate} hasDraft={p.hasDraft} />
      <DeckPlayer deck={p.deck} showNotes />
      <p className="tiny faint">
        {t("İçeriği Club Studio ile düzenle (otomatik kayıt + sürüm geçmişi) ya da JSON dışa aktar → düzenle → “İçeriği değiştir”. Devam eden canlı dersler başlatıldıkları sürümü kullanmaya devam eder.")}
      </p>
    </div>
  );
}
