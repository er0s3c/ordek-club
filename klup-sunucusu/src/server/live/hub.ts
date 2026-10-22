// ============================================================================
//  Canlı sınıf merkezi (hub) — sunucu otoritesinde senkron durum.
//  • Durum yalnızca sunucuda değişir; her değişiklik sürümü (v) 1 artırır ve tam anlık
//    görüntü olarak yayınlanır → yeniden bağlanan istemci tek mesajla senkron olur.
//  • Her mesaj zod ile doğrulanır, yetki her mesajda kontrol edilir, hız sınırı uygulanır.
//  • Bağlantı katmanından bağımsızdır (Conn arayüzü) → gerçek soket olmadan testlenebilir.
//  • Next.js route'ları ile özel sunucu aynı süreçte farklı modül örnekleri yükleyebilir;
//    tekil örnek globalThis üzerinde paylaşılır.
// ============================================================================
import type { Prisma, Role } from "@prisma/client";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { hit } from "@/server/rate-limit";
import { canHostSession } from "@/server/auth/policy";
import { validateSessionToken } from "@/server/auth/session";
import {
  WS_CLOSE, clientMessageSchema, initialLiveState,
  type ClientMessage, type ControlAction, type LiveState, type ParticipantView, type QuestionView, type ServerMessage,
} from "@/lib/live-protocol";

export interface Conn {
  send(data: string): void;
  close(code: number, reason: string): void;
  isOpen(): boolean;
}

export type HubUser = { id: string; displayName: string; username: string; role: Role; status: "ACTIVE" };

type Client = {
  id: string;
  user: HubUser;
  isHost: boolean;
  conn: Conn;
  token: string | null; // oturum token'ı: periyodik yeniden doğrulama için
  connectedAt: number;
  strikes: number;
};

type Participant = { displayName: string; username: string; role: Role; conns: number; handRaised: boolean; connectedMs: number; since: number | null };

type Room = {
  id: string;
  code: string;
  title: string;
  hostId: string | null;
  slideSteps: number[];
  state: LiveState;
  v: number;
  clients: Set<Client>;
  participants: Map<string, Participant>;
  questions: QuestionView[];
  persistTimer: NodeJS.Timeout | null;
  autoplayTimer: NodeJS.Timeout | null;
};

export const LIMITS = {
  maxMessageBytes: 4096,
  maxClientsPerRoom: 400,
  maxConnsPerUser: 3,
  msgsPer10s: 40,
  questionsPerMin: 4,
  handPerMin: 12,
  announcePerMin: 10,
  autoplayBaseMs: 4000,
  persistDebounceMs: 250,
  revalidateMs: 30_000,
};

export class LiveError extends Error {
  constructor(public closeCode: number, message: string) {
    super(message);
  }
}

let seq = 0;

export class LiveHub {
  private rooms = new Map<string, Room>();
  private loading = new Map<string, Promise<Room>>();
  private revalidateTimer: NodeJS.Timeout | null = null;

  // ── oda yönetimi ──────────────────────────────────────────────────────────

  private async loadRoom(sessionId: string): Promise<Room> {
    const existing = this.rooms.get(sessionId);
    if (existing) return existing;
    const pending = this.loading.get(sessionId);
    if (pending) return pending;
    const p = (async () => {
      const s = await db.liveSession.findUnique({
        where: { id: sessionId },
        include: {
          version: { select: { slides: { select: { steps: true }, orderBy: { position: "asc" } } } },
          participants: { include: { user: { select: { displayName: true, username: true, role: true } } } },
          events: { where: { type: "QUESTION" }, orderBy: { createdAt: "asc" }, include: { user: { select: { displayName: true } } } },
        },
      });
      if (!s || s.status !== "ACTIVE") throw new LiveError(WS_CLOSE.NOT_FOUND, "Canlı oturum bulunamadı veya sona erdi.");
      const room: Room = {
        id: s.id,
        code: s.code,
        title: s.title,
        hostId: s.hostId,
        slideSteps: s.version.slides.map((x) => Math.max(1, x.steps)),
        state: { ...initialLiveState(), ...(s.state as Partial<LiveState>) },
        v: s.stateVersion,
        clients: new Set(),
        participants: new Map(
          s.participants.map((p) => [
            p.userId,
            { displayName: p.user.displayName, username: p.user.username, role: p.user.role, conns: 0, handRaised: p.handRaisedAt !== null, connectedMs: p.connectedMs, since: null },
          ]),
        ),
        questions: s.events.map((e) => ({ id: e.id, userId: e.userId, displayName: e.user?.displayName ?? "—", text: e.text, at: e.createdAt.getTime(), resolved: e.resolvedAt !== null })),
        persistTimer: null,
        autoplayTimer: null,
      };
      // Sunucu yeniden başladıysa otomatik oynatma kaldığı yerden devam etmez (eğitmen yeniden başlatır).
      room.state.autoplay = false;
      this.rooms.set(sessionId, room);
      this.ensureRevalidation();
      return room;
    })();
    this.loading.set(sessionId, p);
    try {
      return await p;
    } finally {
      this.loading.delete(sessionId);
    }
  }

