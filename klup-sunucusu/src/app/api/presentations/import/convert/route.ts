import { route, clientIp } from "@/server/http";
import { requireSession, STAFF_ROLES } from "@/server/auth/guard";
import { HttpError, badRequest, tooMany } from "@/server/errors";
import { hit } from "@/server/rate-limit";
import { converterEnabled, convertSlides } from "@/server/slides/service";
import { CONVERTER_MISSING_MESSAGE, IMPORT_LIMITS } from "@/lib/slide-import";
import type { Actor } from "@/server/auth/policy";

export const dynamic = "force-dynamic";

// PPTX/PPT → PDF. Yanıt multipart/form-data: "pdf" (application/pdf) + "notes" (konuşmacı notları, JSON dizi).
// Tarayıcı PDF'i, doğrudan yüklenen bir PDF gibi sayfa sayfa işler.
export const POST = route(async (req) => {
  const session = await requireSession(req, STAFF_ROLES);
  const actor: Actor = { id: session.user.id, role: session.user.role, status: session.user.status };
  if (!converterEnabled()) throw new HttpError(503, "CONVERTER_MISSING", CONVERTER_MISSING_MESSAGE);
  const r = hit(`slides:convert:${actor.id}`, 20, 60 * 60_000);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  const len = Number(req.headers.get("content-length") ?? NaN);
  if (!Number.isFinite(len)) throw new HttpError(411, "LENGTH_REQUIRED", "Content-Length gerekli.");
  if (len > IMPORT_LIMITS.bytes + 64 * 1024) throw badRequest(`Dosya en fazla ${IMPORT_LIMITS.bytes / 1024 / 1024} MB olabilir.`, "FILE_TOO_LARGE");
  if (!(req.headers.get("content-type") ?? "").startsWith("multipart/form-data")) throw badRequest("multipart/form-data bekleniyor.", "BAD_CONTENT_TYPE");
  const file = (await req.formData()).get("file");
  if (!(file instanceof File)) throw badRequest("'file' alanında dosya bekleniyor.", "NO_FILE");
  const { pdf, notes } = await convertSlides(actor, file, clientIp(req));
  const out = new FormData();
  out.set("pdf", new Blob([pdf], { type: "application/pdf" }), "slides.pdf");
  out.set("notes", JSON.stringify(notes));
  return new Response(out, { status: 200, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
});
