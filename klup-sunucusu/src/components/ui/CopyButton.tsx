"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useMessages } from "@/components/providers";

export function CopyButton({ value, className = "btn btn-sm" }: { value: string; className?: string }) {
  const m = useMessages();
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          /* pano izni yok: kullanıcı elle seçebilir */
        }
      }}
    >
      {done ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
      {done ? m.common.copied : m.common.copy}
    </button>
  );
}
