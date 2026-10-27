import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { requireFeature } from "@/server/learning/features";
import { attendance, checkIn, closeCheckIn, eventFeedback, feedbackSchema, joinWaitlist, manualCheckIn, openCheckIn } from "@/server/club/events";

type Context = { params: Promise<{ id: string }> };
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("checkin"), code: z.string().min(4).max(20) }),
  z.object({ action: z.literal("open"), minutes: z.number().int().min(1).max(30).default(5) }),
  z.object({ action: z.literal("close") }),
  z.object({ action: z.literal("manual"), username: z.string().trim().min(1).max(40) }),
  z.object({ action: z.literal("waitlist"), join: z.boolean() }),
  z.object({ action: z.literal("feedback"), data: feedbackSchema }),
]);

export const GET = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req);
  await requireFeature("club-ops");
  return json({ attendance: await attendance(actor, (await ctx.params).id) });
});
export const POST = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  await requireFeature("club-ops");
  const id = (await ctx.params).id;
  const input = await readJson(req, schema);
  switch (input.action) {
    case "checkin": await checkIn(actor, id, input.code); return json({ ok: true });
    case "open": return json(await openCheckIn(actor, id, input.minutes));
    case "close": await closeCheckIn(actor, id); return json({ ok: true });
    case "manual": await manualCheckIn(actor, id, input.username); return json({ ok: true });
    case "waitlist": await joinWaitlist(actor, id, input.join); return json({ ok: true });
    case "feedback": await eventFeedback(actor, id, input.data); return json({ ok: true });
  }
});
