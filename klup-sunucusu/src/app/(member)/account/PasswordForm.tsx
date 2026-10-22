"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { useMessages, useToast } from "@/components/providers";
import { ApiError, api } from "@/lib/api-client";

export function PasswordForm() {
  const m = useMessages();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    if (f.get("newPassword") !== f.get("newPassword2")) {
      setFields({ newPassword2: "Parolalar eşleşmiyor." });
      return;
    }
    setBusy(true);
    setFields({});
    try {
      await api("/api/auth/password", { body: { currentPassword: f.get("currentPassword"), newPassword: f.get("newPassword") } });
      form.reset();
      toast("ok", m.account.passwordChanged);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) setFields(err.fields);
      else toast("error", (err as Error).message);
    }
    setBusy(false);
  }

  return (
    <form className="stack" onSubmit={onSubmit} noValidate>
      <Field label={m.account.currentPassword} name="currentPassword" type="password" autoComplete="current-password" required error={fields.currentPassword} />
      <Field label={m.account.newPassword} name="newPassword" type="password" autoComplete="new-password" required minLength={10} hint={m.auth.passwordHint} error={fields.newPassword} />
      <Field label="Yeni parola (tekrar)" name="newPassword2" type="password" autoComplete="new-password" required error={fields.newPassword2} />
      <div><button className="btn btn-primary" disabled={busy}>{busy && <span className="spinner" aria-hidden />} {m.account.changePassword}</button></div>
    </form>
  );
}
