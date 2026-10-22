import { NextResponse, type NextRequest } from "next/server";

// Middleware YALNIZCA güvenlik başlıklarını üretir. Kimlik doğrulama/yetkilendirme burada YAPILMAZ:
// her sayfa ve API kendi içinde sunucu tarafında doğrular (middleware atlatma sınıfı hatalara karşı).
function sameHostWs(req: NextRequest): string {
  const host = req.headers.get("host") ?? "";
  // Host başlığı CSP'yi bozacak karakter içeremez (yalnızca ad/port).
  if (!/^[a-zA-Z0-9.\-:[\]]{1,255}$/.test(host)) return "";
  return `ws://${host} wss://${host}`;
}

export function middleware(req: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const dev = process.env.NODE_ENV !== "production";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    // Canlı sınıf WebSocket'i yalnızca aynı host'a (bazı tarayıcılar 'self' ile ws/wss eşlemez).
    `connect-src 'self' ${sameHostWs(req)}${dev ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("x-club-path", req.nextUrl.pathname + req.nextUrl.search);
  requestHeaders.set("Content-Security-Policy", csp);

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("Content-Security-Policy", csp);
  return res;
}

export const config = {
  matcher: [
    {
      source: "/((?!api/|_next/static|_next/image|favicon.ico|brand/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
