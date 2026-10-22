import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { GET as statsGET } from "@/app/api/admin/stats/route";
import { GET as membersGET } from "@/app/api/admin/members/route";
import { GET as memberGET, PATCH as memberPATCH } from "@/app/api/admin/members/[id]/route";
import { GET as invGET, POST as invPOST } from "@/app/api/admin/invitations/route";
import { GET as settingsGET, PATCH as settingsPATCH } from "@/app/api/admin/settings/route";
import { POST as logoPOST } from "@/app/api/admin/settings/logo/route";
import { GET as logoGET } from "@/app/api/branding/logo/route";
import { GET as auditGET } from "@/app/api/admin/audit/route";
import { GET as systemGET } from "@/app/api/admin/system/route";
import { GET as meGET } from "@/app/api/auth/me/route";
import { ORIGIN, completeSetupFixture, makeUser, params, readBody, req, resetDb } from "../helpers";

const patch = (cookie: string, id: string, body: unknown) =>
  memberPATCH(req(`/api/admin/members/${id}`, { method: "PATCH", cookie, body }), params({ id }));

describe("admin API yetkilendirmesi (RBAC / IDOR / BOLA)", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });

  it("öğrenci ve eğitmen tüm admin uç noktalarında 403, oturumsuz 401 alır", async () => {
    const victim = await makeUser();
    for (const role of ["STUDENT", "INSTRUCTOR"] as const) {
      const { cookie } = await makeUser({ role });
      const calls: Response[] = await Promise.all([
        statsGET(req("/api/admin/stats", { cookie }), undefined),
        membersGET(req("/api/admin/members", { cookie }), undefined),
        memberGET(req(`/api/admin/members/${victim.user.id}`, { cookie }), params({ id: victim.user.id })),
        patch(cookie, victim.user.id, { action: "disable" }),
        invGET(req("/api/admin/invitations", { cookie }), undefined),
        invPOST(req("/api/admin/invitations", { cookie, body: { label: "x" } }), undefined),
        settingsGET(req("/api/admin/settings", { cookie }), undefined),
        settingsPATCH(req("/api/admin/settings", { method: "PATCH", cookie, body: { registrationPolicy: "OPEN" } }), undefined),
        auditGET(req("/api/admin/audit", { cookie }), undefined),
        systemGET(req("/api/admin/system", { cookie }), undefined),
      ]);
      expect(calls.map((r) => r.status), role).toEqual(Array(10).fill(403));
    }
    expect((await statsGET(req("/api/admin/stats"), undefined)).status).toBe(401);
    expect((await db.user.findUniqueOrThrow({ where: { id: victim.user.id } })).status).toBe("ACTIVE");
    expect((await db.clubSettings.findUniqueOrThrow({ where: { id: 1 } })).registrationPolicy).toBe("APPROVAL");
  });

  it("ADMIN: OWNER'ı ve diğer ADMIN'i yönetemez, kimseyi ADMIN/OWNER yapamaz, kendi rolünü değiştiremez", async () => {
    const owner = await makeUser({ role: "OWNER" });
    const admin = await makeUser({ role: "ADMIN" });
    const admin2 = await makeUser({ role: "ADMIN" });
    const student = await makeUser();

    expect((await patch(admin.cookie, owner.user.id, { action: "disable" })).status).toBe(403);
    expect((await patch(admin.cookie, admin2.user.id, { action: "disable" })).status).toBe(403);
    expect((await patch(admin.cookie, student.user.id, { action: "role", role: "ADMIN" })).status).toBe(403);
    expect((await patch(admin.cookie, student.user.id, { action: "role", role: "OWNER" })).status).toBe(403);
    expect((await patch(admin.cookie, admin.user.id, { action: "role", role: "OWNER" })).status).toBe(403);
    expect((await patch(owner.cookie, owner.user.id, { action: "disable" })).status).toBe(403);
    expect((await patch(owner.cookie, student.user.id, { action: "role", role: "OWNER" })).status).toBe(403);
    // Davetle yetki yükseltme de engelli
    expect((await invPOST(req("/api/admin/invitations", { cookie: admin.cookie, body: { label: "x", role: "ADMIN" } }), undefined)).status).toBe(403);

    // İzin verilenler
    expect((await patch(admin.cookie, student.user.id, { action: "role", role: "INSTRUCTOR" })).status).toBe(200);
    expect((await patch(owner.cookie, admin2.user.id, { action: "role", role: "STUDENT" })).status).toBe(200);
    const roles = await db.user.findMany({ where: { id: { in: [owner.user.id, admin.user.id, student.user.id, admin2.user.id] } }, select: { id: true, role: true } });
    expect(Object.fromEntries(roles.map((r) => [r.id, r.role]))).toEqual({
      [owner.user.id]: "OWNER", [admin.user.id]: "ADMIN", [student.user.id]: "INSTRUCTOR", [admin2.user.id]: "STUDENT",
    });
  });

  it("devre dışı bırakma ve rol değişimi hedefin açık oturumlarını hemen sonlandırır", async () => {
    const admin = await makeUser({ role: "ADMIN" });
    const a = await makeUser();
    const b = await makeUser();
    expect((await patch(admin.cookie, a.user.id, { action: "disable" })).status).toBe(200);
    expect((await meGET(req("/api/auth/me", { cookie: a.cookie }), undefined)).status).toBe(401);
    expect((await patch(admin.cookie, b.user.id, { action: "role", role: "INSTRUCTOR" })).status).toBe(200);
    expect((await meGET(req("/api/auth/me", { cookie: b.cookie }), undefined)).status).toBe(401);
    // Tekrar etkinleştirme
    expect((await patch(admin.cookie, a.user.id, { action: "enable" })).status).toBe(200);
  });

  it("geçersiz durum geçişi ve olmayan üye anlaşılır hata verir", async () => {
    const admin = await makeUser({ role: "ADMIN" });
    const active = await makeUser();
    expect((await patch(admin.cookie, active.user.id, { action: "approve" })).status).toBe(400);
    expect((await patch(admin.cookie, "olmayanid123", { action: "disable" })).status).toBe(404);
    expect((await patch(admin.cookie, active.user.id, { action: "sil-her-seyi" })).status).toBe(400);
  });

  it("üye listesi parola hash'i veya oturum bilgisi sızdırmaz; arama çalışır", async () => {
    const admin = await makeUser({ role: "ADMIN" });
    await makeUser({ username: "zeynep.k" });
    const res = await membersGET(req("/api/admin/members?q=zeynep", { cookie: admin.cookie }), undefined);
    const data = await readBody(res);
    expect(data.items).toHaveLength(1);
    expect(data.items[0].username).toBe("zeynep.k");
    const raw = JSON.stringify(data);
    expect(raw).not.toMatch(/passwordHash|scrypt\$|tokenHash/);
  });

  it("ayar değişikliği uygulanır ve önce/sonra değerleriyle denetim kaydına yazılır", async () => {
    const owner = await makeUser({ role: "OWNER" });
    const res = await settingsPATCH(req("/api/admin/settings", { method: "PATCH", cookie: owner.cookie, body: { registrationPolicy: "OPEN", clubName: "Yeni Ad" } }), undefined);
    expect(res.status).toBe(200);
    const view = await readBody(res);
    expect(view.setupTokenHash).toBeUndefined();
    const log = await db.auditLog.findFirstOrThrow({ where: { action: "settings.update" } });
    expect(log.meta).toMatchObject({ registrationPolicy: { from: "APPROVAL", to: "OPEN" }, clubName: { to: "Yeni Ad" } });
  });

  it("logo yükleme: içerik doğrulanır (SVG/HTML reddedilir), güvenli başlıklarla servis edilir", async () => {
    const admin = await makeUser({ role: "ADMIN" });
    const upload = (bytes: Uint8Array<ArrayBuffer>, name: string, type: string) => {
      const form = new FormData();
      form.append("logo", new File([bytes], name, { type }));
      const r = new Request(ORIGIN + "/api/admin/settings/logo", { method: "POST", body: form, headers: { host: "club.test", origin: ORIGIN, cookie: admin.cookie } });
      // Request gövdesini hesaplayıp Content-Length'i ekle (tarayıcı davranışı)
      return r.arrayBuffer().then((buf) =>
        logoPOST(new Request(r.url, { method: "POST", body: buf, headers: { host: "club.test", origin: ORIGIN, cookie: admin.cookie, "content-type": r.headers.get("content-type")!, "content-length": String(buf.byteLength) } }), undefined),
      );
    };
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>');
    expect((await upload(svg, "logo.png", "image/png")).status).toBe(400); // uzantı/MIME yalanı işe yaramaz
    const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4]);
    expect((await upload(png, "../../../etc/passwd", "text/html")).status).toBe(201);
    const s = await db.clubSettings.findUniqueOrThrow({ where: { id: 1 } });
    expect(s.logoFile).toMatch(/^logo-[a-f0-9]{16}\.png$/);
    const got = await logoGET(req("/api/branding/logo"), undefined);
    expect(got.status).toBe(200);
    expect(got.headers.get("content-type")).toBe("image/png");
    expect(got.headers.get("x-content-type-options")).toBe("nosniff");
    const big = new Uint8Array(1024 * 1024 + 100);
    big.set(png);
    expect((await upload(big, "big.png", "image/png")).status).toBe(400);
  });
});
