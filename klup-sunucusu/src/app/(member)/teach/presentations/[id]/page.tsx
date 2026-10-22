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

export const metadata: Metadata = { title: "Sunum" };

export default async function PresentationPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requirePageSession(STAFF_ROLES);
  const { id } = await params;
  const p = await getPresentation({ id: user.id, role: user.role, status: user.status }, id).catch((e) => {
    if (e instanceof HttpError && (e.status === 404 || e.status === 403)) return null;
    throw e;
  });
  if (!p) notFound();

  return (
    <div className="stack fade-up">
      <Link href="/teach" className="small row" style={{ gap: 6 }}><ArrowLeft size={14} aria-hidden /> Eğitmen paneli</Link>
      <div className="page-head row-between">
        <div>
          <div className="eyebrow">Sunum · v{p.version} · {p.deck.slides.length} slayt</div>
          <h1 className="page-title">{p.deck.title}</h1>
          {p.deck.description && <p className="page-sub">{p.deck.description}</p>}
        </div>
      </div>
      <PresentationActions id={p.id} status={p.status} canEdit={p.canEdit} />
      <DeckPlayer deck={p.deck} showNotes />
      <p className="tiny faint">
        İçeriği düzenlemek için: JSON olarak dışa aktar → düzenle → “İçeriği değiştir” ile yeni sürüm yükle.
        Blok tabanlı görsel editör (Club Studio) sonraki fazda gelecek. Devam eden canlı dersler başlatıldıkları sürümü kullanmaya devam eder.
      </p>
    </div>
  );
}
