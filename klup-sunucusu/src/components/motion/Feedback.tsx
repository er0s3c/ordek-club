"use client";
import { m } from "motion/react";
import { type ReactNode } from "react";
import { useClubReducedMotion } from "./MotionProvider";

export function Feedback({ children, stateKey, className = "", alert = false }: { children: ReactNode; stateKey: string; className?: string; alert?: boolean }) {
  const reduced = useClubReducedMotion();
  return <m.div key={stateKey} initial={reduced ? false : { opacity: .5, y: 4 }} animate={{ opacity: 1, y: 0 }}
    transition={{ duration: reduced ? 0 : .18 }} role={alert ? "alert" : "status"} className={className}>{children}</m.div>;
}
