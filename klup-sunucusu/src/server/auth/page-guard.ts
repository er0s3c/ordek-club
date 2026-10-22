import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";
import { isSetupComplete } from "@/server/settings";
import { SESSION_COOKIE, validateSessionToken, type CurrentSession } from "@/server/auth/session";

// ── Server component'ler / layout'lar için ──────────────────────────────────
// Middleware'e güvenilmez: her korumalı sayfa bu fonksiyonlarla sunucu tarafında yeniden doğrular.

export async function currentSession(): Promise<CurrentSession | null> {
  const jar = await cookies();
  return validateSessionToken(jar.get(SESSION_COOKIE)?.value);
}

export async function requireSetupDone() {
  if (!(await isSetupComplete())) redirect("/setup");
}

export async function requirePageSession(roles?: readonly Role[]): Promise<CurrentSession> {
  await requireSetupDone();
  const s = await currentSession();
  if (!s) {
    const h = await headers();
    const path = h.get("x-club-path") ?? "/";
    redirect(`/login?next=${encodeURIComponent(path)}`);
  }
  if (roles && !roles.includes(s.user.role)) redirect("/dashboard?denied=1");
  return s;
}

export async function getNonce(): Promise<string | undefined> {
  return (await headers()).get("x-nonce") ?? undefined;
}
