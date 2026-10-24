// Yönetici işlemleri: ödül kuralları, seviye eşikleri, puan düzeltme/geri alma, rozetler.
// Hepsi yalnız OWNER/ADMIN; her değişiklik audit log'a yazılır ve geri alınabilir kayıt bırakır.
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { badRequest, conflict, forbidden, notFound } from "@/server/errors";
import { canManageGamification, type Actor } from "@/server/auth/policy";
import { BADGE_ICONS, badgeRuleSchema } from "./badges";
import { ensureGamificationDefaults } from "./defaults";

function requireAdmin(a: Actor) {
  if (!canManageGamification(a)) throw forbidden();
}

export const rulesSchema = z.array(z.object({ key: z.string().min(1).max(40), amount: z.number().int().min(0).max(5000), enabled: z.boolean() })).min(1).max(50);

export async function updateRules(actor: Actor, input: z.output<typeof rulesSchema>, ip: string) {
  requireAdmin(actor);
  await ensureGamificationDefaults();
  await db.$transaction(async (tx) => {
    for (const r of input) {
      const cur = await tx.xpRewardRule.findUnique({ where: { key: r.key } });
      if (!cur) throw badRequest(`Bilinmeyen kural: ${r.key}`);
      if (cur.amount === r.amount && cur.enabled === r.enabled) continue;
      await tx.xpRewardRule.update({ where: { key: r.key }, data: { amount: r.amount, enabled: r.enabled, updatedById: actor.id } });
      await audit({ actorId: actor.id, action: "xp.rule.update", targetType: "XpRewardRule", targetId: r.key, meta: { from: { amount: cur.amount, enabled: cur.enabled }, to: { amount: r.amount, enabled: r.enabled } }, ip }, tx);
    }
  });
}

export const levelsSchema = z
  .array(z.object({ number: z.number().int().min(1).max(100), minXp: z.number().int().min(0).max(10_000_000), title: z.string().trim().min(1).max(40) }))
  .min(2)
  .max(50)
  .superRefine((ls, ctx) => {
    const s = [...ls].sort((a, b) => a.number - b.number);
    if (s[0]!.number !== 1 || s[0]!.minXp !== 0) ctx.addIssue({ code: "custom", message: "1. seviye 0 XP'den başlamalı." });
    for (let i = 1; i < s.length; i++) {
      if (s[i]!.number !== s[i - 1]!.number + 1) ctx.addIssue({ code: "custom", message: "Seviye numaraları ardışık olmalı." });
      if (s[i]!.minXp <= s[i - 1]!.minXp) ctx.addIssue({ code: "custom", message: "Eşikler seviyeyle birlikte artmalı." });
    }
  });

export async function replaceLevels(actor: Actor, input: z.output<typeof levelsSchema>, ip: string) {
  requireAdmin(actor);
  await db.$transaction(async (tx) => {
    const before = await tx.level.findMany({ orderBy: { number: "asc" } });
    await tx.level.deleteMany({});
    await tx.level.createMany({ data: input });
    await audit({ actorId: actor.id, action: "xp.levels.update", targetType: "Level", meta: { before, after: input }, ip }, tx);
  });
}

export const adjustSchema = z.object({
  username: z.string().trim().toLowerCase().min(1).max(40),
  amount: z.number().int().min(-5000).max(5000).refine((n) => n !== 0, "Miktar 0 olamaz."),
  reason: z.string().trim().min(5, "Gerekçe en az 5 karakter olmalı.").max(300),
});

export async function adjustXp(actor: Actor, input: z.output<typeof adjustSchema>, ip: string) {
  requireAdmin(actor);
  const user = await db.user.findUnique({ where: { username: input.username }, select: { id: true, status: true } });
  if (!user) throw notFound("Kullanıcı bulunamadı.");
  return db.$transaction(async (tx) => {
    const t = await tx.xpTransaction.create({
      data: { userId: user.id, amount: input.amount, source: "MANUAL", idempotencyKey: `manual:${crypto.randomUUID()}`, reason: input.reason, createdById: actor.id },
    });
    await audit({ actorId: actor.id, action: "xp.adjust", targetType: "User", targetId: user.id, meta: { amount: input.amount, reason: input.reason, tx: t.id }, ip }, tx);
    return t;
  });
}

// Bir işlemi geri alır: karşı kayıt yazılır (asıl kayıt silinmez). Bir işlem yalnız bir kez geri alınır.
export async function reverseTransaction(actor: Actor, id: string, reason: string, ip: string) {
  requireAdmin(actor);
  const t = await db.xpTransaction.findUnique({ where: { id }, include: { reversedBy: { select: { id: true } } } });
  if (!t) throw notFound("İşlem bulunamadı.");
  if (t.source === "REVERSAL") throw badRequest("Geri alma kaydı geri alınamaz; gerekirse elle düzeltme yap.");
  if (t.reversedBy) throw conflict("Bu işlem zaten geri alınmış.", "ALREADY_REVERSED");
  return db.$transaction(async (tx) => {
    const r = await tx.xpTransaction.create({
      data: { userId: t.userId, amount: -t.amount, source: "REVERSAL", idempotencyKey: `reversal:${t.id}`, reason, reversalOfId: t.id, createdById: actor.id },
    });
    await audit({ actorId: actor.id, action: "xp.reverse", targetType: "XpTransaction", targetId: t.id, meta: { amount: t.amount, reason, reversal: r.id }, ip }, tx);
    return r;
  });
}

