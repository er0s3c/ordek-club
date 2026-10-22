import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import "@/styles/presentation.css";
import { Providers } from "@/components/providers";
import { getMessages } from "@/i18n";
import { getSettings } from "@/server/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings().catch(() => null);
  const name = s?.clubName ?? "Ördek Club";
  return { title: { default: name, template: `%s · ${name}` }, description: s?.description || "Siber güvenlik kulübü eğitim platformu" };
}

export const viewport: Viewport = { themeColor: "#121510", colorScheme: "dark" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings().catch(() => null);
  const locale = s?.locale ?? "tr";
  return (
    <html lang={locale}>
      <body>
        <Providers messages={getMessages(locale)}>{s ? children : <DatabaseDown />}</Providers>
      </body>
    </html>
  );
}

function DatabaseDown() {
  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="card-b stack">
          <span className="eyebrow">Sistem</span>
          <h1 className="page-title">Veritabanına ulaşılamıyor</h1>
          <p className="muted">
            Ördek Club PostgreSQL&apos;e bağlanamadı. Sunucuda <code>./scripts/club.sh status</code> ve{" "}
            <code>./scripts/club.sh logs</code> komutlarıyla durumu kontrol edin.
          </p>
        </div>
      </div>
    </div>
  );
}
