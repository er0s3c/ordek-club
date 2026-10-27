import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, BookOpen, Clock, GraduationCap } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { isAdmin } from "@/server/auth/policy";
import { continueTarget, listTracks, progressSummary } from "@/server/academy/service";
import { availableImages, coverUrl, portraitUrl } from "@/server/academy/images";
import { db } from "@/server/db";
import { SKILLS } from "@/server/academy/placement";
import { LAB_CATALOG } from "@/lib/labs-catalog";
import { TrackCatalog, type CatalogTrack } from "@/components/academy/TrackCatalog";
import { ProgressBar } from "@/components/academy/Progress";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Akademi") };
}

export default async function AcademyHome() {
  const tl = await getT();
  const { user } = await requirePageSession();
  const actor = { id: user.id, role: user.role, status: user.status };
  const [tracks, next, sum] = await Promise.all([listTracks(actor, tl.locale), continueTarget(actor, tl.locale), progressSummary(actor)]);
  const images = availableImages();
  const program = tracks.filter((t) => t.kind === "PROGRAM");
  // Filtre verisi: yol başına beceri etiketleri, ders türleri ve bağlı lab/atölye sayısı.
  const meta = await db.lesson.findMany({ where: { archivedAt: null, track: { archivedAt: null } }, select: { kind: true, skills: true, track: { select: { key: true } } } });
  const catalog: CatalogTrack[] = tracks.filter((t) => t.kind !== "PROGRAM").map((t) => {
    const rows = meta.filter((m) => m.track.key === t.key);
    return {
      key: t.key, code: t.code, kind: t.kind, title: t.title, summary: t.summary,
      villain: t.villain ? { ad: t.villain.ad, bolum: t.villain.bolum } : null,
      portrait: t.villain ? portraitUrl(t.villain.id, images) : null, cover: coverUrl(t.key, images),
      lessons: t.lessons, completed: t.completed, minutes: t.minutes,
      skills: [...new Set(rows.flatMap((r) => r.skills))], kinds: [...new Set(rows.map((r) => r.kind))],
      labs: LAB_CATALOG.filter((l) => l.tracks.includes(t.key)).length + rows.filter((r) => r.kind === "PRACTICE").length,
    };
  });

  return (
    <div className="stack fade-up">
      <div className="page-head">
        <div className="eyebrow">{tl("Club Academy · Gölge Ağ")}</div>
        <h1 className="page-title">{tl("Akademi")}</h1>
        <p className="page-sub">{tl("Her modül bir bölüm, her kötü adam bir dosya. Kod adın:")}{" "}<strong>{tl("Tilki")}</strong>.</p>
      </div>

      {tracks.length === 0 ? (
        <div className="card">
          <div className="empty">
            <GraduationCap size={30} aria-hidden />
            <div>{tl("Akademi içeriği henüz içe aktarılmadı.")}</div>
            {isAdmin(user.role) && <Link className="btn btn-sm btn-primary" href="/admin/academy" style={{ marginTop: 12 }}>{tl("İçeriği içe aktar")}</Link>}
          </div>
        </div>
      ) : (
        <>
          <section className="card continue-card" aria-labelledby="cont-h">
            <div className="card-b continue-body">
              <div>
                <div className="eyebrow" id="cont-h">{next?.resume ? tl("Kaldığın yer") : next ? tl("Sıradaki ders") : tl("Tebrikler")}</div>
                <div className="continue-title">{next ? next.title : tl("Bütün dosyaları kapattın.")}</div>
                {next && <div className="tiny faint">{next.track.code}</div>}
                <div style={{ marginTop: 10 }}>
                  <ProgressBar value={sum.completed} max={sum.total} label={tl("Akademi ilerlemesi")} />
                  <div className="tiny faint" style={{ marginTop: 4 }}>{tl("{completed}/{total} ders tamamlandı", { completed: sum.completed, total: sum.total })}</div>
                </div>
              </div>
              {next && (
                <Link className="btn btn-primary" href={`/academy/lesson/${next.slug}`}>
                  {next.resume ? tl("Devam et") : tl("Başla")} <ArrowRight size={16} aria-hidden />
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
                <span className="tiny faint nowrap"><Clock size={13} aria-hidden />{" "}{tl("~{minutes} dk · {completed}/{lessons}", { minutes: t.minutes, completed: t.completed, lessons: t.lessons })}</span>
              </div>
            </Link>
          ))}

          <Suspense fallback={null}>
            <TrackCatalog tracks={catalog} topics={SKILLS.map((k) => ({ value: k.key, label: tl.locale === "en" ? k.en : k.tr }))} />
          </Suspense>
        </>
      )}
    </div>
  );
}
