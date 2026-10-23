// E2E öncesi: _e2e veritabanını migration'larla hazırlar ve TÜM tabloları boşaltır (yalnız _e2e veritabanında),
// depolama klasörünü temizler. Böylece test boş kurulumdan (kurulum sihirbazı) başlar.
import { execSync } from "node:child_process";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
import { E2E_ENV, E2E_STORAGE } from "./env.mjs";

const url = E2E_ENV.DATABASE_URL;
if (!url.includes("_e2e")) throw new Error("Yalnız _e2e veritabanı temizlenebilir.");

execSync("npx prisma migrate deploy", { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } });

const db = new PrismaClient({ datasources: { db: { url } } });
const tables = await db.$queryRawUnsafe(`SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`);
if (tables.length) await db.$executeRawUnsafe(`TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(", ")} RESTART IDENTITY CASCADE`);
await db.$disconnect();

fs.rmSync(E2E_STORAGE, { recursive: true, force: true });
fs.mkdirSync(E2E_STORAGE, { recursive: true });
console.log(`[e2e] veritabanı ve depolama hazır (${tables.length} tablo boşaltıldı)`);
