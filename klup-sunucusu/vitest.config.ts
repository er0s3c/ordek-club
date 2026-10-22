import path from "node:path";
import os from "node:os";
import { defineConfig } from "vitest/config";
import { TEST_DATABASE_URL as testDb } from "./tests/test-db";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/global-setup.ts"],
    fileParallelism: false, // entegrasyon testleri aynı DB'yi paylaşır
    testTimeout: 20_000,
    env: {
      NODE_ENV: "test",
      DATABASE_URL: testDb,
      APP_URL: "http://club.test",
      APP_SECRET: "test-secret-0123456789abcdef0123456789abcdef",
      STORAGE_DIR: path.join(os.tmpdir(), "ordek-club-test-storage"),
      TRUST_PROXY: "0",
    },
  },
});
