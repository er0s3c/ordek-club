"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useT } from "@/i18n/client";
export function FeatureControls({ features }: { features: { key: string; label: string; enabled: boolean; available: boolean }[] }) {
  const t = useT();
  const router = useRouter(); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
  return <div className="stack"><p className="muted">{t("Özellikleri pilot gruba açmadan önce migration ve testleri tamamla. Geliştirmesi tamamlanmamış paketler açılamaz.")}</p>{message && <p role="status">{message}</p>}{features.map(f=><section className="card card-b learning-agenda" key={f.key}><span><strong>{f.label}</strong><small>{f.available ? (f.enabled ? t("Açık") : t("Kapalı")) : t("Henüz teslim edilmedi")}</small></span><button className="btn" disabled={busy||!f.available} onClick={async()=>{setBusy(true);try{await api("/api/admin/features",{method:"PATCH",body:{key:f.key,enabled:!f.enabled}});router.refresh();setMessage(t("Özellik ayarı kaydedildi."));}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}}>{f.enabled?t("Kapat"):t("Aç")}</button></section>)}</div>;
}
