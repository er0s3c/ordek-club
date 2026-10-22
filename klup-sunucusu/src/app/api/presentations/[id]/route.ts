import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { archivePresentation, getPresentation, updatePresentation } from "@/server/presentations";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
const id = (p: { id: string }) => z.string().min(1).max(64).parse(p.id);

export const GET = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req);
  return json(await getPresentation(actor, id(await params)));
});

const patchSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  content: z.unknown().optional(),
});

export const PATCH = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await memberContext(req, { write: true });
  const input = await readJson(req, patchSchema, 512 * 1024);
  await updatePresentation(actor, id(await params), input, ip);
  return json({ ok: true });
});

export const DELETE = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await memberContext(req, { write: true });
  await archivePresentation(actor, id(await params), ip);
  return json({ ok: true });
});
