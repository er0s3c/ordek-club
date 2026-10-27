"use client";
// Portfolyo gelişim hikâyesi: problem, yaklaşım, sonuç, öğrendiklerim. Paylaşım ayrı anahtarla (PortfolioToggle) seçilir.
import { useState } from "react";
import { api } from "@/lib/api-client";
import { SaveStatus, type SaveState } from "@/components/ui/states";
import { useT } from "@/i18n/client";

type Story = { problem: string; approach: string; result: string; learned: string };
const FIELDS: [keyof Story, string, string][] = [
  ["problem", "Problem", "Ne çözülmesi gerekiyordu?"],
  ["approach", "Yaklaşım", "Hangi adımları izledin, hangi aracı neden seçtin?"],
  ["result", "Sonuç", "Ne buldun, ne değişti?"],
  ["learned", "Öğrendiklerim", "Bir dahaki sefere neyi farklı yaparsın?"],
];

export function StoryView({ story }: { story: Story }) {
  const filled = FIELDS.filter(([k]) => story[k].trim());
  if (!filled.length) return null;
  return <dl className="story">{filled.map(([k, label]) => <div key={k}><dt>{label}</dt><dd>{story[k]}</dd></div>)}</dl>;
}

export function PortfolioStory({ submissionId, initial }: { submissionId: string; initial: Story }) {
  const t = useT();
  const [s, setS] = useState(initial);
  const [state, setState] = useState<SaveState>("idle");
  const [msg, setMsg] = useState<string>();
  async function save() {
    setState("saving");
    try { await api("/api/learning/portfolio", { method: "PATCH", body: { submissionId, ...s } }); setState("saved"); setMsg(undefined); }
    catch (e) { setState("error"); setMsg((e as Error).message); }
  }
  return (
    <details className="story-edit">
      <summary className="small">{t("Gelişim hikâyesi ekle / düzenle")}</summary>
      <div className="stack-sm" style={{ marginTop: 10 }}>
        {FIELDS.map(([k, label, hint]) => <label key={k} className="field">{t(label)}<textarea className="textarea" rows={2} maxLength={2000} placeholder={t(hint)} value={s[k]} onChange={(e) => { setS({ ...s, [k]: e.target.value }); setState("dirty"); }} /></label>)}
        <div className="row"><button type="button" className="btn btn-sm" disabled={state !== "dirty" && state !== "error"} onClick={save}>{t("Hikâyeyi kaydet")}</button><SaveStatus state={state} message={msg} /></div>
      </div>
    </details>
  );
}
