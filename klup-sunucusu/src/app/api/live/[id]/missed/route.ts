import { z } from "zod";
import { memberContext } from "@/server/api-auth";
import { json, readJson, route } from "@/server/http";
import { conflict, notFound } from "@/server/errors";
import { canHostSession, isAdmin } from "@/server/auth/policy";
import { db } from "@/server/db";
import { notify } from "@/server/classroom/notifications";

type Context = { params: Promise<{ id: string }> };
// Dersi kaçıranlara özet: seçilen sınıfta oturuma hiç bağlanmamış öğrencilere bir kez bildirim.
export const POST = route<Context>(async (req, ctx) => {
  const { actor } = await memberContext(req, { write: true });
  const { groupId, note } = await readJson(req, z.object({ groupId: z.string().min(1).max(40), note: z.string().trim().max(300).default("") }));
  const s = await db.liveSession.findUnique({ where: { id: (await ctx.params).id }, include: { participants: { select: { userId: true } }, assignments: { select: { id: true, title: true } } } });
  if (!s || !(canHostSession(actor, s) || isAdmin(actor.role))) throw notFound();
  if (s.status !== "ENDED") throw conflict("Özet ders bittikten sonra gönderilir.");
  const members = await db.classGroupMember.findMany({ where: { groupId, user: { role: "STUDENT", status: "ACTIVE" } }, select: { userId: true } });
  const joined = new Set(s.participants.map((p) => p.userId));
  const missed = members.map((m) => m.userId).filter((id) => !joined.has(id));
  const body = [note, s.assignments.length ? `Oturumda açılan görevler: ${s.assignments.map((a) => a.title).join(", ")}` : ""].filter(Boolean).join(" · ");
  const n = await db.$transaction((tx) => notify(tx, missed, { type: "ASSIGNMENT", title: `Kaçırdığın ders: ${s.title}`, body: body || "Ders özetine ve açılan görevlere göz at.", link: s.assignments[0] ? `/tasks/${s.assignments[0].id}` : "/tasks" }));
  return json({ notified: n });
});
