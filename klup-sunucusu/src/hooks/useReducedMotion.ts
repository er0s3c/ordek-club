"use client";

import { useClubReducedMotion } from "@/components/motion/MotionProvider";

// prefers-reduced-motion: azaltılmış harekette animasyonlar kapanır, sonuç anında görünür.
export function useReducedMotion(): boolean {
  return useClubReducedMotion();
}
