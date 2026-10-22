import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";

export const AUDIT_PAGE_SIZE = 50;

export async function listAudit(q: { action?: string; actor?: string; page: number }) {
  const where: Prisma.AuditLogWhereInput = {};
  if (q.action) where.action = { startsWith: q.action };
  if (q.actor) where.actor = { username: q.actor.toLowerCase() };
  const [total, items] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (q.page - 1) * AUDIT_PAGE_SIZE,
      take: AUDIT_PAGE_SIZE,
      select: {
        id: true, action: true, targetType: true, targetId: true, meta: true, ip: true, createdAt: true,
        actor: { select: { id: true, username: true } },
      },
    }),
  ]);
  return { total, page: q.page, pageSize: AUDIT_PAGE_SIZE, items };
}
