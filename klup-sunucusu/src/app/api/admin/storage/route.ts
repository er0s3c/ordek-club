import { json, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { storageUsage } from "@/server/files/service";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  await adminContext(req);
  return json(await storageUsage());
});
