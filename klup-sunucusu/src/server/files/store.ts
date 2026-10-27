// Yüklenen dosyaların türünü İÇERİKTEN doğrular ve diske güvenli biçimde yazar.
// - İzin listesi: PDF, PNG/JPEG/WebP, ZIP, PowerPoint (PPTX/PPT), PCAP/PCAPNG ve UTF-8 metin/kod dosyaları.
// - Uzantı ile içerik uyuşmalı; çalıştırılabilir dosyalar (MZ/ELF/Mach-O), HTML ve SVG reddedilir.
// - Dosya diske kullanıcının verdiği adla değil, sunucunun ürettiği rastgele adla yazılır.
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "@/server/env";
import { badRequest } from "@/server/errors";
import { sniffImage } from "./image";

export type FileKind = "pdf" | "image" | "zip" | "pptx" | "ppt" | "pcap" | "text";
export type Sniffed = { kind: FileKind; mime: string };

const TEXT_EXT = new Set([
  "txt", "md", "csv", "log", "json", "jsonl", "yaml", "yml", "xml", "ini", "conf", "toml", "yar", "yara", "rules",
  "py", "js", "ts", "c", "h", "cpp", "hpp", "java", "go", "rs", "rb", "php", "sh", "ps1", "sql", "asm",
]);
const EXT_KIND: Record<string, FileKind> = { pdf: "pdf", png: "image", jpg: "image", jpeg: "image", webp: "image", zip: "zip", pptx: "pptx", ppt: "ppt", pcap: "pcap", pcapng: "pcap", cap: "pcap" };
for (const e of TEXT_EXT) EXT_KIND[e] = "text";

export const ALLOWED_EXTENSIONS = Object.keys(EXT_KIND).sort();

const startsWith = (b: Uint8Array, sig: number[]) => sig.every((v, i) => b[i] === v);

function looksExecutable(b: Uint8Array) {
  return (
    startsWith(b, [0x4d, 0x5a]) || // MZ (Windows PE)
    startsWith(b, [0x7f, 0x45, 0x4c, 0x46]) || // ELF
    startsWith(b, [0xcf, 0xfa, 0xed, 0xfe]) || startsWith(b, [0xfe, 0xed, 0xfa, 0xcf]) || // Mach-O
    startsWith(b, [0xca, 0xfe, 0xba, 0xbe]) // Mach-O fat / Java class
  );
}

