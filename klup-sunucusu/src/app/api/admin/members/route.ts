import { json, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { listMembers } from "@/server/members";
import { memberListQuerySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  await adminContext(req);
  const params = Object.fromEntries(new URL(req.url).searchParams);
  return json(await listMembers(memberListQuerySchema.parse(params)));
});
