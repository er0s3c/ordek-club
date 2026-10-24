// Kulübün saat dilimine göre gün ve ay hesapları (aylık liderlik ve öğrenme serileri için).
// Saf fonksiyonlar; yaz saati geçişleri dahil her IANA saat dilimiyle doğru çalışır.

function zonedParts(d: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get("year"), m: get("month"), d: get("day"), h: get("hour"), min: get("minute"), s: get("second") };
}

// Saat diliminin verilen andaki UTC farkı (ms).
function offsetMs(at: number, timeZone: string): number {
  const p = zonedParts(new Date(at), timeZone);
  return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, p.s) - Math.floor(at / 1000) * 1000;
}

// Saat dilimindeki yerel saatin UTC karşılığı.
export function zonedToUtc(y: number, m: number, d: number, timeZone: string): Date {
  const guess = Date.UTC(y, m - 1, d);
  let t = guess - offsetMs(guess, timeZone);
  t = guess - offsetMs(t, timeZone);
  return new Date(t);
}

const pad = (n: number) => String(n).padStart(2, "0");

export const dayKey = (d: Date, timeZone: string) => {
  const p = zonedParts(d, timeZone);
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
};

export const periodOf = (d: Date, timeZone: string) => dayKey(d, timeZone).slice(0, 7);

export const isPeriod = (s: string) => /^\d{4}-(0[1-9]|1[0-2])$/.test(s);

export function shiftPeriod(period: string, months: number): string {
  const [y, m] = period.split("-").map(Number) as [number, number];
  const idx = y * 12 + (m - 1) + months;
  return `${Math.floor(idx / 12)}-${pad((idx % 12) + 1)}`;
}

// [başlangıç, bitiş) — kulüp saat diliminde ayın ilk anından sonraki ayın ilk anına.
export function monthRange(period: string, timeZone: string): { start: Date; end: Date } {
  const [y, m] = period.split("-").map(Number) as [number, number];
  const next = shiftPeriod(period, 1).split("-").map(Number) as [number, number];
  return { start: zonedToUtc(y, m, 1, timeZone), end: zonedToUtc(next[0], next[1], 1, timeZone) };
}

export function periodLabel(period: string): string {
  const [y, m] = period.split("-").map(Number) as [number, number];
  return new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 15)));
}

// Günlük seri: ardışık günler (YYYY-MM-DD, artan sırada olmak zorunda değil).
export function streaks(days: string[], today: string): { current: number; longest: number } {
  const set = new Set(days);
  const toNum = (k: string) => Date.UTC(Number(k.slice(0, 4)), Number(k.slice(5, 7)) - 1, Number(k.slice(8, 10))) / 86_400_000;
  const nums = [...set].map(toNum).sort((a, b) => a - b);
  let longest = 0;
  let run = 0;
  for (let i = 0; i < nums.length; i++) {
    run = i > 0 && nums[i]! - nums[i - 1]! === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }
  // Bugün henüz çalışılmadıysa seri dünden itibaren sayılır (gün bitmeden kırılmış sayılmaz).
  const t = toNum(today);
  let cursor = set.has(today) ? t : t - 1;
  let current = 0;
  const numSet = new Set(nums);
  while (numSet.has(cursor)) {
    current++;
    cursor--;
  }
  return { current, longest };
}
