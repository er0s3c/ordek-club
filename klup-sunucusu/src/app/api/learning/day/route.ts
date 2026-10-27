import { memberContext } from "@/server/api-auth";
import { json, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { civilDay } from "@/server/learning/service";
import { dayDetail } from "@/server/learning/insights";

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  await requireFeature("learning");
  const day = civilDay.parse(new URL(req.url).searchParams.get("day"));
  return json(await dayDetail(actor.id, day));
});
