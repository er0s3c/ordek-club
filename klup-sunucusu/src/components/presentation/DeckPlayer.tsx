"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, MonitorPlay, RotateCcw, Timer } from "lucide-react";
import type { ClientDeck } from "@/lib/deck-schema";
import { SlideView, useReducedMotion } from "./SlideView";
import { useSlideMorph } from "./slide-morph";
import { useT } from "@/i18n/client";

export type Position = { slide: number; step: number };

export function nextPos(deck: ClientDeck, p: Position): Position {
  const steps = deck.slides[p.slide]?.steps ?? 1;
  if (p.step < steps - 1) return { slide: p.slide, step: p.step + 1 };
  if (p.slide < deck.slides.length - 1) return { slide: p.slide + 1, step: 0 };
  return p;
}

export function prevPos(deck: ClientDeck, p: Position): Position {
  if (p.step > 0) return { slide: p.slide, step: p.step - 1 };
  if (p.slide > 0) return { slide: p.slide - 1, step: (deck.slides[p.slide - 1]?.steps ?? 1) - 1 };
  return p;
}

// Yerel kontrollü oynatıcı: önizleme ve (Faz 3'te) bireysel öğrenme modu. Kontrol kullanıcıdadır.
export function DeckPlayer({ deck, showNotes = false, onPosition }: { deck: ClientDeck; showNotes?: boolean; onPosition?: (p: Position) => void }) {
  const tl = useT();
  const [pos, setPos] = useState<Position>({ slide: 0, step: 0 });
  const [key, setKey] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const slide = deck.slides[pos.slide];
  const reducedMotion = useReducedMotion();
  // Slaytlar arası otomatik geçiş (reveal.js auto-animate): ortak öğeler yeni yerine kayar.
  const capture = useSlideMorph(stage, slide, reducedMotion);
  // Sunucu görünümü (Slidev/reveal tarzı): sıradaki slayt, geçen süre, saat ve notlar.
  const [presenter, setPresenter] = useState(false);
  const [started] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { if (!presenter) return; const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, [presenter]);

  const go = useCallback((p: Position) => {
    if (p.slide !== pos.slide) capture();
    setPos(p);
    setKey((k) => k + 1);
    onPosition?.(p);
  }, [onPosition, pos.slide, capture]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); go(nextPos(deck, pos)); }
      if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(prevPos(deck, pos)); }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [deck, pos, go]);

  if (!slide) return null;
  const total = deck.slides.length;
  const pct = ((pos.slide + (pos.step + 1) / slide.steps) / total) * 100;

  return (
    <div className="player" ref={wrap} tabIndex={0} aria-label={tl("Sunum oynatıcı (ok tuşlarıyla gezin)")}>
      <div className="stage-wrap" ref={stage}>
        <SlideView slide={slide} step={pos.step} stepKey={key} />
      </div>
      <div className="player-progress" aria-hidden><span style={{ width: `${pct}%` }} /></div>
      <div className="player-bar">
        <div className="row">
          <button className="btn btn-sm" onClick={() => go(prevPos(deck, pos))} disabled={pos.slide === 0 && pos.step === 0} aria-label={tl("Geri")}><ChevronLeft size={16} aria-hidden /></button>
          <button className="btn btn-sm btn-primary" onClick={() => go(nextPos(deck, pos))} disabled={pos.slide === total - 1 && pos.step === slide.steps - 1} aria-label={tl("İleri")}><ChevronRight size={16} aria-hidden />{" "}{tl("İleri")}</button>
          <button className="btn btn-sm btn-ghost" onClick={() => setKey((k) => k + 1)} aria-label={tl("Animasyonu yeniden oynat")}><RotateCcw size={15} aria-hidden /></button>
        </div>
        <span className="small muted mono">{tl("Slayt {v0}/{total} · adım {v1}/{steps}", { v0: pos.slide + 1, total, v1: pos.step + 1, steps: slide.steps })}</span>
        <div className="row">
          <label className="sr-only" htmlFor="slide-jump">{tl("Slayta git")}</label>
          <select id="slide-jump" className="select" style={{ height: 30, padding: "2px 30px 2px 8px", width: 220 }} value={pos.slide} onChange={(e) => go({ slide: Number(e.target.value), step: 0 })}>
            {deck.slides.map((s, i) => <option key={s.id} value={i}>{i + 1}. {s.title}</option>)}
          </select>
          {showNotes && <button className="btn btn-sm btn-ghost" aria-pressed={presenter} onClick={() => setPresenter((v) => !v)} aria-label={tl("Sunucu görünümü")}><MonitorPlay size={15} aria-hidden /></button>}
          <button className="btn btn-sm btn-ghost" onClick={() => wrap.current?.querySelector(".stage")?.requestFullscreen?.()} aria-label={tl("Tam ekran")}><Maximize2 size={15} aria-hidden /></button>
        </div>
      </div>
      {showNotes && presenter && (
        <div className="presenter">
          <div className="stack-sm">
            <div className="tiny faint">{tl("SIRADAKİ")}</div>
            {deck.slides[pos.slide + 1] ? <div className="presenter-next"><SlideView slide={deck.slides[pos.slide + 1]!} step={0} /></div> : <div className="small muted">{tl("Son slayt.")}</div>}
          </div>
          <div className="presenter-clock" role="timer" aria-live="off">
            <Timer size={16} aria-hidden /> <span className="mono">{new Date(now - started).toISOString().slice(11, 19)}</span>
            <span className="tiny faint mono">{new Date(now).toLocaleTimeString(tl.intl, { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      )}
      {showNotes && (
        <div>
          <div className="tiny faint" style={{ marginBottom: 4 }}>{tl("EĞİTMEN NOTLARI (öğrencilere gösterilmez)")}</div>
          <div className="notes">{slide.notes || tl("— not yok —")}</div>
        </div>
      )}
    </div>
  );
}
