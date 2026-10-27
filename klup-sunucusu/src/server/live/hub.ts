import { featureEnabled } from "@/server/learning/features";
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
  type ClientMessage, type ControlAction, type HelpView, type LiveState, type ParticipantView, type PollStats, type PollView, type PulseStats, type QuestionView, type ServerMessage,
} from "@/lib/live-protocol";
import type { Block } from "@/lib/deck-schema";
import { ensurePracticalAssignment, type PracticalBlock } from "@/server/classroom/practical";
import { recordLearning } from "@/server/learning/events";
import { award, XP_TX } from "@/server/xp/engine";

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

type Participant = { displayName: string; username: string; role: Role; conns: number; handRaised: boolean; handAt: number | null; connectedMs: number; since: number | null };

type PollRuntime = {
  purpose: string;
  id: string;
  kind: "QUIZ" | "POLL";
  question: string;
  options: string[];
  correctIndex: number | null;
  anonymous: boolean;
  timeLimitSec: number;
  status: "OPEN" | "CLOSED" | "REVEALED";
  closesAt: number;
  answers: Map<string, number>;
};

type PracticalInfo = { slideId: string; block: PracticalBlock };

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
  poll: PollRuntime | null;
  pollTimer: NodeJS.Timeout | null;
  practicals: (PracticalInfo | null)[]; // slayt indeksine göre uygulama molası bloğu
  help: HelpView[]; // çözülmemiş yardım talepleri (en eski önce)
  pulse: Map<string, "ok" | "slow" | "repeat">; // geçerli slayt için anlama göstergesi
};

