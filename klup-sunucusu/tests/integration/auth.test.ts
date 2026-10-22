import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as logoutPOST } from "@/app/api/auth/logout/route";
import { GET as meGET } from "@/app/api/auth/me/route";
import { POST as passwordPOST } from "@/app/api/auth/password/route";
import { completeSetupFixture, cookieFrom, makeUser, readBody, req, resetDb } from "../helpers";

describe("kimlik doğrulama ve oturum", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });

  it("kullanıcı adı veya e-posta ile giriş; oturum çerezi güvenli bayraklı", async () => {
    const { user } = await makeUser({ username: "ayse", password: "ayse-guclu-parola" });
    for (const login of ["ayse", "AYSE@example.edu"]) {
      const res = await loginPOST(req("/api/auth/login", { body: { login, password: "ayse-guclu-parola" } }), undefined);
      expect(res.status).toBe(200);
      const sc = res.headers.get("set-cookie")!;
      expect(sc).toMatch(/club_session=[A-Za-z0-9_-]{40,}/);
      expect(sc).toMatch(/HttpOnly/);
      expect(sc).toMatch(/Path=\//);
      const me = await readBody(await meGET(req("/api/auth/me", { cookie: cookieFrom(res)! }), undefined));
      expect(me.user.id).toBe(user.id);
      expect(me.user.passwordHash).toBeUndefined();
    }
    // Token DB'de düz değil hash olarak durur
    const sessions = await db.session.findMany({ where: { userId: user.id } });
    expect(sessions.every((s) => /^[a-f0-9]{64}$/.test(s.tokenHash))).toBe(true);
  });

  it("olmayan kullanıcı ve yanlış parola aynı yanıtı verir (numaralandırma yok)", async () => {
    await makeUser({ username: "mevcut" });
    const a = await loginPOST(req("/api/auth/login", { body: { login: "mevcut", password: "yanlis-parola-xx" } }), undefined);
    const b = await loginPOST(req("/api/auth/login", { body: { login: "olmayan", password: "yanlis-parola-xx" } }), undefined);
    expect(a.status).toBe(401);
    expect(b.status).toBe(401);
    expect(await readBody(a)).toEqual(await readBody(b));
    expect(await db.auditLog.count({ where: { action: "auth.login.failed" } })).toBe(2);
  });

  it("bekleyen, reddedilmiş ve devre dışı hesaplar oturum alamaz", async () => {
    for (const status of ["PENDING", "REJECTED", "DISABLED"] as const) {
      await makeUser({ username: `u-${status.toLowerCase()}`, status, password: "dogru-parola-123" });
      const res = await loginPOST(req("/api/auth/login", { body: { login: `u-${status.toLowerCase()}`, password: "dogru-parola-123" } }), undefined);
      expect(res.status).toBe(403);
      expect((await readBody(res)).error.code).toBe(status);
      expect(res.headers.get("set-cookie")).toBeNull();
    }
  });

  it("kullanıcı başına kaba kuvvet sınırı: 8 denemeden sonra 429 + Retry-After", async () => {
    await makeUser({ username: "hedef" });
    const codes: number[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push((await loginPOST(req("/api/auth/login", { body: { login: "hedef", password: `deneme-${i}-xxxx` } }), undefined)).status);
    }
    expect(codes.slice(0, 8).every((c) => c === 401)).toBe(true);
    const last = await loginPOST(req("/api/auth/login", { body: { login: "hedef", password: "x" } }), undefined);
    expect(last.status).toBe(429);
    expect(Number(last.headers.get("retry-after"))).toBeGreaterThan(0);
  });

  it("çıkış oturumu sunucu tarafında geçersiz kılar", async () => {
    const { cookie } = await makeUser();
    expect((await meGET(req("/api/auth/me", { cookie }), undefined)).status).toBe(200);
    expect((await logoutPOST(req("/api/auth/logout", { method: "POST", cookie }), undefined)).status).toBe(200);
    expect((await meGET(req("/api/auth/me", { cookie }), undefined)).status).toBe(401);
  });

  it("sahte/bozuk oturum token'ı reddedilir", async () => {
    for (const cookie of ["club_session=abc", "club_session=" + "A".repeat(43), "club_session="]) {
      expect((await meGET(req("/api/auth/me", { cookie }), undefined)).status).toBe(401);
    }
  });

  it("süresi dolmuş ve boşta kalmış oturumlar reddedilir ve silinir", async () => {
    const a = await makeUser();
    await db.session.updateMany({ where: { userId: a.user.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await meGET(req("/api/auth/me", { cookie: a.cookie }), undefined)).status).toBe(401);
    expect(await db.session.count({ where: { userId: a.user.id } })).toBe(0);

    const b = await makeUser();
    await db.session.updateMany({ where: { userId: b.user.id }, data: { lastSeenAt: new Date(Date.now() - 73 * 3_600_000) } });
    expect((await meGET(req("/api/auth/me", { cookie: b.cookie }), undefined)).status).toBe(401);
  });

  it("parola değişimi: mevcut parola şart, diğer oturumlar kapanır, mevcut oturum kalır", async () => {
    const a = await makeUser({ username: "degisen", password: "eski-parola-12345" });
    const other = await loginPOST(req("/api/auth/login", { body: { login: "degisen", password: "eski-parola-12345" } }), undefined);
    const otherCookie = cookieFrom(other)!;

    const wrong = await passwordPOST(req("/api/auth/password", { cookie: a.cookie, body: { currentPassword: "yanlis-parola-1", newPassword: "yeni-parola-67890" } }), undefined);
    expect(wrong.status).toBe(400);

    const ok = await passwordPOST(req("/api/auth/password", { cookie: a.cookie, body: { currentPassword: "eski-parola-12345", newPassword: "yeni-parola-67890" } }), undefined);
    expect(ok.status).toBe(200);
    expect((await meGET(req("/api/auth/me", { cookie: a.cookie }), undefined)).status).toBe(200);
    expect((await meGET(req("/api/auth/me", { cookie: otherCookie }), undefined)).status).toBe(401);
    expect((await loginPOST(req("/api/auth/login", { body: { login: "degisen", password: "yeni-parola-67890" } }), undefined)).status).toBe(200);
  });

  it("CSRF: yabancı Origin'den gelen durum değiştiren istek reddedilir", async () => {
    const { cookie } = await makeUser({ password: "eski-parola-12345" });
    const res = await passwordPOST(
      req("/api/auth/password", { cookie, origin: "https://evil.example", body: { currentPassword: "eski-parola-12345", newPassword: "saldirgan-parola-1" } }),
      undefined,
    );
    expect(res.status).toBe(403);
    const noOrigin = await logoutPOST(req("/api/auth/logout", { method: "POST", cookie, origin: null }), undefined);
    expect(noOrigin.status).toBe(403);
  });

  it("JSON olmayan gövde (form tabanlı CSRF denemesi) reddedilir", async () => {
    await makeUser({ username: "formcsrf" });
    const res = await loginPOST(
      req("/api/auth/login", { body: "login=formcsrf&password=x", headers: { "content-type": "application/x-www-form-urlencoded" } }),
      undefined,
    );
    expect(res.status).toBe(400);
    expect((await readBody(res)).error.code).toBe("BAD_CONTENT_TYPE");
  });
});
