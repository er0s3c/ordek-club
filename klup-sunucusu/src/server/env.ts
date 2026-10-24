import path from "node:path";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL tanımlı değil"),
  APP_URL: z.string().url().default("http://localhost:3100"),
  APP_SECRET: z.string().min(32, "APP_SECRET en az 32 karakter olmalı"),
  STORAGE_DIR: z.string().default("./storage"),
  TRUST_PROXY: z.enum(["0", "1"]).default("0"),
  // Akademi içeriğinin (Markdown) kaynağı; imajda /app/content/academy
  ACADEMY_DIR: z.string().default("./content/academy"),
  // İsteğe bağlı virüs taraması (clamd). Tanımlıysa her yükleme taranır; tarayıcıya ulaşılamazsa yükleme reddedilir.
  CLAMAV_HOST: z.string().default(""),
  CLAMAV_PORT: z.coerce.number().int().min(1).max(65535).default(3310),
  // İsteğe bağlı SMTP. SMTP_HOST boşsa e-posta gönderilmez (geliştirmede storage/mail/ altına yazılır).
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_SECURE: z.enum(["0", "1"]).default("0"), // 1 → doğrudan TLS (465); 0 → STARTTLS zorunlu
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  SMTP_FROM: z.string().default(""),
});

export type Env = z.infer<typeof schema> & { storageDir: string; academyDir: string; secureCookies: boolean; trustProxy: boolean };

let cached: Env | null = null;

// Ortam değişkenlerini ilk erişimde doğrular; eksik/zayıf değerde anlaşılır hata verir.
export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Ördek Club yapılandırma hatası (.env):\n${issues}`);
  }
  const e = parsed.data;
  if (e.NODE_ENV === "production" && /insecure|change-me/i.test(e.APP_SECRET)) {
    throw new Error("Üretimde varsayılan APP_SECRET kullanılamaz. ./install.sh ile .env üretin.");
  }
  cached = {
    ...e,
    storageDir: path.resolve(e.STORAGE_DIR),
    academyDir: path.resolve(e.ACADEMY_DIR),
    secureCookies: e.APP_URL.startsWith("https://"),
    trustProxy: e.TRUST_PROXY === "1",
  };
  return cached;
}
