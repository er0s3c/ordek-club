import { db } from "@/server/db";
import { invalidateSettings } from "@/server/settings";
import { resetAll } from "@/server/rate-limit";
import { hashPassword } from "@/server/auth/password";
import { createSession } from "@/server/auth/session";
import { resetDefaultsCache } from "@/server/xp/defaults";
import type { MemberStatus, RegistrationPolicy, Role } from "@prisma/client";

export const ORIGIN = "http://club.test";

export async function resetDb() {
  if (!process.env.DATABASE_URL?.includes("_test")) throw new Error("resetDb yalnızca _test veritabanında çalışır");
  await db.$executeRawUnsafe(
    `TRUNCATE "EmailOutbox", "PasswordResetToken", "AssignmentTeamMember", "AssignmentTeam", "ClassGroupMember", "ClassGroup", "LivePollAnswer", "LivePoll", "Notification", "Announcement", "FileGrant", "FileAsset", "Submission", "AssignmentTarget", "Assignment", "LeaderboardEntry", "LeaderboardPeriod", "ActivityDay", "UserBadge", "Badge", "Level", "XpRewardRule", "XpTransaction", "QuizAttempt", "LessonProgress", "Lesson", "Track", "LiveSessionEvent", "SessionParticipant", "LiveSession", "Slide", "PresentationVersion", "Presentation", "AuditLog", "Session", "User", "Invitation", "ClubSettings" RESTART IDENTITY CASCADE`,
  );
  invalidateSettings();
  resetAll();
  resetDefaultsCache(); // XP kuralları/seviyeler/rozetler bir sonraki kullanımda yeniden eklenir
}

export async function completeSetupFixture(policy: RegistrationPolicy = "APPROVAL") {
  await db.clubSettings.upsert({
    where: { id: 1 },
    update: { setupCompletedAt: new Date(), registrationPolicy: policy },
    create: { id: 1, setupCompletedAt: new Date(), registrationPolicy: policy, clubName: "Test Kulübü" },
  });
  invalidateSettings();
}

let seq = 0;
export async function makeUser(opts: { role?: Role; status?: MemberStatus; password?: string; username?: string } = {}) {
  seq++;
  const username = opts.username ?? `user${seq}${Date.now() % 10000}`;
  const user = await db.user.create({
    data: {
      username,
      email: `${username}@example.edu`,
      displayName: `Kullanıcı ${seq}`,
      passwordHash: await hashPassword(opts.password ?? "dogru-parola-123"),
      role: opts.role ?? "STUDENT",
      status: opts.status ?? "ACTIVE",
      joinedAt: (opts.status ?? "ACTIVE") === "ACTIVE" ? new Date() : null,
    },
  });
  const { token } = await createSession(user.id, "vitest");
  return { user, token, cookie: `club_session=${token}` };
}

type ReqOpts = { method?: string; body?: unknown; cookie?: string; headers?: Record<string, string>; origin?: string | null };

// Route handler'larını doğrudan çağırmak için gerçek bir Request üretir (tarayıcı gibi Origin/Host ile).
export function req(path: string, o: ReqOpts = {}): Request {
  const method = o.method ?? (o.body !== undefined ? "POST" : "GET");
  const headers: Record<string, string> = { host: "club.test", "x-club-remote-addr": "10.0.0.1", ...o.headers };
  if (o.origin !== null && method !== "GET") headers.origin = o.origin ?? ORIGIN;
  if (o.cookie) headers.cookie = o.cookie;
  let body: string | undefined;
  if (o.body !== undefined) {
    headers["content-type"] ??= "application/json";
    body = typeof o.body === "string" ? o.body : JSON.stringify(o.body);
  }
  return new Request(ORIGIN + path, { method, headers, body });
}

export const params = <T extends Record<string, string>>(p: T) => ({ params: Promise.resolve(p) });

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- test yanıtları serbest biçimli incelenir
export async function readBody(res: Response): Promise<any> {
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}

export function cookieFrom(res: Response): string | null {
  const sc = res.headers.get("set-cookie");
  const m = sc?.match(/club_session=([^;]+)/);
  return m && m[1] ? `club_session=${m[1]}` : null;
}
