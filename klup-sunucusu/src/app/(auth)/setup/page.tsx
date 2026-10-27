import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { SetupWizard } from "./SetupWizard";
import { isSetupComplete } from "@/server/settings";
import { env } from "@/server/env";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("İlk kurulum") };
}

export default async function SetupPage() {
  const t = await getT();
  if (await isSetupComplete()) redirect("/login");
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? (env().secureCookies ? "https" : "http");
  return (
    <div className="auth-wrap">
      <div className="auth-card wide fade-up">
        <div className="auth-head">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-logo" src="/brand/club-mark.png" alt="" />
          <div>
            <div className="eyebrow">{t("Kulüp platformu · ilk kurulum")}</div>
            <h1 className="page-title">{t.locale === "en" ? <>Set up your club <em>now</em></> : <>Kulübünü <em>şimdi</em> kur</>}</h1>
            <p className="page-sub">{t("Birkaç dakikada kulüp bilgilerini gir ve kurucu (owner) hesabını oluştur.")}</p>
          </div>
        </div>
        <SetupWizard configuredUrl={env().APP_URL} requestIsHttps={proto === "https"} />
      </div>
    </div>
  );
}
