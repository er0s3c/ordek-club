import { z } from "zod";
import { json, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { deleteFile, openFile } from "@/server/files/service";

export const dynamic = "force-dynamic";

const idParam = z.string().min(1).max(40);

type Ctx = { params: Promise<{ id: string }> };

// İndirme her zaman ek (attachment) olarak, içerik türü tahmini kapalı ve sandbox CSP ile:
// yüklenen dosya uygulama kökeninde asla belge olarak çalışmaz.
export const GET = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req);
  const { file, data } = await openFile(actor, idParam.parse((await params).id));
  const ascii = file.name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(data.length),
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
});

export const DELETE = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await memberContext(req, { write: true });
  await deleteFile(actor, idParam.parse((await params).id), ip);
  return json({ ok: true });
});
