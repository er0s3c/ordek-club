"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, UserMinus, UserPlus } from "lucide-react";
import { useToast } from "@/components/providers";
import { Field, TextAreaField } from "@/components/ui/Field";
import { ApiError, api } from "@/lib/api-client";
import type { GroupValues } from "@/components/classroom/form-values";

const EMPTY: GroupValues = { kind: "CLASS", name: "", description: "", startsAt: "", endsAt: "", location: "", selfJoin: false, capacity: "" };

// Oluşturma ve düzenleme formu (id verilirse düzenler).
export function GroupForm({ id, initial }: { id?: string; initial?: GroupValues }) {
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
        toast("ok", "Kaydedildi.");
        router.refresh();
      } else {
        const r = await api<{ id: string }>("/api/groups", { body });
        toast("ok", v.kind === "CLASS" ? "Sınıf oluşturuldu; şimdi üyeleri ekle." : "Etkinlik oluşturuldu.");
        router.push(`/groups/${r.id}`);
      }
    } catch (err) {
      if (err instanceof ApiError) setFields(err.fields);
      toast("error", (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={() => setOpen(true)}><Plus size={16} aria-hidden /> Sınıf ya da etkinlik oluştur</button>;
  return (
    <section className="card" aria-labelledby="gf-h">
      <div className="card-h"><h2 id="gf-h">{id ? "Bilgileri düzenle" : "Yeni sınıf / etkinlik"}</h2></div>
      <form className="card-b stack-sm" onSubmit={save}>
        {!id && (
          <div className="seg" role="group" aria-label="Tür">
            <button type="button" aria-pressed={v.kind === "CLASS"} onClick={() => set("kind", "CLASS")}>Sınıf / şube</button>
            <button type="button" aria-pressed={v.kind === "EVENT"} onClick={() => set("kind", "EVENT")}>Etkinlik</button>
          </div>
        )}
        <Field label="Ad" required minLength={2} maxLength={100} value={v.name} onChange={(e) => set("name", e.target.value)} error={fields.name} placeholder={v.kind === "CLASS" ? "ör. 2026 Güz — Başlangıç A" : "ör. Cuma CTF gecesi"} />
        <TextAreaField label="Açıklama" rows={3} maxLength={5000} value={v.description} onChange={(e) => set("description", e.target.value)} error={fields.description} />
        {v.kind === "EVENT" && (
          <>
            <div className="form-grid">
              <Field label="Başlangıç" type="datetime-local" value={v.startsAt} onChange={(e) => set("startsAt", e.target.value)} error={fields.startsAt} />
              <Field label="Bitiş" type="datetime-local" value={v.endsAt} onChange={(e) => set("endsAt", e.target.value)} error={fields.endsAt} />
              <Field label="Yer" maxLength={200} value={v.location} onChange={(e) => set("location", e.target.value)} error={fields.location} />
              <Field label="Kapasite (boş = sınırsız)" type="number" min={1} max={10000} value={v.capacity} onChange={(e) => set("capacity", e.target.value)} error={fields.capacity} />
            </div>
            <label className="check"><input type="checkbox" checked={v.selfJoin} onChange={(e) => set("selfJoin", e.target.checked)} /> Öğrenciler kendileri kayıt olabilsin</label>
          </>
        )}
        <div className="row">
          <button className="btn btn-primary btn-sm" disabled={busy}>{id ? "Kaydet" : "Oluştur"}</button>
          {!id && <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOpen(false)}>Vazgeç</button>}
        </div>
      </form>
    </section>
  );
}

export function JoinButton({ id, joined, full }: { id: string; joined: boolean; full: boolean }) {
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    try {
      await api(`/api/groups/${id}/join`, { method: joined ? "DELETE" : "POST" });
      toast("ok", joined ? "Kaydın silindi." : "Etkinliğe kaydoldun.");
      router.refresh();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return joined ? (
    <button className="btn btn-sm" disabled={busy} onClick={go}><UserMinus size={14} aria-hidden /> Kaydımı sil</button>
  ) : (
    <button className="btn btn-sm btn-primary" disabled={busy || full} onClick={go}><UserPlus size={14} aria-hidden /> {full ? "Dolu" : "Kaydol"}</button>
  );
}

export function MembersEditor({ id, initial }: { id: string; initial: string[] }) {
  const toast = useToast();
  const router = useRouter();
  const [text, setText] = useState(initial.join("\n"));
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try {
      const r = await api<{ count: number }>(`/api/groups/${id}/members`, { method: "PUT", body: { usernames: text.split(/[\s,;]+/).filter(Boolean) } });
      toast("ok", `${r.count} üye kaydedildi.`);
      router.refresh();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="stack-sm">
      <TextAreaField label="Üyeler (öğrenci kullanıcı adları)" rows={8} value={text} onChange={(e) => setText(e.target.value)} hint="Her satıra bir kullanıcı adı ya da virgülle ayır. Listede olmayanlar gruptan çıkarılır." />
      <button className="btn btn-sm btn-primary" style={{ alignSelf: "flex-start" }} disabled={busy} onClick={save}>Üyeleri kaydet</button>
    </div>
  );
}

export function ArchiveGroup({ id }: { id: string }) {
  const toast = useToast();
  const router = useRouter();
  return (
    <button className="btn btn-danger btn-sm" onClick={async () => {
      if (!window.confirm("Grup arşivlensin mi? Ona hedeflenmiş görev ve dosyalar üyelerine görünmez olur.")) return;
      try {
        await api(`/api/groups/${id}`, { method: "DELETE" });
        toast("ok", "Grup arşivlendi.");
        router.replace("/groups");
      } catch (e) {
        toast("error", (e as Error).message);
      }
    }}>Arşivle</button>
  );
}
