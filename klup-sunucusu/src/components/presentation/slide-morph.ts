"use client";
// reveal.js "auto-animate" fikri: ardışık iki slaytta aynı içerikli başlık/blok varsa eski konumundan yenisine
// kayarak geçer (FLIP). Eşleşmeyen yeni öğeler hafifçe belirir. Azaltılmış harekette hiçbir şey yapılmaz.
import { useLayoutEffect, useRef, type RefObject } from "react";
import type { Block, ClientSlide } from "@/lib/deck-schema";

function blockKey(b: Block): string {
  switch (b.type) {
    case "heading": case "text": case "callout": return `${b.type}:${b.text}`;
    case "bullets": return `bullets:${b.items[0] ?? ""}`;
    case "code": return `code:${b.language}:${b.code.slice(0, 120)}`;
    case "terminal": return `terminal:${b.lines[0]?.cmd ?? ""}`;
    case "animation": return `animation:${b.animation}`;
    case "image": return `image:${b.fileId}`;
    case "diagram": return `diagram:${b.source.slice(0, 120)}`;
    case "lottie": return `lottie:${b.animation}`;
    case "scene": return `scene:${b.scene}`;
    default: return `${b.type}`;
  }
}

function snapshot(root: HTMLElement | null, slide: ClientSlide | undefined): Map<string, DOMRect> {
  const m = new Map<string, DOMRect>();
  if (!root || !slide) return m;
  const title = root.querySelector<HTMLElement>(".slide-title");
  if (title) m.set(`title:${slide.title}`, title.getBoundingClientRect());
  root.querySelectorAll<HTMLElement>(".slide-body > *").forEach((el, i) => { const b = slide.blocks[i]; if (b) m.set(blockKey(b), el.getBoundingClientRect()); });
  return m;
}

export function useSlideMorph(root: RefObject<HTMLElement | null>, slide: ClientSlide | undefined, reducedMotion: boolean) {
  const prev = useRef<{ id: string; rects: Map<string, DOMRect> } | null>(null);
  // Çizimden önce: önceki slaytın konumları yakalanır (DOM henüz eski slaytı gösteriyorken çağrılır).
  const capture = () => { if (slide) prev.current = { id: slide.id, rects: snapshot(root.current, slide) }; };

  useLayoutEffect(() => {
    const el = root.current;
    const before = prev.current;
    prev.current = null;
    if (!el || !slide || !before || before.id === slide.id || reducedMotion) return;
    const now: [HTMLElement, string][] = [];
    const title = el.querySelector<HTMLElement>(".slide-title");
    if (title) now.push([title, `title:${slide.title}`]);
    el.querySelectorAll<HTMLElement>(".slide-body > *").forEach((node, i) => { const b = slide.blocks[i]; if (b) now.push([node, blockKey(b)]); });
    for (const [node, key] of now) {
      const from = before.rects.get(key);
      const to = node.getBoundingClientRect();
      if (from && to.width && to.height) {
        const dx = from.left - to.left, dy = from.top - to.top, sx = from.width / to.width, sy = from.height / to.height;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01) continue;
        node.animate([{ transformOrigin: "top left", transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transformOrigin: "top left", transform: "none" }], { duration: 520, easing: "cubic-bezier(.22,1,.36,1)" });
      } else if (before.rects.size) {
        node.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 360, delay: 120, easing: "ease-out", fill: "backwards" });
      }
    }
  }, [root, slide, reducedMotion]);

  return capture;
}
