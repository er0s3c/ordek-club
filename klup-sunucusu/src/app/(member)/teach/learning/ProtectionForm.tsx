"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useT } from "@/i18n/client";
export function ProtectionForm({ groups }: { groups: { id:string;name:string }[] }) {
  const t = useT();
  const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);const router=useRouter();
  return <form className="card card-b stack learning-settings" onSubmit={async e=>{e.preventDefault();const f=new FormData(e.currentTarget);setBusy(true);try{await api("/api/learning/protection",{body:{groupId:f.get("groupId"),startsOn:f.get("startsOn"),endsOn:f.get("endsOn")}});setMessage(t("Sınav dönemi koruması kaydedildi."));router.refresh();}catch(err){setMessage((err as Error).message);}finally{setBusy(false);}}}><h2>{t("Sınav dönemi koruması")}</h2><p className="muted">{t("Yarından başlayan en fazla 31 günlük koruma tanımla. Koruma, mevcut sınıf üyelerinin serisini dondurur; XP veya çalışma günü üretmez.")}</p><label>{t("Sınıf")}<select className="input" name="groupId" required>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label><label>{t("Başlangıç")}<input className="input" type="date" name="startsOn" required /></label><label>{t("Bitiş")}<input className="input" type="date" name="endsOn" required /></label><button className="btn btn-primary" disabled={busy||!groups.length}>{t("Korumayı tanımla")}</button><p role="status">{message}</p></form>;
}
