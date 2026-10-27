// Ördek maskotu: yalnız ilk görev, önemli başarı ve boş ekranlarda; ders metninde kullanılmaz.
// Özgün, düz SVG; renkler tasarım belirteçlerinden gelir.
export type DuckPose = "wave" | "cheer" | "search" | "sleep";

export function Duck({ pose = "wave", size = 64, label }: { pose?: DuckPose; size?: number; label?: string }) {
  return (
    <svg className={`duck duck-${pose}`} width={size} height={size} viewBox="0 0 64 64" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <ellipse cx="32" cy="58" rx="18" ry="3" fill="var(--line)" />
      <path d="M14 40c0-10 8-16 18-16 3 0 5-6 3-10-1-3 1-8 7-8 7 0 10 6 9 12-1 4-3 6-3 9 6 3 8 8 8 13 0 9-9 14-21 14S14 49 14 40z" fill="var(--duck-body, #ffd34d)" stroke="var(--ciu-ink)" strokeWidth="2" strokeLinejoin="round" />
      <path d="M50 16l9 2-9 4z" fill="var(--duck-beak, #ff9b3d)" stroke="var(--ciu-ink)" strokeWidth="2" strokeLinejoin="round" />
      {pose === "sleep" ? <path d="M42 13q2 2 4 0" stroke="var(--ciu-ink)" strokeWidth="2" fill="none" strokeLinecap="round" /> : <circle cx="44" cy="13" r="2.4" fill="var(--ciu-ink)" />}
      {pose === "wave" && <path d="M22 36q-8-6-6-14" stroke="var(--ciu-ink)" strokeWidth="2.5" fill="none" strokeLinecap="round" className="duck-wing" />}
      {pose === "cheer" && <><path d="M20 34q-6-10 0-16M44 34q6-8 4-14" stroke="var(--ciu-ink)" strokeWidth="2.5" fill="none" strokeLinecap="round" /><path d="M10 8l2 4M6 16l4 1M54 4l-1 4" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" /></>}
      {pose === "search" && <><circle cx="20" cy="30" r="6" fill="var(--bg-1)" stroke="var(--ciu-ink)" strokeWidth="2" /><path d="M24 34l5 5" stroke="var(--ciu-ink)" strokeWidth="2.5" strokeLinecap="round" /></>}
      {pose === "sleep" && <text x="52" y="8" fontSize="9" fill="var(--accent)" fontFamily="var(--font-sans)">z</text>}
      <path d="M26 42q8 6 18 0" stroke="var(--ciu-ink)" strokeWidth="2" fill="none" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}