  async join(sessionId: string, user: HubUser, conn: Conn, token: string | null): Promise<Client> {
    const room = await this.loadRoom(sessionId);
    if (room.clients.size >= LIMITS.maxClientsPerRoom) throw new LiveError(WS_CLOSE.RATE, "Oturum dolu.");
    const sameUser = [...room.clients].filter((c) => c.user.id === user.id);
    if (sameUser.length >= LIMITS.maxConnsPerUser) throw new LiveError(WS_CLOSE.RATE, "Bu oturuma çok fazla cihazdan bağlısın.");

    const client: Client = {
      id: `c${++seq}`,
      user,
      isHost: canHostSession({ id: user.id, role: user.role, status: user.status }, room),
      conn,
      token,
      connectedAt: Date.now(),
      strikes: 0,
    };
    room.clients.add(client);

    const p = room.participants.get(user.id) ?? { displayName: user.displayName, username: user.username, role: user.role, conns: 0, handRaised: false, connectedMs: 0, since: null };
    p.conns += 1;
    if (p.since === null) p.since = Date.now();
    room.participants.set(user.id, p);

    await db.sessionParticipant.upsert({
      where: { sessionId_userId: { sessionId: room.id, userId: user.id } },
      create: { sessionId: room.id, userId: user.id, connectCount: 1 },
      update: { connectCount: { increment: 1 }, lastSeenAt: new Date() },
    });

    this.send(client, { t: "welcome", you: { userId: user.id, isHost: client.isHost }, session: { id: room.id, code: room.code, title: room.title, slideCount: room.slideSteps.length } });
    this.send(client, { t: "state", v: room.v, state: room.state, serverTime: Date.now() });
    if (client.isHost) this.send(client, { t: "questions", items: room.questions });
    else this.send(client, { t: "you", handRaised: p.handRaised });
    this.broadcastPresence(room);
    return client;
  }

  async leave(sessionId: string, client: Client) {
    const room = this.rooms.get(sessionId);
    if (!room || !room.clients.delete(client)) return;
    const p = room.participants.get(client.user.id);
    if (p) {
      p.conns = Math.max(0, p.conns - 1);
      if (p.conns === 0 && p.since !== null) {
        const add = Date.now() - p.since;
        p.connectedMs += add;
        p.since = null;
        await db.sessionParticipant
          .update({ where: { sessionId_userId: { sessionId: room.id, userId: client.user.id } }, data: { connectedMs: { increment: add }, lastSeenAt: new Date() } })
          .catch((err) => console.error("[live] katılım süresi yazılamadı", err));
      }
    }
    this.broadcastPresence(room);
  }

  // ── mesaj işleme ──────────────────────────────────────────────────────────

  async handle(sessionId: string, client: Client, raw: string): Promise<void> {
    const room = this.rooms.get(sessionId);
    if (!room || !room.clients.has(client)) return;

    if (raw.length > LIMITS.maxMessageBytes) return this.reject(client, "TOO_LARGE", "Mesaj çok büyük.");
    if (!hit(`live:msg:${client.id}`, LIMITS.msgsPer10s, 10_000).ok) {
      client.strikes++;
      if (client.strikes >= 3) client.conn.close(WS_CLOSE.RATE, "rate limit");
      return this.reject(client, "RATE_LIMITED", "Çok hızlı mesaj gönderiyorsun.");
    }

    let msg: ClientMessage;
    try {
      const parsed = clientMessageSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) return this.reject(client, "BAD_MESSAGE", "Geçersiz mesaj.");
      msg = parsed.data;
    } catch {
      return this.reject(client, "BAD_JSON", "Geçersiz JSON.");
    }

