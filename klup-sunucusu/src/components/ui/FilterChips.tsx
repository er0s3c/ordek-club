"use client";
// Seçili filtreler kaldırılabilir etiketler olarak üstte görünür.
import { X } from "lucide-react";
import { m } from "motion/react";
import { useClubReducedMotion } from "@/components/motion/MotionProvider";
import { useT } from "@/i18n/client";

export function FilterChips({ chips, onRemove, onClear }: { chips: { key: string; label: string }[]; onRemove: (key: string) => void; onClear?: () => void }) {
  const t = useT();
  const reduced = useClubReducedMotion();
  if (!chips.length) return null;
  return (
    <div className="chips" aria-label={t("Seçili filtreler")}>
      {chips.map((c) => (
        <m.button key={c.key} type="button" className="chip" whileTap={reduced ? undefined : { scale: .98 }} onClick={() => onRemove(c.key)} aria-label={t("{label} filtresini kaldır", { label: c.label })}>
          {c.label} <X size={12} aria-hidden />
        </m.button>
      ))}
      {onClear && chips.length > 1 && <button type="button" className="btn btn-ghost btn-sm" onClick={onClear}>{t("Tümünü temizle")}</button>}
    </div>
  );
}
