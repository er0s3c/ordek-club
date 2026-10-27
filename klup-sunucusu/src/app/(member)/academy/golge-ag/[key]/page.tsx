import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { chapterNeighbours, storyFor } from "@/server/academy/story";
import { ComicStrip } from "@/components/academy/ComicStrip";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Gölge Ağ") };
}

// Tek bölüm: açılış ve kapanış şeritleri, karakter dosyası ve önceki/sonraki bölüm gezinmesi.
export default async function StoryChapterPage({ params, searchParams }: { params: Promise<{ key: string }>; searchParams: Promise<{ lang?: string }> }) {
  const t = await getT();
  await requirePageSession();
  const { key } = await params;
  if (!/^[a-z0-9-]{1,40}$/.test(key)) notFound();
  const lang = (await searchParams).lang === "en" ? "en" : "tr";
  const story = storyFor(lang, key);
  const chapter = story?.chapters[0];
  if (!chapter) notFound();
  const nav = chapterNeighbours(key);
  const all = storyFor(lang)!.chapters;
  const titleOf = (k: string | null) => (k ? all.find((c) => c.key === k)?.title ?? k : null);

  return (
    <div className="stack fade-up">
      <nav className="row" style={{ gap: 10, flexWrap: "wrap" }}>
        <Link className="btn btn-sm btn-ghost" href={`/academy/golge-ag?lang=${lang}`}><ArrowLeft size={15} aria-hidden /> {t("Gölge Ağ")}</Link>
        <span className="tiny faint">{t("Bölüm {n}/{total}", { n: nav.index + 1, total: nav.total })}</span>
        <nav className="learning-tabs" aria-label={t("Ders dili")}>
          <Link className={`btn btn-sm ${lang === "tr" ? "btn-primary" : ""}`} href={`?lang=tr`} hrefLang="tr" lang="tr">Türkçe</Link>
          <Link className={`btn btn-sm ${lang === "en" ? "btn-primary" : ""}`} href={`?lang=en`} hrefLang="en" lang="en">English</Link>
        </nav>
      </nav>

      <header className="page-head">
        <div className="eyebrow">{chapter.villain?.module ?? t("Bölüm")}</div>
        <h1 className="page-title">{chapter.title}</h1>
        <p className="page-sub">{chapter.intro}</p>
      </header>

      <nav className="story-dots" aria-label={t("Bölümler")}>
        {all.map((c, i) => (
          <Link
            key={c.key}
            href={`/academy/golge-ag/${c.key}?lang=${lang}`}
            className={`story-dot ${c.key === key ? "story-dot-active" : ""}`}
            aria-current={c.key === key ? "page" : undefined}
            aria-label={t("Bölüm {n}: {title}", { n: i + 1, title: c.title })}
          />
        ))}
      </nav>

      {chapter.strips.map((s) => <ComicStrip key={s.id} strip={s} />)}

      {chapter.villain && (
        <section className="card card-b stack" style={{ gap: 6 }}>
          {chapter.villain.portrait && (
            // eslint-disable-next-line @next/next/no-img-element -- kendi API'mizden gelen doğrulanmış raster
            <img src={chapter.villain.portrait} alt="" width={72} height={72} className="story-portrait" />
          )}
          <div className="tiny faint">{t("Dosya")}</div>
          <h2 className="h3">{chapter.villain.name}</h2>
          <p className="small" style={{ margin: 0 }}>{chapter.villain.summary}</p>
          <p className="tiny"><strong>{t("Tehdit")}:</strong> {chapter.villain.threat}</p>
          {chapter.closing && <p className="small muted" style={{ margin: 0 }}>{chapter.closing}</p>}
        </section>
      )}

      <nav className="row" style={{ justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        {nav.prev ? (
          <Link className="btn btn-sm" href={`/academy/golge-ag/${nav.prev}?lang=${lang}`}><ArrowLeft size={15} aria-hidden /> {titleOf(nav.prev)}</Link>
        ) : <span />}
        {nav.next ? (
          <Link className="btn btn-sm btn-primary" href={`/academy/golge-ag/${nav.next}?lang=${lang}`}>{titleOf(nav.next)} <ArrowRight size={15} aria-hidden /></Link>
        ) : (
          <Link className="btn btn-sm btn-primary" href={`/academy/golge-ag?lang=${lang}`}>{t("Baştan oku")}</Link>
        )}
      </nav>
    </div>
  );
}
