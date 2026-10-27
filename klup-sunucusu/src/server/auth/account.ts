// Hesap işlemleri: e-postayla parola sıfırlama, oturum yönetimi, bildirim tercihi, sahiplik devri.
import crypto from "node:crypto";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { env } from "@/server/env";
import { badRequest, conflict, forbidden, notFound, tooMany } from "@/server/errors";
import { hit } from "@/server/rate-limit";
import { getSettings } from "@/server/settings";
import { burnPasswordCheck, hashPassword, passwordProblem, verifyPassword } from "@/server/auth/password";
import { hashToken, revokeUserSessions } from "@/server/auth/session";
import { enqueueMail, mailEnabled } from "@/server/mail/outbox";
import { tFor } from "@/i18n/catalog";
import { localeForUser } from "@/i18n/request";
import type { Actor } from "@/server/auth/policy";

const RESET_TTL_MS = 30 * 60_000;
export const RESET_LIMITS = { perIp: [5, 15 * 60_000], perUser: [3, 60 * 60_000] } as const;

// ── Parola sıfırlama ───────────────────────────────────────────────────────
// Yanıt her durumda aynıdır (kullanıcı/e-posta varlığı sızdırılmaz). Token e-postada ham, veritabanında yalnız hash'i.
export async function requestPasswordReset(identifier: string, ip: string) {
  const r = hit(`reset:ip:${ip}`, ...RESET_LIMITS.perIp);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  if (!mailEnabled()) return;
  const id = identifier.trim().toLowerCase();
  const user = await db.user.findFirst({ where: { OR: [{ username: id }, { email: id }], status: "ACTIVE" } });
  if (!user) {
    await burnPasswordCheck("zamanlama-esitleme"); // var olan/olmayan hesap için benzer süre
    return;
  }
  if (!hit(`reset:user:${user.id}`, ...RESET_LIMITS.perUser).ok) return; // sessizce: hesaba e-posta seli gönderilmez
  const token = crypto.randomBytes(32).toString("base64url");
  const s = await getSettings();
  await db.$transaction(async (tx) => {
    // Önceki kullanılmamış bağlantılar geçersiz olur.
    await tx.passwordResetToken.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } });
    await tx.passwordResetToken.create({ data: { tokenHash: hashToken(token), userId: user.id, expiresAt: new Date(Date.now() + RESET_TTL_MS), ip: ip.slice(0, 64) } });
    const link = `${env().APP_URL.replace(/\/$/, "")}/reset-password#token=${token}`;
    const t = tFor(await localeForUser(user.id));
    await enqueueMail(tx, [
      {
        to: user.email,
        subject: t("{club}: parola sıfırlama", { club: s.clubName }),
        text: t("Merhaba {name},\n\nParolanı sıfırlamak için 30 dakika içinde şu bağlantıyı aç:\n{link}\n\nBu isteği sen yapmadıysan bu e-postayı yok say; parolan değişmez.\nİstek IP adresi: {ip}", { name: user.displayName, link, ip }),
      },
    ]);
    await audit({ actorId: user.id, action: "auth.password.reset.request", targetType: "User", targetId: user.id, ip }, tx);
  });
}

export async function resetPassword(token: string, newPassword: string, ip: string) {
  const r = hit(`reset:ip:${ip}`, ...RESET_LIMITS.perIp);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const invalid = () => badRequest("Bağlantı geçersiz ya da süresi dolmuş. Yeniden sıfırlama iste.", "INVALID_TOKEN");
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) throw invalid();
  const row = await db.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!row || row.usedAt || row.expiresAt < new Date() || row.user.status !== "ACTIVE") throw invalid();
  const problem = passwordProblem(newPassword, row.user);
  if (problem) throw badRequest(problem, "WEAK_PASSWORD", { fields: { password: problem } });
  const hash = await hashPassword(newPassword);
  await db.$transaction(async (tx) => {
    // Aynı token'ın eşzamanlı kullanımı: yalnız biri kazanır.
    const used = await tx.passwordResetToken.updateMany({ where: { id: row.id, usedAt: null }, data: { usedAt: new Date() } });
    if (!used.count) throw invalid();
    await tx.user.update({ where: { id: row.userId }, data: { passwordHash: hash, passwordChangedAt: new Date() } });
    await audit({ actorId: row.userId, action: "auth.password.reset", targetType: "User", targetId: row.userId, ip }, tx);
  });
  await revokeUserSessions(row.userId); // tüm cihazlardan çıkış
}

