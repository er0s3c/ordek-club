"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { useMessages } from "@/components/providers";
import { ApiError, api } from "@/lib/api-client";
import { useT } from "@/i18n/client";

export function LoginForm({ next, canRegister, canReset }: { next: string; canRegister: boolean; canReset: boolean }) {
  const t = useT();
  const m = useMessages();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; kind: "error" | "warn" } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth/login", { body: { login: f.get("login"), password: f.get("password") } });
      router.replace(next);
      router.refresh();
    } catch (err) {
      const pending = err instanceof ApiError && err.code === "PENDING";
      setError({ text: (err as Error).message, kind: pending ? "warn" : "error" });
      setBusy(false);
    }
  }

  return (
    <form className="stack" onSubmit={onSubmit} noValidate>
      {error && <div className={`alert alert-${error.kind}`} role="alert">{error.text}</div>}
      <Field label={m.auth.loginField} name="login" autoComplete="username" autoCapitalize="none" spellCheck={false} required autoFocus />
      <Field label={m.auth.password} name="password" type="password" autoComplete="current-password" required />
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy && <span className="spinner" aria-hidden />} {m.auth.loginButton}
      </button>
      {canReset && <p className="auth-foot" style={{ marginTop: -6 }}><Link href="/forgot-password">{t("Parolamı unuttum")}</Link></p>}
      {canRegister && (
        <p className="auth-foot">
          {m.auth.noAccount} <Link href="/register">{m.auth.registerLink}</Link>
        </p>
      )}
    </form>
  );
}
