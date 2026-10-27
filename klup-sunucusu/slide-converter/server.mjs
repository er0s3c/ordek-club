// Ördek Club slayt dönüştürücü: PPTX/PPT → PDF (LibreOffice headless).
// Yalnız iç ağda, Club uygulamasından gelen isteklere hizmet eder (paylaşılan gizli anahtar). Ağ çıkışı yok,
// kök dosya sistemi salt-okunur, iş başına geçici profil, makrolar kapalı, 90 sn sınır, tek eşzamanlılık.
// Doğrudan çalıştırılınca dinlemeye başlar; içe aktarılınca (testler) servis başlatmaz.
import http from "node:http";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { MAX_BYTES, REGISTRY_XCU, TIMEOUT_MS, checkRequest, createQueue, detectType, sofficeArgs } from "./policy.mjs";

// Süreci (ve Linux'ta tüm süreç grubunu) süre aşımında öldürür. Sonuç: { code, timedOut }.
export function runWithTimeout(cmd, args, timeoutMs, opts = {}) {
  return new Promise((resolve, reject) => {
    const posix = process.platform !== "win32";
    const child = spawn(cmd, args, { stdio: "ignore", detached: posix, ...opts });
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try {
        if (posix) process.kill(-child.pid, "SIGKILL");
        else child.kill("SIGKILL");
      } catch {
        child.kill("SIGKILL");
      }
    }, timeoutMs);
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("exit", (code) => {
      clearTimeout(timer);
      resolve({ code, timedOut });
    });
  });
}

const send = (res, status, body, type = "application/json") => {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(type === "application/json" ? JSON.stringify(body) : body);
};

// config: { secret, soffice: [komut, ...önekArgümanlar], tmpDir?, timeoutMs?, maxBytes?, log? }
export function createConverter(config) {
  const { secret, soffice = ["soffice"], tmpDir = os.tmpdir(), timeoutMs = TIMEOUT_MS, maxBytes = MAX_BYTES, log = console } = config;
  if (typeof secret !== "string" || secret.length < 32) throw new Error("CONVERTER_SECRET en az 32 karakter olmalı");
  const queue = createQueue();

  async function convert(buf, type) {
    const work = await fs.mkdtemp(path.join(tmpDir, "conv-"));
    try {
      const inputName = `input.${type}`;
      await fs.mkdir(path.join(work, "profile", "user"), { recursive: true });
      await fs.mkdir(path.join(work, "out"));
      await fs.writeFile(path.join(work, "profile", "user", "registrymodifications.xcu"), REGISTRY_XCU);
      await fs.writeFile(path.join(work, inputName), buf, { mode: 0o600 });
      const [cmd, ...prefix] = soffice;
      const r = await runWithTimeout(cmd, [...prefix, ...sofficeArgs(work, inputName)], timeoutMs, { cwd: work, env: { PATH: process.env.PATH ?? "", HOME: work, TMPDIR: work, LANG: "C.UTF-8" } });
      if (r.timedOut) return { status: 504 };
      const pdf = await fs.readFile(path.join(work, "out", "input.pdf")).catch(() => null);
      if (r.code !== 0 || !pdf || pdf.subarray(0, 5).toString("latin1") !== "%PDF-") return { status: 422 };
      return { status: 200, pdf };
    } finally {
      await fs.rm(work, { recursive: true, force: true }).catch(() => {});
    }
  }

  return http.createServer(async (req, res) => {
    const id = crypto.randomBytes(4).toString("hex");
    try {
      if (req.method === "GET" && req.url === "/health") return send(res, 200, { ready: true, queue: queue.size });
      const bad = checkRequest({ method: req.method, url: req.url, headers: req.headers }, secret);
      if (bad && bad[0] === 413) req.resume();
      if (bad) return send(res, bad[0], { error: bad[1] });
      const declared = Number(req.headers["content-length"]);
      const chunks = [];
      let size = 0;
      for await (const c of req) {
        size += c.length;
        if (size > declared || size > maxBytes) return send(res, 413, { error: "too large" });
        chunks.push(c);
      }
      const buf = Buffer.concat(chunks);
      const type = req.headers["x-file-type"];
      if (detectType(buf) !== type) return send(res, 415, { error: "content does not match type" });
      const job = queue.run(() => convert(buf, type));
      if (!job) return send(res, 503, { error: "busy" });
      const started = Date.now();
      const r = await job;
      log.info?.(`[converter] ${id} ${type} ${buf.length}B → ${r.status} (${Date.now() - started} ms)`);
      if (r.status !== 200) return send(res, r.status, { error: r.status === 504 ? "timeout" : "conversion failed" });
      return send(res, 200, r.pdf, "application/pdf");
    } catch (err) {
      log.error?.(`[converter] ${id} hata`, err);
      if (!res.headersSent) send(res, 500, { error: "internal" });
      else res.destroy();
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT ?? 8080);
  const server = createConverter({ secret: process.env.CONVERTER_SECRET ?? "", soffice: [process.env.SOFFICE ?? "soffice"] });
  server.requestTimeout = 120_000;
  server.headersTimeout = 15_000;
  server.listen(port, process.env.BIND ?? "0.0.0.0", () => console.log(`[converter] :${port} dinleniyor`));
  for (const sig of ["SIGTERM", "SIGINT"]) process.on(sig, () => server.close(() => process.exit(0)));
}
