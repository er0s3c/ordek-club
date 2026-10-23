import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { hub, type Conn, type HubUser } from "@/server/live/hub";
import { createFromTemplate, loadClientDeck } from "@/server/presentations";
import { startSession } from "@/server/live/service";
import { getAssignmentForStudent, submitAssignment } from "@/server/classroom/assignments";
import type { ServerMessage } from "@/lib/live-protocol";
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
const xpOf = async (userId: string) => (await db.xpTransaction.aggregate({ where: { userId }, _sum: { amount: true } }))._sum.amount ?? 0;

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
  return { inst, s1, s2, live, p, host, a, b, ch, ca, cb, send };
}

const QUIZ = { t: "poll.open", kind: "QUIZ", question: "SYN'e cevap hangisi?", options: ["ACK", "SYN-ACK", "FIN"], correctIndex: 1, timeLimitSec: 30 };

describe("canlı quiz / anket", () => {
  beforeEach(async () => {
    hub.reset();
    await resetDb();
    await completeSetupFixture();
  });
  afterEach(() => hub.reset());

  it("yalnız eğitmen açar; quizde doğru seçenek zorunlu", async () => {
    const { ca, ch, a, host, send } = await setup();
    await send(ca, QUIZ);
    expect(a.last("error")!.code).toBe("FORBIDDEN");
    await send(ch, { ...QUIZ, correctIndex: undefined });
    expect(host.last("error")!.code).toBe("BAD_POLL");
    await send(ch, { ...QUIZ, correctIndex: 5 });
    expect(host.last("error")!.code).toBe("BAD_POLL");
    expect(await db.livePoll.count()).toBe(0);
  });

  it("öğrenci doğru cevabı ve dağılımı açıklanana kadar görmez; eğitmen canlı dağılımı görür", async () => {
    const { ch, ca, cb, a, b, host, send } = await setup();
    await send(ch, QUIZ);
    const view = a.last("poll")!.poll!;
    expect(view).toMatchObject({ status: "OPEN", correctIndex: null, results: null, total: 0, mine: null });
    expect(host.last("poll")!.poll!.correctIndex).toBe(1);
    await send(ca, { t: "poll.answer", pollId: view.id, choice: 1 });
    expect(a.last("ack")!.what).toBe("poll");
    expect(a.last("poll")!.poll).toMatchObject({ mine: 1, total: 1, results: null, correctIndex: null });
    expect(b.last("poll")!.poll).toMatchObject({ mine: null, total: 1, results: null });
    expect(host.last("poll.stats")!.stats).toMatchObject({ counts: [0, 1, 0], total: 1 });
    expect(host.last("poll.stats")!.stats.answers![0]!.choice).toBe(1);
    expect(a.all("poll.stats")).toHaveLength(0);
    expect(b.all("poll.stats")).toHaveLength(0);
    await send(cb, { t: "poll.answer", pollId: view.id, choice: 0 });
    expect(host.last("poll.stats")!.stats.counts).toEqual([1, 1, 0]);
  });

  it("cevap kişi başına bir kez; kapanınca cevap alınmaz; sahte poll kimliği reddedilir", async () => {
    const { ch, ca, cb, a, b, send } = await setup();
    await send(ch, QUIZ);
    const id = a.last("poll")!.poll!.id;
    await send(ca, { t: "poll.answer", pollId: id, choice: 1 });
    await send(ca, { t: "poll.answer", pollId: id, choice: 0 });
    expect(a.last("error")!.code).toBe("ALREADY_ANSWERED");
    await send(cb, { t: "poll.answer", pollId: "baska", choice: 0 });
    expect(b.last("error")!.code).toBe("POLL_CLOSED");
    await send(cb, { t: "poll.answer", pollId: id, choice: 5 });
    expect(b.last("error")!.code).toBe("BAD_CHOICE");
    await send(ch, { t: "poll.close" });
    expect(b.last("poll")!.poll!.status).toBe("CLOSED");
    await send(cb, { t: "poll.answer", pollId: id, choice: 1 });
    expect(b.last("error")!.code).toBe("POLL_CLOSED");
    expect(await db.livePollAnswer.count({ where: { pollId: id } })).toBe(1);
  });

  it("süre dolunca sunucu soruyu kendiliğinden kapatır", async () => {
    const { ch, cb, b, send } = await setup();
    await send(ch, { ...QUIZ, timeLimitSec: 10 });
    const p = b.last("poll")!.poll!;
    // Süreyi beklemeden: kapanış zamanını geçmişe çek (sunucu her cevapta da kontrol eder)
    const room = (hub as unknown as { rooms: Map<string, { poll: { closesAt: number } }> }).rooms;
    for (const r of room.values()) r.poll.closesAt = Date.now() - 1;
    await send(cb, { t: "poll.answer", pollId: p.id, choice: 1 });
    expect(b.last("error")!.code).toBe("POLL_CLOSED");
  });

  it("açıklama: sonuç herkese gider; quizde yalnız doğru cevaplayan bir kez XP alır", async () => {
    const { ch, ca, cb, a, b, s1, s2, send } = await setup();
    await send(ch, QUIZ);
    const id = a.last("poll")!.poll!.id;
    await send(ca, { t: "poll.answer", pollId: id, choice: 1 });
    await send(cb, { t: "poll.answer", pollId: id, choice: 2 });
    await send(ch, { t: "poll.reveal" });
    expect(a.last("poll")!.poll).toMatchObject({ status: "REVEALED", correctIndex: 1, results: [0, 1, 1], mine: 1 });
    expect(b.last("poll")!.poll).toMatchObject({ results: [0, 1, 1], mine: 2 });
    await sleep(50);
    expect(await xpOf(s1.user.id)).toBe(10);
    expect(await xpOf(s2.user.id)).toBe(0);
    await send(ch, { t: "poll.reveal" }); // tekrar açıklamak XP'yi çoğaltmaz
    await sleep(50);
    expect(await xpOf(s1.user.id)).toBe(10);
    expect((await db.livePoll.findUniqueOrThrow({ where: { id } })).status).toBe("REVEALED");
  });

  it("anonim ankette eğitmen bile kimin ne seçtiğini görmez; XP yok", async () => {
    const { ch, ca, a, host, s1, send } = await setup();
    await send(ch, { t: "poll.open", kind: "POLL", question: "Hız nasıl?", options: ["Yavaş", "İyi", "Hızlı"], anonymous: true, timeLimitSec: 30 });
    const id = a.last("poll")!.poll!.id;
    await send(ca, { t: "poll.answer", pollId: id, choice: 2 });
    expect(host.last("poll.stats")!.stats).toMatchObject({ counts: [0, 0, 1], answers: null });
    await send(ch, { t: "poll.reveal" });
    await sleep(50);
    expect(await xpOf(s1.user.id)).toBe(0);
  });

  it("yeni katılan / yeniden bağlanan öğrenci açık soruyu ve kendi cevabını görür", async () => {
    const { live, ch, ca, a, s1, send } = await setup();
    await send(ch, QUIZ);
    const id = a.last("poll")!.poll!.id;
    await send(ca, { t: "poll.answer", pollId: id, choice: 0 });
    hub.reset(); // sunucu yeniden başlamış gibi: oda veritabanından yüklenir
    const again = new FakeConn();
    await hub.join(live.id, asHubUser(s1.user), again, s1.token);
    expect(again.last("poll")!.poll).toMatchObject({ id, mine: 0, total: 1, status: "OPEN" });
  });
});

