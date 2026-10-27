"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Megaphone, Trash2 } from "lucide-react";
import { useToast } from "@/components/providers";
import { Field, TextAreaField } from "@/components/ui/Field";
import { ApiError, api } from "@/lib/api-client";
import { useT } from "@/i18n/client";

export function AnnouncementForm() {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"ALL" | "STAFF">("ALL");
  const [pinned, setPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFields({});
    try {
      await api("/api/announcements", { body: { title, body, audience, pinned, expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null, publishAt: publishAt ? new Date(publishAt).toISOString() : null } });
      toast("ok", audience === "ALL" ? t("Duyuru yayınlandı; tüm üyelere bildirim gitti.") : t("Duyuru personele gönderildi."));
      setTitle("");
      setBody("");
      setPinned(false);
      setExpiresAt("");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) setFields(err.fields);
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card" aria-labelledby="ann-new-h">
      <div className="card-h"><h2 id="ann-new-h"><Megaphone size={15} aria-hidden />{" "}{t("Yeni duyuru")}</h2></div>
      <form className="card-b stack-sm" onSubmit={submit}>
        <Field label={t("Başlık")} required minLength={3} maxLength={140} value={title} onChange={(e) => setTitle(e.target.value)} error={fields.title} />
        <TextAreaField label={t("Metin")} rows={4} maxLength={10000} value={body} onChange={(e) => setBody(e.target.value)} error={fields.body} />
        <div className="row" style={{ flexWrap: "wrap", gap: 14 }}>
          <div className="seg" role="group" aria-label={t("Kime")}>
            <button type="button" aria-pressed={audience === "ALL"} onClick={() => setAudience("ALL")}>{t("Herkes")}</button>
            <button type="button" aria-pressed={audience === "STAFF"} onClick={() => setAudience("STAFF")}>{t("Yalnız personel")}</button>
          </div>
          <label className="check"><input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} />{" "}{t("Sabitle")}</label>
          <label className="small row" style={{ gap: 6 }}>{t("Yayın zamanı")}{" "}<input type="datetime-local" className="input" style={{ width: "auto" }} value={publishAt} onChange={(e) => setPublishAt(e.target.value)} /></label>
          <label className="small row" style={{ gap: 6 }}>{t("Bitiş")}{" "}<input type="datetime-local" className="input" style={{ width: "auto" }} value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} /></label>
        </div>
        <button className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start" }} disabled={busy || title.trim().length < 3}>{t("Yayınla")}</button>
      </form>
    </section>
  );
}

export function DeleteAnnouncement({ id, title }: { id: string; title: string }) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  return (
    <button className="btn btn-sm btn-ghost" aria-label={t("{title} duyurusunu sil", { title })} onClick={async () => {
      if (!window.confirm("Duyuru silinsin mi?")) return;
      try {
        await api(`/api/announcements/${id}`, { method: "DELETE" });
        toast("ok", t("Duyuru silindi."));
        router.refresh();
      } catch (e) {
        toast("error", (e as Error).message);
      }
    }}><Trash2 size={14} aria-hidden /></button>
  );
}
