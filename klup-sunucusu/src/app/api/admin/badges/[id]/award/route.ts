import { z } from "zod";
import { json, readJson, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { awardBadge, revokeBadge } from "@/server/xp/admin";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const body = z.object({
  username: z.string().trim().toLowerCase().min(1).max(40),
  reason: z.string().trim().min(3, "Gerekçe en az 3 karakter olmalı.").max(200),
});

export const POST = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await adminContext(req, { write: true });
  const { username, reason } = await readJson(req, body);
  await awardBadge(actor, z.string().min(1).max(64).parse((await params).id), username, reason, ip);
  return json({ ok: true }, { status: 201 });
});

export const DELETE = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await adminContext(req, { write: true });
  const { username, reason } = await readJson(req, body);
  await revokeBadge(actor, z.string().min(1).max(64).parse((await params).id), username, reason, ip);
  return json({ ok: true });
});
