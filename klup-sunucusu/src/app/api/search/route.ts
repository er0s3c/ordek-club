import { json, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { tooMany } from "@/server/errors";
import { LIMITS, hit } from "@/server/rate-limit";
import { search } from "@/server/search";
import { localeFromRequest } from "@/i18n/request";
import { isLocale } from "@/i18n/locale";

// Arama dili: açık ?lang= → çerez/kayıtlı tercih → tarayıcı. Sonuçlar seçili dilde döner.
export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  const [max, win] = LIMITS.searchPerUser;
  const r = hit(`search:${actor.id}`, max, win);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const explicit = url.searchParams.get("lang");
  const locale = isLocale(explicit) ? explicit : await localeFromRequest(req, { stored: true });
  return json({ hits: await search(actor, q, 24, locale), locale });
});
