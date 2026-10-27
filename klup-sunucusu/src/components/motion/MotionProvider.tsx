"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { LazyMotion, MotionConfig } from "motion/react";
import { motionTokens, reduceMotion } from "@/lib/motion-tokens";

const Reduced = createContext(true);
const enabled = process.env.NEXT_PUBLIC_MOTION_ENABLED !== "false";
const features = () => import("./features").then(module => module.default);

function subscribe(notify: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const observer = new MutationObserver(notify);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
  media.addEventListener("change", notify);
  return () => { observer.disconnect(); media.removeEventListener("change", notify); };
}
function snapshot() {
  return reduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    document.documentElement.dataset.motion === "reduce", enabled);
}

export const useClubReducedMotion = () => useContext(Reduced);

export function MotionProvider({ children }: { children: ReactNode }) {
  // Static server render; subscribe before allowing any animation on the client.
  const reduced = useSyncExternalStore(subscribe, snapshot, () => true);
  useEffect(() => {
    document.documentElement.dataset.motionPolicy = reduced ? "reduce" : "full";
    return () => { delete document.documentElement.dataset.motionPolicy; };
  }, [reduced]);
  return <Reduced.Provider value={reduced}>
    <LazyMotion features={features} strict>
      <MotionConfig reducedMotion={reduced ? "always" : "user"} transition={{ duration: reduced ? 0 : motionTokens.menu, ease: motionTokens.ease }}>
        {children}
      </MotionConfig>
    </LazyMotion>
  </Reduced.Provider>;
}
