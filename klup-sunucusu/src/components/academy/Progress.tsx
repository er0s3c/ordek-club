// Basit ilerleme çubuğu (ekran okuyucu için değerleriyle).
import { ProgressFill } from "@/components/motion/ProgressFill";
import { progressPercent } from "@/lib/motion-tokens";
export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = progressPercent(value, max);
  return (
    <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={`${value}/${max} (%${pct})`}>
      <ProgressFill value={value} max={max} />
    </div>
  );
}
