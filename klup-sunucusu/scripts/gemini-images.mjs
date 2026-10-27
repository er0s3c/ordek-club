#!/usr/bin/env node
// ============================================================================
//  Akademi görsellerini Gemini (Nano Banana 2, gemini-3.1-flash-image) ile üretir.
//    npm run academy:gemini -- --dry                  → ne üretileceğini ve tahmini ücreti göster, istek atma
//    npm run academy:gemini -- --limit 5              → sıradaki 5 bekleyen görseli üret (varsayılan 3)
//    npm run academy:gemini -- --sadece kapak-        → yalnız kimliği bununla başlayanlar (virgülle birden çok)
//    npm run academy:gemini -- --hepsi                → bekleyenlerin hepsi (ücretli; önce --dry ile bak)
//    --yeniden  hazır olanları da yeniden üret · --boyut 2K · --model <kod>
//  Anahtar: klup-sunucusu/.env içinde GEMINI_API_KEY (Google AI Studio). Anahtar hiçbir zaman yazdırılmaz.
//  Görsel kuyruğu scripts/academy.mjs → imageJobs(); kötü adam içeren görsele portresi referans olarak eklenir.
//  Çıktı content/academy/gorseller/<id>.webp; bitince GORSELLER.md / KAPAKLAR.md yeniden üretilir.
// ============================================================================
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { imageJobs } from "./academy.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMG_DIR = path.join(ROOT, "content", "academy", "gorseller");
// Fiyat: ai.google.dev/gemini-api/docs/pricing (Ekim 2026, Standard katman). Yalnız tahmin için.
const PRICE = { "1K": 0.067, "2K": 0.101 };
const CONCURRENCY = 2;

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);

function readEnv() {
  const file = path.join(ROOT, ".env");
  const out = {};
  if (fs.existsSync(file))
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  return { ...out, ...process.env };
}
const env = readEnv();
const KEY = env.GEMINI_API_KEY;
const MODEL = opt("--model", env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image");
const SIZE = opt("--boyut", "1K");

// Referans portreler kimliği sabitler; metin modele hangi görselin kim olduğunu söyler.
function promptFor(job) {
  if (!job.refs.length) return job.prompt;
  const who = job.refs.map((r, i) => `reference image ${i + 1} is ${r.name}`).join(", ");
  return `Character references: ${who}. Keep each referenced character's face, body shape, hairstyle, outfit, props and colors exactly as in their reference image, only change pose and expression to fit the scene. ${job.prompt}`;
}

function body(job) {
  return {
    model: MODEL,
    input: [
      { type: "text", text: promptFor(job) },
      ...job.refs.map((r) => ({ type: "image", mime_type: "image/webp", data: fs.readFileSync(r.file).toString("base64") })),
    ],
    response_format: { type: "image", mime_type: "image/jpeg", aspect_ratio: job.aspect, image_size: SIZE },
  };
}

// Yanıttaki ilk base64 görseli bulur (output_image.data ya da steps[].content[] içindeki görsel blok).
function findImage(node) {
  if (!node || typeof node !== "object") return null;
  if (typeof node.data === "string" && node.data.length > 1000 && (!node.type || node.type === "image")) return node.data;
  if (node.inlineData?.data) return node.inlineData.data;
  for (const v of Object.values(node)) {
    const found = findImage(v);
    if (found) return found;
  }
  return null;
}

async function generate(job) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    let res;
    try {
      res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": KEY },
        body: JSON.stringify(body(job)),
        signal: AbortSignal.timeout(180_000),
      });
    } catch (e) {
      if (attempt === 4) throw new Error(`ağ hatası: ${e.message}`);
      await new Promise((r) => setTimeout(r, 5000 * attempt));
      continue;
    }
    const text = await res.text();
    // Günlük kota / ücretsiz katman (limit: 0) beklemekle düzelmez: hemen dur.
    if (res.status === 429 && /per day|limit: 0|Free Tier/i.test(text)) throw new Error(`KOTA HTTP 429: ${text.slice(0, 300)}`);
    if (res.status === 429 || res.status >= 500) {
      if (attempt === 4) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
      await new Promise((r) => setTimeout(r, 15_000 * attempt));
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 400)}`);
    const data = findImage(JSON.parse(text));
    if (!data) {
      // Görsel yoksa (güvenlik engeli vb.) yanıtı görsel verisi olmadan incelemeye bırak.
      const dump = path.join(os.tmpdir(), `gemini-${job.id}.json`);
      fs.writeFileSync(dump, text.replace(/"data"\s*:\s*"[A-Za-z0-9+/=]{200,}"/g, '"data":"<kırpıldı>"'));
      throw new Error(`yanıtta görsel yok (ayrıntı: ${dump})`);
    }
    return Buffer.from(data, "base64");
  }
}

async function save(job, img) {
  const sharp = (await import("sharp")).default;
  await sharp(img).resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 86 }).toFile(path.join(IMG_DIR, `${job.id}.webp`));
}

const prefixes = opt("--sadece", "").split(",").map((s) => s.trim()).filter(Boolean);
let queue = imageJobs().filter((j) => flag("--yeniden") || !j.done);
if (prefixes.length) queue = queue.filter((j) => prefixes.some((p) => j.id.startsWith(p)));
if (!flag("--hepsi")) queue = queue.slice(0, Number(opt("--limit", 3)));

const cost = (queue.length * (PRICE[SIZE] ?? PRICE["1K"])).toFixed(2);
console.log(`${MODEL} · ${SIZE} · ${queue.length} görsel · tahmini ücret ~$${cost} (giriş belirteçleri hariç)`);
if (flag("--dry")) {
  for (const j of queue) console.log(`- ${j.id} [${j.aspect}]${j.refs.length ? ` refs: ${j.refs.map((r) => r.name).join(", ")}` : ""} · ${j.title}`);
  if (queue[0]) console.log(`\nİlk prompt:\n${promptFor(queue[0])}`);
  process.exit(0);
}
if (!KEY) {
  console.error("GEMINI_API_KEY yok: Google AI Studio'dan alıp klup-sunucusu/.env dosyasına ekleyin (GEMINI_API_KEY=...).");
  process.exit(1);
}

let done = 0;
const failed = [];
async function worker() {
  while (queue.length) {
    const job = queue.shift();
    try {
      await save(job, await generate(job));
      done++;
      console.log(`✔ ${job.id} · ${job.title}`);
    } catch (e) {
      failed.push(job.id);
      console.log(`✘ ${job.id}: ${e.message}`);
      if (/HTTP 40[13]|^KOTA/.test(e.message)) { queue.length = 0; console.error("Anahtar, kota ya da faturalandırma sorunu; durduruldu (AI Studio'da faturalandırmayı açın)."); }
    }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log(`\n${done} görsel üretildi${failed.length ? `, ${failed.length} başarısız: ${failed.join(", ")}` : ""}.`);
if (done) spawnSync(process.execPath, [path.join(ROOT, "scripts", "academy.mjs"), "gorseller"], { stdio: "inherit" });
process.exit(failed.length ? 1 : 0);