// Şüpheli etkinlik: kısa sürede çok fazla tamamlanan ders ya da günlük olağandışı XP.
export async function suspiciousActivity() {
  const since = new Date(Date.now() - 7 * 86_400_000);
  const txs = await db.xpTransaction.findMany({
    where: { createdAt: { gte: since }, source: { in: ["LESSON", "QUIZ", "TRACK"] } },
    select: { userId: true, amount: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const byUser = new Map<string, { at: number; amount: number }[]>();
  for (const t of txs) byUser.set(t.userId, [...(byUser.get(t.userId) ?? []), { at: t.createdAt.getTime(), amount: t.amount }]);
  const flagged: { userId: string; reason: string }[] = [];
  for (const [userId, list] of byUser) {
    // 10 dakikalık pencerede 8'den fazla ödül
    let burst = 0;
    for (let i = 0, j = 0; i < list.length; i++) {
      while (list[i]!.at - list[j]!.at > 10 * 60_000) j++;
      burst = Math.max(burst, i - j + 1);
    }
    // herhangi bir 24 saatte 1500 XP üstü
    let day = 0;
    for (let i = 0, j = 0, sum = 0; i < list.length; i++) {
      sum += list[i]!.amount;
      while (list[i]!.at - list[j]!.at > 86_400_000) sum -= list[j++]!.amount;
      day = Math.max(day, sum);
    }
    if (burst > 8) flagged.push({ userId, reason: `10 dakikada ${burst} ödül` });
    else if (day > 1500) flagged.push({ userId, reason: `24 saatte ${day} XP` });
  }
  const users = await db.user.findMany({ where: { id: { in: flagged.map((f) => f.userId) } }, select: { id: true, username: true, displayName: true } });
  const byId = new Map(users.map((u) => [u.id, u]));
  return flagged.filter((f) => byId.has(f.userId)).map((f) => ({ ...f, user: byId.get(f.userId)! }));
}

// ── Rozetler ────────────────────────────────────────────────────────────────
export const badgeSchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(200).default(""),
  icon: z.enum(BADGE_ICONS),
  rule: badgeRuleSchema,
});

export async function createBadge(actor: Actor, input: z.output<typeof badgeSchema>, ip: string) {
  requireAdmin(actor);
  const key = `custom-${crypto.randomBytes(5).toString("hex")}`;
  return db.$transaction(async (tx) => {
    const b = await tx.badge.create({ data: { key, name: input.name, description: input.description, icon: input.icon, rule: input.rule } });
    await audit({ actorId: actor.id, action: "badge.create", targetType: "Badge", targetId: b.id, meta: { name: b.name, rule: input.rule }, ip }, tx);
    return b;
  });
}

export async function setBadgeActive(actor: Actor, id: string, active: boolean, ip: string) {
  requireAdmin(actor);
  const b = await db.badge.findUnique({ where: { id } });
  if (!b) throw notFound("Rozet bulunamadı.");
  await db.$transaction(async (tx) => {
    await tx.badge.update({ where: { id }, data: { active } });
    await audit({ actorId: actor.id, action: active ? "badge.enable" : "badge.disable", targetType: "Badge", targetId: id, meta: { name: b.name }, ip }, tx);
  });
}

export async function awardBadge(actor: Actor, id: string, username: string, reason: string, ip: string) {
  requireAdmin(actor);
  const [b, u] = await Promise.all([db.badge.findUnique({ where: { id } }), db.user.findUnique({ where: { username: username.toLowerCase() }, select: { id: true, status: true } })]);
  if (!b) throw notFound("Rozet bulunamadı.");
  if (!u || u.status !== "ACTIVE") throw notFound("Aktif kullanıcı bulunamadı.");
  await db.$transaction(async (tx) => {
    const r = await tx.userBadge.createMany({ data: [{ userId: u.id, badgeId: id, reason, awardedById: actor.id }], skipDuplicates: true });
    if (!r.count) throw conflict("Bu kullanıcıda bu rozet zaten var.", "ALREADY_AWARDED");
    await audit({ actorId: actor.id, action: "badge.award", targetType: "User", targetId: u.id, meta: { badge: b.name, reason }, ip }, tx);
  });
}

export async function revokeBadge(actor: Actor, id: string, username: string, reason: string, ip: string) {
  requireAdmin(actor);
  const u = await db.user.findUnique({ where: { username: username.toLowerCase() }, select: { id: true } });
  if (!u) throw notFound("Kullanıcı bulunamadı.");
  await db.$transaction(async (tx) => {
    const r = await tx.userBadge.deleteMany({ where: { userId: u.id, badgeId: id } });
    if (!r.count) throw notFound("Bu kullanıcıda bu rozet yok.");
    await audit({ actorId: actor.id, action: "badge.revoke", targetType: "User", targetId: u.id, meta: { badgeId: id, reason }, ip }, tx);
  });
}