export const LIMITS = {
  maxMessageBytes: 4096,
  maxClientsPerRoom: 400,
  maxConnsPerUser: 3,
  msgsPer10s: 40,
  questionsPerMin: 4,
  handPerMin: 12,
  announcePerMin: 10,
  pollsPerMin: 10,
  helpPerMin: 6,
  pulsePerMin: 20,
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
          version: { select: { slides: { select: { id: true, steps: true, blocks: true }, orderBy: { position: "asc" } } } },
          polls: { orderBy: { openedAt: "desc" }, take: 1, include: { answers: { select: { userId: true, choice: true } } } },
          participants: { include: { user: { select: { displayName: true, username: true, role: true } } } },
          helpRequests: { where: { resolvedAt: null }, orderBy: { createdAt: "asc" }, include: { user: { select: { displayName: true } } } },
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
            { displayName: p.user.displayName, username: p.user.username, role: p.user.role, conns: 0, handRaised: p.handRaisedAt !== null, handAt: p.handRaisedAt?.getTime() ?? null, connectedMs: p.connectedMs, since: null },
          ]),
        ),
        questions: s.events.map((e) => ({ id: e.id, userId: e.userId, displayName: e.user?.displayName ?? "—", text: e.text, at: e.createdAt.getTime(), resolved: e.resolvedAt !== null })),
        help: s.helpRequests.map((h) => ({ id: h.id, userId: h.userId, displayName: h.user.displayName, note: h.note, taskRef: h.taskRef, at: h.createdAt.getTime() })),
        pulse: new Map(),
        persistTimer: null,
        autoplayTimer: null,
        poll: null,
        pollTimer: null,
        practicals: s.version.slides.map((x) => {
          const items = ((x.blocks as unknown as { items?: Block[] }).items ?? []) as Block[];
          const b = items.find((i): i is PracticalBlock => i.type === "practical");
          return b ? { slideId: x.id, block: b } : null;
        }),
      };
      const last = s.polls[0];
      if (last) {
        room.poll = {
          id: last.id,
          kind: last.kind,
          purpose: last.purpose,
          question: last.question,
          options: last.options as string[],
          correctIndex: last.correctIndex,
          anonymous: last.anonymous,
          timeLimitSec: last.timeLimitSec,
          status: last.status,
          closesAt: last.closesAt.getTime(),
          answers: new Map(last.answers.map((a) => [a.userId, a.choice])),
        };
        this.schedulePollClose(room);
      }
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

    const p = room.participants.get(user.id) ?? { displayName: user.displayName, username: user.username, role: user.role, conns: 0, handRaised: false, handAt: null, connectedMs: 0, since: null };
    p.conns += 1;
    if (p.since === null) p.since = Date.now();
    room.participants.set(user.id, p);

    await db.sessionParticipant.upsert({
      where: { sessionId_userId: { sessionId: room.id, userId: user.id } },
      create: { sessionId: room.id, userId: user.id, connectCount: 1 },
      update: { connectCount: { increment: 1 }, lastSeenAt: new Date() },
    });

    this.send(client, { t: "welcome", you: { userId: user.id, isHost: client.isHost }, session: { id: room.id, code: room.code, title: room.title, slideCount: room.slideSteps.length }, serverNow: Date.now() });
    this.send(client, { t: "state", v: room.v, state: room.state, serverTime: Date.now() });
    if (client.isHost) {
      this.send(client, { t: "questions", items: room.questions });
      this.send(client, { t: "help.queue", items: room.help });
      this.send(client, { t: "pulse.stats", stats: this.pulseStats(room) });
    } else {
      this.send(client, { t: "you", handRaised: p.handRaised });
      this.sendHelpYou(room, client);
      this.send(client, { t: "pulse.you", value: room.pulse.get(user.id) ?? null });
    }
    this.send(client, { t: "poll", poll: this.pollView(room, client.user.id, client.isHost) });
    if (client.isHost && room.poll) this.send(client, { t: "poll.stats", stats: this.pollStats(room) });
    this.broadcastPresence(room);
    this.send(client, { t: "operation.changed", revision: Date.now() });
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
      case "poll.open":
        if (!client.isHost) return this.reject(client, "FORBIDDEN", "Quizi yalnızca eğitmen başlatabilir.");
        if (!hit(`live:poll:${room.id}`, LIMITS.pollsPerMin, 60_000).ok) return this.reject(client, "RATE_LIMITED", "Biraz bekle.");
        return this.openPoll(room, client, msg);
      case "poll.close":
        if (!client.isHost) return this.reject(client, "FORBIDDEN", "Yetkin yok.");
        return this.closePoll(room);
      case "poll.reveal":
        if (!client.isHost) return this.reject(client, "FORBIDDEN", "Yetkin yok.");
        return this.revealPoll(room);
      case "poll.answer":
        if (client.isHost) return this.reject(client, "FORBIDDEN", "Eğitmen cevap veremez.");
        return this.answerPoll(room, client, msg.pollId, msg.choice);
      case "help":
        if (client.isHost) return this.reject(client, "FORBIDDEN", "Eğitmen yardım kuyruğuna giremez.");
        if (!hit(`live:help:${room.id}:${client.user.id}`, LIMITS.helpPerMin, 60_000).ok) return this.reject(client, "RATE_LIMITED", "Biraz bekle.");
        return this.requestHelp(room, client, msg.note, msg.taskRef);
      case "help.cancel":
        return this.closeHelp(room, room.help.find((h) => h.userId === client.user.id)?.id, client.user.id);
      case "help.resolve":
        if (!client.isHost) return this.reject(client, "FORBIDDEN", "Yetkin yok.");
        return this.closeHelp(room, msg.id, client.user.id);
      case "pulse":
        if (client.isHost) return;
        if (!hit(`live:pulse:${room.id}:${client.user.id}`, LIMITS.pulsePerMin, 60_000).ok) return this.reject(client, "RATE_LIMITED", "Biraz bekle.");
        if (msg.value) room.pulse.set(client.user.id, msg.value); else room.pulse.delete(client.user.id);
        for (const c of room.clients) if (c.user.id === client.user.id) this.send(c, { t: "pulse.you", value: msg.value });
        return this.toHosts(room, { t: "pulse.stats", stats: this.pulseStats(room) });
      case "speaker.next":
        if (!client.isHost) return this.reject(client, "FORBIDDEN", "Yetkin yok.");
        return this.nextSpeaker(room, client.user.id);
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
    const slideChanged = s.slide !== room.state.slide;
    if (slideChanged && room.pulse.size) {
      // Anlama göstergesi her slaytta yeniden toplanır.
      room.pulse.clear();
      for (const cl of room.clients) this.send(cl, cl.isHost ? { t: "pulse.stats", stats: this.pulseStats(room) } : { t: "pulse.you", value: null });
    }
    this.commit(room, s);
    if (slideChanged || c.action === "goto") void this.ensurePractical(room);
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
    p.handAt = raised ? Date.now() : null;
    for (const c of room.clients) if (c.user.id === userId) this.send(c, { t: "you", handRaised: raised });
    this.broadcastPresence(room);
    await db.sessionParticipant
      .update({ where: { sessionId_userId: { sessionId: room.id, userId } }, data: { handRaisedAt: raised ? new Date() : null } })
      .catch(() => {});
    if (raised) await db.liveSessionEvent.create({ data: { sessionId: room.id, userId: byUserId, type: "HAND" } }).catch(() => {});
  }

  // ── yardım kuyruğu, anlama göstergesi, söz sırası ─────────────────────────

  private sendHelpYou(room: Room, client: Client) {
    const i = room.help.findIndex((h) => h.userId === client.user.id);
    this.send(client, { t: "help.you", pending: i >= 0, position: i >= 0 ? i + 1 : null });
  }

  private broadcastHelp(room: Room) {
    this.toHosts(room, { t: "help.queue", items: room.help });
    for (const c of room.clients) if (!c.isHost) this.sendHelpYou(room, c);
  }

  private async requestHelp(room: Room, client: Client, note: string, taskRef: string) {
    if (room.help.some((h) => h.userId === client.user.id)) return this.sendHelpYou(room, client);
    const h = await db.helpRequest.create({ data: { sessionId: room.id, userId: client.user.id, note, taskRef } });
    room.help.push({ id: h.id, userId: client.user.id, displayName: client.user.displayName, note, taskRef, at: h.createdAt.getTime() });
    this.send(client, { t: "ack", what: "hand" });
    this.broadcastHelp(room);
  }

  private async closeHelp(room: Room, id: string | undefined, byUserId: string) {
    const i = room.help.findIndex((h) => h.id === id);
    if (i < 0 || !id) return;
    room.help.splice(i, 1);
    await db.helpRequest.updateMany({ where: { id, sessionId: room.id }, data: { resolvedAt: new Date(), resolvedById: byUserId } }).catch(() => {});
    this.broadcastHelp(room);
  }

  private pulseStats(room: Room): PulseStats {
    const counts = { ok: 0, slow: 0, repeat: 0 };
    for (const v of room.pulse.values()) counts[v]++;
    return { ...counts, online: [...room.participants.values()].filter((p) => p.conns > 0 && p.role === "STUDENT").length };
  }

  private async nextSpeaker(room: Room, hostId: string) {
    const next = [...room.participants.entries()].filter(([, p]) => p.handRaised).sort((a, b) => (a[1].handAt ?? 0) - (b[1].handAt ?? 0))[0];
    if (!next) return;
    await this.setHand(room, next[0], false, hostId);
    for (const c of room.clients) if (c.user.id === next[0]) this.send(c, { t: "turn", at: Date.now() });
    this.broadcast(room, { t: "announcement", text: `Söz sırası: ${next[1].displayName}`, at: Date.now() });
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

  // ── canlı quiz / anket ────────────────────────────────────────────────────
  // Sunucu otoritesi: süre sunucuda tutulur, cevap kişi başına bir kez (DB'de birincil anahtar),
  // doğru cevap ve dağılım öğrenciye yalnız eğitmen açıkladığında gider.

  private pollView(room: Room, userId: string, isHost = false): PollView | null {
    const p = room.poll;
    if (!p) return null;
    const revealed = p.status === "REVEALED";
    return {
      id: p.id,
      purpose: p.purpose === "EXIT" ? "EXIT" : "LIVE",
      kind: p.kind,
      question: p.question,
      options: p.options,
      anonymous: p.anonymous,
      timeLimitSec: p.timeLimitSec,
      status: p.status,
      closesAt: p.closesAt,
      total: p.answers.size,
      mine: p.answers.get(userId) ?? null,
      results: revealed ? this.pollCounts(p) : null,
      // Eğitmen doğru cevabı baştan görür; öğrenci yalnız açıklanınca.
      correctIndex: (revealed || isHost) && p.kind === "QUIZ" ? p.correctIndex : null,
    };
  }

  private pollCounts(p: PollRuntime) {
    const counts = p.options.map(() => 0);
    for (const c of p.answers.values()) if (c < counts.length) counts[c]! += 1;
    return counts;
  }

  private pollStats(room: Room): PollStats {
    const p = room.poll!;
    return {
      pollId: p.id,
      counts: this.pollCounts(p),
      total: p.answers.size,
      // Anonim ankette eğitmen de kimin ne seçtiğini görmez.
      answers: p.anonymous ? null : [...p.answers.entries()].map(([uid, choice]) => ({ displayName: room.participants.get(uid)?.displayName ?? "—", choice })),
    };
  }

  private broadcastPoll(room: Room) {
    for (const c of room.clients) this.send(c, { t: "poll", poll: this.pollView(room, c.user.id, c.isHost) });
    if (room.poll) this.toHosts(room, { t: "poll.stats", stats: this.pollStats(room) });
  }

  private schedulePollClose(room: Room) {
    if (room.pollTimer) clearTimeout(room.pollTimer);
    room.pollTimer = null;
    const p = room.poll;
    if (!p || p.status !== "OPEN") return;
    room.pollTimer = setTimeout(() => void this.closePoll(room), Math.max(0, p.closesAt - Date.now()));
    room.pollTimer.unref?.();
  }

  private async openPoll(room: Room, client: Client, msg: Extract<ClientMessage, { t: "poll.open" }>) {
    if (msg.purpose === "EXIT" && (msg.kind !== "QUIZ" || !await featureEnabled("teacher-tools"))) return this.reject(client, "BAD_POLL", "Çıkış bileti kullanılamıyor.");
    if (msg.kind === "QUIZ" && (msg.correctIndex === undefined || msg.correctIndex >= msg.options.length))
      return this.reject(client, "BAD_POLL", "Quiz için doğru seçeneği işaretle.");
    if (room.poll?.status === "OPEN") await this.closePoll(room);
    const closesAt = new Date(Date.now() + msg.timeLimitSec * 1000);
    const row = await db.livePoll.create({
      data: {
        sessionId: room.id,
        purpose: msg.purpose ?? "LIVE",
        kind: msg.kind,
        question: msg.question,
        options: msg.options,
        correctIndex: msg.kind === "QUIZ" ? msg.correctIndex! : null,
        anonymous: msg.kind === "POLL" && msg.anonymous,
        timeLimitSec: msg.timeLimitSec,
        closesAt,
      },
    });
    room.poll = {
      id: row.id,
      purpose: row.purpose,
      kind: row.kind,
      question: row.question,
      options: msg.options,
      correctIndex: row.correctIndex,
      anonymous: row.anonymous,
      timeLimitSec: row.timeLimitSec,
      status: "OPEN",
      closesAt: closesAt.getTime(),
      answers: new Map(),
    };
    this.schedulePollClose(room);
    this.broadcastPoll(room);
  }

  private async closePoll(room: Room) {
    const p = room.poll;
    if (!p || p.status !== "OPEN") return;
    p.status = "CLOSED";
    if (room.pollTimer) clearTimeout(room.pollTimer);
    room.pollTimer = null;
    await db.livePoll.updateMany({ where: { id: p.id, status: "OPEN" }, data: { status: "CLOSED" } }).catch(() => {});
    this.broadcastPoll(room);
  }

  // Sonucu açıklar; quizde doğru cevaplayanlara (soru başına bir kez) XP verilir.
  private async revealPoll(room: Room) {
    const p = room.poll;
    if (!p || p.status === "REVEALED") return;
    if (p.status === "OPEN") await this.closePoll(room);
    p.status = "REVEALED";
    await db.livePoll.update({ where: { id: p.id }, data: { status: "REVEALED" } }).catch(() => {});
    this.broadcastPoll(room);
    if (p.kind !== "QUIZ" || p.correctIndex === null) return;
    for (const [userId, choice] of p.answers) {
      if (choice !== p.correctIndex) continue;
      await db
        .$transaction(async (tx) => {
          await award(tx, { userId, ruleKey: "live.quiz", key: `livequiz:${userId}:${p.id}`, source: "LIVE", refType: "LivePoll", refId: p.id, reason: p.question.slice(0, 120) });
          await recordLearning(tx, userId, `livequiz:${p.id}`, "quiz");
        }, XP_TX)
        .catch((err) => console.error("[live] quiz XP'si verilemedi", err));
    }
  }

  private async answerPoll(room: Room, client: Client, pollId: string, choice: number) {
    const p = room.poll;
    if (!p || p.id !== pollId || p.status !== "OPEN" || Date.now() > p.closesAt) return this.reject(client, "POLL_CLOSED", "Bu soru cevaba kapandı.");
    if (choice >= p.options.length) return this.reject(client, "BAD_CHOICE", "Geçersiz seçenek.");
    if (p.answers.has(client.user.id)) return this.reject(client, "ALREADY_ANSWERED", "Bu soruyu zaten cevapladın.");
    // Aynı kullanıcının birden çok cihazından eşzamanlı cevap: veritabanı birincil anahtarı tek kaydı garanti eder.
    const r = await db.livePollAnswer.createMany({ data: [{ pollId, userId: client.user.id, choice }], skipDuplicates: true });
    if (!r.count) return this.reject(client, "ALREADY_ANSWERED", "Bu soruyu zaten cevapladın.");
    p.answers.set(client.user.id, choice);
    this.send(client, { t: "ack", what: "poll" });
    // Öğrencilere yalnız kendi cevabı ve toplam sayı gider (dağılım açıklanana kadar gizli); eğitmene dağılım.
    this.broadcastPoll(room);
  }

  // ── uygulama molası ───────────────────────────────────────────────────────
  private async ensurePractical(room: Room) {
    const slide = room.state.slide;
    const info = room.practicals[slide];
    if (!info || room.state.practicals?.[String(slide)]) return;
    try {
      const r = await ensurePracticalAssignment(room.id, info.slideId, info.block, room.hostId);
      if (room.state.practicals?.[String(slide)]) return;
      this.commit(room, { ...room.state, practicals: { ...(room.state.practicals ?? {}), [String(slide)]: r } });
    } catch (err) {
      console.error("[live] uygulama molası görevi oluşturulamadı", err);
    }
  }

  // ── oturumu bitirme ───────────────────────────────────────────────────────

  /** Oturumu kapatır: herkese bildirir, bağlantıları kapatır, katılım sürelerini yazar. */
  async end(sessionId: string) {
    const room = this.rooms.get(sessionId);
    if (!room) return;
    if (room.autoplayTimer) clearTimeout(room.autoplayTimer);
    if (room.persistTimer) clearTimeout(room.persistTimer);
    if (room.pollTimer) clearTimeout(room.pollTimer);
    if (room.poll?.status === "OPEN") await db.livePoll.updateMany({ where: { id: room.poll.id, status: "OPEN" }, data: { status: "CLOSED" } }).catch(() => {});
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

  notifyOperation(sessionId: string) {
    const room = this.rooms.get(sessionId);
    if (room) this.broadcast(room, { t: "operation.changed", revision: Date.now() });
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
        handAt: p.handAt,
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
      if (r.pollTimer) clearTimeout(r.pollTimer);
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
