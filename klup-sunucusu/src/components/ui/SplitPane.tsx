"use client";
// Bölünebilir çalışma alanı: sürükleyerek ya da ayırıcıya odaklanıp ok tuşlarıyla genişlik ayarlanır.
// Dar ekranda (≤860px) iki bölüm sekmelere dönüşür.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Tabs } from "./Tabs";
import { useT } from "@/i18n/client";

export function SplitPane({ left, right, leftLabel, rightLabel, storageKey, initial = 55 }: { left: ReactNode; right: ReactNode; leftLabel: string; rightLabel: string; storageKey?: string; initial?: number }) {
  const t = useT();
  const [pct, setPct] = useState(initial);
  const [narrow, setNarrow] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    try { const v = storageKey ? Number(localStorage.getItem(storageKey)) : 0; if (v >= 25 && v <= 75) setPct(v); } catch { /* depolama kapalı */ }
    return () => mq.removeEventListener("change", sync);
  }, [storageKey]);
  useEffect(() => { try { if (storageKey) localStorage.setItem(storageKey, String(pct)); } catch { /* depolama kapalı */ } }, [pct, storageKey]);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (!drag.current || !box.current) return;
      const r = box.current.getBoundingClientRect();
      setPct(Math.min(75, Math.max(25, ((e.clientX - r.left) / r.width) * 100)));
    };
    const up = () => { drag.current = false; document.body.classList.remove("is-resizing"); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, []);
  if (narrow) return <Tabs label={t("Çalışma alanı")} tabs={[{ id: "l", label: leftLabel, content: left }, { id: "r", label: rightLabel, content: right }]} />;
  return (
    <div ref={box} className="split" style={{ gridTemplateColumns: `${pct}fr 10px ${100 - pct}fr` }}>
      <section aria-label={leftLabel} className="split-pane">{left}</section>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={t("Bölme genişliği")}
        aria-valuemin={25}
        aria-valuemax={75}
        aria-valuenow={Math.round(pct)}
        tabIndex={0}
        className="split-handle"
        onPointerDown={() => { drag.current = true; document.body.classList.add("is-resizing"); }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPct((p) => Math.max(25, p - 5));
          if (e.key === "ArrowRight") setPct((p) => Math.min(75, p + 5));
        }}
      />
      <section aria-label={rightLabel} className="split-pane">{right}</section>
    </div>
  );
}
