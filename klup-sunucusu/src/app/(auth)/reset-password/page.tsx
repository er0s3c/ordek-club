import type { Metadata } from "next";
import { AuthCard } from "../AuthCard";
import { requireSetupDone } from "@/server/auth/page-guard";
import { ResetForm } from "./ResetForm";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Yeni parola") };
}

// Token adresin # kısmındadır: tarayıcı onu sunucuya hiç göndermez (erişim günlüklerine ve Referer'a düşmez);
// istemci okur ve POST gövdesiyle iletir.
export default async function ResetPage() {
  const t = await getT();
  await requireSetupDone();
  return (
    <AuthCard title={t("Yeni parola belirle")} sub={t("En az 10 karakter. Tüm cihazlardaki oturumların kapanır.")}>
      <ResetForm />
    </AuthCard>
  );
}
