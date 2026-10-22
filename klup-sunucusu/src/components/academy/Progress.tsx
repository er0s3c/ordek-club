// Basit ilerleme çubuğu (ekran okuyucu için değerleriyle).
export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} aria-valuetext={`${value}/${max} (%${pct})`}>
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}
