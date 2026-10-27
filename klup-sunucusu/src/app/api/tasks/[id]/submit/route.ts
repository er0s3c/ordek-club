import { z } from "zod";
import { json, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { HttpError, badRequest } from "@/server/errors";
import { MAX_SUBMISSION_FILES, submitAssignment } from "@/server/classroom/assignments";
import { maxUploadBytes } from "@/server/files/service";

export const dynamic = "force-dynamic";

const idParam = z.string().min(1).max(40);

type Ctx = { params: Promise<{ id: string }> };

// Teslim: metin + en fazla MAX_SUBMISSION_FILES dosya (multipart). Gövde boyutu okumadan önce sınırlanır.
export const POST = route<Ctx>(async (req, { params }) => {
  const { actor, ip } = await memberContext(req, { write: true });
  const len = Number(req.headers.get("content-length") ?? NaN);
  if (!Number.isFinite(len)) throw new HttpError(411, "LENGTH_REQUIRED", "Content-Length gerekli.");
  if (len > (await maxUploadBytes()) * MAX_SUBMISSION_FILES + 128 * 1024) throw badRequest("Teslim çok büyük.", "FILE_TOO_LARGE");
  if (!(req.headers.get("content-type") ?? "").startsWith("multipart/form-data")) throw badRequest("multipart/form-data bekleniyor.", "BAD_CONTENT_TYPE");
  const form = await req.formData();
  const text = form.get("text");
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  // Otomatik puanlanan görevde cevaplar JSON metni olarak gelir.
  const raw = form.get("answers");
  let answers: unknown;
  if (typeof raw === "string" && raw) {
    try {
      answers = JSON.parse(raw);
    } catch {
      throw badRequest("Cevaplar geçersiz.", "BAD_ANSWERS");
    }
  }
  const checklist = form.getAll("checklist").map((v) => Number(v)).filter((n) => Number.isInteger(n));
  const s = await submitAssignment(actor, idParam.parse((await params).id), { text: typeof text === "string" ? text : "", files, answers, checklist }, ip);
  return json({ id: s.id, status: s.status, late: s.late, score: s.score, feedback: s.feedback, xp: s.xp }, { status: 201 });
});
