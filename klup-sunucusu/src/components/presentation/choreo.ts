"use client";
// Theatre.js slayt koreografisi: başlık ve her blok bir Theatre nesnesidir (opaklık, dikey kayma, ölçek, bulanıklık).
// Studio'da eğitmen anahtar kareleri zaman çizelgesinde düzenler; durum JSON olarak slayta (motion) yazılır.
// Oynatmada yalnız @theatre/core yüklenir ve değerler DOM stiline uygulanır. Kod yok, yalnız sayısal anahtar kareler.
import { useEffect, type RefObject } from "react";
import type { IProject, ISheet, ISheetObject, NumberProp } from "@/lib/theatre/core";

export const SHEET = "Slayt";
export const objectKey = (i: number) => (i < 0 ? "Başlık" : `Blok ${i + 1}`);

type Core = typeof import("@/lib/theatre/core");
export type Values = { opacity: number; y: number; scale: number; blur: number };

export function choreoProps(t: Core["types"]): Record<"opacity" | "y" | "scale" | "blur", NumberProp> {
  return {
    opacity: t.number(1, { range: [0, 1] }),
    y: t.number(0, { range: [-160, 160] }),
    scale: t.number(1, { range: [0.3, 1.8] }),
    blur: t.number(0, { range: [0, 16] }),
  };
}

export function applyValues(el: HTMLElement | null | undefined, v: Values) {
  if (!el) return;
  el.style.opacity = String(v.opacity);
  el.style.transform = v.y || v.scale !== 1 ? `translateY(${v.y / 10}cqw) scale(${v.scale})` : "";
  el.style.filter = v.blur ? `blur(${v.blur / 10}cqw)` : "";
}

// Theatre durumunu ayrıştırır; geçersizse null (slayt varsayılan hâliyle görünür).
export function parseChoreo(motion?: string): object | null {
  if (!motion) return null;
  try { const s = JSON.parse(motion) as unknown; return s && typeof s === "object" ? (s as object) : null; } catch { return null; }
}

let seq = 0;
// Her oynatıcı benzersiz proje kimliği alır (Theatre aynı kimliği farklı durumla ikinci kez kabul etmez).
export async function loadChoreo(state: object, count: number): Promise<{ core: Core; project: IProject; sheet: ISheet; objects: ISheetObject<Values>[] }> {
  const core = await import("@/lib/theatre/core");
  const project = core.getProject(`ordek-play-${++seq}`, { state });
  const sheet = project.sheet(SHEET);
  const objects = Array.from({ length: count + 1 }, (_, k) => sheet.object(objectKey(k - 1), choreoProps(core.types)));
  return { core, project, sheet, objects };
}

// Slaytta koreografiyi oynatır: slayt değişince baştan, azaltılmış harekette hiç (son değerler değil, düz görünüm).
export function useChoreography(article: RefObject<HTMLElement | null>, motion: string | undefined, count: number, playKey: string | number, reducedMotion: boolean) {
  useEffect(() => {
    const state = parseChoreo(motion);
    const root = article.current;
    if (!state || !root || reducedMotion) return;
    let live = true;
    const offs: (() => void)[] = [];
    const targets = () => [root.querySelector<HTMLElement>(".slide-title"), ...Array.from(root.querySelectorAll<HTMLElement>(".slide-body > *"))];
    void loadChoreo(state, count).then(({ project, sheet, objects }) => {
      if (!live) return;
      const els = targets();
      objects.forEach((o, k) => offs.push(o.onValuesChange((v) => applyValues(els[k], v))));
      void project.ready.then(() => { if (live) { sheet.sequence.position = 0; void sheet.sequence.play({ iterationCount: 1 }); } });
    }).catch(() => undefined);
    return () => {
      live = false;
      offs.forEach((f) => f());
      for (const el of targets()) if (el) { el.style.opacity = ""; el.style.transform = ""; el.style.filter = ""; }
    };
  }, [article, motion, count, playKey, reducedMotion]);
}
