// Metin yardımcıları (istemci + sunucu): Türkçe katlama, okuma süresi, metin farkı ve benzerlik.

const FOLD: Record<string, string> = { ı: "i", İ: "i", ş: "s", ğ: "g", ü: "u", ö: "o", ç: "c", â: "a", î: "i", û: "u" };

// "Şifreleme", "sifreleme" ve "ŞİFRELEME" aynı arama anahtarına iner.
export function fold(s: string): string {
  return s.toLocaleLowerCase("tr").replace(/[ışğüöçâîûİ]/g, (c) => FOLD[c] ?? c).normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

export function matchScore(haystack: string, needle: string): number {
  const h = fold(haystack), n = fold(needle).trim();
  if (!n) return 0;
  if (h === n) return 100;
  if (h.startsWith(n)) return 80;
  const words = n.split(/\s+/).filter(Boolean);
  if (words.every((w) => h.includes(w))) return h.includes(n) ? 60 : 40;
  return 0;
}

// Okuma süresi: ~180 kelime/dk (öğrenme metni), etkinlik başına 2 dk.
export function readingMinutes(markdown: string, activities = 0): number {
  const words = markdown.replace(/```[\s\S]*?```/g, " kod ").replace(/[#>*_`[\]()!-]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180 + activities * 2));
}

// Satır bazlı fark (LCS). Teslim sürümleri için yeterli; 2000 satırın üstünde kaba karşılaştırmaya düşer.
export type DiffLine = { kind: "same" | "add" | "del"; text: string };
export function lineDiff(before: string, after: string): DiffLine[] {
  const a = before.split("\n"), b = after.split("\n");
  if (a.length * b.length > 4_000_000) return [...a.map((text) => ({ kind: "del" as const, text })), ...b.map((text) => ({ kind: "add" as const, text }))];
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) dp[i]![j] = a[i] === b[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
  const out: DiffLine[] = [];
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { out.push({ kind: "same", text: a[i]! }); i++; j++; }
    else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) out.push({ kind: "del", text: a[i++]! });
    else out.push({ kind: "add", text: b[j++]! });
  }
  while (i < a.length) out.push({ kind: "del", text: a[i++]! });
  while (j < b.length) out.push({ kind: "add", text: b[j++]! });
  return out;
}

// Metin benzerliği: 5 kelimelik parçaların Jaccard oranı (0–1). Kısa metinlerde güvenilmez; çağıran eşik ve uzunluk denetler.
export function shingles(text: string, k = 5): Set<string> {
  const w = fold(text).replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i + k <= w.length; i++) out.add(w.slice(i, i + k).join(" "));
  return out;
}
export function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// Başlıktan kararlı çapa kimliği (ders içi bölüm listesi ve soruların bağlandığı bölüm).
export function slugifyHeading(text: string): string {
  return fold(text).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "bolum";
}
