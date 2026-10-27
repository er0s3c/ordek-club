import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { getStudio } from "@/server/presentations";
import { HttpError } from "@/server/errors";
import { getSettings } from "@/server/settings";
import { ANIMATIONS } from "@/animations/registry";
import { studioDeck } from "@/lib/deck-schema";
import { missionOptions } from "@/server/academy/service";
import { converterEnabled } from "@/server/slides/service";
import { Studio } from "./Studio";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Club Studio") };
}

export default async function StudioPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getT();
  const { user } = await requirePageSession(STAFF_ROLES);
  const { id } = await params;
  const st = await getStudio({ id: user.id, role: user.role, status: user.status }, id).catch((e) => {
    if (e instanceof HttpError && e.status === 404) notFound();
    if (e instanceof HttpError && e.status === 403) redirect(`/teach/presentations/${id}`);
    throw e;
  });
  const [s, missions] = await Promise.all([getSettings(), missionOptions()]);
  const deck = studioDeck(st.deck);

  return (
    <div className="stack fade-up">
      <div className="page-head" style={{ marginBottom: 8 }}>
        <div className="eyebrow"><Link href="/teach">{t("Eğitmen paneli")}</Link> · <Link href={`/teach/presentations/${id}`}>{t("Sunum")}</Link>{" "}· Club Studio</div>
      </div>
      <Studio
        id={id}
        me={{ name: user.displayName }}
        initial={deck}
        savedAt={st.draftUpdatedAt?.toISOString() ?? null}
        hasDraft={st.hasDraft}
        version={st.version}
        versions={st.versions.map((v) => ({ id: v.id, number: v.number, createdAt: v.createdAt.toISOString(), author: v.createdBy?.displayName ?? "—", slides: v._count.slides }))}
        anims={ANIMATIONS.map((a) => ({ id: a.id, title: a.title }))}
        missions={missions}
        timezone={s.timezone}
        converterEnabled={converterEnabled()}
      />
    </div>
  );
}
