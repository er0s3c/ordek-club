import { json, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { getJoinInfo } from "@/server/live/service";
import { hit } from "@/server/rate-limit";
import { tooMany } from "@/server/errors";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ code: string }> };

export const GET = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req);
  // Kod tahminine karşı: kullanıcı başına dakikada 30 sorgu.
  const r = hit(`live:join:${actor.id}`, 30, 60_000);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  return json(await getJoinInfo(actor, (await params).code));
});
