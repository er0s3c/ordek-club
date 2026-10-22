import type { Role } from "@prisma/client";
import { forbidden, unauthorized, HttpError } from "@/server/errors";
import { isSetupComplete } from "@/server/settings";
import { SESSION_COOKIE, readCookie, validateSessionToken, type CurrentSession } from "@/server/auth/session";

// ── API route handler'ları için ─────────────────────────────────────────────
// Çerezi doğrudan Request'ten okur (next/headers'a bağımlı değil → doğrudan testlenebilir).

export async function getSessionFromRequest(req: Request): Promise<CurrentSession | null> {
  return validateSessionToken(readCookie(req.headers.get("cookie"), SESSION_COOKIE));
}

export async function requireSession(req: Request, roles?: readonly Role[]): Promise<CurrentSession> {
  if (!(await isSetupComplete())) throw new HttpError(503, "SETUP_REQUIRED", "Kurulum henüz tamamlanmadı.");
  const s = await getSessionFromRequest(req);
  if (!s) throw unauthorized();
  if (roles && !roles.includes(s.user.role)) throw forbidden();
  return s;
}

export const ADMIN_ROLES = ["OWNER", "ADMIN"] as const satisfies readonly Role[];
export const STAFF_ROLES = ["OWNER", "ADMIN", "INSTRUCTOR"] as const satisfies readonly Role[];
