import type { Metadata } from "next";
import { AuthCard } from "../AuthCard";
import { requireSetupDone } from "@/server/auth/page-guard";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "Yeni parola" };

// Token adresin # kısmındadır: tarayıcı onu sunucuya hiç göndermez (erişim günlüklerine ve Referer'a düşmez);
// istemci okur ve POST gövdesiyle iletir.
export default async function ResetPage() {
  await requireSetupDone();
  return (
    <AuthCard title="Yeni parola belirle" sub="En az 10 karakter. Tüm cihazlardaki oturumların kapanır.">
      <ResetForm />
    </AuthCard>
  );
}
