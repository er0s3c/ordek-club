"use client";
// Beceri anahtarları sunucudaki SKILLS listesiyle aynıdır (src/server/academy/placement.ts).
const SKILL_OPTIONS = [{ key: "ethics", tr: "Etik ve kapsam" }, { key: "network", tr: "Ağ" }, { key: "web", tr: "Web" }, { key: "linux", tr: "Linux" }, { key: "windows", tr: "Windows" }, { key: "crypto", tr: "Kriptografi" }, { key: "incident", tr: "Olay inceleme" }, { key: "ai", tr: "Yapay zekâ" }];

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/providers";
import { Field, TextAreaField } from "@/components/ui/Field";
import { ApiError, api } from "@/lib/api-client";
import { DIFFICULTY_LABEL, KIND_LABEL } from "@/components/classroom/labels";
import type { TaskValues } from "@/components/classroom/form-values";
import { QuizEditor, cleanQuiz, type QDraft } from "./QuizEditor";
import { useT } from "@/i18n/client";

type GroupOpt = { id: string; name: string; kind: "CLASS" | "EVENT"; members: number };

// "Takım adı: kullanıcı1, kullanıcı2" satırları
const parseTeams = (text: string) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const at = l.indexOf(":");
      return at < 0 ? { name: l, usernames: [] as string[] } : { name: l.slice(0, at).trim(), usernames: l.slice(at + 1).split(/[\s,;]+/).map((u) => u.trim().toLowerCase()).filter(Boolean) };
    });

const XP_RULE_LABEL: Record<string, string> = { "task.approved": "Görev (varsayılan)", "task.daily": "Günlük görev", "task.weekly": "Haftalık görev" };

