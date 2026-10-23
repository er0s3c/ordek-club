import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "../AuthCard";
import { LoginForm } from "./LoginForm";
import { currentSession, requireSetupDone } from "@/server/auth/page-guard";
import { getSettings } from "@/server/settings";
import { getMessages } from "@/i18n";
import { mailEnabled } from "@/server/mail/outbox";

export const metadata: Metadata = { title: "Giriş" };

// Yalnızca site içi göreli yollara yönlendir (açık yönlendirme zafiyetine karşı).
function safeNext(raw: string | string[] | undefined): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v || !v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return "/dashboard";
  return v;
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireSetupDone();
  const next = safeNext((await searchParams).next);
  if (await currentSession()) redirect(next);
  const s = await getSettings();
  const m = getMessages(s.locale);
  return (
    <AuthCard title={m.auth.loginTitle} sub={m.auth.loginSub}>
      <LoginForm next={next} canRegister={s.registrationPolicy !== "CLOSED"} canReset={mailEnabled()} />
    </AuthCard>
  );
}
