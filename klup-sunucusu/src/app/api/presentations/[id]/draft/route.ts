import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { discardDraft, getStudio, publishDraft, saveDraft } from "@/server/presentations";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };
const id = (p: { id: string }) => z.string().min(1).max(64).parse(p.id);

export const GET = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req);
  return json(await getStudio(actor, id(await params)));
});

// Otomatik kayıt (Studio): taslağı yazar, sürüm oluşturmaz. Doğrulama sorunları engellemez, yanıtta döner.
export const PUT = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req, { write: true });
  const { content } = await readJson(req, z.object({ content: z.unknown() }), 600 * 1024);
  return json(await saveDraft(actor, id(await params), content));
});

// Yayınla: taslak doğrulanır ve yeni sürüm olur.
export const POST = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await memberContext(req, { write: true });
  return json(await publishDraft(actor, id(await params), ip), { status: 201 });
});

export const DELETE = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req, { write: true });
  await discardDraft(actor, id(await params));
  return json({ ok: true });
});
