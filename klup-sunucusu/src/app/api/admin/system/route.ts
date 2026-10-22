import { json, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { systemReport } from "@/server/health";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  await adminContext(req);
  return json(await systemReport());
});
