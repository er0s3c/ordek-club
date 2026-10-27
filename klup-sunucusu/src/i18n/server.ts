// Sunucu bileşenleri ve layout'lar için dil + çeviri (istek başına bir kez hesaplanır).
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { SESSION_COOKIE } from "@/server/auth/session";
import { getMessages } from "./index";
import { tFor } from "./catalog";
import { fallbackLocale, storedPref } from "./request";
import { LOCALE_COOKIE, resolveLocale, type Locale, type LocalePref } from "./locale";
import type { T } from "./translate";

export { dictFor, tFor, translateFor } from "./catalog";
export { localeForUser, localeFromRequest } from "./request";

// pref: oturum yoksa null.
export const getLocaleInfo = cache(async (): Promise<{ locale: Locale; pref: LocalePref | null }> => {
  const [jar, h] = await Promise.all([cookies(), headers()]);
  const pref = await storedPref(jar.get(SESSION_COOKIE)?.value);
  const locale = resolveLocale({ pref, cookie: jar.get(LOCALE_COOKIE)?.value, acceptLanguage: h.get("accept-language"), fallback: await fallbackLocale() });
  return { locale, pref };
});

export const getLocale = async () => (await getLocaleInfo()).locale;
export const getT = cache(async (): Promise<T> => tFor(await getLocale()));
export const getServerMessages = async () => getMessages(await getLocale());
