// Özel sunucu ve CLI için .env yükleyici; diğer importlardan ÖNCE import edilmelidir.
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
