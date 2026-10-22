import type { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { forbidden, notFound } from "@/server/errors";
import { canCreateInvitationFor, type Actor } from "@/server/auth/policy";
import { newInvitationCode, sha256 } from "@/server/codes";
import type { invitationCreateSchema } from "@/lib/validation";

export async function listInvitations() {
  const items = await db.invitation.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true, label: true, codePrefix: true, role: true, autoApprove: true, maxUses: true, useCount: true,
      expiresAt: true, revokedAt: true, createdAt: true, createdBy: { select: { username: true } },
    },
  });
  const now = Date.now();
  return items.map((i) => ({
    ...i,
    state:
      i.revokedAt ? "REVOKED"
      : i.expiresAt && i.expiresAt.getTime() <= now ? "EXPIRED"
      : i.maxUses !== null && i.useCount >= i.maxUses ? "EXHAUSTED"
      : "ACTIVE",
  }));
}

// Kod düz haliyle YALNIZCA burada (oluşturma yanıtında) döner; veritabanında hash'i tutulur.
export async function createInvitation(actor: Actor, input: z.output<typeof invitationCreateSchema>, ip: string) {
  if (!canCreateInvitationFor(actor, input.role)) throw forbidden("Bu rol için davet oluşturma yetkin yok.");
  const { code, normalized } = newInvitationCode();
  const inv = await db.$transaction(async (tx) => {
    const created = await tx.invitation.create({
      data: {
        label: input.label,
        codeHash: sha256(normalized),
        codePrefix: normalized.slice(0, 4),
        role: input.role,
        autoApprove: input.autoApprove,
        maxUses: input.maxUses,
        expiresAt: input.expiresInDays ? new Date(Date.now() + input.expiresInDays * 86_400_000) : null,
        createdById: actor.id,
      },
    });
    await audit({ actorId: actor.id, action: "invitation.create", targetType: "Invitation", targetId: created.id, meta: { role: input.role, autoApprove: input.autoApprove, maxUses: input.maxUses }, ip }, tx);
    return created;
  });
  return { id: inv.id, code };
}

export async function revokeInvitation(actor: Actor, id: string, ip: string) {
  const inv = await db.invitation.findUnique({ where: { id } });
  if (!inv) throw notFound("Davet bulunamadı.");
  if (!canCreateInvitationFor(actor, inv.role)) throw forbidden("Bu daveti iptal etme yetkin yok.");
  if (inv.revokedAt) return;
  await db.$transaction(async (tx) => {
    await tx.invitation.update({ where: { id }, data: { revokedAt: new Date() } });
    await audit({ actorId: actor.id, action: "invitation.revoke", targetType: "Invitation", targetId: id, ip }, tx);
  });
}
