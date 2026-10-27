import { defineConfig } from "@playwright/test";

// Gerçek sayfalarda içerik yerleşimi (çizgi roman balonları, ders diyagramları). Kendi sunucusunu
// başlatmaz: çalışan bir sunucuya ve test hesabına ihtiyaç duyar (ortam değişkenleri yoksa test atlanır).
//   CLUB_E2E_BASE=http://127.0.0.1:3100 CLUB_E2E_USER=... CLUB_E2E_PASS=...
export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "content-geometry.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 15 * 60_000,
  outputDir: "test-results/content-geometry",
  reporter: [["list"]],
  use: {
    channel: process.env.CLUB_TEST_BROWSER || undefined,
    baseURL: process.env.CLUB_E2E_BASE,
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
