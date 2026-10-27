// Kulüp işleri: öğretmen görüşme saatleri, kulüp anketleri, gönüllü görev panosu ve aylık bülten taslağı.
import { z } from "zod";
import { db } from "@/server/db";
import { badRequest, conflict, forbidden, notFound } from "@/server/errors";
import { canManageClassroom, isAdmin, isStaff, type Actor } from "@/server/auth/policy";
import { notify } from "@/server/classroom/notifications";
import { getSettings } from "@/server/settings";
import { dayKey } from "@/server/xp/time";

// ── görüşme saatleri ──
export const slotSchema = z.object({ startsAt: z.coerce.date(), minutes: z.number().int().min(10).max(120), count: z.number().int().min(1).max(12).default(1), capacity: z.number().int().min(1).max(20).default(1), location: z.string().trim().max(120).default("") });

export async function createSlots(actor: Actor, input: z.output<typeof slotSchema>) {
  if (!isStaff(actor.role)) throw forbidden();
  if (input.startsAt < new Date()) throw badRequest("Başlangıç ileride olmalı.");
  const rows = Array.from({ length: input.count }, (_, i) => { const s = new Date(input.startsAt.getTime() + i * input.minutes * 60_000); return { hostId: actor.id, startsAt: s, endsAt: new Date(s.getTime() + input.minutes * 60_000), capacity: input.capacity, location: input.location }; });
  return db.officeHourSlot.createMany({ data: rows });
}

export async function officeHours(actor: Actor) {
  const now = new Date();
  const slots = await db.officeHourSlot.findMany({ where: { endsAt: { gte: now } }, orderBy: { startsAt: "asc" }, take: 200, include: { host: { select: { id: true, displayName: true } }, bookings: { where: { status: "BOOKED" }, include: { user: { select: { displayName: true } } } } } });
  return slots.map((s) => ({
    id: s.id, host: s.host.displayName, hostId: s.host.id, mine: s.host.id === actor.id, startsAt: s.startsAt.toISOString(), endsAt: s.endsAt.toISOString(), location: s.location, capacity: s.capacity, booked: s.bookings.length,
    myBooking: s.bookings.find((b) => b.userId === actor.id)?.id ?? null,
    // Hazırlık listesi: konu ve öğrenci adı yalnız görüşmeyi veren öğretmene görünür.
    bookings: s.host.id === actor.id || isAdmin(actor.role) ? s.bookings.map((b) => ({ id: b.id, user: b.user.displayName, topic: b.topic })) : [],
  }));
}

