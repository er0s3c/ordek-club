// Next.js'e bağımlı olmayan dil çözümü: route handler'lar, WebSocket sunucusu, e-posta işçisi.
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import { SESSION_COOKIE, hashToken } from "@/server/auth/session";
import { LOCALE_COOKIE, isLocale, resolveLocale, type Locale, type LocalePref } from "./locale";

export function cookieValue(header: string | null | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) {
      try {
        return decodeURIComponent(v.join("="));
      } catch {
        return null;
      }
    }
  }
  return null;
}

// Kayıtlı tercih (oturum çerezinden). Oturum yoksa null; oturum var ama seçim yapılmamışsa "auto".
// Süre denetimi gerekmez: yalnızca dil seçimi için okunur, yetki vermez.
export async function storedPref(token: string | null | undefined): Promise<LocalePref | null> {
  if (!token || token.length < 20 || token.length > 100) return null;
  const row = await db.session
    .findUnique({ where: { tokenHash: hashToken(token) }, select: { user: { select: { learningPreference: { select: { locale: true } } } } } })
    .catch(() => null);
  if (!row) return null;
  const v = row.user.learningPreference?.locale;
  return isLocale(v) ? v : "auto";
}

export async function fallbackLocale(): Promise<string> {
  return (await getSettings().catch(() => null))?.locale ?? "tr";
}

export async function localeFromHeaders(get: (name: string) => string | null | undefined, opts: { stored?: boolean } = {}): Promise<Locale> {
  const cookie = get("cookie");
  const pref = opts.stored ? await storedPref(cookieValue(cookie, SESSION_COOKIE)) : null;
  return resolveLocale({ pref, cookie: cookieValue(cookie, LOCALE_COOKIE), acceptLanguage: get("accept-language"), fallback: await fallbackLocale() });
}

// Route handler'lar: çerez (kayıtlı tercihin bu cihazdaki yansıması) ve Accept-Language;
// stored: true ise veritabanındaki tercih de okunur.
export const localeFromRequest = (req: Request, opts: { stored?: boolean } = {}) => localeFromHeaders((n) => req.headers.get(n), opts);

// Belirli bir kullanıcıya (ör. e-posta alıcısı) giden metinler: kayıtlı tercih, yoksa kulüp varsayılanı.
export async function localeForUser(userId: string): Promise<Locale> {
  const p = await db.learningPreference.findUnique({ where: { userId }, select: { locale: true } }).catch(() => null);
  if (isLocale(p?.locale)) return p.locale;
  return (await fallbackLocale()) === "en" ? "en" : "tr";
}