    switch (msg.t) {
      case "ping":
        return this.send(client, { t: "pong", serverTime: Date.now() });
      case "hello":
        // Yeniden bağlanma / kaçırılan güncelleme: istemcinin sürümü eskiyse anlık görüntü gönder.
        if (msg.lastVersion < room.v) this.send(client, { t: "state", v: room.v, state: room.state, serverTime: Date.now() });
        return;
      case "control":
        if (!client.isHost) return this.reject(client, "FORBIDDEN", "Sunumu yalnızca eğitmen yönetebilir.");
        return this.applyControl(room, msg.c);
      case "hand":
        if (!hit(`live:hand:${room.id}:${client.user.id}`, LIMITS.handPerMin, 60_000).ok) return this.reject(client, "RATE_LIMITED", "Biraz bekle.");
        return this.setHand(room, client.user.id, msg.raised, client.user.id);
      case "lowerHand":
        if (!client.isHost) return this.reject(client, "FORBIDDEN", "Yetkin yok.");
        return this.setHand(room, msg.userId, false, client.user.id);
      case "question":
        if (!hit(`live:q:${room.id}:${client.user.id}`, LIMITS.questionsPerMin, 60_000).ok) return this.reject(client, "RATE_LIMITED", "Dakikada en fazla 4 soru gönderebilirsin.");
        return this.addQuestion(room, client, msg.text);
      case "resolve":
        if (!client.isHost) return this.reject(client, "FORBIDDEN", "Yetkin yok.");
        return this.resolveQuestion(room, msg.id);
      case "announce":
        if (!client.isHost) return this.reject(client, "FORBIDDEN", "Duyuruyu yalnızca eğitmen gönderebilir.");
        if (!hit(`live:ann:${room.id}`, LIMITS.announcePerMin, 60_000).ok) return this.reject(client, "RATE_LIMITED", "Biraz bekle.");
        return this.announce(room, client, msg.text);
    }
  }

  private applyControl(room: Room, c: ControlAction) {
    const s = { ...room.state };
    const stepsOf = (i: number) => room.slideSteps[i] ?? 1;
    const last = room.slideSteps.length - 1;
    let stepChanged = false;
    switch (c.action) {
      case "next":
        if (s.step < stepsOf(s.slide) - 1) s.step++;
        else if (s.slide < last) { s.slide++; s.step = 0; }
        else return;
        stepChanged = true;
        break;
      case "prev":
        if (s.step > 0) s.step--;
        else if (s.slide > 0) { s.slide--; s.step = stepsOf(s.slide) - 1; }
        else return;
        stepChanged = true;
        break;
      case "goto":
        s.slide = Math.min(Math.max(0, c.slide), last);
        s.step = Math.min(c.step, stepsOf(s.slide) - 1);
        stepChanged = true;
        break;
      case "pause":
        s.paused = c.value;
        if (c.value) s.autoplay = false;
        break;
      case "autoplay":
        s.autoplay = c.value;
        break;
      case "speed":
        s.speed = c.value;
        break;
      case "freeNav":
        s.freeNav = c.value;
        break;
    }
    if (stepChanged) s.stepAt = Date.now();
    this.commit(room, s);
  }

  // Durumu uygula: sürüm +1, yayınla, kalıcılaştır, otomatik oynatmayı yeniden planla.
  private commit(room: Room, next: LiveState) {
    room.state = next;
    room.v += 1;
    this.broadcast(room, { t: "state", v: room.v, state: room.state, serverTime: Date.now() });
    this.schedulePersist(room);
    this.scheduleAutoplay(room);
  }

  private scheduleAutoplay(room: Room) {
    if (room.autoplayTimer) clearTimeout(room.autoplayTimer);
    room.autoplayTimer = null;
    const s = room.state;
    if (!s.autoplay || s.paused) return;
    room.autoplayTimer = setTimeout(() => {
      room.autoplayTimer = null;
      const cur = room.state;
      const steps = room.slideSteps[cur.slide] ?? 1;
      // Otomatik oynatma slayt içindeki adımları ilerletir; slayt sonunda durur (slayt geçişi eğitmende).
      if (cur.step < steps - 1) this.commit(room, { ...cur, step: cur.step + 1, stepAt: Date.now() });
      else this.commit(room, { ...cur, autoplay: false });
    }, LIMITS.autoplayBaseMs / s.speed);
    room.autoplayTimer.unref?.();
  }

  private schedulePersist(room: Room) {
    if (room.persistTimer) return;
    room.persistTimer = setTimeout(() => {
      room.persistTimer = null;
      void this.persist(room);
    }, LIMITS.persistDebounceMs);
    room.persistTimer.unref?.();
  }

  private async persist(room: Room) {
    try {
      await db.liveSession.updateMany({
        where: { id: room.id, status: "ACTIVE" },
        data: { state: room.state as unknown as Prisma.InputJsonValue, stateVersion: room.v },
      });
    } catch (err) {
      console.error("[live] durum kaydedilemedi", err);
    }
  }

  private async setHand(room: Room, userId: string, raised: boolean, byUserId: string) {
    const p = room.participants.get(userId);
    if (!p || p.handRaised === raised) return;
    p.handRaised = raised;
    for (const c of room.clients) if (c.user.id === userId) this.send(c, { t: "you", handRaised: raised });
    this.broadcastPresence(room);
    await db.sessionParticipant
      .update({ where: { sessionId_userId: { sessionId: room.id, userId } }, data: { handRaisedAt: raised ? new Date() : null } })
      .catch(() => {});
    if (raised) await db.liveSessionEvent.create({ data: { sessionId: room.id, userId: byUserId, type: "HAND" } }).catch(() => {});
  }

  private async addQuestion(room: Room, client: Client, text: string) {
    const e = await db.liveSessionEvent.create({ data: { sessionId: room.id, userId: client.user.id, type: "QUESTION", text } });
    room.questions.push({ id: e.id, userId: client.user.id, displayName: client.user.displayName, text, at: e.createdAt.getTime(), resolved: false });
    if (room.questions.length > 500) room.questions.splice(0, room.questions.length - 500);
    this.send(client, { t: "ack", what: "question" });
    this.toHosts(room, { t: "questions", items: room.questions });
  }

  private async resolveQuestion(room: Room, id: string) {
    const q = room.questions.find((x) => x.id === id);
    if (!q || q.resolved) return;
    q.resolved = true;
    await db.liveSessionEvent.updateMany({ where: { id, sessionId: room.id }, data: { resolvedAt: new Date() } });
    this.toHosts(room, { t: "questions", items: room.questions });
  }

  private async announce(room: Room, client: Client, text: string) {
    await db.liveSessionEvent.create({ data: { sessionId: room.id, userId: client.user.id, type: "ANNOUNCEMENT", text } });
    this.broadcast(room, { t: "announcement", text, at: Date.now() });
  }

  // ── oturumu bitirme ───────────────────────────────────────────────────────

  /** Oturumu kapatır: herkese bildirir, bağlantıları kapatır, katılım sürelerini yazar. */
  async end(sessionId: string) {
    const room = this.rooms.get(sessionId);
    if (!room) return;
    if (room.autoplayTimer) clearTimeout(room.autoplayTimer);
    if (room.persistTimer) clearTimeout(room.persistTimer);
    await this.persist(room);
    this.broadcast(room, { t: "ended" });
    for (const c of [...room.clients]) {
      await this.leave(sessionId, c);
      c.conn.close(WS_CLOSE.ENDED, "session ended");
    }
    this.rooms.delete(sessionId);
  }

  onlineCount(sessionId: string): number {
    const room = this.rooms.get(sessionId);
    if (!room) return 0;
    return [...room.participants.values()].filter((p) => p.conns > 0).length;
  }

  stateOf(sessionId: string): { v: number; state: LiveState } | null {
    const r = this.rooms.get(sessionId);
    return r ? { v: r.v, state: r.state } : null;
  }

  // ── yayın ─────────────────────────────────────────────────────────────────

  private send(client: Client, msg: ServerMessage) {
    if (client.conn.isOpen()) client.conn.send(JSON.stringify(msg));
  }

  private reject(client: Client, code: string, message: string) {
    this.send(client, { t: "error", code, message });
  }

  private broadcast(room: Room, msg: ServerMessage) {
    const data = JSON.stringify(msg);
    for (const c of room.clients) if (c.conn.isOpen()) c.conn.send(data);
  }

  private toHosts(room: Room, msg: ServerMessage) {
    for (const c of room.clients) if (c.isHost) this.send(c, msg);
  }

  private participantViews(room: Room): ParticipantView[] {
    const now = Date.now();
    return [...room.participants.entries()]
      .map(([userId, p]) => ({
        userId,
        displayName: p.displayName,
        username: p.username,
        role: p.role,
        online: p.conns > 0,
        handRaised: p.handRaised,
        connectedMs: p.connectedMs + (p.since ? now - p.since : 0),
      }))
      .sort((a, b) => Number(b.handRaised) - Number(a.handRaised) || Number(b.online) - Number(a.online) || a.displayName.localeCompare(b.displayName, "tr"));
  }

  // Öğrenciler yalnızca çevrimiçi sayısını görür; ad listesi (kişisel veri) yalnızca eğitmene gider.
  private broadcastPresence(room: Room) {
    const online = [...room.participants.values()].filter((p) => p.conns > 0).length;
    const full: ServerMessage = { t: "presence", online, participants: this.participantViews(room) };
    const slim: ServerMessage = { t: "presence", online };
    for (const c of room.clients) this.send(c, c.isHost ? full : slim);
  }

  // ── periyodik oturum doğrulama ────────────────────────────────────────────
  // Çıkış yapan, parolası değişen, devre dışı bırakılan ya da rolü değişen kullanıcının soketi kapanır.
  private ensureRevalidation() {
    if (this.revalidateTimer) return;
    this.revalidateTimer = setInterval(() => void this.revalidateAll(), LIMITS.revalidateMs);
    this.revalidateTimer.unref?.();
  }

  /**
   * Çevrimiçi katılımcıların biriken bağlı kalma süresini veritabanına yazar ve aralığı yeniden başlatır.
   * Süreç çökse bile en fazla bir kontrol aralığı (30 sn) kaybolur; kapanışta (SIGTERM) da çağrılır.
   */
  async checkpoint() {
    const now = Date.now();
    for (const room of this.rooms.values()) {
      for (const [userId, p] of room.participants) {
        if (p.since === null) continue;
        const add = now - p.since;
        if (add <= 0) continue;
        p.connectedMs += add;
        p.since = now;
        await db.sessionParticipant
          .update({ where: { sessionId_userId: { sessionId: room.id, userId } }, data: { connectedMs: { increment: add }, lastSeenAt: new Date(now) } })
          .catch((err) => console.error("[live] katılım süresi kaydedilemedi", err));
      }
      if (room.persistTimer) {
        clearTimeout(room.persistTimer);
        room.persistTimer = null;
        await this.persist(room);
      }
    }
  }

  async revalidateAll() {
    await this.checkpoint();
    for (const [sessionId, room] of this.rooms) {
      for (const c of [...room.clients]) {
        if (c.token === null) continue;
        const s = await validateSessionToken(c.token).catch(() => null);
        if (!s || s.user.id !== c.user.id || s.user.role !== c.user.role) {
          await this.leave(sessionId, c);
          c.conn.close(WS_CLOSE.UNAUTHORIZED, "session invalid");
        }
      }
    }
  }

  /** Testler için: tüm odaları ve zamanlayıcıları temizler. */
  reset() {
    for (const r of this.rooms.values()) {
      if (r.autoplayTimer) clearTimeout(r.autoplayTimer);
      if (r.persistTimer) clearTimeout(r.persistTimer);
    }
    this.rooms.clear();
    if (this.revalidateTimer) clearInterval(this.revalidateTimer);
    this.revalidateTimer = null;
  }

  async flush(sessionId: string) {
    const r = this.rooms.get(sessionId);
    if (!r) return;
    if (r.persistTimer) clearTimeout(r.persistTimer);
    r.persistTimer = null;
    await this.persist(r);
  }
}

const g = globalThis as unknown as { __clubLiveHub?: LiveHub };
export const hub: LiveHub = g.__clubLiveHub ?? new LiveHub();
g.__clubLiveHub = hub;

export async function auditLive(actorId: string, action: string, sessionId: string, ip: string, meta?: Prisma.InputJsonValue) {
  await audit({ actorId, action, targetType: "LiveSession", targetId: sessionId, ip, meta });
}
