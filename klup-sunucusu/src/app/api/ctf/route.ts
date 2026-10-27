import { memberContext } from "@/server/api-auth";
import { json, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { ctfBoard } from "@/server/ctf/service";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  await requireFeature("community");
  return json(await ctfBoard(actor));
});
