"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Field } from "@/components/ui/Field";
import { ApiError, api } from "@/lib/api-client";
import { useT } from "@/i18n/client";

export function ResetForm() {
  const tl = useT();
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<string | undefined>();

  useEffect(() => {
    const t = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
    setToken(t);
    // Token adres çubuğundan/geçmişten silinir.
    if (t) window.history.replaceState(null, "", "/reset-password");
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (f.get("password") !== f.get("password2")) return setFieldErr(tl("Parolalar aynı değil."));
    setBusy(true);
    setError(null);
    setFieldErr(undefined);
    try {
      await api("/api/auth/reset", { body: { token, password: f.get("password") } });
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.fields.password) setFieldErr(err.fields.password);
      else setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) return <div className="stack"><div className="alert alert-ok" role="status">{tl("Parolan değişti. Yeni parolanla giriş yapabilirsin.")}</div><Link className="btn btn-primary" href="/login">{tl("Giriş yap")}</Link></div>;
  if (token === null) return <span className="spinner" aria-label={tl("Yükleniyor")} />;
  if (!token) return <div className="stack"><div className="alert alert-error">{tl("Bağlantı eksik. E-postadaki bağlantıyı tam olarak aç ya da yeniden iste.")}</div><Link href="/forgot-password">{tl("Yeniden iste")}</Link></div>;
  return (
    <form className="stack" onSubmit={submit}>
      {error && <div className="alert alert-error" role="alert">{error} <Link href="/forgot-password">{tl("Yeniden iste")}</Link></div>}
      <Field label={tl("Yeni parola")} name="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} required autoFocus error={fieldErr} />
      <Field label={tl("Yeni parola (tekrar)")} name="password2" type="password" autoComplete="new-password" required />
      <button className="btn btn-primary btn-block" disabled={busy}>{busy && <span className="spinner" aria-hidden />}{" "}{tl("Parolayı değiştir")}</button>
    </form>
  );
}
