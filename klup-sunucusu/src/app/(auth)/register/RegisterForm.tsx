"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RegistrationPolicy } from "@prisma/client";
import { Field, TextAreaField } from "@/components/ui/Field";
import { useMessages } from "@/components/providers";
import { ApiError, api } from "@/lib/api-client";
import { useT } from "@/i18n/client";

export function RegisterForm({ policy, initialCode }: { policy: RegistrationPolicy; initialCode: string }) {
  const t = useT();
  const m = useMessages();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const inviteRequired = policy === "INVITE_ONLY";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = Object.fromEntries(
      ["username", "email", "displayName", "password", "studentNumber", "department", "applicationNote", "invitationCode"].map((k) => [k, String(f.get(k) ?? "")]),
    );
    setBusy(true);
    setError(null);
    setFields({});
    try {
      const res = await api<{ status: "ACTIVE" | "PENDING" }>("/api/auth/register", { body });
      if (res.status === "ACTIVE") {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
      setPending(true);
    } catch (err) {
      setError((err as Error).message);
      if (err instanceof ApiError) setFields(err.fields);
    }
    setBusy(false);
  }

  if (pending) {
    return (
      <div className="stack">
        <div className="alert alert-ok" role="status">
          <div>
            <strong>{m.auth.pendingTitle}</strong>
            <div>{m.auth.pendingBody}</div>
          </div>
        </div>
        <Link className="btn btn-block" href="/login">{m.auth.backToLogin}</Link>
      </div>
    );
  }

  return (
    <form className="stack" onSubmit={onSubmit} noValidate>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <div className="form-grid">
        <Field label={m.auth.displayName} name="displayName" autoComplete="name" required maxLength={60} error={fields.displayName} />
        <Field label={m.auth.username} name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={32} hint={m.auth.usernameHint} error={fields.username} />
        <Field label={m.auth.email} name="email" type="email" autoComplete="email" required maxLength={254} error={fields.email} />
        <Field label={m.auth.password} name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} hint={m.auth.passwordHint} error={fields.password} />
        <Field label={`${m.auth.studentNumber} (${m.auth.optional})`} name="studentNumber" maxLength={32} error={fields.studentNumber} />
        <Field label={`${m.auth.department} (${m.auth.optional})`} name="department" maxLength={80} error={fields.department} />
      </div>
      <Field
        label={inviteRequired ? m.auth.invitationCode : m.auth.invitationOptional}
        name="invitationCode"
        defaultValue={initialCode}
        autoCapitalize="characters"
        spellCheck={false}
        required={inviteRequired}
        placeholder={t("XXXX-XXXX-XXXX")}
        className="input mono"
        error={fields.invitationCode}
      />
      {policy === "APPROVAL" && <TextAreaField label={m.auth.applicationNote} name="applicationNote" maxLength={500} error={fields.applicationNote} />}
      <button className="btn btn-primary btn-block" disabled={busy}>
        {busy && <span className="spinner" aria-hidden />} {policy === "APPROVAL" ? m.auth.applyButton : m.auth.registerButton}
      </button>
      <p className="auth-foot">
        {m.auth.haveAccount} <Link href="/login">{m.auth.loginButton}</Link>
      </p>
    </form>
  );
}
