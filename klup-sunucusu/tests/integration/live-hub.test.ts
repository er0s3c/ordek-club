import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { hub, LIMITS, type Conn, type HubUser } from "@/server/live/hub";
import { createFromTemplate } from "@/server/presentations";
import { endSession, startSession } from "@/server/live/service";
import { revokeUserSessions } from "@/server/auth/session";
import { WS_CLOSE, type ServerMessage } from "@/lib/live-protocol";
import { completeSetupFixture, makeUser, resetDb } from "../helpers";

class FakeConn implements Conn {
  msgs: ServerMessage[] = [];
  closed: { code: number; reason: string } | null = null;
  send(d: string) { this.msgs.push(JSON.parse(d)); }
  close(code: number, reason: string) { this.closed = { code, reason }; }
  isOpen() { return this.closed === null; }
  last<T extends ServerMessage["t"]>(t: T) { return [...this.msgs].reverse().find((m) => m.t === t) as Extract<ServerMessage, { t: T }> | undefined; }
  all<T extends ServerMessage["t"]>(t: T) { return this.msgs.filter((m) => m.t === t) as Extract<ServerMessage, { t: T }>[]; }
}

const asHubUser = (u: { id: string; displayName: string; username: string; role: HubUser["role"] }): HubUser => ({ ...u, status: "ACTIVE" });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function setup() {
  const inst = await makeUser({ role: "INSTRUCTOR" });
  const s1 = await makeUser();
  const s2 = await makeUser();
  const actor = { id: inst.user.id, role: inst.user.role, status: inst.user.status };
  const p = await createFromTemplate(actor, "network-fundamentals", "10.0.0.1");
  const live = await startSession(actor, p.id, "10.0.0.1");
  const host = new FakeConn(), a = new FakeConn(), b = new FakeConn();
  const ch = await hub.join(live.id, asHubUser(inst.user), host, inst.token);
  const ca = await hub.join(live.id, asHubUser(s1.user), a, s1.token);
  const cb = await hub.join(live.id, asHubUser(s2.user), b, s2.token);
  const send = (c: typeof ch, m: unknown) => hub.handle(live.id, c, JSON.stringify(m));
  return { inst, s1, s2, actor, live, host, a, b, ch, ca, cb, send };
}