// ── Oturumlar ───────────────────────────────────────────────────────────────
export async function listSessions(actor: Actor, currentSessionId: string) {
  const rows = await db.session.findMany({ where: { userId: actor.id, expiresAt: { gt: new Date() } }, orderBy: { lastSeenAt: "desc" }, select: { id: true, userAgent: true, createdAt: true, lastSeenAt: true } });
  return rows.map((r) => ({ ...r, current: r.id === currentSessionId }));
}

export async function revokeSession(actor: Actor, sessionId: string, currentSessionId: string, ip: string) {
  if (sessionId === currentSessionId) throw badRequest("Bu cihazdan çıkmak için Çıkış yap'ı kullan.", "CURRENT_SESSION");
  const r = await db.session.deleteMany({ where: { id: sessionId, userId: actor.id } }); // başkasının oturumu silinemez
  if (!r.count) throw notFound("Oturum bulunamadı.");
  await audit({ actorId: actor.id, action: "auth.session.revoke", targetType: "Session", targetId: sessionId, ip });
}

export async function revokeOtherSessions(actor: Actor, currentSessionId: string, ip: string) {
  await revokeUserSessions(actor.id, currentSessionId);
  await audit({ actorId: actor.id, action: "auth.session.revoke-others", targetType: "User", targetId: actor.id, ip });
}

export async function setEmailNotifications(actor: Actor, on: boolean) {
  await db.user.update({ where: { id: actor.id }, data: { emailNotifications: on } });
}

// ── Sahiplik devri ──────────────────────────────────────────────────────────
// Yalnız OWNER, parolasını doğrulayarak aktif bir ADMIN'e devreder; kendisi ADMIN olur. Kulüpte her an tek OWNER vardır.
export async function transferOwnership(actor: Actor, targetUsername: string, password: string, ip: string) {
  if (actor.role !== "OWNER") throw forbidden("Sahipliği yalnız kulüp sahibi devredebilir.");
  const r = hit(`owner-transfer:${actor.id}`, 5, 15 * 60_000);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const me = await db.user.findUniqueOrThrow({ where: { id: actor.id } });
  if (!(await verifyPassword(me.passwordHash, password))) throw badRequest("Parola hatalı.", "INVALID_CREDENTIALS", { fields: { password: "Parola hatalı." } });
  const target = await db.user.findUnique({ where: { username: targetUsername.trim().toLowerCase() } });
  if (!target || target.status !== "ACTIVE") throw badRequest("Aktif bir üye bulunamadı.", "BAD_TARGET");
  if (target.id === actor.id) throw badRequest("Sahiplik zaten sende.", "SELF");
  if (target.role !== "ADMIN") throw badRequest("Sahiplik yalnız bir yöneticiye (ADMIN) devredilebilir. Önce üyeyi yönetici yap.", "NOT_ADMIN");
  await db.$transaction(async (tx) => {
    const owners = await tx.user.updateMany({ where: { id: actor.id, role: "OWNER" }, data: { role: "ADMIN" } });
    if (!owners.count) throw conflict("Sahiplik durumu değişti; sayfayı yenile.", "STALE");
    await tx.user.update({ where: { id: target.id }, data: { role: "OWNER" } });
    await audit({ actorId: actor.id, action: "member.ownership.transfer", targetType: "User", targetId: target.id, meta: { to: target.username }, ip }, tx);
  });
}
