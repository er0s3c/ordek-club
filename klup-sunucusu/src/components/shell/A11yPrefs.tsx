"use client";
// Erişilebilirlik tercihlerini <html> özniteliklerine yansıtır (stiller ui.css'te).
import { useEffect } from "react";

export type A11y = { fontScale: number; lineHeight: string; readableFont: boolean; highContrast: boolean; reduceMotion: boolean };

export function applyA11y(p: A11y) {
  const h = document.documentElement;
  if (p.fontScale !== 100) { h.dataset.fontScale = String(p.fontScale); h.style.setProperty("--font-scale", String(p.fontScale / 100)); }
  else { delete h.dataset.fontScale; h.style.removeProperty("--font-scale"); }
  h.dataset.line = p.lineHeight;
  h.dataset.readable = String(p.readableFont);
  if (p.highContrast) h.dataset.contrast = "high"; else delete h.dataset.contrast;
  if (p.reduceMotion) h.dataset.motion = "reduce"; else delete h.dataset.motion;
}

export function A11yPrefs({ prefs }: { prefs: A11y | null }) {
  useEffect(() => { if (prefs) applyA11y(prefs); }, [prefs]);
  return null;
}
