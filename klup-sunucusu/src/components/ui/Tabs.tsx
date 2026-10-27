"use client";
// Erişilebilir sekmeler: ok tuşlarıyla gezinme, yalnız seçili panel odaklanabilir.
import { useId, useState, type ReactNode, type KeyboardEvent } from "react";
import { AnimatedBackground, AnimatedBackgroundGroup } from "@/components/motion/AnimatedBackground";

export function Tabs({ tabs, initial, label, value, onValueChange }: { tabs: { id: string; label: ReactNode; content: ReactNode }[]; initial?: string; label: string; value?: string; onValueChange?: (value: string) => void }) {
  const [local, setLocal] = useState(initial ?? tabs[0]?.id);
  const active = value ?? local;
  function setActive(id: string) { setLocal(id); onValueChange?.(id); }
  const base = useId();
  function onKey(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : null;
    if (next === null) return;
    e.preventDefault();
    const t = tabs[(next + tabs.length) % tabs.length]!;
    setActive(t.id);
    document.getElementById(`${base}-t-${t.id}`)?.focus();
  }
  return (
    <div className="tabs">
      <AnimatedBackgroundGroup><div role="tablist" aria-label={label} className="tabs-list">
        {tabs.map((t, i) => (
          <button key={t.id} id={`${base}-t-${t.id}`} type="button" role="tab" aria-selected={active === t.id} aria-controls={`${base}-p-${t.id}`} tabIndex={active === t.id ? 0 : -1} className="tabs-tab" onClick={() => setActive(t.id)} onKeyDown={(e) => onKey(e, i)}>
            <AnimatedBackground selected={active === t.id} /><span className="tabs-tab-label">{t.label}</span>
          </button>
        ))}
      </div></AnimatedBackgroundGroup>
      {tabs.map((t) => (
        <div key={t.id} id={`${base}-p-${t.id}`} role="tabpanel" aria-labelledby={`${base}-t-${t.id}`} hidden={active !== t.id} className="tabs-panel" tabIndex={0}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
