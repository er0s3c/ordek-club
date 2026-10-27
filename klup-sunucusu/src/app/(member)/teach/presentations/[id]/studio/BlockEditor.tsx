"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { diagramMessages, type Block } from "@/lib/deck-schema";
import { LOTTIE, LOTTIE_IDS, type LottieId } from "@/animations/lottie";
import { SCENE_IDS, SCENE_META, type SceneId } from "@/animations/scenes";
import { SketchBoard } from "@/components/presentation/SketchView";
import { useT } from "@/i18n/client";

export type AnimOpt = { id: string; title: string };
export type MissionOpt = { lesson: string; mission: string; title: string };

export const BLOCK_LABEL: Record<Block["type"], string> = {
  heading: "Başlık",
  text: "Metin",
  bullets: "Madde listesi",
  code: "Kod",
  terminal: "Terminal",
  callout: "Bilgi kutusu",
  animation: "Animasyon",
  image: "Görsel",
  practical: "VMware uygulama molası",
  mission: "Mini görev",
  diagram: "Diyagram (Mermaid)",
  sketch: "Çizim (Excalidraw)",
  lottie: "Simge animasyonu",
  scene: "Anlatım sahnesi",
};

const SAMPLE_DIAGRAM = "sequenceDiagram\n  participant T as Tarayıcı\n  participant S as Sunucu\n  T->>S: ClientHello\n  S-->>T: ServerHello + sertifika\n  T->>S: Anahtar paylaşımı\n  S-->>T: Finished";

export function newBlock(type: Block["type"], anims: AnimOpt[], missions: MissionOpt[] = []): Block {
  switch (type) {
    case "heading":
      return { type, text: "", level: 2 };
    case "text":
      return { type, text: "" };
    case "bullets":
      return { type, items: [""], reveal: false };
    case "code":
      return { type, language: "", code: "", highlightSteps: [], morphs: [] };
    case "terminal":
      return { type, lines: [{ cmd: "", out: "" }], reveal: true, cast: false };
    case "diagram":
      return { type, source: SAMPLE_DIAGRAM, reveal: true };
    case "sketch":
      return { type, scene: JSON.stringify({ elements: [] }), alt: "" };
    case "lottie":
      return { type, animation: LOTTIE_IDS[0], caption: "" };
    case "scene":
      return { type, scene: SCENE_IDS[0] };
    case "callout":
      return { type, tone: "info", text: "" };
    case "animation":
      return { type, animation: anims[0]?.id ?? "" };
    case "image":
      return { type, fileId: "", alt: "", caption: "" };
    case "practical":
      return { type, title: "", description: "", files: [], steps: [], durationMin: 30, host: { prepNotes: "", vms: [], snapshot: "", expected: "" } };
    case "mission":
      return { type, lesson: missions[0]?.lesson ?? "", mission: missions[0]?.mission ?? "", title: missions[0]?.title ?? "" };
  }
}

const lines = (s: string) => s.split("\n");
const join = (a: string[]) => a.join("\n");

// "1,2 ; 4" → [[1,2],[4]] (adım başına vurgulanan satırlar)
const parseHl = (s: string) =>
  s
    .split(";")
    .map((p) => p.split(/[\s,]+/).map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 200))
    .filter((a) => a.length);
const fmtHl = (h: number[][]) => h.map((a) => a.join(",")).join(" ; ");

