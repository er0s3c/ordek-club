import fs from "node:fs/promises";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { env } from "@/server/env";
import { requestPasswordReset, resetPassword, listSessions, revokeOtherSessions, revokeSession, transferOwnership } from "@/server/auth/account";
import { verifyPassword } from "@/server/auth/password";
import { createSession, validateSessionToken } from "@/server/auth/session";
import { enqueueMail, mailMode, processOutbox } from "@/server/mail/outbox";
import { notify } from "@/server/classroom/notifications";
import { clubAnalytics } from "@/server/analytics";
import { POST as forgotPost } from "@/app/api/auth/forgot/route";
import { completeSetupFixture, makeUser, readBody, req, resetDb } from "../helpers";
import { resetAll } from "@/server/rate-limit";

type U = Awaited<ReturnType<typeof makeUser>>;
const A = (u: U) => ({ id: u.user.id, role: u.user.role, status: u.user.status });
const codeOf = (p: Promise<unknown>) => p.then(() => null, (e: { code?: string }) => e.code);
const tokenFromMail = (text: string) => text.match(/#token=([A-Za-z0-9_-]+)/)![1]!;

describe("e-posta kuyruğu", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });

  it("testte dosya kipindedir; bildirim yalnız e-postayı açık aktif üyelere kuyruğa girer", async () => {
    expect(mailMode()).toBe("file");
    const a = await makeUser();
    const b = await makeUser();
    await db.user.update({ where: { id: b.user.id }, data: { emailNotifications: false } });
    await notify(db, [a.user.id, b.user.id], { type: "SYSTEM", title: "Deneme", body: "gövde", link: "/tasks" });
    const rows = await db.emailOutbox.findMany();
    expect(rows.map((r) => r.to)).toEqual([a.user.email]);
    expect(rows[0]!.text).toContain(`${env().APP_URL}/tasks`);
    expect(await db.notification.count()).toBe(2); // uygulama içi bildirim herkese
  });

  it("konu/alıcıdaki satır sonları temizlenir (başlık enjeksiyonu); işçi gönderir ve SENT yapar", async () => {
    await enqueueMail(db, [{ to: "ali@example.edu\r\nBcc: x@evil.test", subject: "Merhaba\r\nBcc: x@evil.test", text: "gövde" }]);
    const row = await db.emailOutbox.findFirstOrThrow();
    expect(row.subject).not.toMatch(/[\r\n]/);
    expect(row.to).not.toMatch(/[\r\n]/);
    expect(await processOutbox()).toEqual({ sent: 1, failed: 0 });
    const done = await db.emailOutbox.findUniqueOrThrow({ where: { id: row.id } });
    expect(done.status).toBe("SENT");
    const file = await fs.readFile(path.join(env().storageDir, "mail", `${row.id}.txt`), "utf8");
    expect(file).toContain("gövde");
  });
});

describe("parola sıfırlama", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });

  it("var olan ve olmayan hesap için aynı yanıt; token tek kullanımlık, oturumları kapatır", async () => {
    const u = await makeUser({ username: "sifir.ali" });
    const r1 = await forgotPost(req("/api/auth/forgot", { body: { identifier: "SIFIR.ALI" } }), undefined);
    const r2 = await forgotPost(req("/api/auth/forgot", { body: { identifier: "yok.boyle.biri" } }), undefined);
    expect(r1.status).toBe(200);
    expect(await readBody(r1)).toEqual(await readBody(r2));
    expect(await db.passwordResetToken.count()).toBe(1);
    const mail = await db.emailOutbox.findFirstOrThrow({ where: { to: u.user.email } });
    const token = tokenFromMail(mail.text);
    expect(mail.text).not.toContain("?token="); // sorgu dizesinde değil (sunucu günlüğüne düşmez)
    // Veritabanında ham token yok
    expect(JSON.stringify(await db.passwordResetToken.findMany())).not.toContain(token);

    expect(await codeOf(resetPassword(token, "kisa", "ip"))).toBe("WEAK_PASSWORD");
    await resetPassword(token, "yeni-guclu-parola-42", "ip");
    const after = await db.user.findUniqueOrThrow({ where: { id: u.user.id } });
    expect(await verifyPassword(after.passwordHash, "yeni-guclu-parola-42")).toBe(true);
    expect(await validateSessionToken(u.token)).toBeNull(); // tüm oturumlar kapandı
    expect(await codeOf(resetPassword(token, "baska-guclu-parola-1", "ip"))).toBe("INVALID_TOKEN");
  });

  it("yeni istek eski bağlantıyı geçersiz kılar; süresi dolan ve bozuk token reddedilir; hesap başına sınır", async () => {
    const u = await makeUser();
    await requestPasswordReset(u.user.username, "1.1.1.1");
    const first = tokenFromMail((await db.emailOutbox.findFirstOrThrow()).text);
    await requestPasswordReset(u.user.email, "1.1.1.2");
    expect(await codeOf(resetPassword(first, "yeni-guclu-parola-42", "ip"))).toBe("INVALID_TOKEN");
    const second = tokenFromMail((await db.emailOutbox.findFirstOrThrow({ orderBy: { createdAt: "desc" } })).text);
    await db.passwordResetToken.updateMany({ where: { usedAt: null }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect(await codeOf(resetPassword(second, "yeni-guclu-parola-42", "ip"))).toBe("INVALID_TOKEN");
    expect(await codeOf(resetPassword("x".repeat(10), "yeni-guclu-parola-42", "ip"))).toBe("INVALID_TOKEN");

    resetAll();
    await db.emailOutbox.deleteMany();
    for (let i = 0; i < 5; i++) await requestPasswordReset(u.user.username, `2.2.2.${i}`);
    expect(await db.emailOutbox.count()).toBe(3); // saatte en fazla 3 e-posta
  });

  it("IP başına istek sınırı 429 döner; devre dışı hesaba bağlantı gitmez", async () => {
    const u = await makeUser({ status: "DISABLED" });
    for (let i = 0; i < 5; i++) await requestPasswordReset(u.user.username, "9.9.9.9");
    expect(await db.passwordResetToken.count()).toBe(0);
    expect(await codeOf(requestPasswordReset(u.user.username, "9.9.9.9"))).toBe("RATE_LIMITED");
  });
});

