import crypto from "node:crypto";

// Karışabilecek karakterler (0/O, 1/I/L) çıkarılmış alfabe; reddetme örneklemesiyle modulo yanlılığı yok.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // 31 karakter

export function randomCode(length: number): string {
  let out = "";
  while (out.length < length) {
    for (const byte of crypto.randomBytes(length * 2)) {
      if (byte < 248) out += ALPHABET[byte % 31]; // 248 = 31 * 8
      if (out.length === length) break;
    }
  }
  return out;
}

// Davet kodu: 12 karakter ≈ 59 bit entropi, okunabilirlik için 4'lü gruplar.
export function newInvitationCode(): { code: string; normalized: string } {
  const normalized = randomCode(12);
  return { code: normalized.match(/.{4}/g)!.join("-"), normalized };
}

export const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

// Kurulum anahtarı: 32 karakter (≈158 bit).
export function newSetupToken(): string {
  return randomCode(32).match(/.{8}/g)!.join("-");
}

export const normalizeSetupToken = (t: string) => t.toUpperCase().replace(/[^A-Z0-9]/g, "");