export function BlockEditor({ block, onChange, anims, missions = [], idp }: { block: Block; onChange: (b: Block) => void; anims: AnimOpt[]; missions?: MissionOpt[]; idp: string }) {
  const t = useT();
  const f = (name: string) => `${idp}-${name}`;
  switch (block.type) {
    case "heading":
      return (
        <div className="studio-fields">
          <input className="input" aria-label={t("Başlık metni")} maxLength={160} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />
          <div className="seg" role="group" aria-label={t("Seviye")}>
            <button type="button" aria-pressed={block.level === 1} onClick={() => onChange({ ...block, level: 1 })}>{t("Büyük")}</button>
            <button type="button" aria-pressed={block.level === 2} onClick={() => onChange({ ...block, level: 2 })}>{t("Küçük")}</button>
          </div>
        </div>
      );
    case "text":
      return <textarea className="textarea" aria-label={t("Metin")} rows={4} maxLength={2000} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />;
    case "callout":
      return (
        <div className="studio-fields">
          <select className="input select" aria-label={t("Ton")} style={{ width: "auto" }} value={block.tone} onChange={(e) => onChange({ ...block, tone: e.target.value as typeof block.tone })}>
            <option value="info">{t("Bilgi")}</option>
            <option value="warn">{t("Uyarı")}</option>
            <option value="success">{t("Başarı")}</option>
            <option value="danger">{t("Tehlike")}</option>
          </select>
          <textarea className="textarea" aria-label={t("Kutu metni")} rows={2} maxLength={600} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />
        </div>
      );
    case "bullets":
      return (
        <div className="studio-fields">
          <textarea className="textarea" aria-label={t("Maddeler (her satır bir madde)")} rows={5} value={join(block.items)} onChange={(e) => onChange({ ...block, items: lines(e.target.value).slice(0, 12) })} />
          <label className="check"><input type="checkbox" checked={block.reveal} onChange={(e) => onChange({ ...block, reveal: e.target.checked })} />{" "}{t("Her adımda bir madde aç")}</label>
        </div>
      );
    case "code":
      return (
        <div className="studio-fields">
          <input className="input" aria-label={t("Dil")} placeholder={t("dil (ör. python, sql)")} maxLength={20} value={block.language} onChange={(e) => onChange({ ...block, language: e.target.value.toLowerCase().replace(/[^a-z0-9+#-]/g, "") })} />
          <textarea className="textarea mono" aria-label={t("Kod")} rows={8} maxLength={4000} spellCheck={false} value={block.code} onChange={(e) => onChange({ ...block, code: e.target.value })} />
          <HlInput value={block.highlightSteps} onChange={(h) => onChange({ ...block, highlightSteps: h })} id={f("hl")} />
          {/* Kodun sonraki hâlleri: her adımda bir sonrakine magic-move geçişiyle dönüşür (ör. zafiyetli → düzeltilmiş) */}
          {block.morphs.map((m, i) => (
            <div key={i} className="stack-sm">
              <div className="row-between"><span className="tiny faint">{t("{v0}. adımdaki kod", { v0: i + 1 })}</span><button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange({ ...block, morphs: block.morphs.filter((_, j) => j !== i) })}>{t("Kaldır")}</button></div>
              <textarea className="textarea mono" aria-label={t("{v0}. adımdaki kod", { v0: i + 1 })} rows={6} maxLength={4000} spellCheck={false} value={m} onChange={(e) => onChange({ ...block, morphs: block.morphs.map((x, j) => (j === i ? e.target.value : x)) })} />
            </div>
          ))}
          {block.morphs.length < 10 && <button type="button" className="btn btn-sm btn-ghost" onClick={() => onChange({ ...block, morphs: [...block.morphs, block.morphs.at(-1) ?? block.code] })}>{t("+ Kodun sonraki hâli (dönüşüm animasyonu)")}</button>}
        </div>
      );
    case "terminal":
      return (
        <div className="studio-fields">
          {block.lines.map((l, i) => (
            <div key={i} className="studio-term-row">
              <input className="input mono" aria-label={t("Komut {v0}", { v0: i + 1 })} placeholder={t("$ komut")} maxLength={300} value={l.cmd ?? ""} onChange={(e) => onChange({ ...block, lines: block.lines.map((x, j) => (j === i ? { ...x, cmd: e.target.value } : x)) })} />
              <textarea className="textarea mono" aria-label={t("Çıktı {v0}", { v0: i + 1 })} placeholder={t("çıktı")} rows={2} maxLength={1000} value={l.out ?? ""} onChange={(e) => onChange({ ...block, lines: block.lines.map((x, j) => (j === i ? { ...x, out: e.target.value } : x)) })} />
              {block.lines.length > 1 && <button type="button" className="btn btn-sm btn-ghost" aria-label={t("Satır {v0} sil", { v0: i + 1 })} onClick={() => onChange({ ...block, lines: block.lines.filter((_, j) => j !== i) })}>×</button>}
            </div>
          ))}
          <div className="row">
            {block.lines.length < 20 && <button type="button" className="btn btn-sm btn-ghost" onClick={() => onChange({ ...block, lines: [...block.lines, { cmd: "", out: "" }] })}>{t("+ satır")}</button>}
            <label className="check"><input type="checkbox" checked={block.reveal && !block.cast} disabled={block.cast} onChange={(e) => onChange({ ...block, reveal: e.target.checked })} />{" "}{t("Her adımda bir satır")}</label>
            <label className="check"><input type="checkbox" checked={block.cast} onChange={(e) => onChange({ ...block, cast: e.target.checked })} />{" "}{t("Canlı yazım kaydı (harf harf)")}</label>
          </div>
        </div>
      );
    case "diagram":
      return (
        <div className="studio-fields">
          <textarea className="textarea mono" aria-label={t("Mermaid diyagram metni")} rows={8} maxLength={4000} spellCheck={false} value={block.source} onChange={(e) => onChange({ ...block, source: e.target.value })} />
          <label className="check"><input type="checkbox" checked={block.reveal} onChange={(e) => onChange({ ...block, reveal: e.target.checked })} />{" "}{t("Sıra diyagramında mesajları adım adım göster ({v0} mesaj)", { v0: diagramMessages(block.source) })}</label>
          <span className="hint">{t("sequenceDiagram, flowchart, stateDiagram desteklenir. Önizleme sağdaki slaytta.")}</span>
        </div>
      );
    case "sketch":
      return (
        <div className="studio-fields">
          <SketchBoard scene={block.scene} height={420} onChange={(scene) => onChange({ ...block, scene })} />
          <input className="input" aria-label={t("Çizim açıklaması")} placeholder={t("Çizimin kısa açıklaması (erişilebilirlik için)")} maxLength={200} value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} />
        </div>
      );
    case "lottie":
      return (
        <div className="studio-fields">
          <select className="input select" aria-label={t("Simge animasyonu")} value={block.animation} onChange={(e) => onChange({ ...block, animation: e.target.value as LottieId })}>
            {LOTTIE_IDS.map((id) => <option key={id} value={id}>{LOTTIE[id].title}</option>)}
          </select>
          <input className="input" aria-label={t("Alt yazı")} placeholder={t("Alt yazı (isteğe bağlı)")} maxLength={200} value={block.caption} onChange={(e) => onChange({ ...block, caption: e.target.value })} />
        </div>
      );
    case "scene":
      return (
        <div className="studio-fields">
          <select className="input select" aria-label={t("Anlatım sahnesi")} value={block.scene} onChange={(e) => onChange({ ...block, scene: e.target.value as SceneId })}>
            {SCENE_IDS.map((id) => <option key={id} value={id}>{SCENE_META[id].title}</option>)}
          </select>
          <span className="hint">{SCENE_META[block.scene].summary}</span>
        </div>
      );
    case "animation":
      return (
        <select className="input select" aria-label={t("Animasyon")} value={block.animation} onChange={(e) => onChange({ ...block, animation: e.target.value })}>
          {anims.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
      );
    case "image":
      return <ImageField block={block} onChange={onChange} />;
    case "mission":
      return (
        <div className="studio-fields">
          <select className="input select" aria-label={t("Görev")} value={`${block.lesson}/${block.mission}`}
            onChange={(e) => { const o = missions.find((m) => `${m.lesson}/${m.mission}` === e.target.value); if (o) onChange({ ...block, lesson: o.lesson, mission: o.mission, title: o.title }); }}>
            {!missions.some((m) => m.lesson === block.lesson && m.mission === block.mission) && <option value={`${block.lesson}/${block.mission}`}>{t("— görev seç —")}</option>}
            {missions.map((m) => <option key={`${m.lesson}/${m.mission}`} value={`${m.lesson}/${m.mission}`}>{m.title}</option>)}
          </select>
          <span className="hint">{t("Slaytta görev kartı görünür; öğrenciler görevi kendi cihazında akademide çözer, XP orada verilir.")}</span>
        </div>
      );
    case "practical":
      return (
        <div className="studio-fields">
          <input className="input" aria-label={t("Uygulama başlığı")} placeholder={t("Uygulama başlığı")} maxLength={160} value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          <textarea className="textarea" aria-label={t("Açıklama")} placeholder={t("Öğrenciye açıklama")} rows={2} maxLength={2000} value={block.description} onChange={(e) => onChange({ ...block, description: e.target.value })} />
          <textarea className="textarea" aria-label={t("Adımlar (her satır bir adım)")} placeholder={t("Adımlar — her satır bir adım")} rows={4} value={join(block.steps)} onChange={(e) => onChange({ ...block, steps: lines(e.target.value).slice(0, 20) })} />
          <input className="input" aria-label={t("Gerekli dosyalar (virgülle)")} placeholder={t("Gerekli dosyalar (virgülle)")} value={block.files.join(", ")} onChange={(e) => onChange({ ...block, files: e.target.value.split(",").map((x) => x.trimStart()).slice(0, 10) })} />
          <label className="small row" style={{ gap: 6 }}>{t("Süre (dk)")}{" "}<input className="input" type="number" min={1} max={240} style={{ width: 90 }} value={block.durationMin} onChange={(e) => onChange({ ...block, durationMin: Number(e.target.value) || 1 })} /></label>
          <div className="studio-host">
            <div className="eyebrow">{t("Yalnız eğitmen görür")}</div>
            <input className="input" aria-label={t("VM'ler (virgülle)")} placeholder={t("VM'ler (virgülle)")} value={block.host.vms.join(", ")} onChange={(e) => onChange({ ...block, host: { ...block.host, vms: e.target.value.split(",").map((x) => x.trimStart()).slice(0, 10) } })} />
            <input className="input" aria-label="Snapshot" placeholder={t("Snapshot adı")} maxLength={300} value={block.host.snapshot} onChange={(e) => onChange({ ...block, host: { ...block.host, snapshot: e.target.value } })} />
            <textarea className="textarea" aria-label={t("Hazırlık notları")} placeholder={t("Hazırlık notları")} rows={2} maxLength={3000} value={block.host.prepNotes} onChange={(e) => onChange({ ...block, host: { ...block.host, prepNotes: e.target.value } })} />
            <textarea className="textarea" aria-label={t("Beklenen sonuç")} placeholder={t("Beklenen sonuç")} rows={2} maxLength={3000} value={block.host.expected} onChange={(e) => onChange({ ...block, host: { ...block.host, expected: e.target.value } })} />
          </div>
        </div>
      );
  }
}

function HlInput({ value, onChange, id }: { value: number[][]; onChange: (h: number[][]) => void; id: string }) {
  const t = useT();
  const [text, setText] = useState(fmtHl(value));
  return (
    <div className="field">
      <label htmlFor={id} className="small">{t("Adım adım vurgulanacak satırlar")}</label>
      <input id={id} className="input mono" placeholder={t("ör. 1,2 ; 4 ; 6-7 yerine 6,7")} value={text} onChange={(e) => { setText(e.target.value); onChange(parseHl(e.target.value)); }} />
      <span className="hint">{t("Noktalı virgül adımları ayırır: “2,3 ; 5” → 1. adımda 2–3, 2. adımda 5. satır.")}</span>
    </div>
  );
}

function ImageField({ block, onChange }: { block: Extract<Block, { type: "image" }>; onChange: (b: Block) => void }) {
  const t = useT();
  const toast = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  async function upload(f: File) {
    setBusy(true);
    try {
      const form = new FormData();
      form.set("file", f);
      form.set("scope", "MEDIA");
      form.set("description", "Sunum görseli");
      const r = await api<{ id: string }>("/api/files", { method: "POST", form });
      onChange({ ...block, fileId: r.id, alt: block.alt || f.name.replace(/\.[^.]+$/, "").slice(0, 200) });
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }
  return (
    <div className="studio-fields">
      <div className="row" style={{ flexWrap: "wrap" }}>
        {block.fileId && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="studio-thumb" src={`/api/files/${block.fileId}?inline=1`} alt="" />
        )}
        <input ref={ref} type="file" accept=".png,.jpg,.jpeg,.webp" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        <button type="button" className="btn btn-sm" disabled={busy} onClick={() => ref.current?.click()}><ImagePlus size={14} aria-hidden /> {busy ? t("Yükleniyor…") : block.fileId ? t("Görseli değiştir") : t("Görsel yükle")}</button>
        <span className="hint">{t("PNG, JPEG ya da WebP. Görsel yalnız kulüp üyelerine sunulur.")}</span>
      </div>
      <input className="input" aria-label={t("Alt metin")} placeholder={t("Alt metin (görme engelli üyeler için kısa açıklama)")} maxLength={200} value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} />
      <input className="input" aria-label={t("Alt yazı")} placeholder={t("Alt yazı (isteğe bağlı)")} maxLength={300} value={block.caption} onChange={(e) => onChange({ ...block, caption: e.target.value })} />
    </div>
  );
}
