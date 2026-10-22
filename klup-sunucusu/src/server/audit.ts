import type { Prisma } from "@prisma/client";
import { db } from "@/server/db";

export type AuditInput = {
  actorId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  meta?: Prisma.InputJsonValue;
  ip?: string;
};

type Tx = Pick<typeof db, "auditLog">;

// Audit kaydı asla işlemi düşürmemeli; tx verilirse aynı transaction içinde yazılır.
export async function audit(input: AuditInput, tx: Tx = db) {
  try {
    await tx.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        meta: input.meta,
        ip: input.ip ?? null,
      },
    });
  } catch (err) {
    if (tx !== db) throw err; // transaction içindeyse tutarlılık için hatayı yükselt
    console.error("[club] audit yazılamadı", input.action, err);
  }
}
