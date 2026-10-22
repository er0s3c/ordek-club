import { json, route } from "@/server/http";
import { adminContext } from "@/server/api-auth";
import { MAX_LOGO_BYTES, removeLogo, saveLogo } from "@/server/branding";
import { HttpError, badRequest } from "@/server/errors";

export const dynamic = "force-dynamic";

export const POST = route(async (req) => {
  const { actor, ip } = await adminContext(req, { write: true });
  // Gövdeyi okumadan önce boyutu sınırla (multipart ek yükü için küçük pay).
  const len = Number(req.headers.get("content-length") ?? NaN);
  if (!Number.isFinite(len)) throw new HttpError(411, "LENGTH_REQUIRED", "Content-Length gerekli.");
  if (len > MAX_LOGO_BYTES + 16 * 1024) throw badRequest("Logo en fazla 1 MB olabilir.", "FILE_TOO_LARGE");
  if (!(req.headers.get("content-type") ?? "").startsWith("multipart/form-data")) throw badRequest("multipart/form-data bekleniyor.", "BAD_CONTENT_TYPE");

  const form = await req.formData();
  const file = form.get("logo");
  if (!(file instanceof File)) throw badRequest("'logo' alanında dosya bekleniyor.", "NO_FILE");
  await saveLogo(file, actor.id, ip);
  return json({ ok: true }, { status: 201 });
});

export const DELETE = route(async (req) => {
  const { actor, ip } = await adminContext(req, { write: true });
  await removeLogo(actor.id, ip);
  return json({ ok: true });
});
