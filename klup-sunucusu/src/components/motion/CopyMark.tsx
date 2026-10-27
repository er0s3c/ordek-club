"use client";
import { Copy } from "lucide-react";

export function CopyMark({ copied, size = 15 }: { copied: boolean; size?: number }) {
  // Native SVG/CSS avoids loading Motion's SVG feature bundle just for a 15px icon.
  // The shared motion policy disables this CSS animation too.
  return copied ? <svg key="copied" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path className="copy-check-path" d="m5 12 4 4L19 6" />
  </svg> : <Copy size={size} aria-hidden />;
}
