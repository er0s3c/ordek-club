import { memberContext } from "@/server/api-auth";
import { route } from "@/server/http";
import { tooMany } from "@/server/errors";
import { hit } from "@/server/rate-limit";
import { exportMyData } from "@/server/account-export";

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  const r = hit(`export:${actor.id}`, 5, 60 * 60_000);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const data = await exportMyData(actor.id);
  return new Response(JSON.stringify(data, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="ordek-club-verilerim-${new Date().toISOString().slice(0, 10)}.json"`, "Cache-Control": "no-store" },
  });
});
