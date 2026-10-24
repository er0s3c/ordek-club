"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Info, AlertTriangle, CheckCircle2, ShieldAlert, FlaskConical, Paperclip, ShieldCheck } from "lucide-react";
import { getAnimation } from "@/animations/registry";
import { blockSteps, type Block, type ClientSlide } from "@/lib/deck-schema";
import { FlowAnimationView } from "./FlowAnimationView";
import { Terminal } from "@/components/ui/Terminal";
import type { TermLine } from "@/components/ui/terminal-parse";
import { CodeAnimationView } from "./CodeAnimationView";

export { useReducedMotion };

const CALLOUT_ICON = { info: Info, warn: AlertTriangle, success: CheckCircle2, danger: ShieldAlert };

// Tüm içerik React metni olarak çizilir: HTML/Markdown yorumlanmaz (XSS yüzeyi yok).
function BlockView({ block, step, speed, reducedMotion, stepKey }: { block: Block; step: number; speed: number; reducedMotion: boolean; stepKey: string | number }) {
  const s = Math.min(step, blockSteps(block) - 1);
  switch (block.type) {
    case "heading":
      return block.level === 1 ? <h2 className="blk-h1">{block.text}</h2> : <h3 className="blk-h2">{block.text}</h3>;
    case "text":
      return <div className="blk-text">{block.text}</div>;
    case "bullets":
      return (
        <ul className="blk-bullets">
          {block.items.map((it, i) => {
            const shown = !block.reveal || i <= s;
            return (
              <li key={i} className={shown ? "is-shown" : "is-hidden"} aria-hidden={!shown}>
                {it}
              </li>
            );
          })}
        </ul>
      );
    case "code": {
      const hl = new Set(s > 0 ? block.highlightSteps[s - 1] ?? [] : []);
      return (
        <pre className="blk-code" data-lang={block.language || undefined}>
          {block.code.split("\n").map((line, i) => (
            <div key={i} className={hl.has(i + 1) ? "code-line is-hl" : "code-line"}>
              <span className="ln" aria-hidden>{i + 1}</span>
              <code>{line}</code>
            </div>
          ))}
        </pre>
      );
    }
    case "terminal": {
      const visible = block.reveal ? block.lines.slice(0, s + 1) : block.lines;
      const lines: TermLine[] = visible.flatMap((l, i) => {
        const isNew = block.reveal && i === visible.length - 1;
        return [
          ...(l.cmd !== undefined ? [{ kind: "cmd" as const, text: l.cmd, symbol: "$", isNew }] : []),
          ...(l.out ? l.out.split("\n").map((text) => ({ kind: "out" as const, text, isNew })) : []),
        ];
      });
      return <Terminal className="ciu-terminal--slide" lines={lines} />;
    }
    case "callout": {
      const Icon = CALLOUT_ICON[block.tone];
      return (
        <div className={`blk-callout blk-callout-${block.tone}`}>
          <Icon size={18} aria-hidden />
          <span>{block.text}</span>
        </div>
      );
    }
    case "animation": {
      const def = getAnimation(block.animation);
      if (!def) return <div className="blk-callout blk-callout-warn">Bilinmeyen animasyon: {block.animation}</div>;
      return def.kind === "flow"
        ? <FlowAnimationView def={def} step={s} speed={speed} reducedMotion={reducedMotion} stepKey={stepKey} />
        : <CodeAnimationView def={def} step={s} />;
    }
    case "image":
      if (!block.fileId) return <div className="blk-callout blk-callout-warn">Görsel seçilmedi.</div>;
      // Yetki kontrollü dosya rotası; yalnız içerikten doğrulanmış raster görseller satır içi sunulur.
      return (
        <figure className="blk-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/files/${encodeURIComponent(block.fileId)}?inline=1`} alt={block.alt} loading="lazy" />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case "mission":
      // Görev köprüsü: görev her öğrencinin kendi cihazında akademide çözülür (canlı akış görevle değişmez).
      // Önizleme ve projeksiyonda yalnız bilgi kartıdır; bağlantı yalnız açar, deneme kaydı üretmez.
      return (
        <section className="blk-practical blk-mission" aria-label="Mini görev">
          <div className="blk-practical-head">
            <ShieldCheck size={20} aria-hidden />
            <span className="blk-practical-tag">Mini görev · kendi cihazında · ≈3 dk</span>
          </div>
          <h3 className="blk-h2">{block.title || "Mini görev"}</h3>
          <div className="blk-text">Telefonundan ya da bilgisayarından aç: Akademi → görev. XP görevi çözünce verilir.</div>
          <a className="btn btn-primary blk-mission-cta" href={`/academy/lesson/${block.lesson}#gorev-${block.mission}`} target="_blank" rel="noopener">Görevi aç →</a>
        </section>
      );
    case "practical":
      // Yalnız öğrenciye açık kısım; `host` (VM, snapshot, beklenen sonuç) eğitmen konsolunda ayrı gösterilir.
      return (
        <section className="blk-practical" aria-label="Uygulama molası">
          <div className="blk-practical-head">
            <FlaskConical size={20} aria-hidden />
            <span className="blk-practical-tag">Uygulama molası · {block.durationMin} dk</span>
          </div>
          <h3 className="blk-h2">{block.title}</h3>
          {block.description && <div className="blk-text">{block.description}</div>}
          {block.steps.length > 0 && (
            <ol className="blk-practical-steps">
              {block.steps.map((st, i) => <li key={i}>{st}</li>)}
            </ol>
          )}
          {block.files.length > 0 && (
            <div className="blk-practical-files">
              <Paperclip size={14} aria-hidden /> {block.files.join(" · ")}
            </div>
          )}
        </section>
      );
  }
}

type Props = { slide: ClientSlide; step: number; speed?: number; stepKey?: string | number; className?: string };

// 16:9 sahne; yazı boyutu kapsayıcı genişliğine göre ölçeklenir (container query birimleri).
export function SlideView({ slide, step, speed = 1, stepKey = 0, className }: Props) {
  const reducedMotion = useReducedMotion();
  return (
    <div className={`stage ${className ?? ""}`}>
      <article className={`slide slide--${slide.layout}`} aria-roledescription="slayt" aria-label={slide.title}>
        <h1 className="slide-title">{slide.title}</h1>
        <div className="slide-body">
          {slide.blocks.map((b, i) => (
            <BlockView key={i} block={b} step={step} speed={speed} reducedMotion={reducedMotion} stepKey={stepKey} />
          ))}
        </div>
      </article>
    </div>
  );
}