export function TaskForm({ initial, id, xpDefaults, groups, locked = false }: { initial: TaskValues; id?: string; xpDefaults: Record<string, number>; groups: GroupOpt[]; locked?: boolean }) {
  const t = useT();
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
      groupId: v.audience === "GROUP" ? v.groupId || null : null,
      teamMode: v.teamMode,
      teams: v.teamMode ? parseTeams(v.teams) : [],
      quiz: v.kind === "QUIZ" ? cleanQuiz(v.quiz as QDraft[]) : undefined,
      passPercent: Number(v.passPercent),
      maxAttempts: v.maxAttempts === "" ? null : Number(v.maxAttempts),
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
      checklist: v.checklist.split("\n").map((x) => x.trim()).filter(Boolean),
      skills: v.skills,
      peerReviewEnabled: v.peerReviewEnabled,
      peerReviewCount: Number(v.peerReviewCount),
    };
    try {
      let target = id;
      if (id) await api(`/api/teach/tasks/${encodeURIComponent(id)}`, { method: "PUT", body });
      else target = (await api<{ id: string }>("/api/teach/tasks", { body })).id;
      if (publish && target) await api(`/api/teach/tasks/${encodeURIComponent(target)}/status`, { body: { status: "PUBLISHED" } });
      toast("ok", publish ? t("Görev yayınlandı; öğrencilere bildirim gitti.") : t("Görev kaydedildi."));
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
      <div className="task-form-cols">
        <div className="stack task-form-main">
          <section className="card">
            <div className="card-h"><h2>{t("Görev")}</h2></div>
            <div className="card-b stack">
              <Field label={t("Başlık")} required minLength={3} maxLength={140} value={v.title} onChange={(e) => set("title", e.target.value)} error={fields.title} />
              <TextAreaField label={t("Açıklama")} rows={8} maxLength={20000} value={v.description} onChange={(e) => set("description", e.target.value)} error={fields.description} hint={t("Düz metin; adımlar, beklenen çıktı, kurallar. Gerçek kişi/kurum hedef alınmaz — yalnız laboratuvar verisi.")} />
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="t-kind">{t("Tür")}</label>
                  <select id="t-kind" className="input select" value={v.kind} onChange={(e) => set("kind", e.target.value)}>
                    {Object.entries(KIND_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="t-diff">{t("Zorluk")}</label>
                  <select id="t-diff" className="input select" value={v.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
                    {Object.entries(DIFFICULTY_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </div>
                <Field label={t("Başlangıç (boş = hemen)")} type="datetime-local" value={v.startsAt} onChange={(e) => set("startsAt", e.target.value)} error={fields.startsAt} />
                <Field label={t("Son teslim (boş = yok)")} type="datetime-local" value={v.dueAt} onChange={(e) => set("dueAt", e.target.value)} error={fields.dueAt} />
              </div>
        </div>
          </section>
          {v.kind === "QUIZ" && (
            <section className="card">
              <div className="card-h"><h2>{t("Sorular (otomatik puanlanır)")}</h2><span className="tiny faint">{t("cevap anahtarı öğrenciye gitmez")}</span></div>
              <div className="card-b stack">
                <div className="form-grid">
                  <Field label={t("Geçme yüzdesi")} type="number" min={0} max={100} value={v.passPercent} onChange={(e) => set("passPercent", Number(e.target.value))} error={fields.passPercent} hint={t("Geçen teslim otomatik onaylanır ve XP verilir.")} />
                  <Field label={t("Deneme hakkı (boş = sınırsız)")} type="number" min={1} max={20} value={v.maxAttempts} onChange={(e) => set("maxAttempts", e.target.value)} error={fields.maxAttempts} />
                </div>
                {locked && <div className="alert alert-warn small">{t("Teslim alındığı için sorular değiştirilemez.")}</div>}
                <fieldset disabled={locked} style={{ border: 0, padding: 0, margin: 0 }}>
                  <QuizEditor value={v.quiz as QDraft[]} onChange={(q) => set("quiz", q)} error={fields.quiz} />
                </fieldset>
              </div>
            </section>
          )}
          <section className="card">
            <div className="card-h"><h2>{t("Puanlama ve XP")}</h2></div>
            <div className="card-b stack">
              <div className="form-grid">
                <Field label={t("En yüksek puan")} type="number" min={1} max={1000} value={v.maxScore} onChange={(e) => set("maxScore", Number(e.target.value))} error={fields.maxScore} />
                <div className="field">
                  <label htmlFor="t-xp">{t("XP kuralı")}</label>
                  <select id="t-xp" className="input select" value={v.xpRuleKey} onChange={(e) => set("xpRuleKey", e.target.value)}>
                    {Object.entries(XP_RULE_LABEL).map(([k, l]) => <option key={k} value={k}>{t("{l} · {v0} XP", { l: t(l), v0: xpDefaults[k] ?? "?" })}</option>)}
                  </select>
                </div>
                <Field label={t("Özel XP (boş = kural)")} type="number" min={0} max={500} value={v.xpAmount} onChange={(e) => set("xpAmount", e.target.value)} error={fields.xpAmount} hint={t("0–500; onayda bir kez verilir.")} />
              </div>
              {v.kind !== "QUIZ" && <div className="stack-sm">
                <div className="row-between">
                  <div className="eyebrow">{t("Ölçütler (rubrik)")}</div>
                  <span className={v.rubric.length && rubricSum !== Number(v.maxScore) ? "small text-warn" : "small faint"}>{v.rubric.length ? t("toplam {rubricSum} / {maxScore}", { rubricSum, maxScore: v.maxScore }) : t("isteğe bağlı")}</span>
                </div>
                {v.rubric.map((r, i) => (
                  <div key={i} className="row" style={{ gap: 6 }}>
                    <input className="input" style={{ flex: 1 }} aria-label={t("Ölçüt {v0}", { v0: i + 1 })} maxLength={120} placeholder={t("ör. Doğru IOC'leri buldu")} value={r.criterion} onChange={(e) => set("rubric", v.rubric.map((x, j) => (j === i ? { ...x, criterion: e.target.value } : x)))} />
                    <input className="input" style={{ width: 90 }} type="number" min={1} max={1000} aria-label={t("Ölçüt {v0} puanı", { v0: i + 1 })} value={r.points} onChange={(e) => set("rubric", v.rubric.map((x, j) => (j === i ? { ...x, points: Number(e.target.value) } : x)))} />
                    <button type="button" className="btn btn-sm btn-ghost" aria-label={t("Ölçüt {v0} sil", { v0: i + 1 })} onClick={() => set("rubric", v.rubric.filter((_, j) => j !== i))}><Trash2 size={14} aria-hidden /></button>
                  </div>
                ))}
                {v.rubric.length < 12 && <button type="button" className="btn btn-sm btn-ghost" style={{ alignSelf: "flex-start" }} onClick={() => set("rubric", [...v.rubric, { criterion: "", points: 10 }])}><Plus size={14} aria-hidden />{" "}{t("Ölçüt ekle")}</button>}
                {fields.rubric && <span className="err" role="alert">{fields.rubric}</span>}
              </div>}
              {v.kind !== "QUIZ" && (
                <div className="stack-sm">
                  <div className="eyebrow">{t("Teslim öncesi kontrol listesi")}</div>
                  <textarea className="textarea" rows={3} maxLength={1700} aria-label={t("Kontrol listesi maddeleri (satır başına bir)")} placeholder={t("Kanıt ekledim\nEtkiyi açıkladım\nÇözüm önerdim")} value={v.checklist} onChange={(e) => set("checklist", e.target.value)} />
                  <span className="hint">{t("Satır başına bir madde (en fazla 10). Öğrenci gönderebilmek için hepsini işaretler.")}</span>
                  {fields.checklist && <span className="err" role="alert">{fields.checklist}</span>}
                </div>
              )}
              <fieldset className="stack-sm">
                <legend className="eyebrow">{t("Beceri etiketleri (beceri haritasında kanıt olur)")}</legend>
                <div className="chips">{SKILL_OPTIONS.map((k) => <button key={k.key} type="button" className="chip" aria-pressed={v.skills.includes(k.key)} onClick={() => set("skills", v.skills.includes(k.key) ? v.skills.filter((x) => x !== k.key) : [...v.skills, k.key])}>{t(k.tr)}</button>)}</div>
              </fieldset>
              {v.kind !== "QUIZ" && !v.teamMode && (
                <div className="row">
                  <label className="check"><input type="checkbox" checked={v.peerReviewEnabled} disabled={!v.rubric.length} onChange={(e) => set("peerReviewEnabled", e.target.checked)} />{" "}{t("Kontrollü akran değerlendirmesi")}{" "}{v.rubric.length ? "" : t("(önce rubrik ekle)")}</label>
                  {v.peerReviewEnabled && <label className="row small">{t("Öğrenci başına")}{" "}<input className="input" style={{ width: 80 }} type="number" min={1} max={5} value={v.peerReviewCount} onChange={(e) => set("peerReviewCount", Number(e.target.value))} />{" "}{t("çalışma")}</label>}
                </div>
              )}
        </div>
          </section>
        </div>
        <div className="stack task-form-side">
          <section className="card">
            <div className="card-h"><h2>{t("Kime ve nasıl")}</h2></div>
            <div className="card-b stack">
              <div className="seg" role="group" aria-label={t("Hedef kitle")}>
                <button type="button" aria-pressed={v.audience === "ALL"} onClick={() => set("audience", "ALL")}>{t("Tüm öğrenciler")}</button>
                <button type="button" aria-pressed={v.audience === "SELECTED"} onClick={() => set("audience", "SELECTED")}>{t("Seçili öğrenciler")}</button>
                <button type="button" aria-pressed={v.audience === "GROUP"} onClick={() => set("audience", "GROUP")} disabled={!groups.length} title={groups.length ? undefined : t("Önce Sınıflar sayfasından bir sınıf ya da etkinlik oluştur")}>{t("Sınıf / etkinlik")}</button>
              </div>
              {v.audience === "GROUP" && !v.teamMode && (
                <div className="field">
                  <label htmlFor="t-group">{t("Sınıf ya da etkinlik")}</label>
                  <select id="t-group" className="input select" value={v.groupId} onChange={(e) => set("groupId", e.target.value)}>
                    <option value="">{t("— seç —")}</option>
                    {groups.map((g) => <option key={g.id} value={g.id}>{g.kind === "CLASS" ? t("Sınıf") : t("Etkinlik")}{t(": {name} ({members} üye)", { name: g.name, members: g.members })}</option>)}
                  </select>
                  {fields.groupId && <span className="err" role="alert">{fields.groupId}</span>}
                </div>
              )}
              {v.kind !== "QUIZ" && (
                <label className="check"><input type="checkbox" checked={v.teamMode} disabled={locked} onChange={(e) => set("teamMode", e.target.checked)} />{" "}{t("Takım görevi (takım başına tek teslim; onayda XP takımdaki herkese)")}</label>
              )}
              {v.teamMode && (
                <TextAreaField label={t("Takımlar")} rows={5} disabled={locked} value={v.teams} onChange={(e) => set("teams", e.target.value)} error={fields.teams} hint={locked ? t("Teslim alındığı için takımlar değiştirilemez.") : t("Her satıra bir takım: Takım adı: kullanıcı1, kullanıcı2. Görev yalnız takımlardaki öğrencilere gider.")} />
              )}
              {v.audience === "SELECTED" && !v.teamMode && (
                <TextAreaField label={t("Öğrenci kullanıcı adları")} rows={3} value={v.targetUsernames} onChange={(e) => set("targetUsernames", e.target.value)} error={fields.targetUsernames} hint={t("Virgül, boşluk ya da satırla ayır (ör. ogrenci.ali, ogrenci.ayse).")} />
              )}
              {v.kind !== "QUIZ" && <div className="form-grid">
                <label className="check"><input type="checkbox" checked={v.requireText} onChange={(e) => set("requireText", e.target.checked)} />{" "}{t("Metin cevabı zorunlu")}</label>
                <label className="check"><input type="checkbox" checked={v.requireFile} onChange={(e) => set("requireFile", e.target.checked)} />{" "}{t("En az bir dosya zorunlu")}</label>
                <label className="check"><input type="checkbox" checked={v.allowLate} onChange={(e) => set("allowLate", e.target.checked)} />{" "}{t("Geç teslime izin ver (işaretlenir)")}</label>
                <label className="check"><input type="checkbox" checked={v.allowResubmit} onChange={(e) => set("allowResubmit", e.target.checked)} />{" "}{t("Düzeltme istenince yeniden teslim")}</label>
              </div>}
              {v.kind === "QUIZ" && (
                <div className="form-grid">
                  <label className="check"><input type="checkbox" checked={v.allowLate} onChange={(e) => set("allowLate", e.target.checked)} />{" "}{t("Geç teslime izin ver (işaretlenir)")}</label>
                  <label className="check"><input type="checkbox" checked={v.allowResubmit} onChange={(e) => set("allowResubmit", e.target.checked)} />{" "}{t("Geçemezse tekrar deneyebilsin")}</label>
                </div>
              )}
              {fields.requireText && <span className="err" role="alert">{fields.requireText}</span>}
        </div>
          </section>
        </div>
      </div>

      <div className="row">
        <button className="btn" disabled={busy}>{id ? t("Kaydet") : t("Taslak olarak kaydet")}</button>
        {!id && <button type="button" className="btn btn-primary" disabled={busy} onClick={() => void save(true)}>{t("Kaydet ve yayınla")}</button>}
      </div>
    </form>
  );
}
