"use client";
// Site dili: kaydedilince sayfa yeniden yüklenir, menüler dahil her şey yeni dilde gelir.
import { useState } from "react";
import { api } from "@/lib/api-client";
import { useLocale, useT } from "@/i18n/client";
import type { LocalePref } from "@/i18n/locale";
import { SaveStatus, type SaveState } from "@/components/ui/states";

export function LanguageSettings({ initial }: { initial: LocalePref }) {
  const t = useT();
  const current = useLocale();
  const [value, setValue] = useState<LocalePref>(initial);
  const [state, setState] = useState<SaveState>("idle");
  const [msg, setMsg] = useState<string>();
  async function save(next: LocalePref) {
    setValue(next);
    setState("saving");
    try {
      await api("/api/account/language", { method: "PUT", body: { locale: next } });
      setState("saved");
      window.location.reload();
    } catch (e) {
      setState("error");
      setMsg((e as Error).message);
    }
  }
  return (
    <div className="stack-sm">
      <label className="field" htmlFor="site-language">
        {t("Site dili")} <span className="faint">· Language</span>
        <select id="site-language" className="select" value={value} disabled={state === "saving"} onChange={(e) => void save(e.target.value as LocalePref)}>
          <option value="auto">{t("Otomatik (tarayıcı/sistem dili)")}</option>
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
        </select>
      </label>
      <p className="tiny faint">
        {value === "auto" ? t("Şu an: {lang}. Sistem diliniz Türkçe değilse site İngilizce açılır.", { lang: current === "en" ? "English" : "Türkçe" }) : t("Menüler, dersler ve bildirimler bu dilde gösterilir.")}
      </p>
      <SaveStatus state={state} message={msg} />
    </div>
  );
}
