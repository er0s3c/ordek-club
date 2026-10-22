import { Prisma, type Invitation, type MemberStatus, type Role } from "@prisma/client";
import type { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { getSettings } from "@/server/settings";
import { sha256 } from "@/server/codes";
import { HttpError, badRequest, conflict, forbidden, tooMany } from "@/server/errors";
import { LIMITS, hit, reset } from "@/server/rate-limit";
import { burnPasswordCheck, hashPassword, needsRehash, passwordProblem, verifyPassword } from "@/server/auth/password";
import { createSession, revokeUserSessions } from "@/server/auth/session";
import type { registerSchema } from "@/lib/validation";

type Ctx = { ip: string; userAgent: string | null };

function limit(key: string, [max, windowMs]: readonly [number, number]) {
  const r = hit(key, max, windowMs);
  if (!r.ok) throw tooMany(r.retryAfterSec);
}

const INVALID_LOGIN = () => new HttpError(401, "INVALID_CREDENTIALS", "Kullanıcı adı veya parola hatalı.");
const INVALID_INVITE = () => badRequest("Davet kodu geçersiz, iptal edilmiş veya süresi dolmuş.", "INVALID_INVITATION");

// ── Kayıt / başvuru ─────────────────────────────────────────────────────────

export type RegisterResult =
  | { status: "ACTIVE"; userId: string; session: { token: string; expiresAt: Date } }
  | { status: "PENDING"; userId: string };

export async function register(input: z.output<typeof registerSchema>, ctx: Ctx): Promise<RegisterResult> {
  limit(`register:ip:${ctx.ip}`, LIMITS.registerPerIp);
  const settings = await getSettings();
  if (!settings.setupCompletedAt) throw new HttpError(503, "SETUP_REQUIRED", "Kurulum henüz tamamlanmadı.");
  if (settings.registrationPolicy === "CLOSED") throw forbidden("Kulüp şu anda yeni üye kabul etmiyor.");
  if (settings.registrationPolicy === "INVITE_ONLY" && !input.invitationCode) {
    throw badRequest("Kayıt için davet kodu gerekli.", "INVITATION_REQUIRED", { fields: { invitationCode: "Davet kodu gerekli." } });
  }
  const problem = passwordProblem(input.password, input);
  if (problem) throw badRequest(problem, "WEAK_PASSWORD", { fields: { password: problem } });

  const taken = await db.user.findFirst({
    where: { OR: [{ username: input.username }, { email: input.email }] },
    select: { id: true },
  });
  if (taken) throw conflict("Bu kullanıcı adı veya e-posta zaten kullanımda.", "ACCOUNT_EXISTS");

  const passwordHash = await hashPassword(input.password);

  let user: { id: string; status: MemberStatus; role: Role };
  try {
    user = await db.$transaction(async (tx) => {
      let invitation: Invitation | null = null;
      if (input.invitationCode) {
        // Atomik tüketim: iptal/süre/kullanım limiti tek UPDATE içinde kontrol edilir (yarış koşuluna karşı).
        const rows = await tx.$queryRaw<Invitation[]>`
          UPDATE "Invitation" SET "useCount" = "useCount" + 1
          WHERE "codeHash" = ${sha256(input.invitationCode)}
            AND "revokedAt" IS NULL
            AND ("expiresAt" IS NULL OR "expiresAt" > now())
            AND ("maxUses" IS NULL OR "useCount" < "maxUses")
          RETURNING *`;
        invitation = rows[0] ?? null;
        if (!invitation) throw INVALID_INVITE();
      }
      const active = settings.registrationPolicy === "OPEN" || invitation?.autoApprove === true;
      const now = new Date();
      const created = await tx.user.create({
        data: {
          username: input.username,
          email: input.email,
          displayName: input.displayName,
          passwordHash,
          studentNumber: input.studentNumber ?? null,
          department: input.department ?? null,
          applicationNote: input.applicationNote ?? null,
          role: invitation?.role ?? "STUDENT",
          status: active ? "ACTIVE" : "PENDING",
          joinedAt: active ? now : null,
          invitationId: invitation?.id ?? null,
        },
        select: { id: true, status: true, role: true },
      });
      await audit(
        {
          actorId: created.id,
          action: active ? "member.register.active" : "member.register.pending",
          targetType: "User",
          targetId: created.id,
          meta: invitation ? { invitationId: invitation.id, role: created.role } : { role: created.role },
          ip: ctx.ip,
        },
        tx,
      );
      return created;
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw conflict("Bu kullanıcı adı veya e-posta zaten kullanımda.", "ACCOUNT_EXISTS");
    }
    throw err;
  }

  if (user.status === "ACTIVE") {
    const session = await createSession(user.id, ctx.userAgent);
    return { status: "ACTIVE", userId: user.id, session };
  }
  return { status: "PENDING", userId: user.id };
}

// ── Giriş ───────────────────────────────────────────────────────────────────

const STATUS_DENIED: Record<Exclude<MemberStatus, "ACTIVE">, HttpError> = {
  PENDING: new HttpError(403, "PENDING", "Üyelik başvurun henüz onaylanmadı. Onaylandığında giriş yapabilirsin."),
  REJECTED: new HttpError(403, "REJECTED", "Üyelik başvurun reddedildi. Ayrıntı için kulüp yöneticileriyle iletişime geç."),
  DISABLED: new HttpError(403, "DISABLED", "Hesabın devre dışı bırakıldı. Kulüp yöneticileriyle iletişime geç."),
};

export async function login(loginId: string, password: string, ctx: Ctx) {
  limit(`login:ip:${ctx.ip}`, LIMITS.loginPerIp);
  const userKey = `login:user:${loginId}`;
  limit(userKey, LIMITS.loginPerUser);

  const user = await db.user.findFirst({
    where: loginId.includes("@") ? { email: loginId } : { username: loginId },
  });
  if (!user) {
    await burnPasswordCheck(password);
    await audit({ action: "auth.login.failed", meta: { reason: "unknown_user" }, ip: ctx.ip });
    throw INVALID_LOGIN();
  }
  if (!(await verifyPassword(user.passwordHash, password))) {
    await audit({ actorId: user.id, action: "auth.login.failed", targetType: "User", targetId: user.id, meta: { reason: "bad_password" }, ip: ctx.ip });
    throw INVALID_LOGIN();
  }
  // Parola doğru: durum bilgisini göstermek artık hesap varlığını sızdırmaz.
  if (user.status !== "ACTIVE") throw STATUS_DENIED[user.status];

  reset(userKey);
  const data: Prisma.UserUpdateInput = { lastLoginAt: new Date() };
  if (needsRehash(user.passwordHash)) data.passwordHash = await hashPassword(password);
  await db.user.update({ where: { id: user.id }, data });
  const session = await createSession(user.id, ctx.userAgent);
  await audit({ actorId: user.id, action: "auth.login", targetType: "User", targetId: user.id, ip: ctx.ip });
  return { user, session };
}

// ── Parola değiştirme ───────────────────────────────────────────────────────

export async function changePassword(
  s: { sessionId: string; user: { id: string; username: string; email: string } },
  currentPassword: string,
  newPassword: string,
  ctx: Ctx,
) {
  limit(`password:user:${s.user.id}`, LIMITS.passwordPerUser);
  const user = await db.user.findUniqueOrThrow({ where: { id: s.user.id } });
  if (!(await verifyPassword(user.passwordHash, currentPassword))) {
    throw badRequest("Mevcut parola hatalı.", "INVALID_CREDENTIALS", { fields: { currentPassword: "Mevcut parola hatalı." } });
  }
  const problem = passwordProblem(newPassword, s.user);
  if (problem) throw badRequest(problem, "WEAK_PASSWORD", { fields: { newPassword: problem } });
  if (currentPassword === newPassword) {
    throw badRequest("Yeni parola eskisinden farklı olmalı.", "SAME_PASSWORD", { fields: { newPassword: "Yeni parola eskisinden farklı olmalı." } });
  }
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(newPassword), passwordChangedAt: new Date() },
  });
  await revokeUserSessions(user.id, s.sessionId); // diğer cihazlardaki oturumlar düşer
  await audit({ actorId: user.id, action: "auth.password.change", targetType: "User", targetId: user.id, ip: ctx.ip });
}
