import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "../AuthCard";
import { currentSession, requireSetupDone } from "@/server/auth/page-guard";
import { mailEnabled } from "@/server/mail/outbox";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = { title: "Parolamı unuttum" };

export default async function ForgotPage() {
  await requireSetupDone();
  if (await currentSession()) redirect("/account");
  return (
    <AuthCard title="Parolamı unuttum" sub={mailEnabled() ? "Kayıtlı e-postana sıfırlama bağlantısı gönderelim." : undefined}>
      {mailEnabled() ? (
        <ForgotForm />
      ) : (
        <div className="stack">
          <p className="muted" style={{ margin: 0 }}>Bu kulüpte e-posta gönderimi yapılandırılmamış. Parolanı sıfırlamak için kulüp yöneticisine başvur.</p>
          <Link href="/login">Girişe dön</Link>
        </div>
      )}
    </AuthCard>
  );
}
