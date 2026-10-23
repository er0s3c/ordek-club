"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import { useToast } from "@/components/providers";
import { ApiError, api } from "@/lib/api-client";
import { FILE_ACCEPT } from "@/components/classroom/labels";

export function UploadForm({ maxMb }: { maxMb: number }) {
  const toast = useToast();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [scope, setScope] = useState<"CLUB" | "USERS">("CLUB");
  const [usernames, setUsernames] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const files = Array.from(fileRef.current?.files ?? []);
    if (!files.length) return toast("error", "Dosya seç.");
    const big = files.find((f) => f.size > maxMb * 1024 * 1024);
    if (big) return toast("error", `${big.name} ${maxMb} MB sınırını aşıyor.`);
    setBusy(true);
    let done = 0;
    try {
      for (const f of files) {
        const form = new FormData();
        form.set("file", f);
        form.set("scope", scope);
        form.set("description", description);
        if (scope === "USERS") form.set("usernames", usernames);
        await api("/api/files", { method: "POST", form });
        done++;
      }
      toast("ok", `${done} dosya paylaşıldı.`);
      if (fileRef.current) fileRef.current.value = "";
      setDescription("");
      router.refresh();
    } catch (err) {
      toast("error", `${done ? `${done} dosya yüklendi; ` : ""}${err instanceof ApiError ? err.message : "Yükleme başarısız."}`);
      if (done) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card" aria-labelledby="up-h">
      <div className="card-h"><h2 id="up-h"><Upload size={15} aria-hidden /> Dosya paylaş</h2><span className="tiny faint">dosya başına en fazla {maxMb} MB</span></div>
      <form className="card-b stack-sm" onSubmit={submit}>
        <div className="seg" role="group" aria-label="Kimler görsün">
          <button type="button" aria-pressed={scope === "CLUB"} onClick={() => setScope("CLUB")}>Tüm kulüp</button>
          <button type="button" aria-pressed={scope === "USERS"} onClick={() => setScope("USERS")}>Seçili üyeler</button>
        </div>
        {scope === "USERS" && (
          <div className="field">
            <label htmlFor="up-users">Kullanıcı adları</label>
            <input id="up-users" className="input" value={usernames} onChange={(e) => setUsernames(e.target.value)} placeholder="ogrenci.ali, ogrenci.ayse" />
          </div>
        )}
        <div className="form-grid">
          <div className="field">
            <label htmlFor="up-file">Dosyalar</label>
            <input id="up-file" ref={fileRef} type="file" multiple className="input" accept={FILE_ACCEPT} />
            <span className="hint">PDF, görsel, metin/log, PCAP, ZIP. Çalıştırılabilir dosyalar reddedilir.</span>
          </div>
          <div className="field">
            <label htmlFor="up-desc">Açıklama (isteğe bağlı)</label>
            <input id="up-desc" className="input" maxLength={300} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <button className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start" }} disabled={busy}>{busy ? "Yükleniyor…" : "Paylaş"}</button>
        <p className="tiny faint" style={{ margin: 0 }}>Görev ekleri görev sayfasından yüklenir ve yalnız o görevi görenlere açılır.</p>
      </form>
    </section>
  );
}

export function FileActions({ id, name, canDelete }: { id: string; name: string; canDelete: boolean }) {
  const toast = useToast();
  const router = useRouter();
  return (
    <div className="row" style={{ gap: 4, justifyContent: "flex-end" }}>
      <a className="btn btn-sm btn-ghost" href={`/api/files/${id}`} download aria-label={`${name} indir`}><Download size={14} aria-hidden /></a>
      {canDelete && (
        <button className="btn btn-sm btn-ghost" aria-label={`${name} sil`} onClick={async () => {
          if (!window.confirm(`"${name}" silinsin mi? İçerik diskten kaldırılır.`)) return;
          try {
            await api(`/api/files/${id}`, { method: "DELETE" });
            toast("ok", "Dosya silindi.");
            router.refresh();
          } catch (e) {
            toast("error", (e as Error).message);
          }
        }}><Trash2 size={14} aria-hidden /></button>
      )}
    </div>
  );
}
