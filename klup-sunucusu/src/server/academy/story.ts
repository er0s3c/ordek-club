import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { env } from "@/server/env";
import { comicsFor } from "./comics";
import { availableImages, portraitUrl } from "./images";import type { ComicStripData } from "@/lib/comic";

// Gölge Ağ hikâyesi: karakterler.yaml'daki bölüm sırası + her bölümün açılış/kapanış çizgi roman şeritleri.
// Ders sayfalarındaki şeritlerle aynı bileşen çizilir; burada yalnız sıralı okuma düzeni kurulur.
export type StoryChapter = {
  key: string;
  title: string;
  intro: string;
  closing: string;
  villain: { id: string; name: string; title: string; threat: string; summary: string; module: string; portrait: string | null } | null;
  strips: ComicStripData[];
};

export type StoryData = {
  lang: "tr" | "en";
  title: string;
  chapters: StoryChapter[];
};

type En = { baslik?: string; giris?: string; kapanis?: string; ad?: string; unvan?: string; tehdit?: string; ozet?: string };

type CharFile = {
  aile?: { ad: string };
  karakterler?: { id: string; ad: string; unvan: string; tehdit: string; ozet: string; modul: string; en?: En }[];
  hikaye?: {
    ad?: string;
    en?: { ad?: string };
    bolumler?: Record<string, { baslik: string; giris: string; kapanis?: string; en?: { baslik?: string; giris?: string; kapanis?: string } }>;
  };
};

const cache = new Map<string, { mtime: number; data: CharFile }>();

function loadChars(): CharFile | null {
  const file = path.join(env().academyDir, "karakterler.yaml");
  let mtime = 0;
  try {
    mtime = fs.statSync(file).mtimeMs;
  } catch {
    return null;
  }
  const hit = cache.get(file);
  if (hit?.mtime === mtime) return hit.data;
  try {
    const data = YAML.parse(fs.readFileSync(file, "utf8")) as CharFile;
    cache.set(file, { mtime, data });
    return data;
  } catch {
    return null;
  }
}

// Modül etiketi: "Yol A"…"Yol G" İngilizcede "Path A"…"Path G"; M01–M11, Baron ve Geçmiş olduğu gibi kalır.
const moduleEn = (m: string, en: boolean) => (en ? m.replace(/^Yol /, "Path ") : m);

// Bölüm metinleri: dosyada İngilizcesi yoksa Türkçe kalır (çeviri eklenince otomatik görünür).
export function storyFor(lang: "tr" | "en", only?: string): StoryData | null {
  const chars = loadChars();
  if (!chars?.hikaye?.bolumler) return null;
  const en = lang === "en";
  const images = availableImages();
  const chapters: StoryChapter[] = [];
  for (const [key, ch] of Object.entries(chars.hikaye.bolumler)) {
    if (only && key !== only) continue;
    const v = chars.karakterler?.find((c) => c.id === key) ?? null;
    // Bölümün şeritleri dosyada <key>-acilis / <key>-kapanis olarak durur; gövdeye gömülü olduğu için
    // comicsFor'a yapay bir gövde veriyoruz (aynı dönüşüm: dil, yerleşim, konuşan adları).
    const body = `::cizgi[${key}-acilis]\n\n::cizgi[${key}-kapanis]`;
    const strips = Object.values(comicsFor(body, images, lang));
    chapters.push({
      key,
      title: (en && ch.en?.baslik) || ch.baslik,
      intro: (en && ch.en?.giris) || ch.giris,
      closing: (en && ch.en?.kapanis) || ch.kapanis || "",
      villain: v
        ? {
            id: v.id,
            name: (en && v.en?.ad) || v.ad,
            title: (en && v.en?.unvan) || v.unvan,
            threat: (en && v.en?.tehdit) || v.tehdit,
            summary: (en && v.en?.ozet) || v.ozet,
            module: moduleEn(v.modul, en),
            portrait: portraitUrl(v.id, images),
          }
        : null,
      strips,
    });
  }
  return {
    lang,
    title: (en && chars.hikaye.en?.ad) || chars.hikaye.ad || "Gölge Ağ",
    chapters,
  };
}

// Önceki/sonraki bölüm: sayfa altındaki gezinme için.
export function chapterNeighbours(key: string) {
  const all = storyFor("tr")?.chapters.map((c) => c.key) ?? [];
  const i = all.indexOf(key);
  return { prev: i > 0 ? all[i - 1]! : null, next: i >= 0 && i < all.length - 1 ? all[i + 1]! : null, total: all.length, index: i };
}
