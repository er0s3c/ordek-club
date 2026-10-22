import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { z } from "zod";
import { db } from "@/server/db";
import { env } from "@/server/env";
import { audit } from "@/server/audit";
import { hashPassword, passwordProblem } from "@/server/auth/password";
import { invalidateSettings } from "@/server/settings";
import { newSetupToken, normalizeSetupToken, sha256 } from "@/server/codes";
import { badRequest, conflict, forbidden } from "@/server/errors";
import type { setupSchema } from "@/lib/validation";

const TOKEN_TTL_MS = 24 * 3_600_000;
export const setupTokenFile = () => path.join(env().storageDir, "setup-token.txt");

// Güvenli bootstrap: kurulum tamamlanmamışsa yeni tek seferlik anahtar üretir, hash'ini saklar,
// düz halini yalnızca sunucu loguna ve sahibinin okuyabileceği bir dosyaya yazar.
// Sunucuya erişimi olmayan biri, kurulumu "ilk gelen kazanır" yarışıyla ele geçiremez.
export async function rotateSetupToken(): Promise<string | null> {
  const s = await db.clubSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  if (s.setupCompletedAt) return null;
  const token = newSetupToken();
  await db.clubSettings.update({
    where: { id: 1 },
    data: { setupTokenHash: sha256(normalizeSetupToken(token)), setupTokenExpires: new Date(Date.now() + TOKEN_TTL_MS) },
  });
  invalidateSettings();
  try {
    await fs.mkdir(env().storageDir, { recursive: true });
    await fs.writeFile(setupTokenFile(), token + "\n", { mode: 0o600 });
  } catch (err) {
    console.warn("[club] kurulum anahtarı dosyaya yazılamadı (yalnız logda):", (err as Error).message);
  }
  return token;
}

type SetupInput = z.output<typeof setupSchema>;

export async function completeSetup(input: SetupInput, ip: string) {
  const problem = passwordProblem(input.owner.password, input.owner);
  if (problem) throw badRequest(problem, "WEAK_PASSWORD", { fields: { "owner.password": problem } });
  const passwordHash = await hashPassword(input.owner.password);
  const tokenHash = Buffer.from(sha256(normalizeSetupToken(input.token)), "hex");

  const owner = await db.$transaction(async (tx) => {
    // Satır kilidi: eşzamanlı iki kurulum isteğinden yalnızca biri ilerler.
    await tx.$queryRaw`SELECT id FROM "ClubSettings" WHERE id = 1 FOR UPDATE`;
    const s = await tx.clubSettings.findUniqueOrThrow({ where: { id: 1 } });
    if (s.setupCompletedAt) throw conflict("Kurulum zaten tamamlanmış.", "SETUP_DONE");
    const stored = s.setupTokenHash ? Buffer.from(s.setupTokenHash, "hex") : null;
    const valid =
      stored !== null &&
      stored.length === tokenHash.length &&
      crypto.timingSafeEqual(stored, tokenHash) &&
      (s.setupTokenExpires?.getTime() ?? 0) > Date.now();
    if (!valid) throw forbidden("Kurulum anahtarı geçersiz veya süresi dolmuş.");
    if ((await tx.user.count()) > 0) throw conflict("Sistemde zaten kullanıcı var.", "SETUP_DONE");

    const now = new Date();
    const user = await tx.user.create({
      data: {
        username: input.owner.username,
        email: input.owner.email,
        displayName: input.owner.displayName,
        passwordHash,
        role: "OWNER",
        status: "ACTIVE",
        joinedAt: now,
        lastLoginAt: now, // kurulum yanıtı kurucuya oturum açar
      },
    });
    await tx.clubSettings.update({
      where: { id: 1 },
      data: {
        clubName: input.club.clubName,
        description: input.club.description,
        universityName: input.club.universityName,
        appUrl: input.club.appUrl,
        timezone: input.club.timezone,
        registrationPolicy: input.club.registrationPolicy,
        setupCompletedAt: now,
        setupTokenHash: null,
        setupTokenExpires: null,
      },
    });
    await audit({ actorId: user.id, action: "setup.complete", targetType: "ClubSettings", targetId: "1", ip }, tx);
    return user;
  });

  invalidateSettings();
  await fs.rm(setupTokenFile(), { force: true }).catch(() => {});
  return owner;
}
