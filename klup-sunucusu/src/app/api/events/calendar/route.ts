import { memberContext } from "@/server/api-auth";
import { route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { getSettings } from "@/server/settings";
import { eventsIcs } from "@/server/club/events";

// Kulüp etkinlik takvimi (iCal). Yalnız giriş yapmış üyeler indirir; dosya takvim uygulamasına içe aktarılır.
export const GET = route(async (req) => {
  await memberContext(req);
  await requireFeature("club-ops");
  const body = await eventsIcs((await getSettings()).clubName);
  return new Response(body, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'attachment; filename="kulup-etkinlikleri.ics"', "Cache-Control": "no-store" } });
});
