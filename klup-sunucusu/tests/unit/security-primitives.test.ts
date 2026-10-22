import { describe, expect, it } from "vitest";
import { hashPassword, needsRehash, passwordProblem, verifyPassword } from "@/server/auth/password";
import { newInvitationCode, newSetupToken, normalizeSetupToken, randomCode } from "@/server/codes";
import { sniffImage } from "@/server/files/image";
import { hit } from "@/server/rate-limit";
import { assertSameOrigin } from "@/server/http";
import { HttpError } from "@/server/errors";

describe("parola hash'leme", () => {
  it("doğru parolayı kabul eder, yanlışı reddeder, tuz her seferinde farklıdır", async () => {
    const a = await hashPassword("correct horse battery");
    const b = await hashPassword("correct horse battery");
    expect(a).not.toBe(b);
    expect(a.startsWith("scrypt$32768$8$1$")).toBe(true);
    expect(await verifyPassword(a, "correct horse battery")).toBe(true);
    expect(await verifyPassword(a, "correct horse batterY")).toBe(false);
    expect(needsRehash(a)).toBe(false);
  });

  it("bozuk veya aşırı parametreli hash'i güvenle reddeder", async () => {
    expect(await verifyPassword("plain-text", "x")).toBe(false);
    expect(await verifyPassword("scrypt$1048577$8$1$AAAA$AAAA", "x")).toBe(false); // DoS: dev N
    expect(await verifyPassword("bcrypt$1$2$3$4$5", "x")).toBe(false);
  });

  it("parola politikası", () => {
    expect(passwordProblem("short")).toMatch(/10/);
    expect(passwordProblem("aaaaaaaaaaaa")).toMatch(/tekrar/);
    expect(passwordProblem("password1")).not.toBeNull();
    expect(passwordProblem("ordekclub1")).toMatch(/yaygın/);
    expect(passwordProblem("mehmet-2026-guvenli", { username: "mehmet" })).toMatch(/kullanıcı adını/);
    expect(passwordProblem("uzun ve güvenli bir cümle")).toBeNull();
    expect(passwordProblem("x".repeat(129))).toMatch(/128/);
  });
});

describe("kod üretimi", () => {
  it("davet kodu biçimi ve tekilliği", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 2000; i++) {
      const { code, normalized } = newInvitationCode();
      expect(code).toMatch(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
      expect(normalized).toBe(code.replace(/-/g, ""));
      seen.add(normalized);
    }
    expect(seen.size).toBe(2000);
  });

  it("karışabilen karakterleri (0, O, 1, I, L) içermez", () => {
    expect(randomCode(5000)).not.toMatch(/[01OIL]/);
  });

  it("kurulum anahtarı normalize edilir", () => {
    const t = newSetupToken();
    expect(t).toMatch(/^([A-Z2-9]{8}-){3}[A-Z2-9]{8}$/);
    expect(normalizeSetupToken(` ${t.toLowerCase()} `)).toBe(t.replace(/-/g, ""));
  });
});

describe("görsel içerik koklama", () => {
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
  const jpg = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]);
  const webp = new TextEncoder().encode("RIFF\0\0\0\0WEBPVP8 ");
  it("magic byte ile tür belirler", () => {
    expect(sniffImage(png)?.mime).toBe("image/png");
    expect(sniffImage(jpg)?.mime).toBe("image/jpeg");
    expect(sniffImage(webp)?.mime).toBe("image/webp");
  });
  it("SVG, HTML ve uzantısı değiştirilmiş betikleri reddeder", () => {
    expect(sniffImage(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))).toBeNull();
    expect(sniffImage(new TextEncoder().encode("<!doctype html><script>"))).toBeNull();
    expect(sniffImage(new TextEncoder().encode("#!/bin/sh\nrm -rf /"))).toBeNull();
    expect(sniffImage(new Uint8Array())).toBeNull();
  });
});

describe("hız sınırlayıcı", () => {
  it("pencere içinde limiti uygular ve pencere geçince açar", () => {
    const k = "t:" + Math.random();
    const t0 = 1_000_000;
    for (let i = 0; i < 3; i++) expect(hit(k, 3, 1000, t0 + i).ok).toBe(true);
    const r = hit(k, 3, 1000, t0 + 10);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.retryAfterSec).toBeGreaterThanOrEqual(1);
    expect(hit(k, 3, 1000, t0 + 1001).ok).toBe(true);
  });
});

describe("CSRF Origin kontrolü", () => {
  const mk = (h: Record<string, string>, method = "POST") => new Request("http://club.test/api/x", { method, headers: { host: "club.test", ...h } });
  const blocked = (r: Request) => {
    try {
      assertSameOrigin(r);
      return false;
    } catch (e) {
      return e instanceof HttpError && e.status === 403;
    }
  };
  it("aynı origin'e izin verir", () => {
    expect(blocked(mk({ origin: "http://club.test" }))).toBe(false);
    expect(blocked(mk({ origin: "http://club.test", "sec-fetch-site": "same-origin" }))).toBe(false);
  });
  it("yabancı origin'i, eksik Origin'i ve cross-site isteği reddeder", () => {
    expect(blocked(mk({ origin: "https://evil.example" }))).toBe(true);
    expect(blocked(mk({}))).toBe(true);
    expect(blocked(mk({ origin: "null" }))).toBe(true);
    expect(blocked(mk({ origin: "http://club.test", "sec-fetch-site": "cross-site" }))).toBe(true);
    expect(blocked(mk({ origin: "http://club.test.evil.example" }))).toBe(true);
  });
  it("GET isteklerini engellemez", () => {
    expect(blocked(mk({}, "GET"))).toBe(false);
  });
});
