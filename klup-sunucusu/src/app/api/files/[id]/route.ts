import { z } from "zod";
import { json, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { deleteFile, openFile } from "@/server/files/service";

export const dynamic = "force-dynamic";

const idParam = z.string().min(1).max(40);

type Ctx = { params: Promise<{ id: string }> };

// İndirme ek (attachment) olarak, içerik türü tahmini kapalı ve sandbox CSP ile:
// yüklenen dosya uygulama kökeninde asla belge olarak çalışmaz. Yalnız içerikten doğrulanmış raster
// görseller (PNG/JPEG/WebP/GIF — SVG kabul edilmez) ?inline=1 ile <img> içinde gösterilebilir.
export const GET = route<Ctx>(async (req, { params }) => {
  const { actor } = await memberContext(req);
  const { file, data } = await openFile(actor, idParam.parse((await params).id));
  const ascii = file.name.replace(/[^\x20-\x7e]/g, "_").replace(/["\\]/g, "_");
  const inline = file.kind === "image" && new URL(req.url).searchParams.get("inline") === "1";
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(data.length),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Cache-Control": inline ? "private, max-age=3600" : "private, no-store",
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
