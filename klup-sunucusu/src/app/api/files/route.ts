import { z } from "zod";
import { json, route } from "@/server/http";
import { memberContext } from "@/server/api-auth";
import { HttpError, badRequest } from "@/server/errors";
import { listLibrary, maxUploadBytes, uploadLibraryFile, type UploadTarget } from "@/server/files/service";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

export const GET = route(async (req) => {
  const { actor } = await memberContext(req);
  return json({ items: await listLibrary(actor) });
});

const fields = z.object({
  scope: z.enum(["CLUB", "USERS", "ASSIGNMENT"]),
  usernames: z.string().max(4000).default(""),
  assignmentId: z.string().max(40).default(""),
  description: z.string().max(300).default(""),
});

// Personel yüklemesi: kulüp kütüphanesi, seçili üyeler ya da bir görevin ekleri.
export const POST = route(async (req) => {
  const { actor, ip } = await memberContext(req, { write: true });
  const len = Number(req.headers.get("content-length") ?? NaN);
  if (!Number.isFinite(len)) throw new HttpError(411, "LENGTH_REQUIRED", "Content-Length gerekli.");
  if (len > (await maxUploadBytes()) + 64 * 1024) throw badRequest("Dosya çok büyük.", "FILE_TOO_LARGE");
  if (!(req.headers.get("content-type") ?? "").startsWith("multipart/form-data")) throw badRequest("multipart/form-data bekleniyor.", "BAD_CONTENT_TYPE");
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw badRequest("'file' alanında dosya bekleniyor.", "NO_FILE");
  const f = fields.parse({
    scope: form.get("scope") ?? undefined,
    usernames: form.get("usernames") ?? undefined,
    assignmentId: form.get("assignmentId") ?? undefined,
    description: form.get("description") ?? undefined,
  });
  let target: Exclude<UploadTarget, { scope: "SUBMISSION" }>;
  if (f.scope === "USERS") {
    const names = [...new Set(f.usernames.split(/[\s,]+/).map((s) => s.trim().toLowerCase()).filter(Boolean))].slice(0, 500);
    const users = await db.user.findMany({ where: { username: { in: names }, status: "ACTIVE" }, select: { id: true, username: true } });
    const missing = names.filter((n) => !users.some((u) => u.username === n));
    if (!names.length || missing.length) throw badRequest(missing.length ? `Üye bulunamadı: ${missing.slice(0, 5).join(", ")}` : "En az bir üye yaz.", "BAD_USERS");
    target = { scope: "USERS", userIds: users.map((u) => u.id) };
  } else if (f.scope === "ASSIGNMENT") {
    if (!f.assignmentId) throw badRequest("Görev seç.", "NO_ASSIGNMENT");
    target = { scope: "ASSIGNMENT", assignmentId: f.assignmentId };
  } else target = { scope: "CLUB" };
  const row = await uploadLibraryFile(actor, file, target, f.description, ip);
  return json({ id: row.id, name: row.name, size: row.size }, { status: 201 });
});
