import path from "node:path";
import { defineConfig } from "vitest/config";
// Pure contracts can run on developer machines without PostgreSQL/Docker.
export default defineConfig({resolve:{alias:{"@":path.resolve(__dirname,"src")}},test:{environment:"node",include:["tests/unit/**/*.test.ts"],fileParallelism:false,env:{NODE_ENV:"test",APP_URL:"http://club.test",APP_SECRET:"test-secret-0123456789abcdef0123456789abcdef",TRUST_PROXY:"0",DATABASE_URL:"postgresql://club:change-me-local-dev-only@localhost:5433/ordek_club_test?schema=public"}}});
