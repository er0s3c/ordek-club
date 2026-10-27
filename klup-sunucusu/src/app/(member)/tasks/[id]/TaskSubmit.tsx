"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { FILE_ACCEPT } from "@/components/classroom/labels";
import { useT } from "@/i18n/client";

export function TaskSubmit({ id, requireText, requireFile, existingFiles, resubmit, checklist = [] }: { id: string; requireText: boolean; requireFile: boolean; existingFiles: number; resubmit: boolean; checklist?: string[] }) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const [text, setText] = useState("");
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState<number[]>([]);
  const checklistDone = checked.length === checklist.length;
  const room = 5 - existingFiles;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const files = Array.from(fileRef.current?.files ?? []);
    if (files.length > room) return toast("error", t("En fazla {room} dosya daha ekleyebilirsin.", { room }));
    const form = new FormData();
    form.set("text", text);
    for (const i of checked) form.append("checklist", String(i));
    for (const f of files) form.append("files", f);
    setBusy(true);
    try {
      await api(`/api/tasks/${encodeURIComponent(id)}/submit`, { method: "POST", form });
      toast("ok", resubmit ? t("Teslimin güncellendi.") : t("Teslimin alındı."));
      setText("");
      if (fileRef.current) fileRef.current.value = "";
      setCount(0);
      router.refresh();
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="stack-sm" onSubmit={submit}>
      <div className="field">
        <label htmlFor="sub-text">{requireText ? t("Cevap / açıklama") : t("Not (isteğe bağlı)")}</label>
        <textarea id="sub-text" className="textarea" rows={6} maxLength={20000} required={requireText} value={text} onChange={(e) => setText(e.target.value)} placeholder={resubmit ? t("Güncel cevabın — önceki metnin yerine geçer.") : ""} />
      </div>
      <div className="field">
        <label htmlFor="sub-files">{t("Dosyalar")}{" "}{requireFile ? t("(en az bir dosya gerekli)") : t("(isteğe bağlı)")}{" "}{t("· {room} hakkın kaldı", { room })}</label>
        <input id="sub-files" ref={fileRef} type="file" multiple className="input" accept={FILE_ACCEPT} disabled={room <= 0} onChange={(e) => setCount(e.target.files?.length ?? 0)} />
        <span className="hint">{t("PDF, görsel, metin/log, PCAP ve ZIP kabul edilir; çalıştırılabilir dosyalar reddedilir.")}</span>
      </div>
      {checklist.length > 0 && (
        <fieldset className="field checklist">
          <legend className="small"><strong>{t("Göndermeden önce kontrol et")}</strong> ({checked.length}/{checklist.length})</legend>
          {checklist.map((c, i) => (
            <label key={i} className="check"><input type="checkbox" checked={checked.includes(i)} onChange={(e) => setChecked((x) => (e.target.checked ? [...x, i] : x.filter((y) => y !== i)))} /> {c}</label>
          ))}
        </fieldset>
      )}
      <button className="btn btn-primary" disabled={busy || !checklistDone || (requireText && !text.trim()) || (requireFile && existingFiles + count === 0)}>
        <Send size={15} aria-hidden /> {busy ? t("Gönderiliyor…") : resubmit ? t("Yeniden teslim et") : t("Teslim et")}
      </button>
    </form>
  );
}
