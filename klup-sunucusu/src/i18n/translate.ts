// Metin çevirisi: anahtar, kaynak koddaki Türkçe metnin kendisidir (gettext tarzı). Böylece
// bileşenlerde metin okunur kalır, çevirisi olmayan metin Türkçe görünür ve veritabanından gelen
// sabit etiketler (rozet adı, tür etiketi…) aynı sözlükle çevrilebilir.
//   t("Kaydet")                      → "Save"
//   t("{n} görev açık", { n: 3 })    → "3 tasks open"
export type Dict = Readonly<Record<string, string>>;
export type Vars = Record<string, string | number | null | undefined>;
// Çevirmen, tarih/sayı biçimlendirme için dili de taşır: toLocaleString(t.intl), formatDate(d, tz, t.intl).
// Eksik metin (ör. bulunmayan etiket anahtarı) boş metin olarak döner.
export type T = ((text: string | null | undefined, vars?: Vars) => string) & { readonly locale: "tr" | "en"; readonly intl: string };

export function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k] ?? "") : m));
}

export function makeT(dict: Dict | null, locale: "tr" | "en" = dict ? "en" : "tr"): T {
  const fn = dict ? (text: string | null | undefined, vars?: Vars) => interpolate((text && dict[text]) || text || "", vars) : (text: string | null | undefined, vars?: Vars) => interpolate(text ?? "", vars);
  return Object.assign(fn, { locale, intl: locale === "en" ? "en-GB" : "tr-TR" });
}

// Sunucu mesajları için (hata, bildirim): tam eşleşme yoksa "{ad}" yer tutuculu kalıplar denenir.
// Kalıp eşleşmesi pahalı olduğundan bileşen metinlerinde değil, yalnızca sınırlarda kullanılır.
const patternCache = new WeakMap<Dict, { re: RegExp; names: string[]; out: string }[]>();
function patterns(dict: Dict) {
  let list = patternCache.get(dict);
  if (!list) {
    list = [];
    for (const [key, out] of Object.entries(dict)) {
      if (!/\{\w+\}/.test(key)) continue;
      const names: string[] = [];
      const src = key
        .split(/(\{\w+\})/)
        .map((part) => {
          const m = /^\{(\w+)\}$/.exec(part);
          if (!m) return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          names.push(m[1]!);
          return "([\\s\\S]+?)";
        })
        .join("");
      list.push({ re: new RegExp(`^${src}$`), names, out });
    }
    patternCache.set(dict, list);
  }
  return list;
}

export function translateMessage(dict: Dict | null, text: string): string {
  if (!dict || !text) return text;
  const hit = dict[text];
  if (hit) return hit;
  for (const p of patterns(dict)) {
    const m = p.re.exec(text);
    if (m) return p.out.replace(/\{(\w+)\}/g, (s, k: string) => {
      const i = p.names.indexOf(k);
      // Yakalanan parça da sabit bir arayüz metniyse (ör. "onaylandı") o da çevrilir.
      const v = i >= 0 ? (m[i + 1] ?? "") : s;
      return i >= 0 ? (dict[v] ?? v) : s;
    });
  }
  return text;
}
