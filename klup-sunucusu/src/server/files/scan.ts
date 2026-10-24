// Yükleme taraması:
//  1) ZIP denetimi (açmadan, merkezi dizinden): şifreli öğe, yol geçişi, iç içe arşiv, çalıştırılabilir öğe,
//     sıkıştırma bombası ve öğe başı içerik imzası (ilk baytlar) kontrol edilir.
//  2) İsteğe bağlı ClamAV (clamd INSTREAM). CLAMAV_HOST tanımlıysa tarama zorunludur: ulaşılamazsa yükleme reddedilir.
import net from "node:net";
import zlib from "node:zlib";
import { badRequest } from "@/server/errors";
import { env } from "@/server/env";

const MB = 1024 * 1024;
export const ZIP_LIMITS = { entries: 2000, totalUncompressed: 512 * MB, ratio: 200 };

// Windows/macOS/Android çalıştırılabilirleri, kısayollar ve betik barındırıcıları (metin kod dosyaları — .py, .js, .sh — serbest).
const BLOCKED_EXT = new Set([
  "exe", "dll", "scr", "com", "pif", "cpl", "sys", "drv", "msi", "msp", "msix", "appx", "bat", "cmd", "vbs", "vbe", "wsf", "wsh", "hta",
  "lnk", "url", "scf", "jar", "apk", "dex", "app", "dmg", "pkg", "deb", "rpm", "elf", "so", "dylib", "iso", "img", "vhd", "vhdx",
  "docm", "xlsm", "pptm",
]);
const NESTED_EXT = new Set(["zip", "7z", "rar", "tar", "gz", "tgz", "bz2", "xz", "cab", "arj", "lz", "zst"]);

const looksExecutable = (b: Uint8Array) =>
  (b[0] === 0x4d && b[1] === 0x5a) || // MZ
  (b[0] === 0x7f && b[1] === 0x45 && b[2] === 0x4c && b[3] === 0x46) || // ELF
  (b[0] === 0xcf && b[1] === 0xfa && b[2] === 0xed && b[3] === 0xfe) || (b[0] === 0xfe && b[1] === 0xed && b[2] === 0xfa && b[3] === 0xcf) ||
  (b[0] === 0xca && b[1] === 0xfe && b[2] === 0xba && b[3] === 0xbe) ||
  (b[0] === 0x64 && b[1] === 0x65 && b[2] === 0x78 && b[3] === 0x0a); // dex
const looksArchive = (b: Uint8Array) =>
  (b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05)) || // zip
  (b[0] === 0x1f && b[1] === 0x8b) || // gzip
  (b[0] === 0x37 && b[1] === 0x7a && b[2] === 0xbc && b[3] === 0xaf) || // 7z
  (b[0] === 0x52 && b[1] === 0x61 && b[2] === 0x72 && b[3] === 0x21); // rar

const reject = (code: string, msg: string) => badRequest(`ZIP reddedildi: ${msg}`, code);

export type ZipReport = { entries: number; uncompressed: number };

