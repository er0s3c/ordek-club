import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { applyMemberAction, getMemberDetail } from "@/server/members";
import { memberActionSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
const idSchema = z.string().min(1).max(64);

export const GET = route<Ctx>(async (req, { params }) => {
  await adminContext(req);
  const id = idSchema.parse((await params).id);
  return json(await getMemberDetail(id));
});

export const PATCH = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await adminContext(req, { write: true });
  const id = idSchema.parse((await params).id);
  const input = await readJson(req, memberActionSchema);
  await applyMemberAction(actor, id, input, ip);
  return json({ ok: true });
});
