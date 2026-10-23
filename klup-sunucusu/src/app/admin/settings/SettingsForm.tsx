"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { RegistrationPolicy } from "@prisma/client";
import { Field, TextAreaField } from "@/components/ui/Field";
import { useMessages, useToast } from "@/components/providers";
import { ApiError, api } from "@/lib/api-client";

type Values = {
  clubName: string; universityName: string; description: string; appUrl: string; timezone: string; locale: "tr" | "en";
  registrationPolicy: RegistrationPolicy; maxUploadMb: number; storageQuotaMb: number; userQuotaMb: number; sessionMaxAgeDays: number; sessionIdleHours: number;
};

const POLICIES: RegistrationPolicy[] = ["APPROVAL", "INVITE_ONLY", "OPEN", "CLOSED"];
const TIMEZONES = ["Europe/Istanbul", "Europe/Berlin", "Europe/London", "UTC", "America/New_York"];

export function SettingsForm({ initial }: { initial: Values }) {
  const m = useMessages();
  const toast = useToast();
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);

  const str = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setV((p) => ({ ...p, [k]: e.target.value }));
  const num = (k: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => setV((p) => ({ ...p, [k]: e.target.value === "" ? 0 : Number(e.target.value) }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Yalnızca değişen alanlar gönderilir.
    const patch = Object.fromEntries(Object.entries(v).filter(([k, val]) => saved[k as keyof Values] !== val));
    setBusy(true);
    setFields({});
    try {
      await api("/api/admin/settings", { method: "PATCH", body: patch });
      setSaved(v);
      toast("ok", "Ayarlar kaydedildi.");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) setFields(err.fields);
      toast("error", (err as Error).message);
    }
    setBusy(false);
  }

  return (
    <form className="stack" onSubmit={onSubmit} noValidate>
      <section className="card" aria-labelledby="club-h">
        <div className="card-h"><h2 id="club-h">Kulüp bilgileri</h2></div>
        <div className="card-b stack">
          <div className="form-grid">
            <Field label="Kulüp adı" value={v.clubName} onChange={str("clubName")} maxLength={80} error={fields.clubName} />
            <Field label="Üniversite" value={v.universityName} onChange={str("universityName")} maxLength={120} error={fields.universityName} />
          </div>
          <TextAreaField label="Açıklama" value={v.description} onChange={str("description")} maxLength={500} error={fields.description} />
          <Field label="Sunucu adresi (URL)" value={v.appUrl} onChange={str("appUrl")} className="input mono" error={fields.appUrl} hint="Davet bağlantılarında kullanılır. HTTPS sertifikası install.sh / Caddy ile yapılandırılır." />
          <div className="form-grid">
            <div className="field">
              <label htmlFor="tz">Saat dilimi</label>
              <select id="tz" className="select" value={v.timezone} onChange={str("timezone")}>
                {(TIMEZONES.includes(v.timezone) ? TIMEZONES : [v.timezone, ...TIMEZONES]).map((t) => <option key={t}>{t}</option>)}
              </select>
              {fields.timezone && <span className="err">{fields.timezone}</span>}
            </div>
            <div className="field">
              <label htmlFor="locale">Dil</label>
              <select id="locale" className="select" value={v.locale} onChange={str("locale")}>
                <option value="tr">Türkçe</option>
                <option value="en">English (kısmi)</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="card" aria-labelledby="reg-h">
        <div className="card-h"><h2 id="reg-h">Kayıt politikası</h2></div>
        <div className="card-b stack" role="radiogroup" aria-labelledby="reg-h">
          {POLICIES.map((p) => (
            <label key={p} className="check">
              <input type="radio" name="registrationPolicy" value={p} checked={v.registrationPolicy === p} onChange={str("registrationPolicy")} />
              <span><strong>{m.policies[p].label}</strong><br /><span className="small muted">{m.policies[p].hint}</span></span>
            </label>
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="sec-h">
        <div className="card-h"><h2 id="sec-h">Oturum ve yükleme</h2></div>
        <div className="card-b form-grid">
          <Field label="Oturum ömrü (gün)" type="number" min={1} max={90} value={v.sessionMaxAgeDays} onChange={num("sessionMaxAgeDays")} error={fields.sessionMaxAgeDays} hint="Bu süreden sonra yeniden giriş gerekir." />
          <Field label="Hareketsizlik sınırı (saat)" type="number" min={1} max={720} value={v.sessionIdleHours} onChange={num("sessionIdleHours")} error={fields.sessionIdleHours} hint="Bu süre boyunca kullanılmayan oturum kapanır." />
          <Field label="Dosya yükleme sınırı (MB)" type="number" min={1} max={500} value={v.maxUploadMb} onChange={num("maxUploadMb")} error={fields.maxUploadMb} hint="Tek dosya için üst sınır (paylaşım ve görev teslimi)." />
          <Field label="Kulüp depolama kotası (MB)" type="number" min={100} max={1000000} value={v.storageQuotaMb} onChange={num("storageQuotaMb")} error={fields.storageQuotaMb} hint="Tüm yüklenen dosyaların toplamı." />
          <Field label="Öğrenci başına kota (MB)" type="number" min={1} max={100000} value={v.userQuotaMb} onChange={num("userQuotaMb")} error={fields.userQuotaMb} hint="Öğrencinin teslim dosyalarının toplamı." />
        </div>
      </section>

      <div className="row">
        <button className="btn btn-primary" disabled={busy || !dirty}>{busy && <span className="spinner" aria-hidden />} {m.common.save}</button>
        {dirty && <button type="button" className="btn btn-ghost" onClick={() => setV(saved)}>{m.common.cancel}</button>}
      </div>
    </form>
  );
}
