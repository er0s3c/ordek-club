"use client";

import type { CodeAnimation } from "@/animations/types";
import { ShikiCode } from "./ShikiCode";

// Panelde dil belirtilmemişse içerikten tahmin (yalnız renklendirme içindir; yanlış tahmin yalnız rengi etkiler).
const guessLang = (lines: string[]) => {
  const t = lines.join("\n");
  if (/\bSELECT\b|\bWHERE\b/i.test(t)) return "sql";
  if (/\bdef |^import |print\(/m.test(t)) return "python";
  if (/<\/?[a-z]+[ >]/i.test(t)) return "html";
  if (/\bconst |\blet |=>|function /.test(t)) return "javascript";
  return "text";
};

export function CodeAnimationView({ def, step }: { def: CodeAnimation; step: number }) {
  const k = Math.min(Math.max(0, step), def.steps.length);
  const current = k > 0 ? def.steps[k - 1] : undefined;
  // Her panelin şimdiye kadarki en son çıktısı
  const outputs = new Map<number, NonNullable<(typeof def.steps)[number]["output"]>>();
  for (const st of def.steps.slice(0, k)) if (st.output) outputs.set(st.output.panel, st.output);

  return (
    <figure className="anim" aria-label={def.title}>
      <div className="code-anim" style={{ gridTemplateColumns: `repeat(${def.panels.length}, minmax(0, 1fr))` }}>
        {def.panels.map((p, pi) => {
          // Adım tanımındaki satırlar 0 tabanlı; görünümde 1 tabanlı vurgu.
          const hl = new Set((current?.highlight.find((h) => h.panel === pi)?.lines ?? []).map((l) => l + 1));
          const out = outputs.get(pi);
          return (
            <div key={pi} className={`code-panel code-panel-${p.tone}`}>
              <div className="code-panel-h">{p.label}</div>
              <ShikiCode code={p.lines.join("\n")} lang={p.lang ?? guessLang(p.lines)} highlight={hl} className="code-lines" />
              {out && <div className={`code-out code-out-${out.tone}`}>{out.text}</div>}
            </div>
          );
        })}
      </div>
      <figcaption className="anim-note" aria-live="polite">
        <span className="anim-step mono">{k}/{def.steps.length}</span>
        <span>{current ? current.note : def.summary}</span>
      </figcaption>
    </figure>
  );
}
