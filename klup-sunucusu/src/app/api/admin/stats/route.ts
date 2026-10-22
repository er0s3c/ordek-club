import { json, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { adminDashboardStats } from "@/server/members";
import { getSettings } from "@/server/settings";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  await adminContext(req);
  return json(await adminDashboardStats((await getSettings()).timezone));
});
