"use client";
import { m, useIsPresent } from "motion/react";
import type { ReactNode } from "react";
import { useClubReducedMotion } from "./MotionProvider";
import { motionTokens } from "@/lib/motion-tokens";
import { useT } from "@/i18n/client";

export function HeaderPopup({ id, className, children, mobile = false }: { id: string; className: string; children: ReactNode; mobile?: boolean }) {
  const t = useT();
  const reduced = useClubReducedMotion();
  const present = useIsPresent();
  const props = {
    id, className, children, inert: !present, "aria-hidden": !present || undefined,
    "data-motion-menu": true, "data-header-popup": mobile ? undefined : true,
    initial: reduced ? false as const : { opacity: 0, y: -6, scale: .985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: reduced ? 1 : 0, y: reduced ? 0 : -4, scale: reduced ? 1 : .99 },
    transition: { duration: reduced ? 0 : present ? motionTokens.menu : motionTokens.exit, ease: motionTokens.ease },
  };
  return mobile ? <m.nav {...props} aria-label={t("Menü")} /> : <m.div {...props} />;
}
