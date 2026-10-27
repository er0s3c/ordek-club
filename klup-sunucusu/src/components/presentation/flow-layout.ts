"use client";
// Akış animasyonları için yardımcılar: eğri yol geometrisi, ELK otomatik yerleşimi ve rough.js elle çizim yolları.
import { useEffect, useState } from "react";
import type { ElkNode } from "elkjs/lib/elk-api";
import type { Actor, FlowAnimation } from "@/animations/types";

export const R = 30; // aktör yarıçapı

// İki aktör arasında, aynı çiftteki istek/yanıt üst üste binmesin diye bükülmüş ikinci dereceden eğri.
export function curve(a: Actor, b: Actor) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const side = a.id < b.id ? -1 : 1;
  const bend = Math.min(60, len * 0.18) * side;
  const x1 = a.x + ux * (R + 6), y1 = a.y + uy * (R + 6);
  const x2 = b.x - ux * (R + 10), y2 = b.y - uy * (R + 10);
  const cx = (x1 + x2) / 2 - uy * bend, cy = (y1 + y2) / 2 + ux * bend;
  // Etiket eğrinin tepe noktasında (t = 0.5)
  const mx = 0.25 * x1 + 0.5 * cx + 0.25 * x2, my = 0.25 * y1 + 0.5 * cy + 0.25 * y2;
  return { d: `M${x1.toFixed(1)},${y1.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`, x2, y2, mx, my };
}

// ELK "layered" yerleşimi: adımlardaki iletişim yönüne göre soldan sağa katmanlar; 800×360 tuvale ölçeklenir.
export function useElkLayout(def: FlowAnimation): Actor[] {
  const [actors, setActors] = useState(def.actors);
  useEffect(() => {
    if (def.layout !== "auto") { setActors(def.actors); return; }
    let live = true;
    void (async () => {
      const { default: ELK } = await import("elkjs/lib/elk.bundled.js");
      const elk = new ELK();
      const pairs = new Set<string>();
      const edges = [...(def.links ?? []), ...def.steps.filter((s) => s.from !== s.to).map((s) => [s.from, s.to] as [string, string])]
        .filter(([a, b]) => { const k = `${a}>${b}`; if (pairs.has(k)) return false; pairs.add(k); return true; })
        .map(([a, b], i) => ({ id: `e${i}`, sources: [a], targets: [b] }));
      const g: ElkNode = await elk.layout({
        id: "root",
        layoutOptions: { "elk.algorithm": "layered", "elk.direction": "RIGHT", "elk.spacing.nodeNode": "40", "elk.layered.spacing.nodeNodeBetweenLayers": "90" },
        children: def.actors.map((a) => ({ id: a.id, width: 2 * R + 40, height: 2 * R + 40 })),
        edges,
      });
      const kids = g.children ?? [];
      const w = Math.max(1, g.width ?? 1), h = Math.max(1, g.height ?? 1);
      const sx = Math.min(1, 700 / w), sy = Math.min(1, 280 / h);
      const ox = (800 - w * sx) / 2, oy = (360 - h * sy) / 2;
      if (live) setActors(def.actors.map((a) => { const n = kids.find((k) => k.id === a.id); return n ? { ...a, x: ox + ((n.x ?? 0) + (n.width ?? 0) / 2) * sx, y: oy + ((n.y ?? 0) + (n.height ?? 0) / 2) * sy } : a; }));
    })();
    return () => { live = false; };
  }, [def]);
  return actors;
}

// rough.js ile elle çizilmiş görünüm için SVG yol verisi (tohumlu: her çizimde aynı titreme).
export type SketchPath = { d: string; stroke: string; strokeWidth: number; fill?: string };
export function useSketch(def: FlowAnimation, actors: Actor[]): { zones: SketchPath[][]; links: SketchPath[][] } | null {
  const [paths, setPaths] = useState<{ zones: SketchPath[][]; links: SketchPath[][] } | null>(null);
  useEffect(() => {
    if (def.style !== "sketch") { setPaths(null); return; }
    let live = true;
    void import("roughjs").then(({ default: rough }) => {
      const gen = rough.generator();
      const byId = new Map(actors.map((a) => [a.id, a]));
      const toPaths = (d: Parameters<typeof gen.toPaths>[0]) => gen.toPaths(d).map((p) => ({ d: p.d, stroke: p.stroke, strokeWidth: p.strokeWidth, fill: p.fill }));
      const zones = (def.zones ?? []).map((z, i) => toPaths(gen.rectangle(z.x, z.y, z.w, z.h, { roughness: 1.4, bowing: 1.2, stroke: z.tone === "untrusted" ? "#fe1e34" : "#c8c8c8", strokeWidth: 1.2, seed: 7 + i })));
      const links = (def.links ?? []).map(([a, b], i) => { const A = byId.get(a), B = byId.get(b); return A && B ? toPaths(gen.line(A.x, A.y, B.x, B.y, { roughness: 1.6, stroke: "#9a9a9a", strokeWidth: 1.6, seed: 31 + i })) : []; });
      if (live) setPaths({ zones, links });
    });
    return () => { live = false; };
  }, [def, actors]);
  return paths;
}
