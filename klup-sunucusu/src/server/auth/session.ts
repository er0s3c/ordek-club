import crypto from "node:crypto";
import type { MemberStatus, Role } from "@prisma/client";
import { db } from "@/server/db";
import { env } from "@/server/env";
import { getSettings } from "@/server/settings";

export const SESSION_COOKIE = "club_session";
const TOUCH_INTERVAL_MS = 5 * 60_000; // lastSeenAt en fazla 5 dakikada bir güncellenir

export type SessionUser = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: Role;
  status: MemberStatus;
};
export type CurrentSession = { sessionId: string; user: SessionUser };

export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string, userAgent: string | null) {
  const s = await getSettings();
  const token = crypto.randomBytes(32).toString("base64url"); // 256 bit
  const expiresAt = new Date(Date.now() + s.sessionMaxAgeDays * 86_400_000);
  await db.session.create({
    data: { tokenHash: hashToken(token), userId, userAgent: userAgent?.slice(0, 200) ?? null, expiresAt },
  });
  return { token, expiresAt };
}

// Token'ı doğrular; süresi dolmuş/boşta kalmış/aktif olmayan kullanıcının oturumunu siler.
export async function validateSessionToken(token: string | undefined | null): Promise<CurrentSession | null> {
  if (!token || token.length < 20 || token.length > 100) return null;
  const tokenHash = hashToken(token);
  const row = await db.session.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, username: true, displayName: true, email: true, role: true, status: true } } },
  });
  if (!row) return null;
  const now = Date.now();
  const s = await getSettings();
  const idleLimit = s.sessionIdleHours * 3_600_000;
  if (row.expiresAt.getTime() <= now || now - row.lastSeenAt.getTime() > idleLimit || row.user.status !== "ACTIVE") {
    await db.session.deleteMany({ where: { id: row.id } });
    return null;
  }
  if (now - row.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await db.session.updateMany({ where: { id: row.id }, data: { lastSeenAt: new Date(now) } });
  }
  return { sessionId: row.id, user: row.user };
}

export async function revokeSessionToken(token: string | undefined | null) {
  if (!token) return;
  await db.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

// Parola değişimi, devre dışı bırakma, rol değişimi sonrası: kullanıcının (isteğe bağlı biri hariç) tüm oturumları.
export async function revokeUserSessions(userId: string, exceptSessionId?: string) {
  await db.session.deleteMany({ where: { userId, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) } });
}

export async function purgeExpiredSessions() {
  await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
}

export function sessionCookieHeader(token: string, expiresAt: Date): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Expires=${expiresAt.toUTCString()}`,
  ];
  if (env().secureCookies) parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookieHeader(): string {
  const parts = [`${SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (env().secureCookies) parts.push("Secure");
  return parts.join("; ");
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    if (part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}
