"use client";
// motion-primitives fikirlerinden özgün, küçük hareket bileşenleri (Motion ile): kelime kelime beliren metin,
// yaylı sayı sayacı ve görünür olunca açılan bölüm. Hepsi azaltılmış hareket tercihinde düz içerik gösterir.
import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, m, useInView } from "motion/react";
import { useClubReducedMotion } from "./MotionProvider";

// Metni kelime kelime (ya da harf harf) blur + yukarı kaymayla açar; ekran okuyucu metni tek parça okur.
export function TextEffect({ children, per = "word", delay = 0, className, as: Tag = "span", trigger = 0 }: { children: string; per?: "word" | "char"; delay?: number; className?: string; as?: "span" | "h1" | "h2" | "p"; trigger?: string | number }) {
  const reduced = useClubReducedMotion();
  if (reduced) return <Tag className={className}>{children}</Tag>;
  const parts = per === "word" ? children.split(/(\s+)/) : Array.from(children);
  return (
    <Tag className={className} aria-label={children}>
      {parts.map((p, i) => (/^\s+$/.test(p) ? p : (
        <m.span key={`${trigger}-${i}`} aria-hidden style={{ display: "inline-block", whiteSpace: "pre" }}
          initial={{ opacity: 0, y: "0.35em", filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: delay + i * (per === "word" ? 0.045 : 0.018), duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>{p}</m.span>
      )))}
    </Tag>
  );
}

// Değer değiştikçe yaylı biçimde sayar (ör. XP, tamamlanan ders). Ekran okuyucu son değeri okur.
export function AnimatedNumber({ value, className, format = (n) => Math.round(n).toLocaleString("tr-TR") }: { value: number; className?: string; format?: (n: number) => string }) {
  const reduced = useClubReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) { el.textContent = format(value); return; }
    const c = animate(from.current, value, { type: "spring", stiffness: 90, damping: 20, onUpdate: (v) => { el.textContent = format(v); } });
    from.current = value;
    return () => c.stop();
  }, [value, reduced, format]);
  return <span ref={ref} className={className} aria-label={format(value)}>{format(reduced ? value : 0)}</span>;
}

// Görünür alana girince bir kez yumuşakça açılır.
export function InView({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = useClubReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (reduced || !mounted) return <div ref={ref} className={className}>{children}</div>;
  return (
    <m.div ref={ref} className={className} initial={{ opacity: 0, y: 18 }} animate={seen ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </m.div>
  );
}
