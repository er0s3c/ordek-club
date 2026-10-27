"use client";

// Adapted from Animate UI's primitives/radix/accordion keepRendered content.
// Copyright (c) 2025 Elliot Sutton. MIT + Commons Clause: licenses/animate-ui.txt.
// Local adaptation uses the individual Radix package, no Tailwind/masking, and inert
// closed content so forms stay mounted without leaving hidden controls tabbable.
import * as Accordion from "@radix-ui/react-accordion";
import { useState, type ReactNode } from "react";
import { m } from "motion/react";
import { ChevronDown } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";
import { useClubReducedMotion } from "./MotionProvider";

export function ModuleAccordion({ title, children, defaultOpen = false, className = "card", headingLevel = 3 }: {
  title: ReactNode; children: ReactNode; defaultOpen?: boolean; className?: string; headingLevel?: 2 | 3 | 4;
}) {
  const [value, setValue] = useState(defaultOpen ? "content" : "");
  const open = value === "content";
  const reduced = useClubReducedMotion();
  return <Accordion.Root type="single" collapsible value={value} onValueChange={setValue} className={className} data-animation-owner="animate-ui">
    <Accordion.Item value="content" className="module-accordion">
      <Accordion.Header asChild>{headingLevel === 2 ? <h2><Trigger>{title}</Trigger></h2> : headingLevel === 4 ? <h4><Trigger>{title}</Trigger></h4> : <h3><Trigger>{title}</Trigger></h3>}</Accordion.Header>
      <Accordion.Content forceMount asChild>
        <m.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : motionTokens.layout, ease: motionTokens.ease }}
          aria-hidden={!open} inert={!open} className="module-accordion-content">
          <div className="module-accordion-body">{children}</div>
        </m.div>
      </Accordion.Content>
    </Accordion.Item>
  </Accordion.Root>;
}
function Trigger({ children }: { children: ReactNode }) {
  return <Accordion.Trigger className="module-accordion-trigger"><span>{children}</span><ChevronDown size={17} aria-hidden /></Accordion.Trigger>;
}
