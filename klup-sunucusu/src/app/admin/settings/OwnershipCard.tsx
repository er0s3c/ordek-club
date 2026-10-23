"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Crown } from "lucide-react";
import { useToast } from "@/components/providers";
import { Field } from "@/components/ui/Field";
import { ApiError, api } from "@/lib/api-client";

// Kulüp sahipliğini bir yöneticiye devreder; devreden yönetici (ADMIN) olur. Parola doğrulaması zorunlu.
export function OwnershipCard() {
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const username = String(f.get("username") ?? "");
    if (!window.confirm(`Kulüp sahipliği @${username} kullanıcısına devredilsin mi? Sen yönetici (ADMIN) olacaksın ve bu işlemi geri alamazsın; yalnız yeni sahip geri devredebilir.`)) return;
    setBusy(true);
    setFields({});
    try {
      await api("/api/admin/ownership", { body: { username, password: f.get("password") } });
      toast("ok", "Sahiplik devredildi.");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) setFields(err.fields);
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card" aria-labelledby="own-h" style={{ borderColor: "var(--accent-deep)" }}>
      <div className="card-h"><h2 id="own-h"><Crown size={15} aria-hidden /> Sahiplik devri</h2></div>
      <form className="card-b stack-sm" onSubmit={submit}>
        <p className="small muted" style={{ margin: 0 }}>Sahiplik yalnız aktif bir yöneticiye devredilebilir. Önce Üyeler sayfasından hedef kişiyi yönetici yap.</p>
        <div className="form-grid">
          <Field label="Yeni sahibin kullanıcı adı" name="username" required autoCapitalize="none" spellCheck={false} error={fields.username} />
          <Field label="Parolan (doğrulama)" name="password" type="password" autoComplete="current-password" required error={fields.password} />
        </div>
        <button className="btn btn-danger btn-sm" style={{ alignSelf: "flex-start" }} disabled={busy}>Sahipliği devret</button>
      </form>
    </section>
  );
}
