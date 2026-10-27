// İsteğe bağlı olmayan çeviri yardımcıları (Next.js bağımlılığı yok: özel sunucu, CLI, e-posta işçisi).
import { EN } from "./en-strings";
import type { Locale } from "./locale";
import { makeT, translateMessage, type T } from "./translate";

export const dictFor = (locale: Locale) => (locale === "en" ? EN : null);
export const tFor = (locale: Locale): T => makeT(dictFor(locale));
// Sunucu mesajları (hata, bildirim) için: kalıplı ("{ad}") eşleşmeleri de çevirir.
export const translateFor = (locale: Locale, text: string) => translateMessage(dictFor(locale), text);
