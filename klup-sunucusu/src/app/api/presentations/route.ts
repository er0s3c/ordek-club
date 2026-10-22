import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { createFromTemplate, createPresentation, listPresentations, parseDeck } from "@/server/presentations";
import { TEMPLATE_LIST } from "@/templates";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  return json({ items: await listPresentations(actor), templates: TEMPLATE_LIST });
});

const createSchema = z.union([
  z.object({ template: z.string().min(1).max(60) }),
  z.object({ deck: z.unknown() }),
]);

// İçe aktarma gövdesi büyük olabilir (200 slayt): 512 KB sınırı.
export const POST = route(async (req) => {
  const { actor, ip } = await memberContext(req, { write: true });
  const input = await readJson(req, createSchema, 512 * 1024);
  const p = "template" in input ? await createFromTemplate(actor, input.template, ip) : await createPresentation(actor, parseDeck(input.deck), ip);
  return json({ id: p.id }, { status: 201 });
});
