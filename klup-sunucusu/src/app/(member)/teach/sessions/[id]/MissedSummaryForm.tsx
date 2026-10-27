"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { useT } from "@/i18n/client";

export function MissedSummaryForm({ sessionId, groups }: { sessionId: string; groups: { id: string; name: string }[] }) {
  const t = useT();
  const toast = useToast();
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  if (!groups.length) return null;
  async function send() {
    setBusy(true);
    try { const r = await api<{ notified: number }>(`/api/live/${sessionId}/missed`, { body: { groupId, note } }); toast("ok", r.notified ? t("{notified} öğrenciye ders özeti gönderildi.", { notified: r.notified }) : t("Sınıftaki herkes derse katılmış.")); }
    catch (e) { toast("error", (e as Error).message); } finally { setBusy(false); }
  }
  return (
    <section className="card" aria-labelledby="missed-h">
      <div className="card-h"><h2 id="missed-h">{t("Dersi kaçıranlara özet")}</h2></div>
      <div className="card-b stack-sm">
        <p className="small muted" style={{ margin: 0 }}>{t("Seçtiğin sınıfta bu derse hiç katılmayan öğrencilere bildirim gider: dersin başlığı, notun, oturumda açılan görevler ve destedeki mini görevlerin bağlantısı.")}</p>
        <div className="row">
          <label className="field"><span className="tiny faint">{t("Sınıf")}</span><select className="select" value={groupId} onChange={(e) => setGroupId(e.target.value)}>{groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
          <label className="field" style={{ flex: 1, minWidth: 220 }}><span className="tiny faint">{t("Not")}</span><input className="input" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("Bu hafta TLS’e giriş yaptık; 2 kısa görev açık.")} /></label>
        </div>
        <div><button type="button" className="btn btn-sm btn-primary" disabled={busy || !groupId} onClick={send}><Send size={14} aria-hidden />{" "}{t("Özeti gönder")}</button></div>
      </div>
    </section>
  );
}
