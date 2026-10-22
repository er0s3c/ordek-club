import { z } from "zod";
import { json, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { endSession } from "@/server/live/service";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await memberContext(req, { write: true });
  await endSession(actor, z.string().min(1).max(64).parse((await params).id), ip);
  return json({ ok: true });
});
