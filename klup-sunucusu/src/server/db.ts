import { PrismaClient } from "@prisma/client";

// Özel sunucu (server.ts, esbuild paketi) ile Next.js paketleri aynı süreçte ayrı modül
// örnekleri yükler; tek bağlantı havuzu için istemci globalThis üzerinde paylaşılır.
const g = globalThis as unknown as { __clubPrisma?: PrismaClient };

export const db: PrismaClient =
  g.__clubPrisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });

g.__clubPrisma = db;
