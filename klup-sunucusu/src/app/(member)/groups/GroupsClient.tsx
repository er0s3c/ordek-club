"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, UserMinus, UserPlus } from "lucide-react";
import { useToast } from "@/components/providers";
import { Field, TextAreaField } from "@/components/ui/Field";
import { ApiError, api } from "@/lib/api-client";
import type { GroupValues } from "@/components/classroom/form-values";
import { useT } from "@/i18n/client";

const EMPTY: GroupValues = { kind: "CLASS", name: "", description: "", startsAt: "", endsAt: "", location: "", selfJoin: false, capacity: "" };

// Oluşturma ve düzenleme formu (id verilirse düzenler).
export function GroupForm({ id, initial }: { id?: string; initial?: GroupValues }) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(!!id);
  const [v, setV] = useState<GroupValues>(initial ?? EMPTY);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof GroupValues>(k: K, val: GroupValues[K]) => setV((x) => ({ ...x, [k]: val }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFields({});
    const body = {
      kind: v.kind,
      name: v.name,
      description: v.description,
      startsAt: v.startsAt ? new Date(v.startsAt).toISOString() : null,
      endsAt: v.endsAt ? new Date(v.endsAt).toISOString() : null,
      location: v.location,
      selfJoin: v.kind === "EVENT" && v.selfJoin,
      capacity: v.capacity ? Number(v.capacity) : null,
    };
    try {
      if (id) {
        await api(`/api/groups/${id}`, { method: "PUT", body });
        toast("ok", t("Kaydedildi."));
        router.refresh();
      } else {
        const r = await api<{ id: string }>("/api/groups", { body });
        toast("ok", v.kind === "CLASS" ? t("Sınıf oluşturuldu; şimdi üyeleri ekle.") : t("Etkinlik oluşturuldu."));
        router.push(`/groups/${r.id}`);
      }
    } catch (err) {
      if (err instanceof ApiError) setFields(err.fields);
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={() => setOpen(true)}><Plus size={16} aria-hidden />{" "}{t("Sınıf ya da etkinlik oluştur")}</button>;
  return (
    <section className="card" aria-labelledby="gf-h">
      <div className="card-h"><h2 id="gf-h">{id ? t("Bilgileri düzenle") : t("Yeni sınıf / etkinlik")}</h2></div>
      <form className="card-b stack-sm" onSubmit={save}>
        {!id && (
          <div className="seg" role="group" aria-label={t("Tür")}>
            <button type="button" aria-pressed={v.kind === "CLASS"} onClick={() => set("kind", "CLASS")}>{t("Sınıf / şube")}</button>
            <button type="button" aria-pressed={v.kind === "EVENT"} onClick={() => set("kind", "EVENT")}>{t("Etkinlik")}</button>
          </div>
        )}
        <Field label={t("Ad")} required minLength={2} maxLength={100} value={v.name} onChange={(e) => set("name", e.target.value)} error={fields.name} placeholder={v.kind === "CLASS" ? t("ör. 2026 Güz — Başlangıç A") : t("ör. Cuma CTF gecesi")} />
        <TextAreaField label={t("Açıklama")} rows={3} maxLength={5000} value={v.description} onChange={(e) => set("description", e.target.value)} error={fields.description} />
        {v.kind === "EVENT" && (
          <>
            <div className="form-grid">
              <Field label={t("Başlangıç")} type="datetime-local" value={v.startsAt} onChange={(e) => set("startsAt", e.target.value)} error={fields.startsAt} />
              <Field label={t("Bitiş")} type="datetime-local" value={v.endsAt} onChange={(e) => set("endsAt", e.target.value)} error={fields.endsAt} />
              <Field label={t("Yer")} maxLength={200} value={v.location} onChange={(e) => set("location", e.target.value)} error={fields.location} />
              <Field label={t("Kapasite (boş = sınırsız)")} type="number" min={1} max={10000} value={v.capacity} onChange={(e) => set("capacity", e.target.value)} error={fields.capacity} />
            </div>
            <label className="check"><input type="checkbox" checked={v.selfJoin} onChange={(e) => set("selfJoin", e.target.checked)} />{" "}{t("Öğrenciler kendileri kayıt olabilsin")}</label>
          </>
        )}
        <div className="row">
          <button className="btn btn-primary btn-sm" disabled={busy}>{id ? t("Kaydet") : t("Oluştur")}</button>
          {!id && <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen(false)}>{t("Vazgeç")}</button>}
        </div>
      </form>
    </section>
  );
}

export function JoinButton({ id, joined, full }: { id: string; joined: boolean; full: boolean }) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    try {
      await api(`/api/groups/${id}/join`, { method: joined ? "DELETE" : "POST" });
      toast("ok", joined ? t("Kaydın silindi.") : t("Etkinliğe kaydoldun."));
      router.refresh();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return joined ? (
    <button className="btn btn-sm" disabled={busy} onClick={go}><UserMinus size={14} aria-hidden />{" "}{t("Kaydımı sil")}</button>
  ) : (
    <button className="btn btn-sm btn-primary" disabled={busy || full} onClick={go}><UserPlus size={14} aria-hidden /> {full ? t("Dolu") : t("Kaydol")}</button>
  );
}

export function MembersEditor({ id, initial }: { id: string; initial: string[] }) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const [text, setText] = useState(initial.join("\n"));
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try {
      const r = await api<{ count: number }>(`/api/groups/${id}/members`, { method: "PUT", body: { usernames: text.split(/[\s,;]+/).filter(Boolean) } });
      toast("ok", t("{count} üye kaydedildi.", { count: r.count }));
      router.refresh();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stack-sm">
      <TextAreaField label={t("Üyeler (öğrenci kullanıcı adları)")} rows={8} value={text} onChange={(e) => setText(e.target.value)} hint={t("Her satıra bir kullanıcı adı ya da virgülle ayır. Listede olmayanlar gruptan çıkarılır.")} />
      <button className="btn btn-sm btn-primary" style={{ alignSelf: "flex-start" }} disabled={busy} onClick={save}>{t("Üyeleri kaydet")}</button>
    </div>
  );
}

export function ArchiveGroup({ id }: { id: string }) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  return (
    <button className="btn btn-danger btn-sm" onClick={async () => {
      if (!window.confirm(t("Grup arşivlensin mi? Ona hedeflenmiş görev ve dosyalar üyelerine görünmez olur."))) return;
      try {
        await api(`/api/groups/${id}`, { method: "DELETE" });
        toast("ok", t("Grup arşivlendi."));
        router.replace("/groups");
      } catch (e) {
        toast("error", (e as Error).message);
      }
    }}>{t("Arşivle")}</button>
  );
}
