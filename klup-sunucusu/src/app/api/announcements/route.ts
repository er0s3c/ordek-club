import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { announcementSchema, createAnnouncement, listAnnouncements } from "@/server/classroom/announcements";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  return json({ items: await listAnnouncements(actor) });
});

export const POST = route(async (req) => {
  const { actor, ip } = await memberContext(req, { write: true });
  const a = await createAnnouncement(actor, await readJson(req, announcementSchema), ip);
  return json({ id: a.id }, { status: 201 });
});
