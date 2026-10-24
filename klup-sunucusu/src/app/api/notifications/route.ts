import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { listNotifications, markRead, unreadCount } from "@/server/classroom/notifications";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  const [items, unread] = await Promise.all([listNotifications(actor), unreadCount(actor.id)]);
  return json({ items, unread });
});

const body = z.object({ ids: z.union([z.literal("all"), z.array(z.string().min(1).max(40)).max(200)]) });

export const POST = route(async (req) => {
  const { actor } = await memberContext(req, { write: true });
  const { ids } = await readJson(req, body);
  await markRead(actor, ids);
  return json({ unread: await unreadCount(actor.id) });
});
