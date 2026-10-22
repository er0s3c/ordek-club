import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "../AuthCard";
import { RegisterForm } from "./RegisterForm";
import { currentSession, requireSetupDone } from "@/server/auth/page-guard";
import { getSettings } from "@/server/settings";
import { getMessages } from "@/i18n";

export const metadata: Metadata = { title: "Kayıt" };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireSetupDone();
  if (await currentSession()) redirect("/dashboard");
  const s = await getSettings();
  const m = getMessages(s.locale);
  const policy = s.registrationPolicy;
  const code = (await searchParams).code;

  if (policy === "CLOSED") {
    return (
      <AuthCard title={m.auth.registerTitle}>
        <div className="stack">
          <div className="alert alert-info">{m.auth.registerClosed}</div>
          <Link className="btn btn-block" href="/login">{m.auth.backToLogin}</Link>
        </div>
      </AuthCard>
    );
  }
  const sub = policy === "OPEN" ? m.auth.registerSubOpen : policy === "INVITE_ONLY" ? m.auth.registerSubInvite : m.auth.registerSubApproval;
  return (
    <AuthCard title={m.auth.registerTitle} sub={sub} wide>
      <RegisterForm policy={policy} initialCode={typeof code === "string" ? code.slice(0, 40) : ""} />
    </AuthCard>
  );
}
