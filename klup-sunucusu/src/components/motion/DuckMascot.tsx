"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Duck, type DuckPose } from "@/components/ui/Duck";
import { useClubReducedMotion } from "./MotionProvider";

const RiveDuck = dynamic(() => import("./RiveDuck"), { ssr: false });

export function DuckMascot({ pose = "wave", size = 64, label, eventId }: {
  pose?: DuckPose | "level" | "streak" | "encourage"; size?: number; label?: string; eventId?: string;
}) {
  const holder = useRef<HTMLSpanElement>(null);
  const reduced = useClubReducedMotion();
  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [consumed, setConsumed] = useState(false);
  useEffect(() => {
    const node = holder.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      const showing = entry?.isIntersecting ?? false;
      setVisible(showing);
      if (showing) setLoaded(true);
    }, { threshold: .1 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    setReady(false);
    setConsumed(false);
    if (!eventId) return;
    try { setConsumed(sessionStorage.getItem(`club:celebrated:${eventId}`) === "1"); } catch { /* static fallback remains available */ }
  }, [eventId]);
  const active = !reduced && !failed && !consumed;
  const fallbackPose = pose === "level" || pose === "streak" ? "cheer" : pose === "encourage" ? "wave" : pose;
  return <span ref={holder} className="duck-mascot" style={{ width: size, height: size }} data-ready={ready && active} data-animation-state={failed ? "fallback" : reduced || consumed ? "static" : ready ? "ready" : "loading"} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
    <Duck pose={fallbackPose} size={size} />
    {active && loaded && <RiveDuck pose={pose} visible={visible} onReady={() => setReady(true)} onError={() => { setFailed(true); setReady(false); }} onPlayed={() => {
      if (eventId) { try { sessionStorage.setItem(`club:celebrated:${eventId}`, "1"); } catch { /* optional storage */ } }
    }} />}
  </span>;
}
