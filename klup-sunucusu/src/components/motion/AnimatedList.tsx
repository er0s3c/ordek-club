"use client";

import { useEffect, type HTMLAttributes } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useClubReducedMotion } from "./MotionProvider";

// AutoAnimate alone owns layout in this container. Keep stable keys on children.
export function AnimatedList({ children, as: Tag = "div", ...props }: HTMLAttributes<HTMLElement> & { as?: "div" | "ul" | "ol" }) {
  const reduced = useClubReducedMotion();
  const [parent, enable] = useAutoAnimate<HTMLElement>({ duration: 240, easing: "cubic-bezier(.22,1,.36,1)" });
  useEffect(() => { enable(!reduced); }, [reduced, enable]);
  return <Tag ref={parent} data-animation-owner="auto-animate" {...props}>{children}</Tag>;
}
