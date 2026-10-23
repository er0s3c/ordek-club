import { defineConfig, devices } from "@playwright/test";
// @ts-expect-error — .mjs ortam dosyası (tip bildirimi yok)
import { E2E_ENV, E2E_URL } from "./e2e/env.mjs";

// Uçtan uca test: derlenmiş üretim sunucusu (dist/server.js) ayrı veritabanı ve portta çalışır.
// Çalıştırma: npm run test:e2e   (önce derler, veritabanını hazırlar)
export default defineConfig({
  testDir: "e2e",
  timeout: 240_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL: E2E_URL, trace: "retain-on-failure", locale: "tr-TR", timezoneId: "Europe/Istanbul", ...devices["Desktop Chrome"] },
  webServer: {
    command: "node dist/server.js",
    url: `${E2E_URL}/api/health`,
    env: E2E_ENV,
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "pipe",
  },
});
