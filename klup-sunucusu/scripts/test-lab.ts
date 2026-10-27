// Explicit, synthetic pilot test. No user records or XP are created.
import "../src/server/load-env";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import https from "node:https";
import { WebSocket } from "ws";
import { labConnection, labHealth, labRequest } from "../src/server/learning/lab-client";
const owned: string[] = [];
const sockets = new Set<WebSocket>();
const pause = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const user = () => { const id = `pilot-${crypto.randomUUID()}`; owned.push(id); return id; };
async function stop(id: string) { await labRequest(id, "stop"); owned.splice(owned.indexOf(id), 1); }
async function terminalCommand(id: string, command: string, hold?: Promise<void>) {
  const { base, tls } = labConnection();
  const { ticket } = await labRequest(id, "ticket"); assert.ok(ticket);
  const url = new URL("/terminal", base); url.protocol = "wss:"; url.searchParams.set("ticket", ticket);
  await new Promise<void>((resolve, reject) => {
    const socket = new WebSocket(url, { ...tls, handshakeTimeout: 15000 }); sockets.add(socket);
    let output = "", ready = false;
    const timer = setTimeout(() => { socket.terminate(); reject(new Error("terminal timed out")); }, 30000);
    socket.on("open", () => socket.send(`${command} && printf '\\n__LAB_READY__\\n'\n`));
    socket.on("message", data => {
      output = (output + data.toString()).slice(-10000);
      if (!ready && /\r?\n__LAB_READY__\r?\n/.test(output)) {
        ready = true; clearTimeout(timer);
        if (hold) void hold.then(() => socket.close()); else socket.close();
        resolve();
      }
    });
    socket.on("error", error => { clearTimeout(timer); reject(error); });
    socket.on("close", () => { sockets.delete(socket); clearTimeout(timer); if (!ready) reject(new Error("terminal closed before command completion")); });
  });
}

async function main() {
  await labHealth();
  const { base, tls } = labConnection();
  await new Promise<void>((resolve, reject) => {
    const req = https.get(new URL("/health", base), { ca: tls.ca, rejectUnauthorized: true, timeout: 5000 }, res => { res.resume(); reject(new Error("Unauthenticated client was accepted")); });
    req.on("timeout", () => req.destroy(new Error("timeout")));
    req.on("error", error => { if (/certificate required|handshake failure|bad certificate/i.test(error.message)) resolve(); else reject(error); });
  });
  const a = user(), b = user();
  const first = await labRequest(a, "start"), second = await labRequest(b, "start");
  assert.equal(first.state, "RUNNING"); assert.equal(second.state, "RUNNING"); assert.notEqual(first.id, second.id);
  assert.equal((await labRequest(a, "check")).passed, false);
  await terminalCommand(a, "chmod 600 /home/student/incident.txt");
  assert.equal((await labRequest(a, "check")).passed, true);
  assert.equal((await labRequest(b, "check")).passed, false);
  await labRequest(a, "reset");
  assert.equal((await labRequest(a, "check")).passed, false);
  await stop(a); await stop(b);
  console.log("mTLS rejection, real shell, two independent workspaces, server verification and reset passed.");
  if (process.argv.includes("--capacity")) {
    const ids = Array.from({ length: 21 }, user);
    const sessions = [];
    for (const id of ids) sessions.push(await labRequest(id, "start"));
    assert.equal(sessions.filter(s => s.state === "RUNNING").length, 20);
    const queued = sessions[20]; assert.ok(queued);
    assert.equal(queued.state, "QUEUED"); assert.equal(queued.position, 1);
    let release!: () => void;
    const hold = new Promise<void>(resolve => { release = resolve; });
    try { await Promise.all(ids.slice(0, 20).map(id => terminalCommand(id, "test -f /home/student/incident.txt", hold))); }
    finally { release(); }
    console.log("20 concurrent authenticated PTYs executed shell commands successfully.");
    const firstId = ids[0]!, queuedId = ids[20]!;
    await stop(firstId);
    let promoted = await labRequest(queuedId, "status");
    for (let i = 0; promoted.state !== "RUNNING" && i < 10; i++) { await pause(500); promoted = await labRequest(queuedId, "status"); }
    assert.equal(promoted.state, "RUNNING");
    console.log("20 running sessions, 21st queued, FIFO promotion after release passed.");
  }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Pilot test failed"); process.exitCode = 1; }).finally(async () => {
  for (const socket of sockets) socket.terminate();
  for (const id of [...owned]) { try { await stop(id); } catch { console.error(`Synthetic session requires cleanup: ${id}`); process.exitCode = 1; } }
});
