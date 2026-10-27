import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import "@/styles/presentation.css";
import "@/styles/academy.css";
import "@/styles/gamification.css";
import "@/styles/classroom.css";
import "@/styles/terminal.css";
import "@/styles/lab.css";
import "@/styles/mission.css";
import "@/styles/learning.css";
import "@/styles/ui.css";
import "@/styles/motion.css";
import "@xterm/xterm/css/xterm.css";
import { Providers } from "@/components/providers";
import { getMessages } from "@/i18n";
import { getLocaleInfo, getT } from "@/i18n/server";
import { getSettings } from "@/server/settings";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings().catch(() => null);
  const t = await getT();
  const name = s?.clubName ?? "Ördek Club";
  return { title: { default: name, template: `%s · ${name}` }, description: s?.description || t("Siber güvenlik kulübü eğitim platformu") };
}

export const viewport: Viewport = { themeColor: "#5c1fe2", colorScheme: "light" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings().catch(() => null);
  const { locale, pref } = await getLocaleInfo();
  return (
    <html lang={locale}>
      <body>
        <Providers messages={getMessages(locale)} locale={locale} pref={pref}>{s ? children : <DatabaseDown />}</Providers>
      </body>
    </html>
  );
}

async function DatabaseDown() {
  const t = await getT();
  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="card-b stack">
          <span className="eyebrow">{t("Sistem")}</span>
          <h1 className="page-title">{t("Veritabanına ulaşılamıyor")}</h1>
          <p className="muted">
            {t("Ördek Club PostgreSQL'e bağlanamadı. Sunucuda şu komutlarla durumu kontrol edin:")} <code>./scripts/club.sh status</code>,{" "}
            <code>./scripts/club.sh logs</code>
          </p>
        </div>
      </div>
    </div>
  );
}
