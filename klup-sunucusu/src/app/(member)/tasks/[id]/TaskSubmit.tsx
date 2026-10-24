"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Send } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { FILE_ACCEPT } from "@/components/classroom/labels";

export function TaskSubmit({ id, requireText, requireFile, existingFiles, resubmit }: { id: string; requireText: boolean; requireFile: boolean; existingFiles: number; resubmit: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const [text, setText] = useState("");
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const room = 5 - existingFiles;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const files = Array.from(fileRef.current?.files ?? []);
    if (files.length > room) return toast("error", `En fazla ${room} dosya daha ekleyebilirsin.`);
    const form = new FormData();
    form.set("text", text);
    for (const f of files) form.append("files", f);
    setBusy(true);
    try {
      await api(`/api/tasks/${encodeURIComponent(id)}/submit`, { method: "POST", form });
      toast("ok", resubmit ? "Teslimin güncellendi." : "Teslimin alındı.");
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
        <label htmlFor="sub-text">{requireText ? "Cevap / açıklama" : "Not (isteğe bağlı)"}</label>
        <textarea id="sub-text" className="textarea" rows={6} maxLength={20000} required={requireText} value={text} onChange={(e) => setText(e.target.value)} placeholder={resubmit ? "Güncel cevabın — önceki metnin yerine geçer." : ""} />
      </div>
      <div className="field">
        <label htmlFor="sub-files">Dosyalar {requireFile ? "(en az bir dosya gerekli)" : "(isteğe bağlı)"} · {room} hakkın kaldı</label>
        <input id="sub-files" ref={fileRef} type="file" multiple className="input" accept={FILE_ACCEPT} disabled={room <= 0} onChange={(e) => setCount(e.target.files?.length ?? 0)} />
        <span className="hint">PDF, görsel, metin/log, PCAP ve ZIP kabul edilir; çalıştırılabilir dosyalar reddedilir.</span>
      </div>
      <button className="btn btn-primary" disabled={busy || (requireText && !text.trim()) || (requireFile && existingFiles + count === 0)}>
        <Send size={15} aria-hidden /> {busy ? "Gönderiliyor…" : resubmit ? "Yeniden teslim et" : "Teslim et"}
      </button>
    </form>
  );
}
