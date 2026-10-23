import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { setGroupMembers } from "@/server/classroom/groups";

export const dynamic = "force-dynamic";

const idParam = z.string().min(1).max(40);

type Ctx = { params: Promise<{ id: string }> };

const body = z.object({ usernames: z.array(z.string().trim().toLowerCase().min(1).max(40)).max(2000) });

export const PUT = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await memberContext(req, { write: true });
  const { usernames } = await readJson(req, body, 256 * 1024);
  return json({ count: await setGroupMembers(actor, idParam.parse((await params).id), usernames, ip) });
});
