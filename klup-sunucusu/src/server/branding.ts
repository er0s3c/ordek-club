import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { db } from "@/server/db";
import { env } from "@/server/env";
import { audit } from "@/server/audit";
import { badRequest } from "@/server/errors";
import { getSettings, invalidateSettings } from "@/server/settings";
import { sniffImage } from "@/server/files/image";

export const MAX_LOGO_BYTES = 1024 * 1024; // 1 MiB
const brandingDir = () => path.join(env().storageDir, "branding");
const SAFE_NAME = /^logo-[a-f0-9]{16}\.(png|jpg|webp)$/;

export async function saveLogo(file: File, actorId: string, ip: string) {
  if (file.size === 0) throw badRequest("Dosya boş.", "EMPTY_FILE");
  if (file.size > MAX_LOGO_BYTES) throw badRequest("Logo en fazla 1 MB olabilir.", "FILE_TOO_LARGE");
  const buf = new Uint8Array(await file.arrayBuffer());
  const kind = sniffImage(buf);
  if (!kind) throw badRequest("Yalnızca PNG, JPEG veya WebP logo yüklenebilir.", "UNSUPPORTED_TYPE");

  // Dosya adı sunucuda üretilir; kullanıcının verdiği ad hiçbir yolda kullanılmaz.
  const name = `logo-${crypto.randomBytes(8).toString("hex")}.${kind.ext}`;
  await fs.mkdir(brandingDir(), { recursive: true });
  await fs.writeFile(path.join(brandingDir(), name), buf, { mode: 0o640 });

  const prev = (await getSettings()).logoFile;
  await db.clubSettings.update({ where: { id: 1 }, data: { logoFile: name, logoMime: kind.mime, logoUpdatedAt: new Date() } });
  invalidateSettings();
  if (prev && SAFE_NAME.test(prev)) await fs.rm(path.join(brandingDir(), prev), { force: true });
  await audit({ actorId, action: "settings.logo.update", targetType: "ClubSettings", targetId: "1", meta: { mime: kind.mime, bytes: file.size }, ip });
}

export async function removeLogo(actorId: string, ip: string) {
  const prev = (await getSettings()).logoFile;
  await db.clubSettings.update({ where: { id: 1 }, data: { logoFile: null, logoMime: null, logoUpdatedAt: new Date() } });
  invalidateSettings();
  if (prev && SAFE_NAME.test(prev)) await fs.rm(path.join(brandingDir(), prev), { force: true });
  await audit({ actorId, action: "settings.logo.remove", targetType: "ClubSettings", targetId: "1", ip });
}

export async function readLogo(): Promise<{ data: Buffer; mime: string } | null> {
  const s = await getSettings();
  if (!s.logoFile || !s.logoMime || !SAFE_NAME.test(s.logoFile)) return null;
  try {
    return { data: await fs.readFile(path.join(brandingDir(), s.logoFile)), mime: s.logoMime };
  } catch {
    return null;
  }
}
