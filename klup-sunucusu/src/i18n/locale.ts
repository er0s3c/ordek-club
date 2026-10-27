// Dil seçimi (sunucu ve istemcide aynı kurallar). Sıra: öğrencinin kayıtlı tercihi → bu cihazın
// son seçimi (çerez) → tarayıcı/sistem dili (Accept-Language) → kulübün varsayılan dili.
// Tarayıcı dili Türkçe (tr, tr-TR, tr-CY…) ise Türkçe, başka herhangi bir dilse İngilizce.
export type Locale = "tr" | "en";
export type LocalePref = Locale | "auto";

export const LOCALES: readonly Locale[] = ["tr", "en"];
export const LOCALE_COOKIE = "club_lang";

export const isLocale = (v: unknown): v is Locale => v === "tr" || v === "en";

export function fromLanguageTag(tag: string): Locale {
  return /^tr(-|_|$)/i.test(tag.trim()) ? "tr" : "en";
}

// En yüksek q değerli dili seçer; "*" ve q=0 yok sayılır. Başlık yoksa/boşsa null.
export function fromAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;
  let best: { tag: string; q: number } | null = null;
  for (const part of header.split(",").slice(0, 20)) {
    const [rawTag, ...params] = part.trim().split(";");
    const tag = rawTag?.trim() ?? "";
    if (!tag || tag === "*" || !/^[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*$/.test(tag)) continue;
    const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    const q = qParam ? Number(qParam.slice(2)) : 1;
    if (!Number.isFinite(q) || q <= 0) continue;
    if (!best || q > best.q) best = { tag, q };
  }
  return best ? fromLanguageTag(best.tag) : null;
}

export function resolveLocale(input: { pref?: string | null; cookie?: string | null; acceptLanguage?: string | null; fallback?: string | null }): Locale {
  if (isLocale(input.pref)) return input.pref;
  if (isLocale(input.cookie)) return input.cookie;
  return fromAcceptLanguage(input.acceptLanguage) ?? (isLocale(input.fallback) ? input.fallback : "tr");
}

// Intl biçimlendiricileri için BCP 47 etiketi.
export const intlLocale = (l: Locale) => (l === "en" ? "en-GB" : "tr-TR");
