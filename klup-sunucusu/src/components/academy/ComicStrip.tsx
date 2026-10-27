import { Bangers, Patrick_Hand } from "next/font/google";
import type { ComicStripData } from "@/lib/comic";
import s from "./ComicStrip.module.css";
import { getT } from "@/i18n/server";

// Çizgi roman harfleri: başlık ve ses efektleri Bangers, balonlar el yazısı Patrick Hand (ikisi de Türkçe karakterli).
const display = Bangers({ weight: "400", subsets: ["latin", "latin-ext"], display: "swap", variable: "--comic-display" });
const letter = Patrick_Hand({ weight: "400", subsets: ["latin", "latin-ext"], display: "swap", variable: "--comic-letter" });

// Gölge Ağ çizgi roman şeridi. Görsel yazısızdır; anlatıcı kutusu, balonlar ve ses efektleri gerçek metindir (okunur, aranır,
// ekran okuyucuya gider). Anlatıcı kutusu görselin üstünde kendi bandında durur; balonlar ve ses efekti görselin üzerinde
// her biri ayrı bir köşeye yerleşir (bkz. layoutComicPanel). Ölçüler panel genişliğine bağlıdır (cqi), böylece dar panelde
// metin görselin üstüne taşmaz.
// Tek panelli şerit derste kısa bir "sahne" olarak, çok panelli şerit bölüm açılışı/kapanışı olarak çizilir.
export async function ComicStrip({ strip }: { strip: ComicStripData }) {
  const t = await getT();
  const single = strip.panels.length === 1;
  return (
    <section lang={strip.lang} className={`${s.strip} ${single ? s.beat : ""} ${display.variable} ${letter.variable}`} aria-label={t("Çizgi roman: {title}", { title: strip.title })}>
      <header className={s.head}>
        <span className={s.title}>{strip.title}</span>
      </header>
      <div className={s.grid} data-count={strip.panels.length}>
        {strip.panels.map((p, i) => (
          <figure key={i} className={s.panel}>
            {p.caption && <figcaption className={s.caption}>{p.caption}</figcaption>}
            <div className={s.art}>
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- görseller kendi API'mizden, optimizasyon kapalı
                <img src={p.image} alt={p.alt} loading="lazy" decoding="async" />
              ) : (
                <div className={s.shade} role="img" aria-label={p.alt} />
              )}
              {p.sfx && <span className={`${s.sfx} ${s[`sfx_${p.sfx.spot.replace("-", "_")}`]}`} aria-hidden>{p.sfx.text}</span>}
              {p.bubbles.length > 0 && (
                <div className={s.text}>
                  {p.bubbles.map((b, j) => (
                    <p key={j} className={`${s.bubble} ${s[b.kind]} ${s[b.spot.replace("-", "_")]}`}>
                      <span className={s.who}>{b.who}</span>
                      <span>{b.text}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </figure>
        ))}
      </div>
      {strip.next && <p className={s.next}>{strip.next}</p>}
    </section>
  );
}
