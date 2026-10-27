"use client";

import { createContext, use, useContext, useEffect, useMemo, type ReactNode } from "react";
import { LOCALE_COOKIE, type Locale, type LocalePref } from "./locale";
import { makeT, translateMessage, type Dict, type T } from "./translate";

// İngilizce sözlük ayrı bir parça olarak yalnızca gerektiğinde yüklenir; söz modül düzeyinde
// tutulduğu için use() ikinci kez askıya almaz.
let enPromise: Promise<Dict> | null = null;
const loadEn = () => (enPromise ??= import("./en-strings").then((m) => m.EN));

// Bileşen dışındaki istemci kodu (api-client, olay yardımcıları) için sayfa dili.
// Tarayıcıda tek kullanıcı olduğundan modül düzeyinde tutulabilir; sunucuda hiç yazılmaz.
const page: { locale: Locale; dict: Dict | null } = { locale: "tr", dict: null };
export const translateClient = (text: string) => translateMessage(page.dict, text);
export const clientLocale = () => page.locale;

const Ctx = createContext<{ locale: Locale; t: T }>({ locale: "tr", t: makeT(null) });

export function LocaleProvider({ locale, pref, children }: { locale: Locale; pref: LocalePref | null; children: ReactNode }) {
  const dict = locale === "en" ? use(loadEn()) : null;
  if (typeof window !== "undefined") {
    page.locale = locale;
    page.dict = dict;
  }
  const value = useMemo(() => ({ locale, t: makeT(dict) }), [locale, dict]);
  // Kayıtlı tercih bu cihazın çerezine yansıtılır: oturum açılmadan önceki sayfalar ve API
  // hataları da aynı dilde gelir. "auto" çerezi siler; oturum yoksa (pref=null) dokunulmaz.
  useEffect(() => {
    if (!pref) return;
    const has = document.cookie.split("; ").find((c) => c.startsWith(LOCALE_COOKIE + "="))?.split("=")[1];
    if (pref === "auto" && has) document.cookie = `${LOCALE_COOKIE}=; path=/; max-age=0; samesite=lax`;
    else if (pref !== "auto" && has !== pref) document.cookie = `${LOCALE_COOKIE}=${pref}; path=/; max-age=31536000; samesite=lax`;
  }, [pref]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useT = () => useContext(Ctx).t;
export const useLocale = () => useContext(Ctx).locale;
