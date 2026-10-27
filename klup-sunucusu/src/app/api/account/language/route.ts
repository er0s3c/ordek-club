import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { db } from "@/server/db";
import { preference } from "@/server/learning/service";
import { LOCALE_COOKIE } from "@/i18n/locale";

export const dynamic = "force-dynamic";

// Site dili: "auto" tarayıcı/sistem diline göre seçer. Çerez, bu cihazda oturum açılmadan
// önceki sayfaların ve API hatalarının da aynı dilde gelmesi içindir.
export const PUT = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  const { locale } = await readJson(req, z.object({ locale: z.enum(["auto", "tr", "en"]) }));
  await preference(actor.id);
  await db.learningPreference.update({ where: { userId: actor.id }, data: { locale } });
  const res = json({ ok: true, locale });
  res.headers.append("Set-Cookie", locale === "auto" ? `${LOCALE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax` : `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`);
  return res;
});
