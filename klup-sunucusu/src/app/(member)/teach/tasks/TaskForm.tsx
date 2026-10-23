"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/providers";
import { Field, TextAreaField } from "@/components/ui/Field";
import { ApiError, api } from "@/lib/api-client";
import { DIFFICULTY_LABEL, KIND_LABEL } from "@/components/classroom/labels";

export type TaskValues = {
  title: string;
  description: string;
  kind: string;
  difficulty: string;
  audience: "ALL" | "SELECTED";
  targetUsernames: string;
  startsAt: string; // datetime-local
  dueAt: string;
  allowLate: boolean;
  allowResubmit: boolean;
  requireText: boolean;
  requireFile: boolean;
  maxScore: number;
  rubric: { criterion: string; points: number }[];
  xpRuleKey: string;
  xpAmount: string; // boş → kural varsayılanı
};

export const EMPTY_TASK: TaskValues = {
  title: "", description: "", kind: "TEXT", difficulty: "MEDIUM", audience: "ALL", targetUsernames: "", startsAt: "", dueAt: "",
  allowLate: false, allowResubmit: true, requireText: true, requireFile: false, maxScore: 100, rubric: [], xpRuleKey: "task.approved", xpAmount: "",
};

const XP_RULE_LABEL: Record<string, string> = { "task.approved": "Görev (varsayılan)", "task.daily": "Günlük görev", "task.weekly": "Haftalık görev" };

