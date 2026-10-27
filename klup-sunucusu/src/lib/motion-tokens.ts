// Seconds, shared by Motion and the native dialog lifecycle.
export const motionTokens = {
  feedback: .12,
  menu: .2,
  panel: .3,
  exit: .17,
  layout: .26,
  ease: [.22, 1, .36, 1] as const,
  spring: { type: "spring" as const, stiffness: 420, damping: 38, mass: .8 },
};

export function reduceMotion(os: boolean, account: boolean, enabled = true) {
  return os || account || !enabled;
}

export function progressPercent(value: number, max: number) {
  return Number.isFinite(value) && Number.isFinite(max) && max > 0
    ? Math.min(100, Math.max(0, Math.round(value / max * 100))) : 0;
}
