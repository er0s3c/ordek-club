import type { Metadata } from "next";
import Link from "next/link";
import { requirePageSession } from "@/server/auth/page-guard";
import { storyFor } from "@/server/academy/story";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Gölge Ağ") };
}

// Gölge Ağ: 18 bölümlük iki dilli çizgi roman. Bölüm sayfası açılış + kapanış şeritlerini sırayla gösterir;
// aynı şeritler derslerin içinde de görünür (tek kaynak: cizgi-roman.yaml).
export default async function StoryPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const t = await getT();
  await requirePageSession();
  const lang = (await searchParams).lang === "en" ? "en" : "tr";
  const story = storyFor(lang);
  if (!story) return <p className="alert alert-warn">{t("Gölge Ağ hikâyesi hazırlanıyor.")}</p>;
  const panels = story.chapters.reduce((n, c) => n + c.strips.reduce((m, s) => m + s.panels.length, 0), 0);
  return (
    <div className="stack fade-up">
      <header className="page-head">
        <div className="eyebrow">{t("Akademi")}</div>
        <h1 className="page-title">{story.title}</h1>
        <p className="page-sub">
          {t("Kampüsteki mesajlardan limandaki son masaya: {n} bölüm, {panels} panel. Bölümleri sırayla oku.", { n: story.chapters.length, panels })}
        </p>
        <nav className="learning-tabs" aria-label={t("Ders dili")}>
          <Link className={`btn btn-sm ${lang === "tr" ? "btn-primary" : ""}`} href="?lang=tr" hrefLang="tr" lang="tr">Türkçe</Link>
          <Link className={`btn btn-sm ${lang === "en" ? "btn-primary" : ""}`} href="?lang=en" hrefLang="en" lang="en">English</Link>
        </nav>
      </header>

      <ol className="story-list">
        {story.chapters.map((c, i) => (
          <li key={c.key} className="card card-b story-row">
            {c.villain?.portrait && (
              // eslint-disable-next-line @next/next/no-img-element -- kendi API'mizden gelen doğrulanmış raster
              <img src={c.villain.portrait} alt="" width={64} height={64} className="story-portrait" />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="tiny faint">{t("Bölüm {n}", { n: i + 1 })} · {c.villain?.module ?? "—"}</div>
              <h2 className="h3" style={{ margin: "2px 0 4px" }}>{c.title}</h2>
              <p className="small" style={{ margin: 0 }}>{c.intro}</p>
              {c.villain && (
                <p className="tiny faint" style={{ marginTop: 4 }}>{c.villain.name} · {c.villain.title} — {c.villain.threat}</p>
              )}
            </div>
            <Link className="btn btn-sm" href={`/academy/golge-ag/${c.key}?lang=${lang}`}>{t("Oku")}</Link>
          </li>
        ))}
      </ol>

      <p className="tiny faint">{t("Bu hikâye kurgusaldır; karakterler, kurumlar ve olaylar eğitim amacıyla üretilmiştir.")}</p>
    </div>
  );
}
