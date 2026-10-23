// Görev görünürlüğü — dosya ve görev servislerinin ortak kuralı.
import type { Prisma } from "@prisma/client";
import { isStaff, type Actor } from "@/server/auth/policy";

// Öğrencinin görebileceği görevler: yayınlanmış (ya da kapanmış), başlangıcı gelmiş ve ona hedeflenmiş
// (herkese, adıyla seçilmiş ya da üyesi olduğu arşivlenmemiş bir sınıf/etkinliğe).
export function visibleAssignmentsWhere(actor: Actor, now = new Date()): Prisma.AssignmentWhereInput {
  if (isStaff(actor.role)) return {};
  return {
    status: { in: ["PUBLISHED", "CLOSED"] },
    startsAt: { lte: now },
    OR: [
      { audience: "ALL" },
      { audience: "SELECTED", targets: { some: { userId: actor.id } } },
      { audience: "GROUP", group: { archivedAt: null, members: { some: { userId: actor.id } } } },
    ],
  };
}

// Öğrencinin üyesi olduğu (arşivlenmemiş) gruplar.
export const memberGroupWhere = (userId: string): Prisma.ClassGroupWhereInput => ({ archivedAt: null, members: { some: { userId } } });
