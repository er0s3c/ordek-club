import { beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import { db } from "@/server/db";
import { rotateSetupToken, setupTokenFile } from "@/server/setup";
import { POST as setupPOST, GET as setupGET } from "@/app/api/setup/route";
import { GET as statsGET } from "@/app/api/admin/stats/route";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { cookieFrom, readBody, req, resetDb } from "../helpers";

const body = (token: string) => ({
  token,
  club: { clubName: "Siber Kulüp", universityName: "Örnek Üniversitesi", appUrl: "http://club.test", timezone: "Europe/Istanbul", registrationPolicy: "APPROVAL" },
  owner: { username: "kurucu", email: "kurucu@ornek.edu.tr", displayName: "Kurucu Kişi", password: "guclu-bir-kurulum-2026" },
});

describe("ilk kurulum (güvenli bootstrap)", () => {
  beforeEach(resetDb);

  it("kurulum öncesi giriş ve admin API'leri kapalıdır", async () => {
    await rotateSetupToken();
    expect((await loginPOST(req("/api/auth/login", { body: { login: "x", password: "y" } }), undefined)).status).toBe(503);
    expect((await statsGET(req("/api/admin/stats"), undefined)).status).toBe(503);
    expect((await readBody(await setupGET(req("/api/setup"), undefined))).setupComplete).toBe(false);
  });

  it("anahtarsız/yanlış anahtarla kurulum yapılamaz", async () => {
    await rotateSetupToken();
    const res = await setupPOST(req("/api/setup", { body: body("YANLIS-ANAHTAR-0000") }), undefined);
    expect(res.status).toBe(403);
    expect(await db.user.count()).toBe(0);
  });

  it("anahtar dosyaya yazılır; doğru anahtarla OWNER oluşur, oturum açılır ve kurulum kapanır", async () => {
    const token = (await rotateSetupToken())!;
    expect(fs.readFileSync(setupTokenFile(), "utf8").trim()).toBe(token);

    const res = await setupPOST(req("/api/setup", { body: body(token.toLowerCase()) }), undefined);
    expect(res.status).toBe(201);
    const cookie = cookieFrom(res);
    expect(cookie).toBeTruthy();
    expect(res.headers.get("set-cookie")).toMatch(/HttpOnly/);
    expect(res.headers.get("set-cookie")).toMatch(/SameSite=Lax/);

    const owner = await db.user.findUniqueOrThrow({ where: { username: "kurucu" } });
    expect(owner.role).toBe("OWNER");
    expect(owner.status).toBe("ACTIVE");
    expect(owner.passwordHash).not.toContain("guclu-bir-kurulum");
    const s = await db.clubSettings.findUniqueOrThrow({ where: { id: 1 } });
    expect(s.setupCompletedAt).not.toBeNull();
    expect(s.setupTokenHash).toBeNull();
    expect(fs.existsSync(setupTokenFile())).toBe(false);

    // Kurucu oturumu admin API'sine erişebilir
    expect((await statsGET(req("/api/admin/stats", { cookie: cookie! }), undefined)).status).toBe(200);

    // İkinci kurulum denemesi (aynı anahtarla) reddedilir
    const again = await setupPOST(req("/api/setup", { body: body(token) }), undefined);
    expect(again.status).toBe(409);
    expect(await rotateSetupToken()).toBeNull();
  });

  it("eşzamanlı iki kurulum isteğinden yalnızca biri başarılı olur", async () => {
    const token = (await rotateSetupToken())!;
    const b2 = body(token);
    b2.owner = { ...b2.owner, username: "ikinci", email: "ikinci@ornek.edu.tr" };
    const results = await Promise.all([
      setupPOST(req("/api/setup", { body: body(token) }), undefined),
      setupPOST(req("/api/setup", { body: b2 }), undefined),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([201, 409]);
    expect(await db.user.count()).toBe(1);
  });

  it("zayıf kurucu parolası reddedilir", async () => {
    const token = (await rotateSetupToken())!;
    const b = body(token);
    b.owner.password = "kurucu12345"; // kullanıcı adını içeriyor
    const res = await setupPOST(req("/api/setup", { body: b }), undefined);
    expect(res.status).toBe(400);
    expect((await readBody(res)).error.fields["owner.password"]).toBeTruthy();
  });

  it("süresi geçmiş anahtar kabul edilmez", async () => {
    const token = (await rotateSetupToken())!;
    await db.clubSettings.update({ where: { id: 1 }, data: { setupTokenExpires: new Date(Date.now() - 1000) } });
    const res = await setupPOST(req("/api/setup", { body: body(token) }), undefined);
    expect(res.status).toBe(403);
  });
});
