// Tarih/sayı biçimlendirme — kulübün saat dilimine göre (sunucu ve istemcide aynı sonuç).
// intl: çevirmenin dili (t.intl); verilmezse Türkçe.
export function formatDateTime(d: Date | string | null | undefined, timeZone = "Europe/Istanbul", intl = "tr-TR"): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat(intl, { dateStyle: "medium", timeStyle: "short", timeZone }).format(new Date(d));
}

export function formatDate(d: Date | string | null | undefined, timeZone = "Europe/Istanbul", intl = "tr-TR"): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat(intl, { dateStyle: "medium", timeZone }).format(new Date(d));
}

export function formatBytes(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toLocaleUpperCase("tr"))
    .join("") || "?";
