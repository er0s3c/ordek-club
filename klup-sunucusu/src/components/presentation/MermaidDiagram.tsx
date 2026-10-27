"use client";
// Mermaid diyagramı: metinden sıra/akış/durum diyagramı. securityLevel "strict" (etiketlerde HTML yok,
// tıklama/JS yok; çıktı DOMPurify'dan geçer). SVG, React prop'u yerine ayrıştırılıp DOM düğümü olarak eklenir.
// step verilirse sıra diyagramında mesajlar adım adım görünür.
import { useEffect, useId, useRef, useState } from "react";
import { useT } from "@/i18n/client";

let ready: Promise<typeof import("mermaid").default> | null = null;
function loadMermaid() {
  ready ??= import("mermaid").then(({ default: m }) => {
    m.initialize({ startOnLoad: false, securityLevel: "strict", theme: "dark", fontFamily: "Readex Pro, Arial, sans-serif", themeVariables: { primaryColor: "#2a1c4f", primaryBorderColor: "#5c1fe2", lineColor: "#c9b6ff", textColor: "#fffcf2" } });
    return m;
  });
  return ready;
}

export function MermaidDiagram({ source, step, className }: { source: string; step?: number; className?: string }) {
  const t = useT();
  const host = useRef<HTMLDivElement>(null);
  const id = useId().replace(/[^a-z0-9]/gi, "");
  const [err, setErr] = useState("");
  useEffect(() => {
    let live = true;
    void loadMermaid()
      .then((m) => m.render(`mmd-${id}`, source))
      .then(({ svg }) => {
        if (!live || !host.current) return;
        const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
        const el = doc.documentElement;
        el.setAttribute("role", "img");
        el.removeAttribute("style");
        host.current.replaceChildren(document.importNode(el, true));
        setErr("");
      })
      .catch((e: Error) => { if (live) setErr(e.message.split("\n")[0] ?? t("Diyagram çizilemedi.")); });
    return () => { live = false; };
  }, [source, id, t]);
  // Adım adım açılım: sıra diyagramındaki mesaj okları ve metinleri sırayla görünür.
  useEffect(() => {
    if (step === undefined || !host.current) return;
    const show = (els: NodeListOf<SVGElement>) => els.forEach((m, i) => { m.style.transition = "opacity .35s ease"; m.style.opacity = i < step ? "1" : "0.08"; });
    show(host.current.querySelectorAll<SVGElement>(".messageLine0, .messageLine1"));
    show(host.current.querySelectorAll<SVGElement>(".messageText"));
  });
  return (
    <figure className={`mermaid-figure ${className ?? ""}`}>
      <div ref={host} className="mermaid-host" />
      {err && <figcaption className="small" role="alert">{t("Diyagram çizilemedi: {err}", { err })}</figcaption>}
    </figure>
  );
}
