"use client";
import { m } from "motion/react";
import { progressPercent, motionTokens } from "@/lib/motion-tokens";
import { useClubReducedMotion } from "./MotionProvider";

export function ProgressFill({ value, max = 100 }: { value: number; max?: number }) {
  const reduced = useClubReducedMotion();
  const width = `${progressPercent(value, max)}%`;
  return <m.span initial={false} style={{ width }} animate={{ width }} transition={{ duration: reduced ? 0 : .45, ease: motionTokens.ease }} data-motion-fill />;
}
