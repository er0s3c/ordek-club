import { Prisma } from "@prisma/client";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { conflict, forbidden, notFound } from "@/server/errors";
import { canHostSession, canUseTeaching, canViewPresentation, isAdmin, type Actor } from "@/server/auth/policy";
import { randomCode } from "@/server/codes";
import { initialLiveState } from "@/lib/live-protocol";
import { loadClientDeck } from "@/server/presentations";
import { hub } from "@/server/live/hub";

export const SESSION_CODE_LENGTH = 6; // 31^6 ≈ 887 milyon; katılım ayrıca giriş + aktif üyelik ister
export const normalizeCode = (c: string) => c.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);

export async function startSession(actor: Actor, presentationId: string, ip: string) {
  if (!canUseTeaching(actor)) throw forbidden("Canlı dersi yalnızca eğitmen ve yöneticiler başlatabilir.");
  const p = await db.presentation.findUnique({ where: { id: presentationId } });
  if (!p || !canViewPresentation(actor, p)) throw notFound("Sunum bulunamadı.");
  if (!p.currentVersionId) throw conflict("Sunumun içeriği yok.");

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const s = await db.$transaction(async (tx) => {
        const created = await tx.liveSession.create({
          data: {
            code: randomCode(SESSION_CODE_LENGTH),
            title: p.title,
            presentationId: p.id,
            versionId: p.currentVersionId!,
            hostId: actor.id,
            state: initialLiveState() as unknown as Prisma.InputJsonValue,
          },
        });
        await audit({ actorId: actor.id, action: "live.start", targetType: "LiveSession", targetId: created.id, meta: { presentationId: p.id, code: created.code }, ip }, tx);
        return created;
      });
      return { id: s.id, code: s.code };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") continue; // kod çakışması → yeniden dene
      throw err;
    }
  }
  throw conflict("Oturum kodu üretilemedi, tekrar dene.");
}

export async function listActiveSessions() {
  const items = await db.liveSession.findMany({
    where: { status: "ACTIVE" },
    orderBy: { startedAt: "desc" },
    take: 50,
    select: { id: true, code: true, title: true, startedAt: true, hostId: true, host: { select: { displayName: true } } },
  });
  return items.map((s) => ({ ...s, online: hub.onlineCount(s.id) }));
}

// Katılım bilgisi: sunum içeriği (notlar YALNIZCA eğitmene) + rol.
export async function getJoinInfo(actor: Actor, code: string) {
  const s = await db.liveSession.findUnique({ where: { code: normalizeCode(code) } });
  if (!s || s.status !== "ACTIVE") throw notFound("Bu kodla devam eden bir canlı ders yok.");
  const isHost = canHostSession(actor, s);
  const deck = await loadClientDeck(s.versionId, isHost);
  return { session: { id: s.id, code: s.code, title: s.title, startedAt: s.startedAt }, isHost, deck };
}

export async function getHostedSession(actor: Actor, id: string) {
  const s = await db.liveSession.findUnique({ where: { id } });
  if (!s || !canHostSession(actor, s)) throw notFound("Oturum bulunamadı.");
  return s;
}

export async function endSession(actor: Actor, id: string, ip: string) {
  const s = await getHostedSession(actor, id);
  if (s.status === "ENDED") return;
  await hub.end(s.id);
  await db.$transaction(async (tx) => {
    const r = await tx.liveSession.updateMany({ where: { id: s.id, status: "ACTIVE" }, data: { status: "ENDED", endedAt: new Date() } });
    if (r.count) await audit({ actorId: actor.id, action: "live.end", targetType: "LiveSession", targetId: s.id, ip }, tx);
  });
}

export async function getSummary(actor: Actor, id: string) {
  const s = await db.liveSession.findUnique({
    where: { id },
    include: {
      host: { select: { displayName: true, username: true } },
      version: { select: { _count: { select: { slides: true } } } },
      participants: { include: { user: { select: { displayName: true, username: true, role: true } } }, orderBy: { firstJoinAt: "asc" } },
      events: { orderBy: { createdAt: "asc" }, include: { user: { select: { displayName: true } } } },
    },
  });
  if (!s || !(canHostSession(actor, s) || isAdmin(actor.role))) throw notFound("Oturum bulunamadı.");
  const end = s.endedAt ?? new Date();
  const durationMs = end.getTime() - s.startedAt.getTime();
  const participants = s.participants.map((p) => ({
    userId: p.userId,
    displayName: p.user.displayName,
    username: p.user.username,
    role: p.user.role,
    firstJoinAt: p.firstJoinAt,
    connectedMs: p.connectedMs,
    connectCount: p.connectCount,
    attendancePct: durationMs > 0 ? Math.min(100, Math.round((p.connectedMs / durationMs) * 100)) : 0,
  }));
  const ev = (t: string) => s.events.filter((e) => e.type === t);
  return {
    id: s.id,
    code: s.code,
    title: s.title,
    status: s.status,
    host: s.host,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    durationMs,
    slideCount: s.version._count.slides,
    participants,
    questions: ev("QUESTION").map((e) => ({ id: e.id, text: e.text, by: e.user?.displayName ?? "—", at: e.createdAt, resolved: e.resolvedAt !== null })),
    announcements: ev("ANNOUNCEMENT").map((e) => ({ id: e.id, text: e.text, at: e.createdAt })),
    handRaises: ev("HAND").length,
  };
}

export async function listMySessions(actor: Actor) {
  if (!canUseTeaching(actor)) throw forbidden();
  return db.liveSession.findMany({
    where: isAdmin(actor.role) ? {} : { hostId: actor.id },
    orderBy: { startedAt: "desc" },
    take: 30,
    select: { id: true, code: true, title: true, status: true, startedAt: true, endedAt: true, _count: { select: { participants: true } } },
  });
}
