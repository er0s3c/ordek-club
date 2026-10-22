import path from "node:path";
import type { NextConfig } from "next";

// Güvenlik başlıklarının dinamik kısmı (nonce'lu CSP) src/middleware.ts'de üretilir.
// Burada her yanıta eklenen statik başlıklar durur.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Kök dizindeki Ördek Lab'in lockfile'ı yüzünden Next.js çalışma alanı kökünü yanlış çıkarmasın.
  outputFileTracingRoot: path.resolve(__dirname),
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  // Görsel optimizasyonu dış kaynaklara kapalı (SSRF yüzeyi yok).
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true }, // lint ayrı adım: npm run lint
  experimental: {
    serverActions: { bodySizeLimit: "1mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
