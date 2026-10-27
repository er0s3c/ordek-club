import { memberContext } from "@/server/api-auth";
import { json, route } from "@/server/http";
import { distributePeerReviews } from "@/server/classroom/extensions";

type Context = { params: Promise<{ id: string }> };
// Öğretmen: akran değerlendirmelerini dağıt (tekrar çağrılırsa yalnız eksik atamalar eklenir).
export const POST = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  return json(await distributePeerReviews(actor, (await ctx.params).id));
});
