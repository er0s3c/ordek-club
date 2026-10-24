import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, CircleDot, Clock } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { HttpError } from "@/server/errors";
import { getTrack } from "@/server/academy/service";
import { availableImages, portraitUrl } from "@/server/academy/images";
import { ProgressBar } from "@/components/academy/Progress";
import { KIND_BADGE, KIND_LABEL } from "@/components/academy/labels";

export const metadata: Metadata = { title: "Akademi" };

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { user } = await requirePageSession();
  const key = (await params).track;
  if (!/^[a-z0-9-]{1,40}$/.test(key)) notFound();
  const t = await getTrack({ id: user.id, role: user.role, status: user.status }, key).catch((e) => {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  });
  if (!t) notFound();
  const images = availableImages();
  const portrait = t.villain ? portraitUrl(t.villain.id, images) : null;
  const completed = t.lessons.filter((l) => l.status === "COMPLETED").length;
  const firstOpen = t.lessons.find((l) => l.status !== "COMPLETED");

  return (
    <div className="stack fade-up">
      <Link href="/academy" className="back-link small"><ArrowLeft size={15} aria-hidden /> Akademi</Link>
      <div className="page-head">
        <div className="eyebrow">{t.code}{t.kind === "CORE" ? " · Sezon 1" : t.kind === "SPECIALIZATION" ? " · Sezon 2" : ""}</div>
        <h1 className="page-title">{t.title}</h1>
        {t.summary && <p className="page-sub">{t.summary}</p>}
      </div>

      {t.villain && (
        <section className="dossier dossier-card" aria-label={`Dosya: ${t.villain.ad}`}>
          {portrait && (
            // eslint-disable-next-line @next/next/no-img-element -- kendi API'mizden, optimizasyon kapalı
            <img className="md-portrait" src={portrait} alt={`${t.villain.ad} — ${t.villain.unvan}`} />
          )}
          <p>🕴️ <strong>DOSYA: {t.villain.ad}</strong> · <em>{t.villain.unvan}</em></p>
          {t.villain.bolum && <p>📼 <strong>{t.villain.bolum}.</strong> {t.villain.giris}</p>}
          <p><strong>Tehdit:</strong> {t.villain.tehdit}</p>
        </section>
      )}

      <section className="card" aria-labelledby="lessons-h">
        <div className="card-h">
          <h2 id="lessons-h">Dersler</h2>
          <span className="tiny faint">{completed}/{t.lessons.length}</span>
        </div>
        <div className="card-b" style={{ paddingBottom: 6 }}>
          <ProgressBar value={completed} max={t.lessons.length} label={`${t.title} ilerlemesi`} />
        </div>
        <ol className="lesson-list">
          {t.lessons.map((l, i) => (
            <li key={l.slug}>
              <Link href={`/academy/lesson/${l.slug}`} className={`lesson-row${l.status === "COMPLETED" ? " is-done" : ""}`}>
                <span className="lesson-status" role="img" aria-label={l.status === "COMPLETED" ? "Tamamlandı" : l.status === "STARTED" ? "Başlandı" : "Başlanmadı"}>
                  {l.status === "COMPLETED" ? <CheckCircle2 size={18} /> : l.status === "STARTED" ? <CircleDot size={18} /> : <Circle size={18} />}
                </span>
                <span className="lesson-no mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="lesson-name">{l.title}</span>
                <span className={KIND_BADGE[l.kind]}>{KIND_LABEL[l.kind]}</span>
                <span className="tiny faint lesson-min"><Clock size={12} aria-hidden /> {l.minutes} dk</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {firstOpen && (
        <div>
          <Link className="btn btn-primary btn-wrap" href={`/academy/lesson/${firstOpen.slug}`}>
            {completed ? "Devam et" : "Başla"}: {firstOpen.title}
          </Link>
        </div>
      )}
    </div>
  );
}