describe("VMware uygulama molası", () => {
  beforeEach(async () => {
    hub.reset();
    await resetDb();
    await completeSetupFixture();
  });
  afterEach(() => hub.reset());

  it("öğrenci destesinde eğitmen notları (VM, snapshot, beklenen sonuç) yoktur", async () => {
    const { p } = await setup();
    const pres = await db.presentation.findUniqueOrThrow({ where: { id: p.id } });
    const find = (d: Awaited<ReturnType<typeof loadClientDeck>>) => d.slides.flatMap((s) => s.blocks).find((b) => b.type === "practical")!;
    const student = find(await loadClientDeck(pres.currentVersionId!, false));
    const host = find(await loadClientDeck(pres.currentVersionId!, true));
    expect(student.type === "practical" && student.host).toEqual({ prepNotes: "", vms: [], snapshot: "", expected: "" });
    expect(student.type === "practical" && student.steps.length).toBeGreaterThan(0);
    expect(host.type === "practical" && host.host.expected).toContain("SYN-ACK");
  });

  it("uygulama slaytına geçilince bağlı görev bir kez oluşur; öğrenci teslim eder", async () => {
    const { live, ch, a, s1, send } = await setup();
    const slide = 7; // ağ temelleri şablonunda uygulama molası
    await send(ch, { t: "control", c: { action: "goto", slide, step: 0 } });
    await sleep(100);
    const info = a.last("state")!.state.practicals[String(slide)];
    expect(info).toBeDefined();
    const asg = await db.assignment.findUniqueOrThrow({ where: { id: info!.assignmentId } });
    expect(asg).toMatchObject({ kind: "VMWARE", status: "PUBLISHED", liveSessionId: live.id, allowLate: true });
    expect(asg.description).not.toContain("ack=x+1"); // beklenen sonuç görev metnine sızmaz
    expect(asg.description).not.toContain("host-only"); // hazırlık notu da

    // Geri gidip yeniden gelmek ikinci görev oluşturmaz
    await send(ch, { t: "control", c: { action: "goto", slide: 0, step: 0 } });
    await send(ch, { t: "control", c: { action: "goto", slide, step: 0 } });
    await sleep(100);
    expect(await db.assignment.count({ where: { liveSessionId: live.id } })).toBe(1);

    const actor = { id: s1.user.id, role: s1.user.role, status: s1.user.status };
    expect((await getAssignmentForStudent(actor, asg.id)).title).toContain("Uygulama");
    const sub = await submitAssignment(actor, asg.id, { text: "seq=0 / ack=1", files: [] }, "ip");
    expect(sub.status).toBe("SUBMITTED");
  });
});
