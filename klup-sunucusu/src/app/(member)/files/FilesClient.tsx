"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { useToast } from "@/components/providers";
import { ApiError, api } from "@/lib/api-client";
import { FILE_ACCEPT } from "@/components/classroom/labels";
import { useT } from "@/i18n/client";

export function UploadForm({ maxMb, groups }: { maxMb: number; groups: { id: string; name: string; kind: "CLASS" | "EVENT" }[] }) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [scope, setScope] = useState<"CLUB" | "USERS" | "GROUP">("CLUB");
  const [groupId, setGroupId] = useState("");
  const [usernames, setUsernames] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const files = Array.from(fileRef.current?.files ?? []);
    if (!files.length) return toast("error", t("Dosya seç."));
    const big = files.find((f) => f.size > maxMb * 1024 * 1024);
    if (big) return toast("error", t("{name} {maxMb} MB sınırını aşıyor.", { name: big.name, maxMb }));
    setBusy(true);
    let done = 0;
    try {
      for (const f of files) {
        const form = new FormData();
        form.set("file", f);
        form.set("scope", scope);
        form.set("description", description);
        if (scope === "USERS") form.set("usernames", usernames);
        if (scope === "GROUP") form.set("groupId", groupId);
        await api("/api/files", { method: "POST", form });
        done++;
      }
      toast("ok", t("{done} dosya paylaşıldı.", { done }));
      if (fileRef.current) fileRef.current.value = "";
      setDescription("");
      router.refresh();
    } catch (err) {
      toast("error", `${done ? t("{done} dosya yüklendi; ", { done }) : ""}${err instanceof ApiError ? err.message : t("Yükleme başarısız.")}`);
      if (done) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card" aria-labelledby="up-h">
      <div className="card-h"><h2 id="up-h"><Upload size={15} aria-hidden />{" "}{t("Dosya paylaş")}</h2><span className="tiny faint">{t("dosya başına en fazla {maxMb} MB", { maxMb })}</span></div>
      <form className="card-b stack-sm" onSubmit={submit}>
        <div className="seg" role="group" aria-label={t("Kimler görsün")}>
          <button type="button" aria-pressed={scope === "CLUB"} onClick={() => setScope("CLUB")}>{t("Tüm kulüp")}</button>
          <button type="button" aria-pressed={scope === "USERS"} onClick={() => setScope("USERS")}>{t("Seçili üyeler")}</button>
          <button type="button" aria-pressed={scope === "GROUP"} disabled={!groups.length} onClick={() => setScope("GROUP")}>{t("Sınıf / etkinlik")}</button>
        </div>
        {scope === "GROUP" && (
          <div className="field">
            <label htmlFor="up-group">{t("Sınıf ya da etkinlik")}</label>
            <select id="up-group" className="input select" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
              <option value="">{t("— seç —")}</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.kind === "CLASS" ? t("Sınıf") : t("Etkinlik")}: {g.name}</option>)}
            </select>
          </div>
        )}
        {scope === "USERS" && (
          <div className="field">
            <label htmlFor="up-users">{t("Kullanıcı adları")}</label>
            <input id="up-users" className="input" value={usernames} onChange={(e) => setUsernames(e.target.value)} placeholder="ogrenci.ali, ogrenci.ayse" />
          </div>
        )}
        <div className="form-grid">
          <div className="field">
            <label htmlFor="up-file">{t("Dosyalar")}</label>
            <input id="up-file" ref={fileRef} type="file" multiple className="input" accept={FILE_ACCEPT} />
            <span className="hint">{t("PDF, görsel, metin/log, PCAP, ZIP. Çalıştırılabilir dosyalar reddedilir.")}</span>
          </div>
          <div className="field">
            <label htmlFor="up-desc">{t("Açıklama (isteğe bağlı)")}</label>
            <input id="up-desc" className="input" maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start" }} disabled={busy}>{busy ? t("Yükleniyor…") : t("Paylaş")}</button>
        <p className="tiny faint" style={{ margin: 0 }}>{t("Görev ekleri görev sayfasından yüklenir ve yalnız o görevi görenlere açılır.")}</p>
      </form>
    </section>
  );
}

export function FileActions({ id, name, canDelete }: { id: string; name: string; canDelete: boolean }) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  return (
    <div className="row" style={{ gap: 4, justifyContent: "flex-end" }}>
      <a className="btn btn-sm btn-ghost" href={`/api/files/${id}`} download aria-label={t("{name} indir", { name })}><Download size={14} aria-hidden /></a>
      {canDelete && (
        <button className="btn btn-sm btn-ghost" aria-label={t("{name} sil", { name })} onClick={async () => {
          if (!window.confirm(t("\"{name}\" silinsin mi? İçerik diskten kaldırılır.", { name }))) return;
          try {
            await api(`/api/files/${id}`, { method: "DELETE" });
            toast("ok", t("Dosya silindi."));
            router.refresh();
          } catch (e) {
            toast("error", (e as Error).message);
          }
        }}><Trash2 size={14} aria-hidden /></button>
      )}
    </div>
  );
}
