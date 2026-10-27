"use client";

// Adapted from ibelick/motion-primitives AnimatedBackground (MIT).
// See licenses/motion-primitives.txt and THIRD_PARTY_NOTICES.md.
// Controlled value avoids replacing tab click/key handlers and preserves form state.
import { useId, type ReactNode } from "react";
import { LayoutGroup, m } from "motion/react";
import { motionTokens } from "@/lib/motion-tokens";
import { useClubReducedMotion } from "./MotionProvider";

export function AnimatedBackgroundGroup({ children }: { children: ReactNode }) {
  const id = useId();
  return <LayoutGroup id={id}>{children}</LayoutGroup>;
}
export function AnimatedBackground({ selected }: { selected: boolean }) {
  const reduced = useClubReducedMotion();
  return selected ? <m.span aria-hidden className="tab-selection" layoutId={reduced ? undefined : "selected-background"}
    initial={false} transition={reduced ? { duration: 0 } : motionTokens.spring} data-animation-owner="motion-primitives" /> : null;
}
