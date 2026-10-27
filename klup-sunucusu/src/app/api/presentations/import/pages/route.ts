import { json, route } from "@/server/http";
import { requireSession, STAFF_ROLES } from "@/server/auth/guard";
import { HttpError, badRequest, tooMany } from "@/server/errors";
import { hit } from "@/server/rate-limit";
import { maxUploadBytes } from "@/server/files/service";
import { storeImportPage } from "@/server/slides/service";
import { IMPORT_LIMITS } from "@/lib/slide-import";
import type { Actor } from "@/server/auth/policy";

export const dynamic = "force-dynamic";

// İçe aktarılan sayfanın görseli (MEDIA). Genel dosya uç noktasının dakikalık sınırı 150 sayfalık bir
// içe aktarmaya yetmediği için ayrı, sayfa sayısına göre ayarlı bir sınır kullanılır.
export const POST = route(async (req) => {
  const session = await requireSession(req, STAFF_ROLES);
  const actor: Actor = { id: session.user.id, role: session.user.role, status: session.user.status };
  const r = hit(`slides:page:${actor.id}`, IMPORT_LIMITS.pages * 3, 10 * 60_000);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const len = Number(req.headers.get("content-length") ?? NaN);
  if (!Number.isFinite(len)) throw new HttpError(411, "LENGTH_REQUIRED", "Content-Length gerekli.");
  if (len > (await maxUploadBytes()) + 64 * 1024) throw badRequest("Sayfa görseli çok büyük.", "FILE_TOO_LARGE");
  if (!(req.headers.get("content-type") ?? "").startsWith("multipart/form-data")) throw badRequest("multipart/form-data bekleniyor.", "BAD_CONTENT_TYPE");
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) throw badRequest("'file' alanında görsel bekleniyor.", "NO_FILE");
  const f = await storeImportPage(actor, file); // denetim kaydı içe aktarma sonunda tek seferde yazılır
  return json(f, { status: 201 });
});
