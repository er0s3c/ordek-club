import { defineConfig } from "@playwright/test";

// Isolated component contract tests, not authenticated production/member tests.
export default defineConfig({
  testDir: "./tests/browser",
  testMatch: "motion.spec.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  outputDir: "test-results/motion-playwright",
  reporter: [["list"], ["json", { outputFile: "test-results/motion-playwright-results.json" }]],
  use: { channel: process.env.CLUB_TEST_BROWSER || undefined, baseURL: "http://127.0.0.1:3189", viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference", screenshot: "only-on-failure", trace: "retain-on-failure" },
  webServer: { command: "node scripts/preview-motion.mjs", url: "http://127.0.0.1:3189", reuseExistingServer: !process.env.CI },
});