// ZIP merkezi dizinindeki öğe adları (açmadan). Yapı okunamazsa null.
export function zipEntryNames(buf: Uint8Array, max = 5000): string[] | null {
  const b = Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
  let eocd = -1;
  for (let i = b.length - 22; i >= Math.max(0, b.length - 65_557); i--) {
    if (b.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return null;
  const count = b.readUInt16LE(eocd + 10);
  let p = b.readUInt32LE(eocd + 16);
  if (count > max) return null;
  const names: string[] = [];
  for (let n = 0; n < count; n++) {
    if (p + 46 > b.length || b.readUInt32LE(p) !== 0x02014b50) return null;
    const flags = b.readUInt16LE(p + 8);
    const nameLen = b.readUInt16LE(p + 28);
    names.push(b.subarray(p + 46, p + 46 + nameLen).toString(flags & 0x800 ? "utf8" : "latin1"));
    p += 46 + nameLen + b.readUInt16LE(p + 30) + b.readUInt16LE(p + 32);
  }
  return names;
}

// OOXML sunumu: ZIP içinde [Content_Types].xml ve ppt/ altında öğeler.
function looksPptx(buf: Uint8Array) {
  const names = zipEntryNames(buf);
  return !!names && names.includes("[Content_Types].xml") && names.some((n) => n.startsWith("ppt/"));
}

// Eski PowerPoint (.ppt): OLE bileşik belge (CFB) başlığı + "PowerPoint Document" akışı (dizin girdisi UTF-16LE).
// Yalnız CFB başlığı yetmez: aynı kap .doc/.xls/.msi için de kullanılır.
const CFB_SIG = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const PPT_STREAM = Buffer.from("PowerPoint Document", "utf16le");
function looksPpt(buf: Uint8Array) {
  return startsWith(buf, CFB_SIG) && Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength).includes(PPT_STREAM);
}

// İçerikten tür tespiti. Metin yalnızca geçerli UTF-8 ve NUL baytsız ise kabul edilir.
export function sniffFile(buf: Uint8Array): Sniffed | null {
  if (buf.length === 0 || looksExecutable(buf)) return null;
  if (startsWith(buf, [0x25, 0x50, 0x44, 0x46, 0x2d])) return { kind: "pdf", mime: "application/pdf" };
  const img = sniffImage(buf);
  if (img) return { kind: "image", mime: img.mime };
  if (startsWith(buf, [0x50, 0x4b, 0x03, 0x04]) || startsWith(buf, [0x50, 0x4b, 0x05, 0x06])) {
    if (looksPptx(buf)) return { kind: "pptx", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation" };
    return { kind: "zip", mime: "application/zip" };
  }
  if (looksPpt(buf)) return { kind: "ppt", mime: "application/vnd.ms-powerpoint" };
  if (
    startsWith(buf, [0xd4, 0xc3, 0xb2, 0xa1]) || startsWith(buf, [0xa1, 0xb2, 0xc3, 0xd4]) ||
    startsWith(buf, [0x4d, 0x3c, 0xb2, 0xa1]) || startsWith(buf, [0xa1, 0xb2, 0x3c, 0x4d])
  )
    return { kind: "pcap", mime: "application/vnd.tcpdump.pcap" };
  if (startsWith(buf, [0x0a, 0x0d, 0x0d, 0x0a])) return { kind: "pcap", mime: "application/x-pcapng" };
  if (buf.includes(0)) return null;
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    return null;
  }
  return { kind: "text", mime: "text/plain; charset=utf-8" };
}

// Görünen ad: yol ayırıcıları, kontrol ve yön değiştiren karakterler atılır; uzunluk sınırlanır.
export function cleanFileName(raw: string): string {
  const base = raw.split(/[\\/]/).pop() ?? "dosya";
  const cleaned = base
    .replace(/[\u0000-\u001f\u007f‪-‮⁦-⁩"<>|:*?]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\.+/, "");
  if (!cleaned) return "dosya";
  if (cleaned.length <= 120) return cleaned;
  const ext = cleaned.includes(".") ? cleaned.slice(cleaned.lastIndexOf(".")) : "";
  return cleaned.slice(0, 120 - ext.length) + ext;
}

export const extOf = (name: string) => (name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toLowerCase() : "");

// Dosyayı doğrular: uzantı izin listesinde olmalı ve içerikten bulunan türle uyuşmalı.
export function validateUpload(name: string, buf: Uint8Array): Sniffed {
  const ext = extOf(name);
  const expected = EXT_KIND[ext];
  if (!expected) throw badRequest(`Bu dosya türüne izin verilmiyor (.${ext || "?"}). İzinli: PDF, görsel, ZIP, PowerPoint, PCAP, metin ve kod dosyaları.`, "UNSUPPORTED_TYPE");
  const sniffed = sniffFile(buf);
  if (!sniffed) throw badRequest("Dosya içeriği izin verilen bir türe uymuyor (çalıştırılabilir ya da ikili dosya olabilir).", "UNSUPPORTED_CONTENT");
  // .zip uzantılı bir PPTX yine ZIP olarak kabul edilir (içerik aynı kap).
  if (expected === "zip" && sniffed.kind === "pptx") return { kind: "zip", mime: "application/zip" };
  if (sniffed.kind !== expected) throw badRequest(`Dosya uzantısı (.${ext}) ile içeriği uyuşmuyor.`, "TYPE_MISMATCH");
  return sniffed;
}

const filesDir = () => path.join(env().storageDir, "files");
const KEY = /^[a-f0-9]{32}$/;
const blobPath = (key: string) => {
  if (!KEY.test(key)) throw new Error("geçersiz depolama anahtarı");
  return path.join(filesDir(), key.slice(0, 2), key);
};

export async function writeBlob(buf: Uint8Array): Promise<{ key: string; sha256: string }> {
  const key = crypto.randomBytes(16).toString("hex");
  const p = blobPath(key);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, buf, { mode: 0o640, flag: "wx" });
  return { key, sha256: crypto.createHash("sha256").update(buf).digest("hex") };
}

export const readBlob = (key: string) => fs.readFile(blobPath(key));
export const removeBlob = (key: string) => fs.rm(blobPath(key), { force: true });
