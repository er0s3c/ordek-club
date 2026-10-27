"use client";
// Excalidraw çizimleri: slaytta salt-okunur SVG olarak (exportToSvg), Studio'da ve canlı derste düzenlenebilir tahta.
// Sahne JSON olarak saklanır; yazı tipleri CDN yerine /vendor/excalidraw altından yüklenir.
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n/client";
import "@excalidraw/excalidraw/index.css";

declare global { interface Window { EXCALIDRAW_ASSET_PATH?: string } }
const prepare = () => { if (typeof window !== "undefined") window.EXCALIDRAW_ASSET_PATH = "/vendor/excalidraw/"; };

type Scene = { elements: unknown[]; appState?: Record<string, unknown> };
export function parseScene(raw: string): Scene {
  try { const s = JSON.parse(raw) as Scene; return Array.isArray(s.elements) ? s : { elements: [] }; } catch { return { elements: [] }; }
}

export function SketchView({ scene, alt }: { scene: string; alt: string }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let live = true;
    prepare();
    void import("@excalidraw/excalidraw").then(async ({ exportToSvg, restoreElements }) => {
      const s = parseScene(scene);
      const svg = await exportToSvg({ elements: restoreElements(s.elements as never, null), appState: { exportBackground: false, exportWithDarkMode: true, viewBackgroundColor: "transparent" }, files: null, exportPadding: 16 });
      if (!live || !host.current) return;
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", alt);
      svg.removeAttribute("width");
      svg.removeAttribute("height");
      host.current.replaceChildren(svg);
    });
    return () => { live = false; };
  }, [scene, alt]);
  return <div ref={host} className="sketch-view" />;
}

// Düzenlenebilir tahta (Studio blok düzenleyicisi ve canlı ders beyaz tahtası).
export function SketchBoard({ scene, onChange, height = 480 }: { scene: string; onChange: (json: string) => void; height?: number }) {
  const locale = useLocale();
  const [Comp, setComp] = useState<typeof import("@excalidraw/excalidraw").Excalidraw | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { prepare(); let live = true; void import("@excalidraw/excalidraw").then((m) => { if (live) setComp(() => m.Excalidraw); }); return () => { live = false; }; }, []);
  if (!Comp) return <div className="skeleton" style={{ height }} />;
  const initial = parseScene(scene);
  return (
    <div className="sketch-board" style={{ height }}>
      <Comp
        initialData={{ elements: initial.elements as never, appState: { viewBackgroundColor: "#1d1730", theme: "dark" } }}
        theme="dark"
        langCode={locale === "en" ? "en" : "tr-TR"}
        UIOptions={{ canvasActions: { loadScene: false, saveToActiveFile: false, export: false, saveAsImage: false } }}
        onChange={(elements) => {
          // Kaydetmeyi seyrekleştir; silinmiş öğeler ve büyük ekler JSON'a girmez.
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => onChange(JSON.stringify({ elements: elements.filter((e) => !e.isDeleted) })), 400);
        }}
      />
    </div>
  );
}
