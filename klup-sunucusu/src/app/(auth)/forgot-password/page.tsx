import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "../AuthCard";
import { currentSession, requireSetupDone } from "@/server/auth/page-guard";
import { mailEnabled } from "@/server/mail/outbox";
import { ForgotForm } from "./ForgotForm";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Parolamı unuttum") };
}

export default async function ForgotPage() {
  const t = await getT();
  await requireSetupDone();
  if (await currentSession()) redirect("/account");
  return (
    <AuthCard title={t("Parolamı unuttum")} sub={mailEnabled() ? t("Kayıtlı e-postana sıfırlama bağlantısı gönderelim.") : undefined}>
      {mailEnabled() ? (
        <ForgotForm />
      ) : (
        <div className="stack">
          <p className="muted" style={{ margin: 0 }}>{t("Bu kulüpte e-posta gönderimi yapılandırılmamış. Parolanı sıfırlamak için kulüp yöneticisine başvur.")}</p>
          <Link href="/login">{t("Girişe dön")}</Link>
        </div>
      )}
    </AuthCard>
  );
}
