"use client";

import type { CodeAnimation } from "@/animations/types";

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
          const hl = new Set(current?.highlight.find((h) => h.panel === pi)?.lines ?? []);
          const out = outputs.get(pi);
          return (
            <div key={pi} className={`code-panel code-panel-${p.tone}`}>
              <div className="code-panel-h">{p.label}</div>
              <pre className="code-lines">
                {p.lines.map((line, li) => (
                  <div key={li} className={hl.has(li) ? "code-line is-hl" : "code-line"}>
                    <span className="ln" aria-hidden>{li + 1}</span>
                    <code>{line}</code>
                  </div>
                ))}
              </pre>
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
