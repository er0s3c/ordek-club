"use client";
// Erişilebilirlik ve okuma tercihleri: değişiklik anında önizlenir, "Kaydet" ile hesaba yazılır.
import { useState } from "react";
import { api } from "@/lib/api-client";
import { applyA11y, type A11y } from "./A11yPrefs";
import { SaveStatus, type SaveState } from "@/components/ui/states";
import { useT } from "@/i18n/client";

export function A11ySettings({ initial }: { initial: A11y }) {
  const t = useT();
  const [p, setP] = useState(initial);
  const [state, setState] = useState<SaveState>("idle");
  const [msg, setMsg] = useState<string>();
  function set<K extends keyof A11y>(k: K, v: A11y[K]) { const next = { ...p, [k]: v }; setP(next); applyA11y(next); setState("dirty"); }
  async function save() {
    setState("saving");
    try { await api("/api/account/a11y", { method: "PUT", body: p }); setState("saved"); setMsg(undefined); }
    catch (e) { setState("error"); setMsg((e as Error).message); }
  }
  return (
    <div className="stack">
      <label className="field">{t("Yazı boyutu: %{fontScale}", { fontScale: p.fontScale })}
        <input type="range" min={85} max={150} step={5} value={p.fontScale} onChange={(e) => set("fontScale", Number(e.target.value))} />
      </label>
      <label className="field">{t("Ders metninde satır aralığı")}
        <select className="select" value={p.lineHeight} onChange={(e) => set("lineHeight", e.target.value)}>
          <option value="compact">{t("Sık")}</option><option value="normal">{t("Normal")}</option><option value="relaxed">{t("Geniş")}</option>
        </select>
      </label>
      <label className="check"><input type="checkbox" checked={p.readableFont} onChange={(e) => set("readableFont", e.target.checked)} />{" "}{t("Okunaklı yazı tipi (harf ve kelime aralığı geniş)")}</label>
      <label className="check"><input type="checkbox" checked={p.highContrast} onChange={(e) => set("highContrast", e.target.checked)} />{" "}{t("Yüksek kontrast")}</label>
      <label className="check"><input type="checkbox" checked={p.reduceMotion} onChange={(e) => set("reduceMotion", e.target.checked)} />{" "}{t("Hareketi azalt (cihaz ayarından bağımsız)")}</label>
      <div className="row"><button type="button" className="btn btn-primary btn-sm" disabled={state !== "dirty" && state !== "error"} onClick={save}>{t("Tercihleri kaydet")}</button><SaveStatus state={state} message={msg} /></div>
    </div>
  );
}
