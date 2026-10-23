"use client";

import Link from "next/link";
import { useState } from "react";
import { Field } from "@/components/ui/Field";
import { api } from "@/lib/api-client";

export function ForgotForm() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth/forgot", { body: { identifier: f.get("identifier") } });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done)
    return (
      <div className="stack">
        <div className="alert alert-ok" role="status">Bu bilgilerle aktif bir hesap varsa birkaç dakika içinde sıfırlama bağlantısı gelecek. Gereksiz klasörünü de kontrol et.</div>
        <Link href="/login">Girişe dön</Link>
      </div>
    );
  return (
    <form className="stack" onSubmit={submit}>
      {error && <div className="alert alert-error" role="alert">{error}</div>}
      <Field label="Kullanıcı adı veya e-posta" name="identifier" autoComplete="username" autoCapitalize="none" spellCheck={false} required autoFocus />
      <button className="btn btn-primary btn-block" disabled={busy}>{busy && <span className="spinner" aria-hidden />} Bağlantı gönder</button>
      <p className="auth-foot"><Link href="/login">Girişe dön</Link></p>
    </form>
  );
}
