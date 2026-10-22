import { z } from "zod";
import { json, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { listAudit } from "@/server/audit-query";

export const dynamic = "force-dynamic";

const query = z.object({
  action: z.string().trim().max(60).regex(/^[a-z0-9._]*$/).optional(),
  actor: z.string().trim().max(32).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
});

export const GET = route(async (req) => {
  await adminContext(req);
  return json(await listAudit(query.parse(Object.fromEntries(new URL(req.url).searchParams))));
});