describe("oturumlar ve sahiplik", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });

  it("kişi yalnız kendi oturumlarını görür ve kapatır", async () => {
    const a = await makeUser();
    const b = await makeUser();
    const other = await createSession(a.user.id, "Firefox");
    const mine = await db.session.findFirstOrThrow({ where: { userId: a.user.id, userAgent: "vitest" } });
    const list = await listSessions(A(a), mine.id);
    expect(list).toHaveLength(2);
    expect(list.find((x) => x.current)?.id).toBe(mine.id);
    const bSession = await db.session.findFirstOrThrow({ where: { userId: b.user.id } });
    expect(await codeOf(revokeSession(A(a), bSession.id, mine.id, "ip"))).toBe("NOT_FOUND");
    expect(await codeOf(revokeSession(A(a), mine.id, mine.id, "ip"))).toBe("CURRENT_SESSION");
    await revokeOtherSessions(A(a), mine.id, "ip");
    expect(await validateSessionToken(other.token)).toBeNull();
    expect(await validateSessionToken(a.token)).not.toBeNull();
    expect(await validateSessionToken(b.token)).not.toBeNull();
  });

  it("sahiplik yalnız OWNER tarafından, parolayla, bir ADMIN'e devredilir; her an tek OWNER", async () => {
    const owner = await makeUser({ role: "OWNER", password: "sahip-parolasi-123" });
    const admin = await makeUser({ role: "ADMIN" });
    const inst = await makeUser({ role: "INSTRUCTOR" });
    expect(await codeOf(transferOwnership(A(admin), owner.user.username, "x".repeat(12), "ip"))).toBe("FORBIDDEN");
    expect(await codeOf(transferOwnership(A(owner), admin.user.username, "yanlis-parola-1", "ip"))).toBe("INVALID_CREDENTIALS");
    expect(await codeOf(transferOwnership(A(owner), inst.user.username, "sahip-parolasi-123", "ip"))).toBe("NOT_ADMIN");
    await transferOwnership(A(owner), admin.user.username, "sahip-parolasi-123", "ip");
    const roles = Object.fromEntries((await db.user.findMany({ select: { id: true, role: true } })).map((u) => [u.id, u.role]));
    expect(roles[admin.user.id]).toBe("OWNER");
    expect(roles[owner.user.id]).toBe("ADMIN");
    expect(await db.user.count({ where: { role: "OWNER" } })).toBe(1);
    // Eski sahip artık devredemez
    expect(await codeOf(transferOwnership({ ...A(owner), role: "ADMIN" }, admin.user.username, "sahip-parolasi-123", "ip"))).toBe("FORBIDDEN");
  });
});

describe("analitik", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });

  it("yalnız personel; yalnız öğrenciler sayılır", async () => {
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const stu = await makeUser();
    await makeUser({ role: "ADMIN" });
    expect(await codeOf(clubAnalytics(A(stu)))).toBe("FORBIDDEN");
    await db.user.update({ where: { id: stu.user.id }, data: { lastLoginAt: new Date() } });
    const a = await clubAnalytics(A(inst));
    expect(a.members.students).toBe(1);
    expect(a.members.loggedIn7).toBe(1);
    expect(a.members.weekly).toHaveLength(8);
    expect(JSON.stringify(a)).not.toContain(stu.user.username); // bireysel öğrenci bilgisi yok
  });
});
