import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { forbidden } from "@/server/errors";
import { canManageClassroom } from "@/server/auth/policy";
import { requireFeature } from "@/server/learning/features";
import { createAnnouncement } from "@/server/classroom/announcements";
import {
  bookSlot, cancelBooking, clubTaskSchema, createClubTask, createPoll, createSlots,
  deleteSlot, moveClubTask, newsletterDraft, pollSchema, slotSchema, votePoll,
} from "@/server/club/ops";

// Kulüp işleri tek uçta, eylem adına göre: görüşme saatleri, anketler, gönüllü görevler, bülten.
const id = z.string().min(1).max(40);
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("slots.create"), data: slotSchema }),
  z.object({ action: z.literal("slots.delete"), id }),
  z.object({ action: z.literal("slots.book"), id, topic: z.string() }),
  z.object({ action: z.literal("slots.cancel"), id }),
  z.object({ action: z.literal("poll.create"), data: pollSchema }),
  z.object({ action: z.literal("poll.vote"), id, choice: z.number().int().min(0).max(7) }),
  z.object({ action: z.literal("task.create"), data: clubTaskSchema }),
  z.object({ action: z.literal("task.move"), id, move: z.enum(["claim", "release", "done", "delete"]) }),
  z.object({ action: z.literal("newsletter.publish"), title: z.string().trim().min(3).max(140), body: z.string().max(10_000) }),
]);

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  await requireFeature("club-ops");
  if (!canManageClassroom(actor)) throw forbidden();
  return json(await newsletterDraft());
});

export const POST = route(async (req) => {
  const { actor, ip } = await memberContext(req, { write: true });
  await requireFeature("club-ops");
  const input = await readJson(req, schema);
  switch (input.action) {
    case "slots.create": return json({ created: (await createSlots(actor, input.data)).count }, { status: 201 });
    case "slots.delete": await deleteSlot(actor, input.id); return json({ ok: true });
    case "slots.book": return json({ id: (await bookSlot(actor, input.id, input.topic)).id }, { status: 201 });
    case "slots.cancel": await cancelBooking(actor, input.id); return json({ ok: true });
    case "poll.create": return json({ id: (await createPoll(actor, input.data)).id }, { status: 201 });
    case "poll.vote": await votePoll(actor, input.id, input.choice); return json({ ok: true });
    case "task.create": return json({ id: (await createClubTask(actor, input.data)).id }, { status: 201 });
    case "task.move": await moveClubTask(actor, input.id, input.move); return json({ ok: true });
    case "newsletter.publish": {
      if (!canManageClassroom(actor)) throw forbidden();
      const a = await createAnnouncement(actor, { title: input.title, body: input.body, audience: "ALL", pinned: false, expiresAt: null }, ip);
      return json({ id: a.id }, { status: 201 });
    }
  }
});
