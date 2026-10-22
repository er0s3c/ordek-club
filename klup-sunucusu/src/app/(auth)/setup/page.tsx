import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SetupWizard } from "./SetupWizard";
import { isSetupComplete } from "@/server/settings";
import { env } from "@/server/env";

export const metadata: Metadata = { title: "İlk kurulum" };

export default async function SetupPage() {
  if (await isSetupComplete()) redirect("/login");
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? (env().secureCookies ? "https" : "http");
  return (
    <div className="auth-wrap">
      <div className="auth-card wide fade-up">
        <div className="auth-head">
          <span className="brand-logo" aria-hidden>Ö</span>
          <div>
            <div className="eyebrow">Ördek Club · ilk kurulum</div>
            <h1 className="page-title">Kulübünü kur</h1>
            <p className="page-sub">Birkaç dakikada kulüp bilgilerini gir ve kurucu (owner) hesabını oluştur.</p>
          </div>
        </div>
        <SetupWizard configuredUrl={env().APP_URL} requestIsHttps={proto === "https"} />
      </div>
    </div>
  );
}
