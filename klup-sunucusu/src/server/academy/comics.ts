// Çizgi roman şeritlerinin dile göre listesi: arama ve Gölge Ağ okuyucusu için. comicsFor ile aynı
// dönüşümü kullanır (başlık, panel metni, konuşan adı, yerleşim), böylece ekranda ne görünüyorsa o aranır.
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { env } from "@/server/env";
import { comicFileSchema, comicIds, layoutComicPanel, type ComicBubble, type ComicFile, type ComicStripData } from "@/lib/comic";
import { availableImages } from "./images";

// Çizgi roman şeritleri dosyadan okunur (içe aktarmaya gerek yok); dosya değişince önbellek yenilenir.
let cache: { file: string; mtime: number; data: ComicFile | null } | null = null;

function load(): ComicFile | null {
  const file = path.join(env().academyDir, "cizgi-roman.yaml");
  let mtime: number;
  try {
    mtime = fs.statSync(file).mtimeMs;
  } catch {
    return null;
  }
  if (cache?.file === file && cache.mtime === mtime) return cache.data;
  const parsed = comicFileSchema.safeParse(YAML.parse(fs.readFileSync(file, "utf8")));
  cache = { file, mtime, data: parsed.success ? parsed.data : null };
  return cache.data;
}

// Balonlardaki konuşan adı kısa addır ("Tilki", "Selim"); İngilizce sayfada da kısa ad kullanılır.
// Karakter tam adı burada tekrarlanmaz: çizgi romanda kim konuşuyorsa o ad görünür.
const SPEAKER_EN: Record<string, string> = {
  Tilki: "Fox",
  Selim: "Selim",
  Mesaj: "Message",
  Etiket: "Label",
  Not: "Note",
  "B.": "B.",
};

const imageUrl = (id: string, images: ReadonlySet<string>) => {
  const name = ["webp", "png", "jpg", "jpeg"].map((e) => `${id}.${e}`).find((n) => images.has(n));
  return name ? `/api/academy/images/${name}` : null;
};

// Tek bir şeridi sayfaya gidecek biçime çevirir (dil, panel yerleşimi, konuşan adı).
function toStripData(id: string, s: NonNullable<ComicFile["seritler"][string]>, images: ReadonlySet<string>, lang: "tr" | "en"): ComicStripData {
  const en = lang === "en";
  return {
    id,
    lang: en && s.en ? "en" : "tr",
    title: (en && s.en?.baslik) || s.baslik,
    panels: s.paneller.map((p) => ({
      image: imageUrl(p.gorsel, images),
      alt: (en && p.en?.alt) || p.alt,
      ...layoutComicPanel({
        caption: (en && p.en?.anlatici) || p.anlatici || null,
        bubbles: p.balonlar.map((b) => ({ who: (en && SPEAKER_EN[b.kim]) || b.kim, text: (en && b.en) || b.metin, kind: b.tur, spot: b.yer })),
        sfx: p.ses ? { text: (en && p.en?.ses) || p.ses.metin, spot: p.ses.yer } : null,
      }),
    })),
    next: (en && s.en?.devam) || s.devam || null,
  };
}

// Ders gövdesinin kullandığı şeritler, sayfaya gidecek biçimde. İngilizce metni olmayan alan Türkçe kalır.
export function comicsFor(body: string, images: ReadonlySet<string>, lang: "tr" | "en" = "tr"): Record<string, ComicStripData> {
  const data = load();
  const out: Record<string, ComicStripData> = {};
  if (!data) return out;
  for (const id of comicIds(body)) {
    const s = data.seritler[id];
    if (!s) continue;
    out[id] = toStripData(id, s, images, lang);
  }
  return out;
}

// Tüm şeritler (arama ve Gölge Ağ okuyucusu): dosya sırasıyla, seçili dilde.
export function allStrips(lang: "tr" | "en" = "tr"): ComicStripData[] {
  const data = load();
  if (!data) return [];
  const images = availableImages();
  return Object.entries(data.seritler).map(([id, s]) => toStripData(id, s, images, lang));
}

export type { ComicBubble };
