import { z } from "zod";
import { clientIp, json, readJson, route } from "@/server/http";
import { requireSession, STAFF_ROLES } from "@/server/auth/guard";
import { importSlides } from "@/server/slides/service";
import { IMPORT_LIMITS } from "@/lib/slide-import";
import type { Actor } from "@/server/auth/policy";

export const dynamic = "force-dynamic";

const page = z.object({
  fileId: z.string().regex(/^c[a-z0-9]{20,30}$/, "Geçersiz görsel."),
  text: z.string().max(20_000).default(""),
  notes: z.string().max(20_000).default(""),
});

const body = z
  .object({
    title: z.string().trim().min(2, "Sunum başlığı gerekli.").max(160).optional(),
    presentationId: z.string().min(1).max(64).optional(),
    pages: z.array(page).min(1, "İçe aktarılacak sayfa yok.").max(IMPORT_LIMITS.pages, `En fazla ${IMPORT_LIMITS.pages} sayfa.`),
  })
  .refine((b) => Boolean(b.title) !== Boolean(b.presentationId), { message: "Ya yeni sunum başlığı ya da eklenecek sunum seçilmeli.", path: ["title"] });

// Tarayıcıda işlenmiş sayfalar (yüklenmiş görsel + metin + not) → yeni sunum ya da var olan sunumun taslağına ekleme.
export const POST = route(async (req) => {
  const session = await requireSession(req, STAFF_ROLES);
  const actor: Actor = { id: session.user.id, role: session.user.role, status: session.user.status };
  const input = await readJson(req, body, 6 * 1024 * 1024);
  const r = await importSlides(actor, input, clientIp(req));
  return json(r, { status: r.created ? 201 : 200 });
});
