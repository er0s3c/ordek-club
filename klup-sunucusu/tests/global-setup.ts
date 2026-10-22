import { execSync } from "node:child_process";
import { TEST_DATABASE_URL } from "./test-db";

// Test veritabanına tüm migration'ları uygular (yoksa veritabanını oluşturur). Yıkıcı değildir;
// testler arası temizlik tests/helpers.ts → resetDb() ile yalnızca _test veritabanında yapılır.
export default function setup() {
  const url = TEST_DATABASE_URL;
  if (!url || !url.includes("_test")) throw new Error("Testler yalnızca adı _test içeren bir veritabanında çalışır.");
  execSync("npx prisma migrate deploy", {
    stdio: "pipe",
    env: { ...process.env, DATABASE_URL: url },
  });
}
