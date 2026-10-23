import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { getStudio } from "@/server/presentations";
import { HttpError } from "@/server/errors";
import { getSettings } from "@/server/settings";
import { ANIMATIONS } from "@/animations/registry";
import { DECK_SCHEMA_VERSION, type Deck } from "@/lib/deck-schema";
import { Studio } from "./Studio";

export const metadata: Metadata = { title: "Club Studio" };

export default async function StudioPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await requirePageSession(STAFF_ROLES);
  const { id } = await params;
  const st = await getStudio({ id: user.id, role: user.role, status: user.status }, id).catch((e) => {
    if (e instanceof HttpError && e.status === 404) notFound();
    if (e instanceof HttpError && e.status === 403) redirect(`/teach/presentations/${id}`);
    throw e;
  });
  const s = await getSettings();
  // Taslak kısmen geçersiz olabilir (düzenleme sürerken); editör eksik alanları varsayılanla tamamlar.
  const raw = (st.deck ?? {}) as Partial<Deck>;
  const deck: Deck = {
    schema: DECK_SCHEMA_VERSION,
    title: raw.title ?? "",
    description: raw.description ?? "",
    slides: Array.isArray(raw.slides) && raw.slides.length ? raw.slides.map((sl) => ({ title: sl.title ?? "", layout: sl.layout ?? "default", blocks: Array.isArray(sl.blocks) ? sl.blocks : [], notes: sl.notes ?? "" })) : [{ title: "Yeni slayt", layout: "default", blocks: [], notes: "" }],
  };
  return (
    <div className="stack fade-up">
      <div className="page-head" style={{ marginBottom: 8 }}>
        <div className="eyebrow"><Link href="/teach">Eğitmen paneli</Link> · <Link href={`/teach/presentations/${id}`}>Sunum</Link> · Club Studio</div>
      </div>
      <Studio
        id={id}
        initial={deck}
        savedAt={st.draftUpdatedAt?.toISOString() ?? null}
        hasDraft={st.hasDraft}
        version={st.version}
        versions={st.versions.map((v) => ({ id: v.id, number: v.number, createdAt: v.createdAt.toISOString(), author: v.createdBy?.displayName ?? "—", slides: v._count.slides }))}
        anims={ANIMATIONS.map((a) => ({ id: a.id, title: a.title }))}
        timezone={s.timezone}
      />
    </div>
  );
}
