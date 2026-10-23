import type { LevelInfo } from "@/server/xp/engine";

export function LevelChip({ level }: { level: Pick<LevelInfo, "number" | "title"> }) {
  return (
    <span className="level-chip" title={`Seviye ${level.number}`}>
      <span className="level-no">{level.number}</span>
      {level.title}
    </span>
  );
}

// Seviye ve sonraki seviyeye kalan XP (profil ve ana panel).
export function LevelBar({ level, total }: { level: LevelInfo; total: number }) {
  return (
    <div className="stack-sm">
      <div className="row-between">
        <LevelChip level={level} />
        <span className="tiny faint mono">{total.toLocaleString("tr-TR")} XP</span>
      </div>
      <div className="progress" role="progressbar" aria-label="Sonraki seviyeye ilerleme" aria-valuemin={0} aria-valuemax={100} aria-valuenow={level.progressPct}>
        <span style={{ width: `${level.progressPct}%` }} />
      </div>
      <div className="tiny faint">
        {level.next ? <>Seviye {level.next.number} ({level.next.title}) için <strong>{level.toNext.toLocaleString("tr-TR")} XP</strong> kaldı</> : "En üst seviyedesin."}
      </div>
    </div>
  );
}