describe("canlı sınıf hub'ı", () => {
  beforeEach(async () => {
    hub.reset();
    await resetDb();
    await completeSetupFixture();
  });
  afterEach(() => hub.reset());

  it("katılımda karşılama + anlık durum; eğitmen isHost, öğrenci değil", async () => {
    const { host, a } = await setup();
    expect(host.last("welcome")!.you.isHost).toBe(true);
    expect(a.last("welcome")!.you.isHost).toBe(false);
    expect(a.last("state")!.state).toMatchObject({ slide: 0, step: 0, paused: false });
  });

  it("eğitmen ileri/geri/goto ile durumu değiştirir; sürüm her değişiklikte artar ve herkese yayınlanır", async () => {
    const { live, ch, a, b, send } = await setup();
    const v0 = a.last("state")!.v;
    await send(ch, { t: "control", c: { action: "next" } }); // slayt 0 tek adımlı → slayt 1
    expect(a.last("state")).toMatchObject({ v: v0 + 1, state: { slide: 1, step: 0 } });
    expect(b.last("state")!.v).toBe(v0 + 1);
    await send(ch, { t: "control", c: { action: "next" } }); // slayt 1 animasyonlu → adım 1
    expect(a.last("state")!.state).toMatchObject({ slide: 1, step: 1 });
    await send(ch, { t: "control", c: { action: "goto", slide: 99, step: 99 } }); // sınırlar kısıtlanır
    const st = a.last("state")!.state;
    expect(st.slide).toBe(7);
    expect(st.step).toBeLessThan(10);
    await send(ch, { t: "control", c: { action: "prev" } });
    expect(a.last("state")!.v).toBe(v0 + 4);
    await hub.flush(live.id);
    const row = await db.liveSession.findUniqueOrThrow({ where: { id: live.id } });
    expect(row.stateVersion).toBe(v0 + 4);
  });

  it("öğrenci akışı DEĞİŞTİREMEZ ve duyuru gönderemez", async () => {
    const { ca, a, b, send } = await setup();
    const before = b.last("state")!.v;
    for (const c of [{ action: "next" }, { action: "goto", slide: 3 }, { action: "pause", value: true }, { action: "freeNav", value: true }]) {
      await send(ca, { t: "control", c });
    }
    await send(ca, { t: "announce", text: "sınav iptal!" });
    await send(ca, { t: "resolve", id: "x" });
    await send(ca, { t: "lowerHand", userId: "y" });
    expect(a.all("error").filter((e) => e.code === "FORBIDDEN")).toHaveLength(7);
    expect(b.last("state")!.v).toBe(before);
    expect(b.all("announcement")).toHaveLength(0);
  });

  it("yeniden bağlanma: eski sürümle hello → tam anlık görüntü; güncel sürümle gereksiz mesaj yok", async () => {
    const { live, ch, a, s1, send } = await setup();
    await send(ch, { t: "control", c: { action: "next" } });
    await send(ch, { t: "control", c: { action: "next" } });
    const fresh = new FakeConn();
    const c2 = await hub.join(live.id, asHubUser(s1.user), fresh, s1.token);
    const n = fresh.all("state").length;
    await hub.handle(live.id, c2, JSON.stringify({ t: "hello", lastVersion: 0 }));
    expect(fresh.all("state").length).toBe(n + 1);
    expect(fresh.last("state")!.state).toEqual(a.last("state")!.state);
    await hub.handle(live.id, c2, JSON.stringify({ t: "hello", lastVersion: fresh.last("state")!.v }));
    expect(fresh.all("state").length).toBe(n + 1);
  });

  it("katılımcı listesi (ad, süre) yalnızca eğitmene; öğrenciler yalnızca sayıyı görür", async () => {
    const { host, a } = await setup();
    const hp = host.last("presence")!;
    expect(hp.online).toBe(3);
    expect(hp.participants!.map((p) => p.username)).toHaveLength(3);
    const sp = a.last("presence")!;
    expect(sp.online).toBe(3);
    expect(sp.participants).toBeUndefined();
  });

  it("sorular yalnızca eğitmene gider; yanıtlandı işareti kalıcıdır", async () => {
    const { live, ch, ca, host, a, b, send } = await setup();
    await send(ca, { t: "question", text: "  TTL neden azalır?  " });
    expect(a.last("ack")!.what).toBe("question");
    const q = host.last("questions")!.items;
    expect(q).toHaveLength(1);
    expect(q[0]!.text).toBe("TTL neden azalır?");
    expect(a.all("questions")).toHaveLength(0);
    expect(b.all("questions")).toHaveLength(0);
    await send(ch, { t: "resolve", id: q[0]!.id });
    expect(host.last("questions")!.items[0]!.resolved).toBe(true);
    const ev = await db.liveSessionEvent.findFirstOrThrow({ where: { sessionId: live.id, type: "QUESTION" } });
    expect(ev.resolvedAt).not.toBeNull();
  });

  it("el kaldırma: öğrenci kaldırır, eğitmen görür ve indirebilir", async () => {
    const { ch, ca, s1, host, a, send } = await setup();
    await send(ca, { t: "hand", raised: true });
    expect(a.last("you")!.handRaised).toBe(true);
    expect(host.last("presence")!.participants!.find((p) => p.userId === s1.user.id)!.handRaised).toBe(true);
    await send(ch, { t: "lowerHand", userId: s1.user.id });
    expect(a.last("you")!.handRaised).toBe(false);
  });

  it("duyuru herkese yayınlanır ve kaydedilir", async () => {
    const { live, ch, a, b, send } = await setup();
    await send(ch, { t: "announce", text: "5 dk mola" });
    expect(a.last("announcement")!.text).toBe("5 dk mola");
    expect(b.last("announcement")!.text).toBe("5 dk mola");
    expect(await db.liveSessionEvent.count({ where: { sessionId: live.id, type: "ANNOUNCEMENT" } })).toBe(1);
  });

  it("geçersiz, büyük ve aşırı sık mesajlar reddedilir; ısrar edenin bağlantısı kapanır", async () => {
    const { live, ca, a } = await setup();
    await hub.handle(live.id, ca, "{bozuk json");
    await hub.handle(live.id, ca, JSON.stringify({ t: "nope" }));
    await hub.handle(live.id, ca, "x".repeat(LIMITS.maxMessageBytes + 1));
    expect(a.all("error").map((e) => e.code)).toEqual(["BAD_JSON", "BAD_MESSAGE", "TOO_LARGE"]);
    for (let i = 0; i < LIMITS.msgsPer10s + 5; i++) await hub.handle(live.id, ca, JSON.stringify({ t: "ping" }));
    expect(a.all("error").some((e) => e.code === "RATE_LIMITED")).toBe(true);
    expect(a.closed?.code).toBe(WS_CLOSE.RATE);
  });

  it("soru gönderme hız sınırı (dakikada 4)", async () => {
    const { ca, a, host, send } = await setup();
    for (let i = 0; i < 6; i++) await send(ca, { t: "question", text: `soru ${i}` });
    expect(host.last("questions")!.items).toHaveLength(4);
    expect(a.all("error").filter((e) => e.code === "RATE_LIMITED")).toHaveLength(2);
  });

  it("otomatik oynatma adımları sunucuda ilerletir ve slayt sonunda durur; duraklatma otomatiği kapatır", async () => {
    const old = LIMITS.autoplayBaseMs;
    LIMITS.autoplayBaseMs = 40;
    try {
      const { ch, a, send } = await setup();
      await send(ch, { t: "control", c: { action: "goto", slide: 3, step: 0 } }); // TCP el sıkışma: 5 adım
      await send(ch, { t: "control", c: { action: "speed", value: 2 } });
      await send(ch, { t: "control", c: { action: "autoplay", value: true } });
      await sleep(250);
      const st = a.last("state")!.state;
      expect(st.slide).toBe(3);
      expect(st.step).toBe(4);
      expect(st.autoplay).toBe(false);
      await send(ch, { t: "control", c: { action: "autoplay", value: true } });
      await send(ch, { t: "control", c: { action: "pause", value: true } });
      expect(a.last("state")!.state).toMatchObject({ paused: true, autoplay: false });
    } finally {
      LIMITS.autoplayBaseMs = old;
    }
  });

  it("sunucu yeniden başlasa da (hub sıfırlanır) durum veritabanından geri gelir", async () => {
    const { live, ch, s1, send } = await setup();
    await send(ch, { t: "control", c: { action: "goto", slide: 4, step: 2 } });
    await send(ch, { t: "control", c: { action: "freeNav", value: true } });
    await hub.flush(live.id);
    hub.reset(); // süreç yeniden başladı
    const c = new FakeConn();
    await hub.join(live.id, asHubUser(s1.user), c, s1.token);
    expect(c.last("state")!.state).toMatchObject({ slide: 4, step: 2, freeNav: true });
  });

  it("katılım süresi periyodik olarak yazılır: süreç çökse de bağlı kalınan süre kaybolmaz", async () => {
    const { live, s1 } = await setup();
    await sleep(60);
    await hub.checkpoint(); // revalidateAll her 30 sn'de bunu çağırır
    hub.reset(); // çökme: leave() hiç çalışmadı
    const p = await db.sessionParticipant.findUniqueOrThrow({ where: { sessionId_userId: { sessionId: live.id, userId: s1.user.id } } });
    expect(p.connectedMs).toBeGreaterThanOrEqual(50);
  });

  it("oturum iptal edilen (çıkış/devre dışı) kullanıcının soketi periyodik doğrulamada kapanır", async () => {
    const { s1, a, b } = await setup();
    await revokeUserSessions(s1.user.id);
    await hub.revalidateAll();
    expect(a.closed?.code).toBe(WS_CLOSE.UNAUTHORIZED);
    expect(b.closed).toBeNull();
  });

  it("aynı kullanıcı en fazla 3 cihazdan bağlanabilir", async () => {
    const { live, s1 } = await setup();
    await hub.join(live.id, asHubUser(s1.user), new FakeConn(), s1.token);
    await hub.join(live.id, asHubUser(s1.user), new FakeConn(), s1.token);
    await expect(hub.join(live.id, asHubUser(s1.user), new FakeConn(), s1.token)).rejects.toThrow(/çok fazla cihaz/);
  });

  it("dersi bitirme: herkese 'ended', bağlantılar 4000 ile kapanır, katılım süresi yazılır", async () => {
    const { live, actor, s1, a, host } = await setup();
    await sleep(30);
    await endSession(actor, live.id, "10.0.0.1");
    expect(a.last("ended")).toBeDefined();
    expect(a.closed?.code).toBe(WS_CLOSE.ENDED);
    expect(host.closed?.code).toBe(WS_CLOSE.ENDED);
    const p = await db.sessionParticipant.findUniqueOrThrow({ where: { sessionId_userId: { sessionId: live.id, userId: s1.user.id } } });
    expect(p.connectedMs).toBeGreaterThan(0);
    expect((await db.liveSession.findUniqueOrThrow({ where: { id: live.id } })).status).toBe("ENDED");
    await expect(hub.join(live.id, asHubUser(s1.user), new FakeConn(), s1.token)).rejects.toThrow(/bulunamadı/);
  });

  it("öğrenci ve başka eğitmen dersi bitiremez", async () => {
    const { live, s1 } = await setup();
    const other = await makeUser({ role: "INSTRUCTOR" });
    await expect(endSession({ id: s1.user.id, role: "STUDENT", status: "ACTIVE" }, live.id, "x")).rejects.toThrow(/bulunamadı/);
    await expect(endSession({ id: other.user.id, role: "INSTRUCTOR", status: "ACTIVE" }, live.id, "x")).rejects.toThrow(/bulunamadı/);
    expect((await db.liveSession.findUniqueOrThrow({ where: { id: live.id } })).status).toBe("ACTIVE");
  });
});
