import { z } from "zod";
import { json, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { restoreVersion } from "@/server/presentations";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string; versionId: string }> };

export const POST = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req, { write: true });
  const p = await params;
  return json({ deck: await restoreVersion(actor, z.string().min(1).max(64).parse(p.id), z.string().min(1).max(64).parse(p.versionId)) });
});
