// Yol ve karakter metinlerinin İngilizcesi. Çizgi roman gibi dosyadan okunur (içe aktarma gerekmez),
// dosya değişince önbellek yenilenir:
//   akademi.yaml      yollar[].en: { baslik, ozet }
//   karakterler.yaml  karakterler[].en: { ad, unvan, tehdit, ozet } · hikaye.bolumler.<id>.en: { baslik, giris }
// İngilizcesi olmayan alan Türkçe kalır.
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { env } from "@/server/env";
import type { Villain } from "./content";

type TrackEn = { baslik?: string; ozet?: string };
type VillainEn = { ad?: string; unvan?: string; tehdit?: string; ozet?: string; bolum?: string; giris?: string };
type Data = { tracks: Map<string, TrackEn>; villains: Map<string, VillainEn> };

let cache: { key: string; data: Data } | null = null;

function mtime(file: string) {
  try {
    return fs.statSync(file).mtimeMs;
  } catch {
    return 0;
  }
}

function load(): Data {
  const dir = env().academyDir;
  const manifest = path.join(dir, "akademi.yaml");
  const chars = path.join(dir, "karakterler.yaml");
  const key = `${dir}:${mtime(manifest)}:${mtime(chars)}`;
  if (cache?.key === key) return cache.data;
  const data: Data = { tracks: new Map(), villains: new Map() };
  try {
    const m = YAML.parse(fs.readFileSync(manifest, "utf8")) as { yollar?: { anahtar: string; en?: TrackEn }[] };
    for (const t of m.yollar ?? []) if (t.en) data.tracks.set(t.anahtar, t.en);
  } catch {
    /* dosya yoksa Türkçe kalır */
  }
  try {
    const c = YAML.parse(fs.readFileSync(chars, "utf8")) as {
      karakterler?: { id: string; en?: VillainEn }[];
      hikaye?: { bolumler?: Record<string, { en?: { baslik?: string; giris?: string } }> };
    };
    for (const k of c.karakterler ?? []) {
      const b = c.hikaye?.bolumler?.[k.id]?.en;
      if (k.en || b) data.villains.set(k.id, { ...k.en, bolum: b?.baslik, giris: b?.giris?.replace(/\s+/g, " ").trim() });
    }
  } catch {
    /* dosya yoksa Türkçe kalır */
  }
  cache = { key, data };
  return data;
}

export function trackText(key: string, title: string, summary: string, lang: "tr" | "en") {
  if (lang !== "en") return { title, summary };
  const en = load().tracks.get(key);
  return { title: en?.baslik || title, summary: en?.ozet || summary };
}

export function villainText(v: Villain | null, lang: "tr" | "en"): Villain | null {
  if (!v || lang !== "en") return v;
  const en = load().villains.get(v.id);
  if (!en) return v;
  return { ...v, ad: en.ad || v.ad, unvan: en.unvan || v.unvan, tehdit: en.tehdit || v.tehdit, ozet: en.ozet || v.ozet, bolum: en.bolum || v.bolum, giris: en.giris || v.giris };
}
