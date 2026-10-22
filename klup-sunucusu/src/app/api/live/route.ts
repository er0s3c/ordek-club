import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { listActiveSessions, startSession } from "@/server/live/service";

export const dynamic = "force-dynamic";

// Devam eden canlı dersler (tüm aktif üyeler görebilir).
export const GET = route(async (req) => {
  await memberContext(req);
  return json({ items: await listActiveSessions() });
});

export const POST = route(async (req) => {
  const { actor, ip } = await memberContext(req, { write: true });
  const { presentationId } = await readJson(req, z.object({ presentationId: z.string().min(1).max(64) }));
  return json(await startSession(actor, presentationId, ip), { status: 201 });
});
