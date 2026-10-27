import { memberContext } from "@/server/api-auth";
import { route } from "@/server/http";
import { featureEnabled } from "@/server/learning/features";
import { trackBookPdf } from "@/server/academy/track-book-pdf";
import { localeFromRequest } from "@/i18n/request";

// Yol kitabı: /api/academy/track/[key]/book.pdf?lang=en — öğretmen ve öğrenci indirebilir.
export const GET = route(async (req, { params }: { params: Promise<{ key: string }> }) => {
  await memberContext(req);
  if (!(await featureEnabled("academy-v2"))) return new Response("Kapalı", { status: 404 });
  const url = new URL(req.url);
  const { key } = await params;
  if (!/^[a-z0-9-]{1,40}$/.test(key)) return new Response("Geçersiz yol kimliği.", { status: 400 });
  const lang = url.searchParams.get("lang") === "en" || (url.searchParams.get("lang") !== "tr" && (await localeFromRequest(req, { stored: true })) === "en") ? "en" : "tr";
  const { bytes, title } = await trackBookPdf({ key, lang });
  const safe = `${key}-${lang}-kitap.pdf`.replace(/[^\w.-]/g, "-");
  return new Response(bytes as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(`${title}.pdf`)}`,
      "Cache-Control": "no-store",
    },
  });
});
