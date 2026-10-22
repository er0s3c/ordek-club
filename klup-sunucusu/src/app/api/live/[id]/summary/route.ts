import { z } from "zod";
import { json, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { getSummary } from "@/server/live/service";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req);
  return json(await getSummary(actor, z.string().min(1).max(64).parse((await params).id)));
});