export function inspectZip(buf: Buffer): ZipReport {
  // End of Central Directory: son 64 KB + 22 bayt içinde aranır.
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65_557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw reject("ZIP_CORRUPT", "arşiv yapısı okunamadı.");
  const count = buf.readUInt16LE(eocd + 10);
  const cdSize = buf.readUInt32LE(eocd + 12);
  const cdOffset = buf.readUInt32LE(eocd + 16);
  if (count === 0xffff || cdOffset === 0xffffffff) throw reject("ZIP64", "ZIP64 biçimi desteklenmiyor.");
  if (count > ZIP_LIMITS.entries) throw reject("ZIP_TOO_MANY", `en fazla ${ZIP_LIMITS.entries} öğe olabilir.`);
  if (cdOffset + cdSize > eocd) throw reject("ZIP_CORRUPT", "merkezi dizin bozuk.");

  let p = cdOffset;
  let total = 0;
  for (let n = 0; n < count; n++) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== 0x02014b50) throw reject("ZIP_CORRUPT", "merkezi dizin bozuk.");
    const flags = buf.readUInt16LE(p + 8);
    const method = buf.readUInt16LE(p + 10);
    const csize = buf.readUInt32LE(p + 20);
    const usize = buf.readUInt32LE(p + 24);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString(flags & 0x800 ? "utf8" : "latin1");
    p += 46 + nameLen + extraLen + commentLen;

    if (flags & 0x1) throw reject("ZIP_ENCRYPTED", `şifreli öğe taranamaz (${name}).`);
    const clean = name.replace(/\\/g, "/");
    if (clean.startsWith("/") || /^[a-z]:/i.test(clean) || clean.split("/").includes("..")) throw reject("ZIP_PATH", `güvensiz yol (${name}).`);
    if (clean.endsWith("/")) continue; // klasör
    const ext = clean.includes(".") ? clean.slice(clean.lastIndexOf(".") + 1).toLowerCase() : "";
    if (BLOCKED_EXT.has(ext)) throw reject("ZIP_EXECUTABLE", `çalıştırılabilir öğe (${name}).`);
    if (NESTED_EXT.has(ext)) throw reject("ZIP_NESTED", `iç içe arşiv taranamaz (${name}).`);
    total += usize;
    if (total > ZIP_LIMITS.totalUncompressed) throw reject("ZIP_BOMB", "açılmış boyut çok büyük.");
    if (usize > 10 * MB && csize > 0 && usize / csize > ZIP_LIMITS.ratio) throw reject("ZIP_BOMB", `olağandışı sıkıştırma oranı (${name}).`);

    // İçerik imzası: öğenin ilk baytları (uzantısı masum görünen çalıştırılabilir/arşivi yakalar).
    if (localOffset + 30 > buf.length || buf.readUInt32LE(localOffset) !== 0x04034b50) throw reject("ZIP_CORRUPT", "yerel başlık bozuk.");
    const start = localOffset + 30 + buf.readUInt16LE(localOffset + 26) + buf.readUInt16LE(localOffset + 28);
    const data = buf.subarray(start, Math.min(start + csize, start + 64 * 1024, buf.length));
    let head: Uint8Array;
    if (method === 0) head = data.subarray(0, 8);
    else if (method === 8) {
      try {
        head = zlib.inflateRawSync(data, { finishFlush: zlib.constants.Z_SYNC_FLUSH, maxOutputLength: MB }).subarray(0, 8);
      } catch {
        throw reject("ZIP_CORRUPT", `öğe açılamadı (${name}).`);
      }
    } else throw reject("ZIP_METHOD", `desteklenmeyen sıkıştırma (${name}).`);
    if (head.length && looksExecutable(head)) throw reject("ZIP_EXECUTABLE", `çalıştırılabilir içerik (${name}).`);
    if (head.length && looksArchive(head)) throw reject("ZIP_NESTED", `iç içe arşiv taranamaz (${name}).`);
  }
  return { entries: count, uncompressed: total };
}

// clamd INSTREAM protokolü: "zINSTREAM\0", [uzunluk(4B BE) + parça]..., 0 uzunluk; yanıt "stream: OK" ya da "stream: <ad> FOUND".
export function clamScan(buf: Uint8Array, host: string, port: number, timeoutMs = 20_000): Promise<{ clean: boolean; signature: string | null }> {
  return new Promise((resolve, reject) => {
    const sock = net.connect({ host, port });
    let out = "";
    const fail = (e: Error) => {
      sock.destroy();
      reject(e);
    };
    sock.setTimeout(timeoutMs, () => fail(new Error("clamd zaman aşımı")));
    sock.on("error", fail);
    sock.on("data", (d) => (out += d.toString("utf8")));
    sock.on("end", () => {
      const line = out.replace(/\0/g, "").trim();
      if (/:\s*OK$/.test(line)) resolve({ clean: true, signature: null });
      else {
        const m = line.match(/:\s*(.+)\s+FOUND$/);
        if (m) resolve({ clean: false, signature: m[1]! });
        else reject(new Error(`clamd yanıtı anlaşılamadı: ${line.slice(0, 120)}`));
      }
    });
    sock.on("connect", () => {
      sock.write("zINSTREAM\0");
      for (let i = 0; i < buf.length; i += 64 * 1024) {
        const chunk = buf.subarray(i, i + 64 * 1024);
        const len = Buffer.alloc(4);
        len.writeUInt32BE(chunk.length);
        sock.write(len);
        sock.write(chunk);
      }
      sock.end(Buffer.alloc(4)); // 0 → akış sonu
    });
  });
}

// Yükleme hattının tek giriş noktası. Dönen not dosya kaydında saklanır.
export async function scanUpload(kind: string, buf: Uint8Array): Promise<string> {
  const notes: string[] = [];
  if (kind === "zip") {
    const r = inspectZip(Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength));
    notes.push(`zip:${r.entries} öğe`);
  }
  const e = env();
  if (e.CLAMAV_HOST) {
    let r: { clean: boolean; signature: string | null };
    try {
      r = await clamScan(buf, e.CLAMAV_HOST, e.CLAMAV_PORT);
    } catch (err) {
      console.error("[files] ClamAV taraması yapılamadı", err);
      throw badRequest("Virüs taraması şu an yapılamıyor; yükleme reddedildi. Biraz sonra tekrar dene.", "SCAN_UNAVAILABLE");
    }
    if (!r.clean) throw badRequest(`Dosya zararlı yazılım içeriyor (${r.signature}).`, "MALWARE");
    notes.push("clamav:temiz");
  }
  return notes.join(" · ");
}