export async function bookSlot(actor: Actor, slotId: string, topic: string) {
  const t = z.string().trim().min(5, "Görüşme konusunu kısaca yaz.").max(500).parse(topic);
  return db.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "OfficeHourSlot" WHERE id = ${slotId} FOR UPDATE`;
    const s = await tx.officeHourSlot.findUnique({ where: { id: slotId }, include: { bookings: { where: { status: "BOOKED" } } } });
    if (!s || s.startsAt < new Date()) throw notFound("Saat bulunamadı ya da geçti.");
    if (s.hostId === actor.id) throw badRequest("Kendi saatine kayıt olamazsın.");
    if (s.bookings.some((b) => b.userId === actor.id)) throw conflict("Bu saate zaten kayıtlısın.");
    if (s.bookings.length >= s.capacity) throw conflict("Bu saat doldu.");
    const b = await tx.officeHourBooking.upsert({ where: { slotId_userId: { slotId, userId: actor.id } }, create: { slotId, userId: actor.id, topic: t }, update: { topic: t, status: "BOOKED" } });
    await notify(tx, [s.hostId], { type: "SYSTEM", title: "Görüşme saatine kayıt", body: t.slice(0, 160), link: "/club/office-hours" });
    return b;
  });
}

export async function cancelBooking(actor: Actor, id: string) {
  const b = await db.officeHourBooking.findUnique({ where: { id }, include: { slot: true } });
  if (!b || (b.userId !== actor.id && b.slot.hostId !== actor.id && !isAdmin(actor.role))) throw notFound();
  await db.officeHourBooking.update({ where: { id }, data: { status: "CANCELLED" } });
}

export async function deleteSlot(actor: Actor, id: string) {
  const s = await db.officeHourSlot.findUnique({ where: { id }, include: { bookings: { where: { status: "BOOKED" } } } });
  if (!s || (s.hostId !== actor.id && !isAdmin(actor.role))) throw notFound();
  await db.$transaction(async (tx) => {
    if (s.bookings.length) await notify(tx, s.bookings.map((b) => b.userId), { type: "SYSTEM", title: "Görüşme saati iptal edildi", body: s.startsAt.toLocaleString("tr-TR"), link: "/club/office-hours" });
    await tx.officeHourSlot.delete({ where: { id } });
  });
}

// ── kulüp anketleri ──
export const pollSchema = z.object({ question: z.string().trim().min(5).max(200), options: z.array(z.string().trim().min(1).max(120)).min(2).max(8), anonymous: z.boolean().default(true), closesAt: z.coerce.date().nullable().default(null) });
export async function createPoll(actor: Actor, input: z.output<typeof pollSchema>) {
  if (!canManageClassroom(actor)) throw forbidden();
  return db.$transaction(async (tx) => {
    const p = await tx.clubPoll.create({ data: { ...input, createdById: actor.id } });
    const ids = (await tx.user.findMany({ where: { status: "ACTIVE", id: { not: actor.id } }, select: { id: true } })).map((u) => u.id);
    await notify(tx, ids, { type: "SYSTEM", title: `Kulüp anketi: ${input.question}`, link: "/club/polls" });
    return p;
  });
}
export async function votePoll(actor: Actor, id: string, choice: number) {
  const p = await db.clubPoll.findUnique({ where: { id } });
  if (!p) throw notFound();
  if (p.closesAt && p.closesAt < new Date()) throw conflict("Anket kapandı.");
  if (choice < 0 || choice >= (p.options as string[]).length) throw badRequest("Geçersiz seçenek.");
  await db.clubPollVote.upsert({ where: { pollId_userId: { pollId: id, userId: actor.id } }, create: { pollId: id, userId: actor.id, choice }, update: { choice } });
}
export async function polls(actor: Actor) {
  const rows = await db.clubPoll.findMany({ orderBy: { createdAt: "desc" }, take: 30, include: { votes: { include: { user: { select: { displayName: true } } } }, createdBy: { select: { displayName: true } } } });
  const staff = canManageClassroom(actor);
  return rows.map((p) => {
    const options = p.options as string[];
    const mine = p.votes.find((v) => v.userId === actor.id)?.choice ?? null;
    const open = !p.closesAt || p.closesAt > new Date();
    const show = mine !== null || !open || staff;
    return { id: p.id, question: p.question, options, anonymous: p.anonymous, open, closesAt: p.closesAt?.toISOString() ?? null, by: p.createdBy?.displayName ?? "—", mine, total: p.votes.length, counts: show ? options.map((_, i) => p.votes.filter((v) => v.choice === i).length) : null, voters: staff && !p.anonymous ? p.votes.map((v) => ({ name: v.user.displayName, choice: v.choice })) : null };
  });
}

// ── gönüllü görev panosu ──
export const clubTaskSchema = z.object({ title: z.string().trim().min(3).max(120), description: z.string().trim().max(1000).default(""), dueAt: z.coerce.date().nullable().default(null) });
export async function createClubTask(actor: Actor, input: z.output<typeof clubTaskSchema>) {
  if (!canManageClassroom(actor)) throw forbidden();
  return db.clubTask.create({ data: { ...input, createdById: actor.id } });
}
export async function moveClubTask(actor: Actor, id: string, action: "claim" | "release" | "done" | "delete") {
  const t = await db.clubTask.findUnique({ where: { id } });
  if (!t) throw notFound();
  const staff = canManageClassroom(actor);
  if (action === "delete") { if (!staff) throw forbidden(); await db.clubTask.delete({ where: { id } }); return; }
  if (action === "claim") {
    const r = await db.clubTask.updateMany({ where: { id, status: "OPEN" }, data: { status: "CLAIMED", claimedById: actor.id } });
    if (!r.count) throw conflict("Bu görevi başka biri üstlendi.");
    if (t.createdById) await db.$transaction((tx) => notify(tx, [t.createdById!], { type: "SYSTEM", title: `Gönüllü görev üstlenildi: ${t.title}`, link: "/club/tasks" }));
    return;
  }
  if (t.claimedById !== actor.id && !staff) throw forbidden();
  if (action === "release") await db.clubTask.update({ where: { id }, data: { status: "OPEN", claimedById: null } });
  else await db.clubTask.update({ where: { id }, data: { status: "DONE", doneAt: new Date() } });
}
export const clubTasks = () => db.clubTask.findMany({ orderBy: [{ status: "asc" }, { createdAt: "desc" }], take: 100, include: { claimedBy: { select: { id: true, displayName: true } } } });

// ── aylık bülten taslağı: son 30 günün etkinlikleri, yeni/ güncellenen dersler, kulüp hedefleri ──
export async function newsletterDraft() {
  const { clubName, timezone } = await getSettings();
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [events, upcoming, lessons, changed, goals, checkins, done] = await Promise.all([
    db.classGroup.findMany({ where: { kind: "EVENT", startsAt: { gte: since, lte: new Date() } }, select: { name: true, _count: { select: { checkIns: true } } } }),
    db.classGroup.findMany({ where: { kind: "EVENT", archivedAt: null, startsAt: { gt: new Date() } }, orderBy: { startsAt: "asc" }, take: 5, select: { name: true, startsAt: true, location: true } }),
    db.lesson.count({ where: { archivedAt: null, updatedAt: { gte: since } } }),
    db.lessonChange.count({ where: { createdAt: { gte: since } } }),
    db.clubGoal.findMany({ where: { endsOn: { gte: dayKey(since, timezone) } }, select: { title: true, target: true } }),
    db.eventCheckIn.count({ where: { at: { gte: since } } }),
    db.learningEvent.count({ where: { kind: "lesson", createdAt: { gte: since } } }),
  ]);
  const lines = [
    `# ${clubName} · Aylık bülten`,
    "",
    `Son 30 günde kulüpçe **${done}** ders tamamlandı ve etkinliklerde **${checkins}** katılım doğrulandı.`,
    "",
    "## Geride kalan etkinlikler",
    ...(events.length ? events.map((e) => `- ${e.name} (${e._count.checkIns} katılım)`) : ["- Bu ay etkinlik yapılmadı."]),
    "",
    "## Yaklaşan etkinlikler",
    ...(upcoming.length ? upcoming.map((e) => `- ${e.name} · ${e.startsAt!.toLocaleString("tr-TR", { timeZone: timezone })}${e.location ? ` · ${e.location}` : ""}`) : ["- Takvimde henüz yaklaşan etkinlik yok."]),
    "",
    "## Akademide yenilikler",
    `- ${lessons} ders eklendi ya da güncellendi${changed ? ` (${changed} içerik değişikliği)` : ""}.`,
    ...(goals.length ? ["", "## Kulüp hedefleri", ...goals.map((g) => `- ${g.title} (hedef ${g.target})`)] : []),
  ];
  return { title: `${clubName} · Aylık bülten`, body: lines.join("\n") };
}
