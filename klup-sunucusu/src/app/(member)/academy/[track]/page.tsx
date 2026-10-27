import { featureEnabled } from "@/server/learning/features";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Circle, CircleDot, Clock, FlaskConical } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { HttpError } from "@/server/errors";
import { getTrack } from "@/server/academy/service";
import { availableImages, coverUrl, portraitUrl } from "@/server/academy/images";
import { LAB_CATALOG } from "@/lib/labs-catalog";
import { labIconUrl } from "@/server/academy/images";
import { LabIcon } from "@/components/academy/LabIcon";
import { PREREQS, RESOURCES } from "@/lib/academy-guides";
import { db } from "@/server/db";
import { ExternalLink, Route } from "lucide-react";
import { ProgressBar } from "@/components/academy/Progress";
import { KIND_BADGE, KIND_LABEL } from "@/components/academy/labels";
import { ModuleAccordion } from "@/components/motion/ModuleAccordion";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Akademi") };
}

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const tl = await getT();
  const { user } = await requirePageSession();
  const key = (await params).track;
  if (!/^[a-z0-9-]{1,40}$/.test(key)) notFound();
  const t = await getTrack({ id: user.id, role: user.role, status: user.status }, key, tl.locale).catch((e) => {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  });
  if (!t) notFound();
  const academyV2 = await featureEnabled("academy-v2");
  const images = availableImages();
  const portrait = t.villain ? portraitUrl(t.villain.id, images) : null;
  const completed = t.lessons.filter((l) => l.status === "COMPLETED").length;
  const firstOpen = t.lessons.find((l) => l.status !== "COMPLETED");
  const cover = coverUrl(key, images);
  const started = t.lessons.find((l) => l.status === "STARTED");
  const upcoming = t.lessons.filter((l) => l.status !== "COMPLETED" && l.slug !== (started ?? firstOpen)?.slug).slice(0, 1)[0];
  const minutes = t.lessons.reduce((a, l) => a + l.minutes, 0);
  const left = t.lessons.filter((l) => l.status !== "COMPLETED").reduce((a, l) => a + l.minutes, 0);
  const [labsOn, workshopsOn] = await Promise.all([featureEnabled("labs"), featureEnabled("workshops")]);
  const labs = LAB_CATALOG.filter((l) => l.tracks.includes(key) && (l.feature === "labs" ? labsOn : workshopsOn));
  const practice = t.lessons.filter((l) => l.kind === "PRACTICE").length;
  // Önerilen önkoşullar (kilit değil): önkoşul yolundaki tamamlanma oranı
  const prereqs = await Promise.all((PREREQS[key] ?? []).map(async (k) => {
    const pt = await db.track.findFirst({ where: { key: k, archivedAt: null }, select: { code: true, title: true, lessons: { where: { archivedAt: null }, select: { progress: { where: { userId: user.id, status: "COMPLETED" }, select: { id: true } } } } } });
    if (!pt) return null;
    const total = pt.lessons.length, done = pt.lessons.filter((l) => l.progress.length).length;
    return { key: k, code: pt.code, title: pt.title, pct: total ? Math.round((done / total) * 100) : 0 };
  }));
  const missingPrereqs = prereqs.filter((p): p is NonNullable<typeof p> => !!p && p.pct < 60);
  const resources = RESOURCES[key] ?? [];

  return (
    <div className="stack fade-up">
      <Link href="/academy" className="back-link small"><ArrowLeft size={15} aria-hidden />{" "}{tl("Akademi")}</Link>
      <div className="page-head">
        <div className="eyebrow">{t.code}{t.kind === "CORE" ? tl(" · Sezon 1") : t.kind === "SPECIALIZATION" ? tl(" · Sezon 2") : ""}</div>
        <h1 className="page-title">{t.title}</h1>
        {t.summary && <p className="page-sub">{t.summary}</p>}
      </div>

      {cover && (
        // eslint-disable-next-line @next/next/no-img-element -- kendi API'mizden, optimizasyon kapalı
        <div className="cover track-hero-cover"><img src={cover} alt={tl("{title} modül kapağı", { title: t.title })} /></div>
      )}

      {/* Modül akışı: tamamlanan, devam edilen ve sıradaki açıkça ayrılır */}
      <section className="flow" aria-label={tl("Modül akışı")}>
        <div className="flow-step" data-state="done"><span className="eyebrow">{tl("Tamamlanan")}</span><strong>{tl("{completed} ders", { completed })}</strong><span className="tiny faint">{t.lessons.length - completed ? tl("{v0} ders kaldı", { v0: t.lessons.length - completed }) : tl("Modül bitti")}</span></div>
        <div className="flow-step" data-state="current"><span className="eyebrow">{tl("Devam edilen")}</span>{(started ?? firstOpen) ? <Link href={`/academy/lesson/${(started ?? firstOpen)!.slug}`}><strong>{(started ?? firstOpen)!.title}</strong></Link> : <strong>—</strong>}<span className="tiny faint">{started ? tl("Başladın") : firstOpen ? tl("Henüz açılmadı") : ""}</span></div>
        <div className="flow-step" data-state="next"><span className="eyebrow">{tl("Sıradaki")}</span>{upcoming ? <Link href={`/academy/lesson/${upcoming.slug}`}><strong>{upcoming.title}</strong></Link> : <strong>—</strong>}<span className="tiny faint">{upcoming ? tl("{minutes} dk", { minutes: upcoming.minutes }) : ""}</span></div>
      </section>
      <div className="row tiny faint">
        <span className="pill pill-neutral"><Clock size={13} aria-hidden />{" "}{tl("~{minutes} dk toplam · {left} dk kaldı", { minutes, left })}</span>
        <span className="pill pill-neutral"><BookOpen size={13} aria-hidden />{" "}{tl("{length} ders", { length: t.lessons.length })}</span>
        <span className="pill pill-neutral"><FlaskConical size={13} aria-hidden />{" "}{tl("{v0} lab / uygulama", { v0: labs.length + practice })}</span>
      </div>

      {missingPrereqs.length > 0 && completed === 0 && (
        <div className="alert alert-info" role="note"><Route size={18} aria-hidden /><span>{tl("Bu yoldan önce şunlara göz atman önerilir:")}{" "}{missingPrereqs.map((p, i) => <span key={p.key}>{i ? ", " : ""}<Link href={`/academy/${p.key}`}>{p.code} · {p.title}</Link> (%{p.pct})</span>)}{tl(". Zorunlu değil — biliyorsan doğrudan başlayabilirsin.")}</span></div>
      )}
      {academyV2 && <Link className="btn" href={`/academy/${key}/exam`}>{tl("Yol sınavı ve belgem")}</Link>}
      {academyV2 && <a className="btn btn-sm" href={`/api/academy/track/${key}/book.pdf?lang=${tl.locale}`} download>{tl("Yol kitabı (PDF)")}</a>}
      {t.villain && (
        <section className="dossier dossier-card" aria-label={tl("Dosya: {ad}", { ad: t.villain.ad })}>
          {portrait && (
            // eslint-disable-next-line @next/next/no-img-element -- kendi API'mizden, optimizasyon kapalı
            <img className="md-portrait" src={portrait} alt={`${t.villain.ad} — ${t.villain.unvan}`} />
          )}
          <p>🕴️ <strong>{tl("DOSYA: {ad}", { ad: t.villain.ad })}</strong> · <em>{t.villain.unvan}</em></p>
          {t.villain.bolum && <p>📼 <strong>{t.villain.bolum}.</strong> {t.villain.giris}</p>}
          <p><strong>{tl("Tehdit:")}</strong> {t.villain.tehdit}</p>
        </section>
      )}

      <ModuleAccordion title={<span className="row">{tl("Dersler")}{" "}<span className="tiny faint">{completed}/{t.lessons.length}</span></span>} defaultOpen headingLevel={2}>
        <div className="card-b" style={{ paddingBottom: 6 }}>
          <ProgressBar value={completed} max={t.lessons.length} label={tl("{title} ilerlemesi", { title: t.title })} />
        </div>
        <ol className="lesson-list">
          {t.lessons.map((l, i) => (
            <li key={l.slug}>
              <Link href={`/academy/lesson/${l.slug}`} className={`lesson-row${l.status === "COMPLETED" ? " is-done" : ""}`}>
                <span className="lesson-status" role="img" aria-label={l.status === "COMPLETED" ? tl("Tamamlandı") : l.status === "STARTED" ? tl("Başlandı") : tl("Başlanmadı")}>
                  {l.status === "COMPLETED" ? <CheckCircle2 size={18} /> : l.status === "STARTED" ? <CircleDot size={18} /> : <Circle size={18} />}
                </span>
                <span className="lesson-no mono">{String(i + 1).padStart(2, "0")}</span>
                <span className="lesson-name">{l.title}</span>
                <span className={KIND_BADGE[l.kind]}>{tl(KIND_LABEL[l.kind])}</span>
                <span className="tiny faint lesson-min"><Clock size={12} aria-hidden />{" "}{tl("{minutes} dk", { minutes: l.minutes })}</span>
              </Link>
            </li>
          ))}
        </ol>
      </ModuleAccordion>

      {labs.length > 0 && (
        <ModuleAccordion title={<span className="row"><FlaskConical size={16} aria-hidden />{" "}{tl("Bu modülün uygulama alanları")}</span>} defaultOpen headingLevel={2}>
          <ul className="list-tight card-b">
            {labs.map((l) => <li key={l.key}><LabIcon src={labIconUrl(l.key, images)} kind={l.kind} size={40} /><span style={{ flex: 1, minWidth: 0 }}><strong>{l.title}</strong><span className="tiny faint" style={{ display: "block" }}>{l.summary}</span></span><Link className="btn btn-sm" href={l.href}>{tl("Aç")}{" "}<ArrowRight size={14} aria-hidden /></Link></li>)}
          </ul>
        </ModuleAccordion>
      )}

      {resources.length > 0 && (
        <ModuleAccordion className="card card-quiet" title={tl("Modül sonu kaynaklar")} headingLevel={2}>
          <ul className="list-tight card-b">{resources.map((r) => <li key={r.url}><span style={{ flex: 1, minWidth: 0 }}><a href={r.url} target="_blank" rel="noopener noreferrer">{tl(r.title)} <ExternalLink size={12} aria-label={tl("(yeni sekmede açılır)")} /></a><span className="tiny faint" style={{ display: "block" }}>{tl(r.note)}</span></span></li>)}</ul>
        </ModuleAccordion>
      )}

      {firstOpen && (
        <div>
          <Link className="btn btn-primary btn-wrap" href={`/academy/lesson/${firstOpen.slug}`}>
            {completed ? tl("Devam et") : tl("Başla")}: {firstOpen.title}
          </Link>
        </div>
      )}
    </div>
  );
}
