import { readLogo } from "@/server/branding";
import { route } from "@/server/http";
import { notFound } from "@/server/errors";

export const dynamic = "force-dynamic";

// Kulüp logosu herkese açıktır (giriş sayfasında görünür). Türü sunucuda belirlenmiş MIME ile,
// nosniff ve kısıtlayıcı CSP ile servis edilir.
export const GET = route(async () => {
  const logo = await readLogo();
  if (!logo) throw notFound("Logo yok.");
  return new Response(new Uint8Array(logo.data), {
    headers: {
      "Content-Type": logo.mime,
      "Content-Length": String(logo.data.length),
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
});
