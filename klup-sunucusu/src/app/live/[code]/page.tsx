import type { Metadata } from "next";
import Link from "next/link";
import { requirePageSession } from "@/server/auth/page-guard";
import { getJoinInfo } from "@/server/live/service";
import { HttpError } from "@/server/errors";
import { LiveViewer } from "./LiveViewer";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Canlı ders") };
}

export default async function LiveViewerPage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const t = await getT();
  const { user } = await requirePageSession();
  const { code } = await params;
  const present = (await searchParams).present === "1";
  const info = await getJoinInfo({ id: user.id, role: user.role, status: user.status }, code).catch((e) => {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  });
  if (!info) {
    return (
      <div className="auth-wrap">
        <div className="card auth-card"><div className="card-b stack">
          <div className="eyebrow">{t("Canlı ders")}</div>
          <h1 className="page-title">{t("Ders bulunamadı")}</h1>
          <p className="muted">{t("Bu kodla devam eden bir canlı ders yok; ders bitmiş olabilir.")}</p>
          <Link className="btn" href="/live">{t("Başka bir koda katıl")}</Link>
        </div></div>
      </div>
    );
  }
  // Projeksiyon görünümünde de eğitmen notları istemciye gönderilmez.
  const deck = { ...info.deck, slides: info.deck.slides.map((s) => ({ ...s, notes: undefined })) };
  return <LiveViewer code={info.session.code} title={info.session.title} deck={deck} present={present} />;
}
