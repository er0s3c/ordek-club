"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { KeyRound, Building2, UserRoundCog, ImageUp, ShieldAlert, ShieldCheck } from "lucide-react";
import { Field, TextAreaField } from "@/components/ui/Field";
import { useMessages, useToast } from "@/components/providers";
import { ApiError, api } from "@/lib/api-client";
import { LogoUploader } from "@/components/admin/LogoUploader";

const POLICIES = ["APPROVAL", "INVITE_ONLY", "OPEN", "CLOSED"] as const;
type Policy = (typeof POLICIES)[number];

const STEPS = [
  { icon: KeyRound, title: "Kurulum anahtarı" },
  { icon: Building2, title: "Kulüp bilgileri" },
  { icon: UserRoundCog, title: "Kurucu hesabı" },
  { icon: ImageUp, title: "Logo" },
];

// Adım → hangi alan anahtarları o adıma ait (sunucu hatasında doğru adıma dönmek için)
const STEP_OF_FIELD = (k: string) => (k === "token" ? 0 : k.startsWith("club.") ? 1 : k.startsWith("owner.") ? 2 : -1);

export function SetupWizard({ configuredUrl, requestIsHttps }: { configuredUrl: string; requestIsHttps: boolean }) {
  const m = useMessages();
  const toast = useToast();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [v, setV] = useState({
    token: "",
    clubName: "",
    universityName: "",
    description: "",
    appUrl: configuredUrl,
    timezone: "Europe/Istanbul",
    registrationPolicy: "APPROVAL" as Policy,
    displayName: "",
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setV((p) => ({ ...p, [k]: e.target.value }));

  function localCheck(): boolean {
    const f: Record<string, string> = {};
    if (step === 0 && v.token.trim().length < 10) f.token = "Sunucu loglarındaki kurulum anahtarını gir.";
    if (step === 1 && v.clubName.trim().length < 2) f["club.clubName"] = "Kulüp adı gerekli.";
    if (step === 2) {
      if (v.password.length < 10) f["owner.password"] = "Parola en az 10 karakter olmalı.";
      if (v.password !== v.password2) f.password2 = "Parolalar eşleşmiyor.";
    }
    setFields(f);
    return Object.keys(f).length === 0;
  }

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await api("/api/setup", {
        body: {
          token: v.token,
          club: {
            clubName: v.clubName, universityName: v.universityName, description: v.description,
            appUrl: v.appUrl, timezone: v.timezone, registrationPolicy: v.registrationPolicy,
          },
          owner: { displayName: v.displayName, username: v.username, email: v.email, password: v.password },
        },
      });
      toast("ok", "Kurulum tamamlandı. Hoş geldin!");
      setStep(3);
    } catch (err) {
      setError((err as Error).message);
      if (err instanceof ApiError) {
        const f = { ...err.fields };
        if (err.status === 403) f.token = err.message;
        setFields(f);
        const steps = Object.keys(f).map(STEP_OF_FIELD).filter((s) => s >= 0);
        if (steps.length) setStep(Math.min(...steps));
        if (err.code === "SETUP_DONE") router.replace("/login");
      }
    }
    setBusy(false);
  }

  function onNext(e: React.FormEvent) {
    e.preventDefault();
    if (!localCheck()) return;
    if (step < 2) setStep(step + 1);
    else void submit();
  }

  const Icon = STEPS[step]!.icon;

  return (
    <div className="card">
      <div className="card-b">
        <div className="steps" aria-hidden>
          {STEPS.map((_, i) => <span key={i} data-done={i <= step} />)}
        </div>
        <div className="row" style={{ marginBottom: 16 }}>
          <Icon size={20} color="var(--lime)" aria-hidden />
          <h2 style={{ fontSize: 17 }}>
            Adım {step + 1}/4 · {STEPS[step]!.title}
          </h2>
        </div>

        {error && step < 3 && <div className="alert alert-error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

        {step < 3 ? (
          <form className="stack" onSubmit={onNext} noValidate>
            {step === 0 && (
              <>
                <p className="muted small" style={{ margin: 0 }}>
                  Güvenlik için kurulumu yalnızca sunucuya erişimi olan kişi yapabilir. Anahtarı görmek için sunucuda:
                </p>
                <pre className="code-box" style={{ fontSize: 13, margin: 0, overflowX: "auto" }}>./scripts/club.sh setup-token</pre>
                <Field label="Kurulum anahtarı" value={v.token} onChange={set("token")} className="input mono" autoFocus autoComplete="off" spellCheck={false} placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX" error={fields.token} />
              </>
            )}
            {step === 1 && (
              <>
                <div className="form-grid">
                  <Field label="Kulüp adı" value={v.clubName} onChange={set("clubName")} maxLength={80} required autoFocus error={fields["club.clubName"]} placeholder="ör. Siber Güvenlik Topluluğu" />
                  <Field label="Üniversite" value={v.universityName} onChange={set("universityName")} maxLength={120} error={fields["club.universityName"]} />
                </div>
                <TextAreaField label="Kısa açıklama" value={v.description} onChange={set("description")} maxLength={500} error={fields["club.description"]} />
                <Field
                  label="Sunucu adresi (URL)"
                  value={v.appUrl}
                  onChange={set("appUrl")}
                  className="input mono"
                  error={fields["club.appUrl"]}
                  hint="Öğrencilerin tarayıcıya yazacağı adres. HTTPS için alan adınızı install.sh sırasında girin."
                />
                <div className={`alert ${requestIsHttps ? "alert-ok" : "alert-warn"} small`}>
                  {requestIsHttps ? <ShieldCheck size={18} aria-hidden /> : <ShieldAlert size={18} aria-hidden />}
                  <span>
                    {requestIsHttps
                      ? "Bu bağlantı HTTPS ile şifreli."
                      : "Bu bağlantı HTTPS değil. Yerel ağ denemesi için sorun değil; internete açık kurulumda HTTPS (Caddy profili) kullanın."}
                  </span>
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="tz">Saat dilimi</label>
                    <select id="tz" className="select" value={v.timezone} onChange={set("timezone")}>
                      {["Europe/Istanbul", "Europe/Berlin", "Europe/London", "UTC", "America/New_York"].map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <span className="hint">Aylık liderlik tablosu bu saat dilimine göre sıfırlanır.</span>
                  </div>
                  <div className="field">
                    <label htmlFor="pol">Kayıt politikası</label>
                    <select id="pol" className="select" value={v.registrationPolicy} onChange={set("registrationPolicy")}>
                      {POLICIES.map((p) => <option key={p} value={p}>{m.policies[p].label}</option>)}
                    </select>
                    <span className="hint">{m.policies[v.registrationPolicy].hint}</span>
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <p className="muted small" style={{ margin: 0 }}>Bu hesap kulübün kurucusu (OWNER) olur ve tüm yetkilere sahiptir.</p>
                <div className="form-grid">
                  <Field label={m.auth.displayName} value={v.displayName} onChange={set("displayName")} autoComplete="name" autoFocus error={fields["owner.displayName"]} />
                  <Field label={m.auth.username} value={v.username} onChange={set("username")} autoComplete="username" autoCapitalize="none" error={fields["owner.username"]} hint={m.auth.usernameHint} />
                  <Field label={m.auth.email} type="email" value={v.email} onChange={set("email")} autoComplete="email" error={fields["owner.email"]} />
                  <span />
                  <Field label={m.auth.password} type="password" value={v.password} onChange={set("password")} autoComplete="new-password" error={fields["owner.password"]} hint={m.auth.passwordHint} />
                  <Field label="Parola (tekrar)" type="password" value={v.password2} onChange={set("password2")} autoComplete="new-password" error={fields.password2} />
                </div>
              </>
            )}
            <div className="row-between" style={{ marginTop: 6 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0 || busy}>
                Geri
              </button>
              <button className="btn btn-primary" disabled={busy}>
                {busy && <span className="spinner" aria-hidden />} {step === 2 ? "Kurulumu tamamla" : "Devam"}
              </button>
            </div>
          </form>
        ) : (
          <div className="stack">
            <div className="alert alert-ok">Kurulum tamamlandı ve kurucu hesabınla giriş yaptın.</div>
            <p className="muted small" style={{ margin: 0 }}>İsteğe bağlı: kulüp logonu yükle (PNG, JPEG veya WebP, en fazla 1 MB). Bunu daha sonra ayarlardan da yapabilirsin.</p>
            <LogoUploader initialHasLogo={false} initialVersion={0} />
            <button
              className="btn btn-primary"
              onClick={() => {
                router.replace("/admin");
                router.refresh();
              }}
            >
              Yönetim paneline git
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
