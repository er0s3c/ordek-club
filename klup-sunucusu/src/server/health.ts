import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { db } from "@/server/db";
import { env } from "@/server/env";

export const APP_VERSION = process.env.npm_package_version ?? "0.1.0";

export async function checkDatabase(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const t = performance.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Math.round(performance.now() - t) };
  } catch (err) {
    return { ok: false, latencyMs: Math.round(performance.now() - t), error: (err as Error).message.split("\n")[0] };
  }
}

export async function checkStorage(): Promise<{ ok: boolean; error?: string }> {
  const probe = path.join(env().storageDir, `.probe-${process.pid}`);
  try {
    await fs.mkdir(env().storageDir, { recursive: true });
    await fs.writeFile(probe, "ok");
    await fs.rm(probe);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

async function dirSize(dir: string): Promise<number> {
  let total = 0;
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return 0;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) total += await dirSize(p);
    else if (e.isFile()) total += (await fs.stat(p)).size;
  }
  return total;
}

// Yalnızca admin sistem sayfası için ayrıntılı rapor (genel /api/health ayrıntı sızdırmaz).
export async function systemReport() {
  const [database, storage, storageBytes, pgVersion, migrations] = await Promise.all([
    checkDatabase(),
    checkStorage(),
    dirSize(env().storageDir),
    db.$queryRaw<{ version: string }[]>`SELECT version()`.then((r) => r[0]?.version.split(" ").slice(0, 2).join(" ") ?? "?").catch(() => "?"),
    db.$queryRaw<{ migration_name: string; finished_at: Date | null }[]>`
      SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY started_at DESC LIMIT 5`.catch(() => []),
  ]);
  const disk = await fs.statfs(env().storageDir).catch(() => null);
  return {
    version: APP_VERSION,
    node: process.version,
    uptimeSec: Math.round(process.uptime()),
    memory: { rssMb: Math.round(process.memoryUsage().rss / 1048576), systemTotalMb: Math.round(os.totalmem() / 1048576), systemFreeMb: Math.round(os.freemem() / 1048576) },
    database: { ...database, version: pgVersion },
    storage: {
      ...storage,
      usedBytes: storageBytes,
      diskFreeBytes: disk ? disk.bavail * disk.bsize : null,
      diskTotalBytes: disk ? disk.blocks * disk.bsize : null,
    },
    migrations,
    secureCookies: env().secureCookies,
    trustProxy: env().trustProxy,
  };
}
