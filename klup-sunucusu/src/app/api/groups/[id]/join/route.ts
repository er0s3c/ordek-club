import { z } from "zod";
import { json, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { joinEvent, leaveEvent } from "@/server/classroom/groups";

export const dynamic = "force-dynamic";

const idParam = z.string().min(1).max(40);

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req, { write: true });
  await joinEvent(actor, idParam.parse((await params).id));
  return json({ ok: true });
});

export const DELETE = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req, { write: true });
  await leaveEvent(actor, idParam.parse((await params).id));
  return json({ ok: true });
});
