"use client";
// Beceri ağı (Cytoscape): beceriler ve onları besleyen dersler/kanıtlar tek grafikte. Birden çok beceriye kanıt
// olan ders ortak düğümdür; tamamlananlar dolu, sıradakiler kesik çizgili. Düğüme tıklamak ilgili sayfayı açar.
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { SkillCard } from "./SkillMap";
import { useT } from "@/i18n/client";

export function SkillGraph({ cards, onSkill }: { cards: SkillCard[]; onSkill: (s: SkillCard) => void }) {
  const tl = useT();
  const host = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pick = useRef(onSkill);
  pick.current = onSkill;

  useEffect(() => {
    let cy: { destroy: () => void } | null = null;
    let live = true;
    void import("cytoscape").then(({ default: cytoscape }) => {
      if (!live || !host.current) return;
      const els: cytoscape.ElementDefinition[] = [];
      const seen = new Set<string>();
      for (const s of cards) {
        const pct = s.total ? s.done / s.total : 0;
        els.push({ data: { id: `s:${s.key}`, label: s.tr, kind: "skill", pct, size: 46 + Math.min(40, s.total * 4) } });
        const add = (href: string, title: string, done: boolean) => {
          const id = `l:${href}`;
          if (!seen.has(id)) { seen.add(id); els.push({ data: { id, label: title.length > 28 ? `${title.slice(0, 27)}…` : title, kind: done ? "done" : "todo", href } }); }
          els.push({ data: { id: `${s.key}->${href}`, source: `s:${s.key}`, target: id, kind: done ? "done" : "todo" } });
        };
        s.evidence.forEach((e) => add(e.href, e.title, true));
        s.todo.forEach((t) => add(t.href, t.title, false));
      }
      const c = cytoscape({
        container: host.current,
        elements: els,
        wheelSensitivity: 0.25,
        minZoom: 0.3,
        maxZoom: 2.2,
        style: [
          { selector: "node", style: { label: "data(label)", "font-size": 10, color: "#2b2147", "text-wrap": "wrap", "text-max-width": "110px", "text-valign": "bottom", "text-margin-y": 4 } },
          { selector: "node[kind = 'skill']", style: { width: "data(size)", height: "data(size)", "background-color": "#5c1fe2", "background-opacity": 0.18, "border-width": 3, "border-color": "#5c1fe2", "pie-size": "80%", "pie-1-background-color": "#5c1fe2", "pie-1-background-size": "mapData(pct, 0, 1, 0, 100)" as unknown as number, "font-size": 12, "font-weight": "bold", "text-valign": "center", "text-margin-y": 0, color: "#fff", "text-outline-color": "#2b2147", "text-outline-width": 2 } },
          { selector: "node[kind = 'done']", style: { width: 16, height: 16, "background-color": "#11a85a" } },
          { selector: "node[kind = 'todo']", style: { width: 14, height: 14, "background-color": "#fff", "border-width": 2, "border-style": "dashed", "border-color": "#8a84a0" } },
          { selector: "edge", style: { width: 1.5, "line-color": "#c9c3d6", "curve-style": "bezier" } },
          { selector: "edge[kind = 'done']", style: { "line-color": "#7fd6a6", width: 2 } },
          { selector: "edge[kind = 'todo']", style: { "line-style": "dashed" } },
          { selector: "node:active, node:selected", style: { "overlay-opacity": 0.12, "overlay-color": "#5c1fe2" } },
        ],
        layout: { name: "cose", animate: !matchMedia("(prefers-reduced-motion: reduce)").matches, nodeRepulsion: () => 9000, idealEdgeLength: () => 70, padding: 24 } as cytoscape.LayoutOptions,
      });
      c.on("tap", "node", (e) => {
        const d = e.target.data() as { kind: string; id: string; href?: string };
        if (d.kind === "skill") { const s = cards.find((x) => `s:${x.key}` === d.id); if (s) pick.current(s); }
        else if (d.href) router.push(d.href);
      });
      cy = c;
    });
    return () => { live = false; cy?.destroy(); };
  }, [cards, router, tl]);

  return (
    <figure className="skill-graph" style={{ margin: 0 }}>
      <div ref={host} className="skill-graph-canvas" role="img" aria-label={tl("Beceri ağı: beceriler ve onları besleyen dersler. Aynı bilgiler kart görünümünde liste olarak da var.")} />
      <figcaption className="row tiny faint" style={{ flexWrap: "wrap", gap: 14 }}>
        <span><span className="legend-dot is-skill" />{" "}{tl("Beceri (dolu dilim = ilerleme)")}</span>
        <span><span className="legend-dot is-done" />{" "}{tl("Tamamlanan")}</span>
        <span><span className="legend-dot is-todo" />{" "}{tl("Sıradaki")}</span>
        <span>{tl("Fareyle sürükle, tekerlekle yakınlaştır, düğüme tıklayarak aç.")}</span>
      </figcaption>
    </figure>
  );
}
