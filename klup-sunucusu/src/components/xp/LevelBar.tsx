import type { LevelInfo } from "@/server/xp/engine";
import { ProgressFill } from "@/components/motion/ProgressFill";
import { getT } from "@/i18n/server";

export async function LevelChip({ level }: { level: Pick<LevelInfo, "number" | "title"> }) {
  const t = await getT();
  return (
    <span className="level-chip" title={t("Seviye {number}", { number: level.number })}>
      <span className="level-no">{level.number}</span>
      {t(level.title)}
    </span>
  );
}

// Seviye ve sonraki seviyeye kalan XP (profil ve ana panel).
export async function LevelBar({ level, total }: { level: LevelInfo; total: number }) {
  const t = await getT();
  return (
    <div className="stack-sm">
      <div className="row-between">
        <LevelChip level={level} />
        <span className="tiny faint mono">{total.toLocaleString(t.intl)} XP</span>
      </div>
      <div className="progress" role="progressbar" aria-label={t("Sonraki seviyeye ilerleme")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={level.progressPct}>
        <ProgressFill value={level.progressPct} />
      </div>
      <div className="tiny faint">
        {level.next ? <>{t("Seviye {number} ({title}) için", { number: level.next.number, title: t(level.next.title) })}{" "}<strong>{level.toNext.toLocaleString(t.intl)} XP</strong>{" "}{t("kaldı")}</> : t("En üst seviyedesin.")}
      </div>
    </div>
  );
}
