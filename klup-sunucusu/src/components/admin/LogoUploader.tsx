"use client";

import { useRef, useState } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";

const MAX = 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/webp"];

export function LogoUploader({ initialHasLogo, initialVersion }: { initialHasLogo: boolean; initialVersion: number }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [hasLogo, setHasLogo] = useState(initialHasLogo);
  const [version, setVersion] = useState(initialVersion);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    // İstemci kontrolü yalnızca kullanıcı deneyimi içindir; sunucu içeriği ayrıca doğrular.
    if (!TYPES.includes(file.type)) return toast("error", "Yalnızca PNG, JPEG veya WebP yüklenebilir.");
    if (file.size > MAX) return toast("error", "Logo en fazla 1 MB olabilir.");
    const form = new FormData();
    form.append("logo", file);
    setBusy(true);
    try {
      await api("/api/admin/settings/logo", { method: "POST", form });
      setHasLogo(true);
      setVersion(Date.now());
      toast("ok", "Logo güncellendi.");
    } catch (e) {
      toast("error", (e as Error).message);
    }
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  async function remove() {
    setBusy(true);
    try {
      await api("/api/admin/settings/logo", { method: "DELETE" });
      setHasLogo(false);
      toast("ok", "Logo kaldırıldı.");
    } catch (e) {
      toast("error", (e as Error).message);
    }
    setBusy(false);
  }

  return (
    <div className="row">
      {hasLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/branding/logo?v=${version}`} alt="Mevcut kulüp logosu" width={64} height={64} style={{ borderRadius: 12, objectFit: "cover", border: "1px solid var(--line)" }} />
      ) : (
        <div className="brand-logo" style={{ width: 64, height: 64, fontSize: 12 }} aria-hidden>logo yok</div>
      )}
      <input ref={input} type="file" accept={TYPES.join(",")} className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      <button type="button" className="btn" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? <span className="spinner" aria-hidden /> : <ImageUp size={16} aria-hidden />} Logo yükle
      </button>
      {hasLogo && (
        <button type="button" className="btn btn-danger" onClick={remove} disabled={busy}>
          <Trash2 size={16} aria-hidden /> Kaldır
        </button>
      )}
    </div>
  );
}