// Yerel saat ↔ ISO: datetime-local girdisi saat dilimi taşımaz, tarayıcının yerel saatiyle yorumlanır.
export const toLocalInput = (d: string | Date | null | undefined) => {
  if (!d) return "";
  const x = new Date(d);
  return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function TaskForm({ initial, id, xpDefaults }: { initial: TaskValues; id?: string; xpDefaults: Record<string, number> }) {
  const toast = useToast();
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof TaskValues>(k: K, val: TaskValues[K]) => setV((x) => ({ ...x, [k]: val }));
  const rubricSum = v.rubric.reduce((a, r) => a + (Number(r.points) || 0), 0);

  async function save(publish: boolean) {
    setBusy(true);
    setFields({});
    const body = {
      title: v.title,
      description: v.description,
      kind: v.kind,
      difficulty: v.difficulty,
      audience: v.audience,
      targetUsernames: v.audience === "SELECTED" ? v.targetUsernames.split(/[\s,]+/).filter(Boolean) : [],
      ...(v.startsAt ? { startsAt: new Date(v.startsAt).toISOString() } : {}),
      dueAt: v.dueAt ? new Date(v.dueAt).toISOString() : null,
      allowLate: v.allowLate,
      allowResubmit: v.allowResubmit,
      requireText: v.requireText,
      requireFile: v.requireFile,
      maxScore: Number(v.maxScore),
      rubric: v.rubric.map((r) => ({ criterion: r.criterion, points: Number(r.points) })),
      xpRuleKey: v.xpRuleKey,
      xpAmount: v.xpAmount === "" ? null : Number(v.xpAmount),
    };
    try {
      let target = id;
      if (id) await api(`/api/teach/tasks/${encodeURIComponent(id)}`, { method: "PUT", body });
      else target = (await api<{ id: string }>("/api/teach/tasks", { body })).id;
      if (publish && target) await api(`/api/teach/tasks/${encodeURIComponent(target)}/status`, { body: { status: "PUBLISHED" } });
      toast("ok", publish ? "Görev yayınlandı; öğrencilere bildirim gitti." : "Görev kaydedildi.");
      router.push(`/teach/tasks/${target}`);
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError) setFields(e.fields);
      toast("error", (e as Error).message);
      setBusy(false);
    }
  }

  return (
    <form className="stack" onSubmit={(e) => { e.preventDefault(); void save(false); }}>
      <section className="card">
        <div className="card-h"><h2>Görev</h2></div>
        <div className="card-b stack">
          <Field label="Başlık" required minLength={3} maxLength={140} value={v.title} onChange={(e) => set("title", e.target.value)} error={fields.title} />
          <TextAreaField label="Açıklama" rows={8} maxLength={20000} value={v.description} onChange={(e) => set("description", e.target.value)} error={fields.description} hint="Düz metin; adımlar, beklenen çıktı, kurallar. Gerçek kişi/kurum hedef alınmaz — yalnız laboratuvar verisi." />
          <div className="form-grid">
            <div className="field">
              <label htmlFor="t-kind">Tür</label>
              <select id="t-kind" className="input select" value={v.kind} onChange={(e) => set("kind", e.target.value)}>
                {Object.entries(KIND_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="t-diff">Zorluk</label>
              <select id="t-diff" className="input select" value={v.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
                {Object.entries(DIFFICULTY_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
            <Field label="Başlangıç (boş = hemen)" type="datetime-local" value={v.startsAt} onChange={(e) => set("startsAt", e.target.value)} error={fields.startsAt} />
            <Field label="Son teslim (boş = yok)" type="datetime-local" value={v.dueAt} onChange={(e) => set("dueAt", e.target.value)} error={fields.dueAt} />
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-h"><h2>Kime ve nasıl</h2></div>
        <div className="card-b stack">
          <div className="seg" role="group" aria-label="Hedef kitle">
            <button type="button" aria-pressed={v.audience === "ALL"} onClick={() => set("audience", "ALL")}>Tüm öğrenciler</button>
            <button type="button" aria-pressed={v.audience === "SELECTED"} onClick={() => set("audience", "SELECTED")}>Seçili öğrenciler</button>
          </div>
          {v.audience === "SELECTED" && (
            <TextAreaField label="Öğrenci kullanıcı adları" rows={3} value={v.targetUsernames} onChange={(e) => set("targetUsernames", e.target.value)} error={fields.targetUsernames} hint="Virgül, boşluk ya da satırla ayır (ör. ogrenci.ali, ogrenci.ayse)." />
          )}
          <div className="form-grid">
            <label className="check"><input type="checkbox" checked={v.requireText} onChange={(e) => set("requireText", e.target.checked)} /> Metin cevabı zorunlu</label>
            <label className="check"><input type="checkbox" checked={v.requireFile} onChange={(e) => set("requireFile", e.target.checked)} /> En az bir dosya zorunlu</label>
            <label className="check"><input type="checkbox" checked={v.allowLate} onChange={(e) => set("allowLate", e.target.checked)} /> Geç teslime izin ver (işaretlenir)</label>
            <label className="check"><input type="checkbox" checked={v.allowResubmit} onChange={(e) => set("allowResubmit", e.target.checked)} /> Düzeltme istenince yeniden teslim</label>
          </div>
          {fields.requireText && <span className="err" role="alert">{fields.requireText}</span>}
        </div>
      </section>

      <section className="card">
        <div className="card-h"><h2>Puanlama ve XP</h2></div>
        <div className="card-b stack">
          <div className="form-grid">
            <Field label="En yüksek puan" type="number" min={1} max={1000} value={v.maxScore} onChange={(e) => set("maxScore", Number(e.target.value))} error={fields.maxScore} />
            <div className="field">
              <label htmlFor="t-xp">XP kuralı</label>
              <select id="t-xp" className="input select" value={v.xpRuleKey} onChange={(e) => set("xpRuleKey", e.target.value)}>
                {Object.entries(XP_RULE_LABEL).map(([k, l]) => <option key={k} value={k}>{l} · {xpDefaults[k] ?? "?"} XP</option>)}
              </select>
            </div>
            <Field label="Özel XP (boş = kural)" type="number" min={0} max={500} value={v.xpAmount} onChange={(e) => set("xpAmount", e.target.value)} error={fields.xpAmount} hint="0–500; onayda bir kez verilir." />
          </div>
          <div className="stack-sm">
            <div className="row-between">
              <div className="eyebrow">Ölçütler (rubrik)</div>
              <span className={v.rubric.length && rubricSum !== Number(v.maxScore) ? "small text-warn" : "small faint"}>{v.rubric.length ? `toplam ${rubricSum} / ${v.maxScore}` : "isteğe bağlı"}</span>
            </div>
            {v.rubric.map((r, i) => (
              <div key={i} className="row" style={{ gap: 6 }}>
                <input className="input" style={{ flex: 1 }} aria-label={`Ölçüt ${i + 1}`} maxLength={120} placeholder="ör. Doğru IOC'leri buldu" value={r.criterion} onChange={(e) => set("rubric", v.rubric.map((x, j) => (j === i ? { ...x, criterion: e.target.value } : x)))} />
                <input className="input" style={{ width: 90 }} type="number" min={1} max={1000} aria-label={`Ölçüt ${i + 1} puanı`} value={r.points} onChange={(e) => set("rubric", v.rubric.map((x, j) => (j === i ? { ...x, points: Number(e.target.value) } : x)))} />
                <button type="button" className="btn btn-sm btn-ghost" aria-label={`Ölçüt ${i + 1} sil`} onClick={() => set("rubric", v.rubric.filter((_, j) => j !== i))}><Trash2 size={14} aria-hidden /></button>
              </div>
            ))}
            {v.rubric.length < 12 && <button type="button" className="btn btn-sm btn-ghost" style={{ alignSelf: "flex-start" }} onClick={() => set("rubric", [...v.rubric, { criterion: "", points: 10 }])}><Plus size={14} aria-hidden /> Ölçüt ekle</button>}
            {fields.rubric && <span className="err" role="alert">{fields.rubric}</span>}
          </div>
        </div>
      </section>

      <div className="row">
        <button className="btn" disabled={busy}>{id ? "Kaydet" : "Taslak olarak kaydet"}</button>
        {!id && <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void save(true)}>Kaydet ve yayınla</button>}
      </div>
    </form>
  );
}
