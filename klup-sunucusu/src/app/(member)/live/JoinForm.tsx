"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn } from "lucide-react";
import { api } from "@/lib/api-client";
import { useT } from "@/i18n/client";

export function JoinForm() {
  const t = useT();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const normalized = code.toUpperCase().replace(/[^A-Z0-9]/g, "");

  return (
    <form
      className="stack"
      onSubmit={async (e) => {
        e.preventDefault();
        if (normalized.length < 6) return setError(t("Kod 6 karakter olmalı."));
        setBusy(true);
        setError(null);
        try {
          await api(`/api/live/join/${normalized}`);
          router.push(`/live/${normalized}`);
        } catch (err) {
          setError((err as Error).message);
          setBusy(false);
        }
      }}
    >
      <div className="field">
        <label htmlFor="code">{t("Oturum kodu")}</label>
        <input
          id="code"
          className="input mono"
          style={{ fontSize: 26, letterSpacing: "0.3em", textTransform: "uppercase", textAlign: "center" }}
          maxLength={8}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "code-err" : undefined}
          autoFocus
        />
        {error && <span id="code-err" className="err" role="alert">{error}</span>}
      </div>
      <button className="btn btn-primary" disabled={busy}>{busy ? <span className="spinner" aria-hidden /> : <LogIn size={16} aria-hidden />}{" "}{t("Katıl")}</button>
    </form>
  );
}
