import { json, route } from "@/server/http";
import { requireSession } from "@/server/auth/guard";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const { user } = await requireSession(req);
  return json({ user });
});
