import { requireSession, ADMIN_ROLES } from "@/server/auth/guard";
import { clientIp } from "@/server/http";
import { tooMany } from "@/server/errors";
import { LIMITS, hit } from "@/server/rate-limit";
import type { Actor } from "@/server/auth/policy";

// Admin API'leri için ortak giriş noktası: oturum + rol + (yazma işlemlerinde) hız sınırı.
export async function adminContext(req: Request, { write = false } = {}) {
  const session = await requireSession(req, ADMIN_ROLES);
  if (write) {
    const [max, win] = LIMITS.adminWritePerUser;
    const r = hit(`admin:write:${session.user.id}`, max, win);
    if (!r.ok) throw tooMany(r.retryAfterSec);
  }
  const actor: Actor = { id: session.user.id, role: session.user.role, status: session.user.status };
  return { session, actor, ip: clientIp(req) };
}

// Herhangi bir aktif üye için: oturum + (isteğe bağlı) yazma hız sınırı.
export async function memberContext(req: Request, { write = false } = {}) {
  const session = await requireSession(req);
  if (write) {
    const r = hit(`member:write:${session.user.id}`, 60, 60_000);
    if (!r.ok) throw tooMany(r.retryAfterSec);
  }
  const actor: Actor = { id: session.user.id, role: session.user.role, status: session.user.status };
  return { session, actor, ip: clientIp(req) };
}
