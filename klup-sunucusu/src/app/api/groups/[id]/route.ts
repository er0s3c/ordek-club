import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { archiveGroup, getGroup, groupInputSchema, updateGroup } from "@/server/classroom/groups";

export const dynamic = "force-dynamic";

const idParam = z.string().min(1).max(40);

type Ctx = { params: Promise<{ id: string }> };

export const GET = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req);
  return json(await getGroup(actor, idParam.parse((await params).id)));
});

export const PUT = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await memberContext(req, { write: true });
  await updateGroup(actor, idParam.parse((await params).id), await readJson(req, groupInputSchema), ip);
  return json({ ok: true });
});

export const DELETE = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await memberContext(req, { write: true });
  await archiveGroup(actor, idParam.parse((await params).id), ip);
  return json({ ok: true });
});
