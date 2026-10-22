import { json, route } from "@/server/http";
import { checkDatabase, APP_VERSION } from "@/server/health";
import { isSetupComplete } from "@/server/settings";

export const dynamic = "force-dynamic";

// Genel sağlık kontrolü (Docker healthcheck + izleme). Ayrıntılı bilgi yalnızca admin sistem sayfasında.
export const GET = route(async () => {
  const database = await checkDatabase();
  const setupComplete = database.ok ? await isSetupComplete().catch(() => false) : false;
  return json(
    { status: database.ok ? "ok" : "degraded", database: database.ok ? "ok" : "unreachable", setupComplete, version: APP_VERSION },
    { status: database.ok ? 200 : 503 },
  );
});
