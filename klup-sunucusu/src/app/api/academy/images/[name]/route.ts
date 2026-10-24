import fs from "node:fs/promises";
import path from "node:path";
import { route } from "@/server/http";
import { requireSession } from "@/server/auth/guard";
import { notFound } from "@/server/errors";
import { env } from "@/server/env";
import { imageParam } from "@/server/academy/params";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" };

type Ctx = { params: Promise<{ name: string }> };

// Ders görselleri yalnızca giriş yapmış üyelere; ad katı bir kalıpla doğrulanır, dosya gorseller/ dışından okunamaz.
export const GET = route<Ctx>(async (req, { params }) => {
  await requireSession(req);
  const r = imageParam.safeParse((await params).name);
  if (!r.success) throw notFound("Görsel bulunamadı.");
  const file = path.join(env().academyDir, "gorseller", r.data);
  const data = await fs.readFile(file).catch(() => null);
  if (!data) throw notFound("Görsel bulunamadı.");
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": MIME[r.data.split(".").pop()!]!,
      "Content-Length": String(data.length),
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
});
