import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { POST as registerPOST } from "@/app/api/auth/register/route";
import { POST as loginPOST } from "@/app/api/auth/login/route";
import { POST as invPOST, GET as invGET } from "@/app/api/admin/invitations/route";
import { DELETE as invDELETE } from "@/app/api/admin/invitations/[id]/route";
import { PATCH as memberPATCH } from "@/app/api/admin/members/[id]/route";
import { completeSetupFixture, cookieFrom, makeUser, params, readBody, req, resetDb } from "../helpers";

let n = 0;
const reg = (extra: Record<string, unknown> = {}) => {
  n++;
  return { username: `ogrenci${n}`, email: `ogrenci${n}@ornek.edu.tr`, displayName: `Öğrenci ${n}`, password: "ogrenci-parolasi-1", ...extra };
};
const register = (body: Record<string, unknown>, ip = `10.1.0.${n}`) =>
  registerPOST(req("/api/auth/register", { body, headers: { "x-club-remote-addr": ip } }), undefined);

async function createInvite(cookie: string, body: Record<string, unknown>) {
  const res = await invPOST(req("/api/admin/invitations", { cookie, body }), undefined);
  expect(res.status).toBe(201);
  return readBody(res) as Promise<{ id: string; code: string }>;
}

describe("üyelik: başvuru, onay ve davet kodları", () => {
  beforeEach(resetDb);

  it("APPROVAL: başvuru PENDING kalır, giriş yapamaz; admin onaylayınca girer ve katılım tarihi yazılır", async () => {
    await completeSetupFixture("APPROVAL");
    const admin = await makeUser({ role: "ADMIN" });
    const body = reg({ applicationNote: "Merhaba!" });
    const res = await register(body);
    expect(res.status).toBe(201);
    expect((await readBody(res)).status).toBe("PENDING");
    expect(res.headers.get("set-cookie")).toBeNull();

    const login1 = await loginPOST(req("/api/auth/login", { body: { login: body.username, password: body.password } }), undefined);
    expect(login1.status).toBe(403);

    const u = await db.user.findUniqueOrThrow({ where: { username: body.username as string } });
    expect(u.role).toBe("STUDENT");
    const ok = await memberPATCH(req(`/api/admin/members/${u.id}`, { method: "PATCH", cookie: admin.cookie, body: { action: "approve", note: "Hoş geldin" } }), params({ id: u.id }));
    expect(ok.status).toBe(200);
    const after = await db.user.findUniqueOrThrow({ where: { id: u.id } });
    expect(after.status).toBe("ACTIVE");
    expect(after.joinedAt).not.toBeNull();
    expect(after.reviewedById).toBe(admin.user.id);

    const login2 = await loginPOST(req("/api/auth/login", { body: { login: body.username, password: body.password } }), undefined);
    expect(login2.status).toBe(200);
    expect(await db.auditLog.count({ where: { action: "member.approve", targetId: u.id } })).toBe(1);
  });

  it("OPEN: kayıt hemen aktif olur ve oturum açılır", async () => {
    await completeSetupFixture("OPEN");
    const res = await register(reg());
    expect((await readBody(res)).status).toBe("ACTIVE");
    expect(cookieFrom(res)).toBeTruthy();
  });

  it("CLOSED: kayıt yapılamaz", async () => {
    await completeSetupFixture("CLOSED");
    expect((await register(reg())).status).toBe(403);
  });

  it("istemci rol/durum gönderse bile STUDENT/PENDING oluşur (mass assignment)", async () => {
    await completeSetupFixture("APPROVAL");
    const body = reg({ role: "OWNER", status: "ACTIVE", joinedAt: "2020-01-01" });
    await register(body);
    const u = await db.user.findUniqueOrThrow({ where: { username: body.username as string } });
    expect(u.role).toBe("STUDENT");
    expect(u.status).toBe("PENDING");
    expect(u.joinedAt).toBeNull();
  });

  it("aynı kullanıcı adı/e-posta ikinci kez kullanılamaz", async () => {
    await completeSetupFixture("OPEN");
    const body = reg();
    expect((await register(body)).status).toBe(201);
    const dup = await register({ ...body, email: "baska@ornek.edu.tr" });
    expect(dup.status).toBe(409);
    const dup2 = await register({ ...body, username: "baskaad", email: (body.email as string).toUpperCase() });
    expect(dup2.status).toBe(409);
  });

  it("INVITE_ONLY: kodsuz/yanlış kodla reddedilir; geçerli kodla rol ve otomatik onay uygulanır", async () => {
    await completeSetupFixture("INVITE_ONLY");
    const owner = await makeUser({ role: "OWNER" });
    expect((await register(reg())).status).toBe(400);
    expect((await register(reg({ invitationCode: "AAAA-BBBB-CCCC" }))).status).toBe(400);

    const inv = await createInvite(owner.cookie, { label: "Eğitmenler", role: "INSTRUCTOR", autoApprove: true, maxUses: 5 });
    const body = reg({ invitationCode: inv.code.toLowerCase() });
    const res = await register(body);
    expect(res.status).toBe(201);
    expect((await readBody(res)).status).toBe("ACTIVE");
    const u = await db.user.findUniqueOrThrow({ where: { username: body.username as string } });
    expect(u.role).toBe("INSTRUCTOR");
    expect(u.invitationId).toBe(inv.id);

    // Kod DB'de düz saklanmaz; liste yanıtı kodu içermez
    const row = await db.invitation.findUniqueOrThrow({ where: { id: inv.id } });
    expect(JSON.stringify(row)).not.toContain(inv.code.replace(/-/g, ""));
    const list = await readBody(await invGET(req("/api/admin/invitations", { cookie: owner.cookie }), undefined));
    expect(JSON.stringify(list)).not.toContain(inv.code);
  });

  it("kullanım limiti eşzamanlı kayıtlarda bile aşılamaz (yarış koşulu)", async () => {
    await completeSetupFixture("INVITE_ONLY");
    const owner = await makeUser({ role: "OWNER" });
    const inv = await createInvite(owner.cookie, { label: "Tek kişilik", role: "STUDENT", autoApprove: true, maxUses: 2 });
    const bodies = Array.from({ length: 6 }, () => reg({ invitationCode: inv.code }));
    const results = await Promise.all(bodies.map((b, i) => register(b, `10.2.0.${i}`)));
    expect(results.filter((r) => r.status === 201)).toHaveLength(2);
    expect((await db.invitation.findUniqueOrThrow({ where: { id: inv.id } })).useCount).toBe(2);
    expect(await db.user.count({ where: { invitationId: inv.id } })).toBe(2);
  });

  it("iptal edilmiş ve süresi dolmuş davetler çalışmaz", async () => {
    await completeSetupFixture("INVITE_ONLY");
    const owner = await makeUser({ role: "OWNER" });
    const a = await createInvite(owner.cookie, { label: "İptal", role: "STUDENT" });
    expect((await invDELETE(req(`/api/admin/invitations/${a.id}`, { method: "DELETE", cookie: owner.cookie }), params({ id: a.id }))).status).toBe(200);
    expect((await register(reg({ invitationCode: a.code }))).status).toBe(400);

    const b = await createInvite(owner.cookie, { label: "Eski", role: "STUDENT" });
    await db.invitation.update({ where: { id: b.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await register(reg({ invitationCode: b.code }))).status).toBe(400);
  });

  it("APPROVAL + otomatik onaysız davet: kullanıcı yine PENDING kalır", async () => {
    await completeSetupFixture("APPROVAL");
    const owner = await makeUser({ role: "OWNER" });
    const inv = await createInvite(owner.cookie, { label: "Onaylı değil", role: "STUDENT", autoApprove: false });
    expect((await readBody(await register(reg({ invitationCode: inv.code })))).status).toBe("PENDING");
  });

  it("kayıt hız sınırı (IP başına)", async () => {
    await completeSetupFixture("APPROVAL");
    const statuses: number[] = [];
    for (let i = 0; i < 12; i++) statuses.push((await register(reg(), "10.9.9.9")).status);
    expect(statuses.slice(0, 10).every((s) => s === 201)).toBe(true);
    expect(statuses.slice(10)).toEqual([429, 429]);
  });
});
