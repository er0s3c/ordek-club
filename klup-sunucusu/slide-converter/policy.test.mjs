import { test } from "node:test";
import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MAX_BYTES, checkRequest, createQueue, detectType, secretOk, sofficeArgs, REGISTRY_XCU } from "./policy.mjs";
import { createConverter, runWithTimeout } from "./server.mjs";

const SECRET = "s".repeat(40);
const here = path.dirname(fileURLToPath(import.meta.url));
const PPTX = Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from("....[Content_Types].xml....ppt/slides/slide1.xml....")]);
const PPT = Buffer.concat([Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), Buffer.alloc(64), Buffer.from("PowerPoint Document", "utf16le")]);
const headers = (o = {}) => ({ "x-converter-secret": SECRET, "x-file-type": "pptx", "content-type": "application/octet-stream", "content-length": "100", ...o });

test("tür içerikten bulunur; uzantı/başlık tek başına yetmez", () => {
  assert.equal(detectType(PPTX), "pptx");
  assert.equal(detectType(PPT), "ppt");
  assert.equal(detectType(Buffer.from("%PDF-1.7 ....")), null);
  assert.equal(detectType(Buffer.concat([Buffer.from([0x50, 0x4b, 0x03, 0x04]), Buffer.from("word/document.xml [Content_Types].xml")])), null); // docx
  assert.equal(detectType(Buffer.concat([Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), Buffer.alloc(64)])), null); // msi/doc
  assert.equal(detectType(Buffer.from([0x4d, 0x5a, 0x90, 0, 0, 0, 0, 0])), null);
});

test("istek politikası: gizli anahtar, tür, boyut", () => {
  assert.equal(checkRequest({ method: "POST", url: "/convert", headers: headers() }, SECRET), null);
  assert.equal(checkRequest({ method: "GET", url: "/convert", headers: headers() }, SECRET)[0], 404);
  assert.equal(checkRequest({ method: "POST", url: "/convert", headers: headers({ "x-converter-secret": "yanlis" }) }, SECRET)[0], 401);
  assert.equal(checkRequest({ method: "POST", url: "/convert", headers: headers({ "x-file-type": "docx" }) }, SECRET)[0], 415);
  assert.equal(checkRequest({ method: "POST", url: "/convert", headers: headers({ "content-length": undefined }) }, SECRET)[0], 411);
  assert.equal(checkRequest({ method: "POST", url: "/convert", headers: headers({ "content-length": String(MAX_BYTES + 1) }) }, SECRET)[0], 413);
  assert.equal(checkRequest({ method: "POST", url: "/convert", headers: headers({ "content-length": String(MAX_BYTES) }) }, SECRET), null);
  assert.ok(!secretOk("", ""));
  assert.ok(!secretOk("kisa", "kisa"));
  assert.throws(() => createConverter({ secret: "kisa" }));
});

test("LibreOffice: iş başına geçici profil, makrolar kapalı", () => {
  const args = sofficeArgs("/tmp/conv-abc", "input.pptx");
  assert.ok(args.includes("-env:UserInstallation=file:///tmp/conv-abc/profile"));
  assert.ok(args.includes("--headless") && args.includes("--norestore"));
  assert.match(REGISTRY_XCU, /MacroSecurityLevel[\s\S]*<value>3<\/value>/);
  assert.match(REGISTRY_XCU, /DisableMacrosExecution[\s\S]*<value>true<\/value>/);
});

test("kuyruk: tek eşzamanlılık, dolunca reddeder", async () => {
  const q = createQueue(1);
  let running = 0, peak = 0;
  const job = () => q.run(async () => { running++; peak = Math.max(peak, running); await new Promise((r) => setTimeout(r, 20)); running--; return 1; });
  const a = job(), b = job(), c = job();
  assert.ok(a && b);
  assert.equal(c, null);
  await Promise.all([a, b]);
  assert.equal(peak, 1);
  assert.ok(q.run(async () => 2));
});

test("süre aşımı süreci öldürür", async () => {
  const t = Date.now();
  const r = await runWithTimeout(process.execPath, ["-e", "setInterval(()=>{},1000)"], 300);
  assert.equal(r.timedOut, true);
  assert.ok(Date.now() - t < 5000);
});

async function withServer(fn) {
  const server = createConverter({ secret: SECRET, soffice: [process.execPath, path.join(here, "test", "fake-soffice.mjs")], tmpDir: os.tmpdir(), timeoutMs: 500, log: {} });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${server.address().port}/convert`;
  try {
    await fn(url);
  } finally {
    await new Promise((r) => server.close(r));
  }
}
const post = (url, body, h = {}) => fetch(url, { method: "POST", body, headers: { "content-type": "application/octet-stream", "x-converter-secret": SECRET, "x-file-type": "pptx", ...h } });

test("uçtan uca: PDF döner; sahte tür, yanlış anahtar, bozuk dosya ve süre aşımı reddedilir", async () => {
  await withServer(async (url) => {
    const ok = await post(url, PPTX);
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get("content-type"), "application/pdf");
    assert.match(await ok.text(), /^%PDF-/);
    assert.equal((await post(url, PPT, { "x-file-type": "pptx" })).status, 415); // içerik ppt, başlık pptx
    assert.equal((await post(url, Buffer.from("%PDF-1.7 sahte"))).status, 415);
    assert.equal((await post(url, PPTX, { "x-converter-secret": "x".repeat(40) })).status, 401);
    assert.equal((await post(url, Buffer.concat([PPTX, Buffer.from("MODE:broken")]))).status, 422);
    assert.equal((await post(url, Buffer.concat([PPTX, Buffer.from("MODE:slow")]))).status, 504);
  });
});
