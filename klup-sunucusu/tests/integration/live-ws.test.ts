import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import WebSocket from "ws";
import { hub } from "@/server/live/hub";
import { createLiveUpgradeHandler } from "@/server/live/ws-server";
import { createFromTemplate } from "@/server/presentations";
import { startSession } from "@/server/live/service";
import type { ServerMessage } from "@/lib/live-protocol";
import { completeSetupFixture, makeUser, resetDb } from "../helpers";

let server: http.Server;
let liveHandler: ReturnType<typeof createLiveUpgradeHandler>;
let base: string;

beforeAll(async () => {
  liveHandler = createLiveUpgradeHandler();
  server = http.createServer((_req, res) => res.end());
  server.on("upgrade", (req, socket, head) => {
    if (!liveHandler.handleUpgrade(req, socket, head)) socket.destroy();
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  base = `127.0.0.1:${(server.address() as AddressInfo).port}`;
});
// Yükseltilmiş soketler http sunucusunun bağlantı listesinde değildir: kapatmadan önce sonlandır.
afterAll(async () => {
  for (const c of liveHandler.wss.clients) c.terminate();
  server.closeAllConnections();
  await new Promise<void>((r) => server.close(() => r()));
});

type Opened = { ws: WebSocket; msgs: ServerMessage[]; waitFor: <T extends ServerMessage["t"]>(t: T, pred?: (m: Extract<ServerMessage, { t: T }>) => boolean) => Promise<Extract<ServerMessage, { t: T }>> };

function open(code: string, opts: { cookie?: string; origin?: string | null }): Promise<Opened | { status: number }> {
  const headers: Record<string, string> = {};
  if (opts.cookie) headers.cookie = opts.cookie;
  if (opts.origin !== null) headers.origin = opts.origin ?? `http://${base}`;
  const ws = new WebSocket(`ws://${base}/ws/live?code=${code}`, { headers });
  const msgs: ServerMessage[] = [];
  const waiters: (() => void)[] = [];
  ws.on("message", (d) => {
    msgs.push(JSON.parse(String(d)));
    waiters.splice(0).forEach((w) => w());
  });
  const waitFor: Opened["waitFor"] = (t, pred) =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`zaman aşımı: ${t}`)), 3000);
      const check = () => {
        const m = [...msgs].reverse().find((x) => x.t === t && (!pred || pred(x as never)));
        if (m) {
          clearTimeout(timeout);
          resolve(m as never);
        } else waiters.push(check);
      };
      check();
    });
  return new Promise((resolve) => {
    ws.on("open", () => resolve({ ws, msgs, waitFor }));
    ws.on("unexpected-response", (_req, res) => resolve({ status: res.statusCode ?? 0 }));
    ws.on("error", () => {});
  });
}

const isOpen = (x: Opened | { status: number }): x is Opened => "ws" in x;

describe("WebSocket yükseltme güvenliği ve senkronizasyon (gerçek soket)", () => {
  let code = "";
  let host: Awaited<ReturnType<typeof makeUser>>;
  let student: Awaited<ReturnType<typeof makeUser>>;

  beforeEach(async () => {
    hub.reset();
    await resetDb();
    await completeSetupFixture();
    host = await makeUser({ role: "INSTRUCTOR" });
    student = await makeUser();
    const actor = { id: host.user.id, role: host.user.role, status: host.user.status };
    const p = await createFromTemplate(actor, "http-security-101", "127.0.0.1");
    code = (await startSession(actor, p.id, "127.0.0.1")).code;
  });

  it("çerezsiz bağlantı 401, yabancı Origin 403, Origin'siz 403, bilinmeyen kod 404", async () => {
    expect(await open(code, {})).toEqual({ status: 401 });
    expect(await open(code, { cookie: student.cookie, origin: "https://evil.example" })).toEqual({ status: 403 });
    expect(await open(code, { cookie: student.cookie, origin: null })).toEqual({ status: 403 });
    expect(await open("ZZZZZZ", { cookie: student.cookie })).toEqual({ status: 404 });
    expect(await open(code, { cookie: "club_session=sahte-token-degeri-uzun-1234567890" })).toEqual({ status: 401 });
  });

  it("eğitmenin slayt değişikliği öğrencinin ekranına anında yansır; öğrencinin kontrol denemesi reddedilir", async () => {
    const h = await open(code, { cookie: host.cookie });
    const s = await open(code.toLowerCase(), { cookie: student.cookie });
    if (!isOpen(h) || !isOpen(s)) throw new Error("bağlanamadı");
    expect((await h.waitFor("welcome")).you.isHost).toBe(true);
    const first = await s.waitFor("state");

    h.ws.send(JSON.stringify({ t: "control", c: { action: "next" } }));
    const moved = await s.waitFor("state", (m) => m.v === first.v + 1);
    // Slayt 0 tek adımlı → slayt 1, adım 0
    expect(moved.state).toMatchObject({ slide: 1, step: 0 });

    s.ws.send(JSON.stringify({ t: "control", c: { action: "goto", slide: 5 } }));
    expect((await s.waitFor("error")).code).toBe("FORBIDDEN");

    // Bağlantı kopar → yeniden bağlanınca güncel durumu alır
    s.ws.close();
    h.ws.send(JSON.stringify({ t: "control", c: { action: "next" } }));
    await h.waitFor("state", (m) => m.v === first.v + 2);
    const s2 = await open(code, { cookie: student.cookie });
    if (!isOpen(s2)) throw new Error("bağlanamadı");
    s2.ws.send(JSON.stringify({ t: "hello", lastVersion: first.v + 1 }));
    // Slayt 1 maddeleri tek tek açıyor → aynı slayt, adım 1
    expect((await s2.waitFor("state", (m) => m.v === first.v + 2)).state).toMatchObject({ slide: 1, step: 1 });

    h.ws.close();
    s2.ws.close();
  });
});
