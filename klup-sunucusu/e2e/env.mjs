// E2E ortamı: ayrı veritabanı (adı _e2e ile biter), ayrı depolama ve ayrı port. Geliştirme verisine dokunmaz.
import os from "node:os";
import path from "node:path";

const base = process.env.E2E_DATABASE_URL ?? "postgresql://club:change-me-local-dev-only@localhost:5433/ordek_club_e2e?schema=public";
if (!new URL(base).pathname.endsWith("_e2e")) throw new Error("E2E veritabanı adı _e2e ile bitmeli.");

export const E2E_PORT = Number(process.env.E2E_PORT ?? 3199);
export const E2E_URL = `http://localhost:${E2E_PORT}`;
export const E2E_STORAGE = path.join(os.tmpdir(), "ordek-club-e2e");
export const E2E_ENV = {
  NODE_ENV: "production",
  DATABASE_URL: base,
  APP_URL: E2E_URL,
  APP_SECRET: "e2e-only-secret-7b1f0d9c4a2e8f6b3d5c1a9e7f0b2d4c6a8e0f1b3d5c7a9e",
  STORAGE_DIR: E2E_STORAGE,
  TRUST_PROXY: "0",
  PORT: String(E2E_PORT),
  HOST: "127.0.0.1",
};
