import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { reverseTransaction } from "@/server/xp/admin";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await adminContext(req, { write: true });
  const id = z.string().min(1).max(64).parse((await params).id);
  const { reason } = await readJson(req, z.object({ reason: z.string().trim().min(5, "Gerekçe en az 5 karakter olmalı.").max(300) }));
  const r = await reverseTransaction(actor, id, reason, ip);
  return json({ id: r.id }, { status: 201 });
});
