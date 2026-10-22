import crypto from "node:crypto";
import { promisify } from "node:util";

// scrypt (bellek-yoğun KDF, Node yerleşik — native bağımlılık yok).
// Saklama biçimi: scrypt$N$r$p$saltB64$hashB64  → parametreler ileride yükseltilebilir.
const scrypt = promisify(crypto.scrypt) as (
  pw: crypto.BinaryLike,
  salt: crypto.BinaryLike,
  keylen: number,
  opts: crypto.ScryptOptions,
) => Promise<Buffer>;

const N = 2 ** 15;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAXMEM = 128 * N * R * 2; // 64 MiB

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return ["scrypt", N, R, P, salt.toString("base64"), hash.toString("base64")].join("$");
}

export async function verifyPassword(stored: string, password: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, nS, rS, pS, saltB64, hashB64] = parts as [string, string, string, string, string, string];
  const n = Number(nS), r = Number(rS), p = Number(pS);
  if (![n, r, p].every(Number.isInteger) || n > 2 ** 20 || r > 32 || p > 16) return false;
  const expected = Buffer.from(hashB64, "base64");
  let actual: Buffer;
  try {
    actual = await scrypt(password.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length, {
      N: n, r, p, maxmem: 128 * n * r * 2,
    });
  } catch {
    return false;
  }
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function needsRehash(stored: string): boolean {
  const [, nS, rS, pS] = stored.split("$");
  return Number(nS) !== N || Number(rS) !== R || Number(pS) !== P;
}

// Kullanıcı bulunamadığında da aynı süreyi harcamak için (kullanıcı adı numaralandırmasına karşı).
let dummy: Promise<string> | null = null;
export async function burnPasswordCheck(password: string): Promise<void> {
  dummy ??= hashPassword(crypto.randomBytes(16).toString("hex"));
  await verifyPassword(await dummy, password);
}

// Parola politikası: uzunluk odaklı (NIST 800-63B). Karmaşıklık kuralı dayatılmaz.
const COMMON = new Set([
  "password", "password1", "parola123", "sifre1234", "1234567890", "qwertyuiop", "123456789a",
  "ordekclub1", "ordekclub", "administrator", "letmein123", "iloveyou12", "welcome123",
]);

export function passwordProblem(password: string, ctx: { username?: string; email?: string } = {}): string | null {
  if (password.length < 10) return "Parola en az 10 karakter olmalı.";
  if (password.length > 128) return "Parola en fazla 128 karakter olabilir.";
  if (/^(.)\1+$/.test(password)) return "Parola tek bir karakterin tekrarı olamaz.";
  const lower = password.toLowerCase();
  if (COMMON.has(lower)) return "Bu parola çok yaygın; başka bir parola seç.";
  if (ctx.username && lower.includes(ctx.username.toLowerCase())) return "Parola kullanıcı adını içeremez.";
  const local = ctx.email?.split("@")[0];
  if (local && local.length >= 4 && lower.includes(local.toLowerCase())) return "Parola e-posta adresini içeremez.";
  return null;
}
