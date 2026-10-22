import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, GraduationCap, Skull } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { isAdmin } from "@/server/auth/policy";
import { continueTarget, listTracks, progressSummary, type TrackCard } from "@/server/academy/service";
import { availableImages, portraitUrl } from "@/server/academy/images";
import { ProgressBar } from "@/components/academy/Progress";

export const metadata: Metadata = { title: "Akademi" };

function Card({ t, images }: { t: TrackCard; images: ReadonlySet<string> }) {
  const portrait = t.villain ? portraitUrl(t.villain.id, images) : null;
  const soon = t.kind === "SPECIALIZATION" && t.lessons <= 1;
  const done = t.lessons > 0 && t.completed >= t.lessons;
  return (
    <Link href={`/academy/${t.key}`} className={`track-card card${done ? " is-done" : ""}`}>
      <div className="track-portrait" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element -- kendi API'mizden, optimizasyon kapalı */}
        {portrait ? <img src={portrait} alt="" loading="lazy" /> : <Skull size={28} />}
      </div>
      <div className="track-info">
        <div className="row" style={{ gap: 8 }}>
          <span className="track-code">{t.code}</span>
          {done && <span className="stamp stamp-ok">Dosya kapandı</span>}
          {soon && <span className="badge">Yakında</span>}
        </div>
        <h3 className="track-title">{t.title}</h3>
        {t.villain && <div className="tiny faint">🕴️ {t.villain.ad}{t.villain.bolum ? ` · “${t.villain.bolum}”` : ""}</div>}
        <ProgressBar value={t.completed} max={t.lessons} label={`${t.title} ilerlemesi`} />
        <div className="tiny faint">{t.completed}/{t.lessons} ders · ~{t.minutes} dk</div>
      </div>
    </Link>
  );
}

export default async function AcademyHome() {
  const { user } = await requirePageSession();
  const actor = { id: user.id, role: user.role, status: user.status };
  const [tracks, next, sum] = await Promise.all([listTracks(actor), continueTarget(actor), progressSummary(actor)]);
  const images = availableImages();
  const program = tracks.filter((t) => t.kind === "PROGRAM");
  const core = tracks.filter((t) => t.kind === "CORE");
  const spec = tracks.filter((t) => t.kind === "SPECIALIZATION");

  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">Club Academy · Gölge Ağ</div>
        <h1 className="page-title">Akademi</h1>
        <p className="page-sub">Her modül bir bölüm, her kötü adam bir dosya. Kod adın: <strong>Tilki</strong>.</p>
      </div>

      {tracks.length === 0 ? (
        <div className="card">
          <div className="empty">
            <GraduationCap size={30} aria-hidden />
            <div>Akademi içeriği henüz içe aktarılmadı.</div>
            {isAdmin(user.role) && <Link className="btn btn-sm btn-primary" href="/admin/academy" style={{ marginTop: 12 }}>İçeriği içe aktar</Link>}
          </div>
        </div>
      ) : (
        <>
          <section className="card continue-card" aria-labelledby="cont-h">
            <div className="card-b continue-body">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="eyebrow" id="cont-h">{next?.resume ? "Kaldığın yer" : next ? "Sıradaki ders" : "Tebrikler"}</div>
                <div className="continue-title">{next ? next.title : "Bütün dosyaları kapattın."}</div>
                {next && <div className="tiny faint">{next.track.code}</div>}
                <div style={{ marginTop: 10 }}>
                  <ProgressBar value={sum.completed} max={sum.total} label="Akademi ilerlemesi" />
                  <div className="tiny faint" style={{ marginTop: 4 }}>{sum.completed}/{sum.total} ders tamamlandı</div>
                </div>
              </div>
              {next && (
                <Link className="btn btn-primary" href={`/academy/lesson/${next.slug}`}>
                  {next.resume ? "Devam et" : "Başla"} <ArrowRight size={16} aria-hidden />
                </Link>
              )}
            </div>
          </section>

          {program.map((t) => (
            <Link key={t.key} href={`/academy/${t.key}`} className="card program-card">
              <div className="card-b row">
                <BookOpen size={20} color="var(--gold)" aria-hidden />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>{t.title}</strong>
                  <div className="tiny faint">{t.summary}</div>
                </div>
                <span className="tiny faint nowrap"><Clock size={13} aria-hidden /> ~{t.minutes} dk · {t.completed}/{t.lessons}</span>
              </div>
            </Link>
          ))}

          {core.length > 0 && (
            <section aria-labelledby="s1-h" className="stack-sm">
              <h2 id="s1-h" className="section-title">Sezon 1 · Temel modüller</h2>
              <div className="track-grid">{core.map((t) => <Card key={t.key} t={t} images={images} />)}</div>
            </section>
          )}
          {spec.length > 0 && (
            <section aria-labelledby="s2-h" className="stack-sm">
              <h2 id="s2-h" className="section-title">Sezon 2 · Uzmanlık yolları</h2>
              <div className="track-grid">{spec.map((t) => <Card key={t.key} t={t} images={images} />)}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
