import type { AnimationDef } from "./types";
import { EN_ANIM } from "./en";

// İngilizce katman biçimi: diziler tanımdaki sırayla eşleşir; eksik alan Türkçe kalır.
type ActorEn = { label?: string; sub?: string };
type StepEn = { label?: string; note?: string };
export type AnimationEn = { title?: string; summary?: string; actors?: ActorEn[]; steps?: StepEn[]; zones?: string[]; panels?: string[] };

// Animasyon tanımları Türkçe yazılır (tek kaynak). Bu katman, sayfa dili İngilizceyken yalnız görünen
// metinleri değiştirir: başlık, özet, aktör etiketi/alt yazısı, adım etiketi/açıklaması, bölge ve panel
// etiketleri. Kod animasyonlarındaki kod satırları çevrilmez; onlar öğrencinin laboratuvarda gördüğü koddur.
export function localizeAnimation(def: AnimationDef, locale: "tr" | "en"): AnimationDef {
  if (locale !== "en") return def;
  const en = EN_ANIM[def.id];
  if (!en) return def;
  if (def.kind === "code") {
    const panels = def.panels.map((p, i) => (en.panels?.[i] ? { ...p, label: en.panels[i]! } : p));
    return { ...def, title: en.title ?? def.title, summary: en.summary ?? def.summary, panels };
  }
  const actors = def.actors.map((a, i) => {
    const t = en.actors?.[i];
    if (!t) return a;
    return { ...a, label: t.label ?? a.label, ...(a.sub ? { sub: t.sub ?? a.sub } : {}) };
  });
  const steps = def.steps.map((s, i) => {
    const t = en.steps?.[i];
    if (!t) return s;
    return { ...s, label: t.label ?? s.label, note: t.note ?? s.note };
  });
  const zones = def.zones?.map((z, i) => (en.zones?.[i] ? { ...z, label: en.zones[i]! } : z));
  return { ...def, title: en.title ?? def.title, summary: en.summary ?? def.summary, actors, steps, ...(zones ? { zones } : {}) };
}
