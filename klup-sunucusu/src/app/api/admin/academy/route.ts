import { json, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { academyStats } from "@/server/academy/service";
import { importAcademy } from "@/server/academy/importer";
import { HttpError } from "@/server/errors";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const { actor } = await adminContext(req);
  return json(await academyStats(actor));
});

// İçeriği content/academy'den yeniden içe aktarır (hatalı içerik hiç uygulanmaz).
export const POST = route(async (req) => {
  const { actor, ip } = await adminContext(req, { write: true });
  const summary = await importAcademy({ actorId: actor.id, ip });
  if (!summary.applied) {
    // Sorunlar `fields` içinde döner (istemci bunları liste olarak gösterir).
    const fields = Object.fromEntries(summary.problems.slice(0, 25).map((p, i) => [String(i + 1), p]));
    throw new HttpError(422, "ACADEMY_INVALID", `İçerikte ${summary.problems.length} sorun var; hiçbir değişiklik uygulanmadı.`, { fields });
  }
  return json(summary);
});
