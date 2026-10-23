// Görev görünürlüğü — dosya ve görev servislerinin ortak kuralı.
import type { Prisma } from "@prisma/client";
import { isStaff, type Actor } from "@/server/auth/policy";

// Öğrencinin görebileceği görevler: yayınlanmış (ya da kapanmış), başlangıcı gelmiş ve ona hedeflenmiş.
export function visibleAssignmentsWhere(actor: Actor, now = new Date()): Prisma.AssignmentWhereInput {
  if (isStaff(actor.role)) return {};
  return {
    status: { in: ["PUBLISHED", "CLOSED"] },
    startsAt: { lte: now },
    OR: [{ audience: "ALL" }, { targets: { some: { userId: actor.id } } }],
  };
}
