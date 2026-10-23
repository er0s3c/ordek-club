"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import type { Block } from "@/lib/deck-schema";

export type AnimOpt = { id: string; title: string };

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
};

export function newBlock(type: Block["type"], anims: AnimOpt[]): Block {
  switch (type) {
    case "heading":
      return { type, text: "", level: 2 };
    case "text":
      return { type, text: "" };
    case "bullets":
      return { type, items: [""], reveal: false };
    case "code":
      return { type, language: "", code: "", highlightSteps: [] };
    case "terminal":
      return { type, lines: [{ cmd: "", out: "" }], reveal: true };
    case "callout":
      return { type, tone: "info", text: "" };
    case "animation":
      return { type, animation: anims[0]?.id ?? "" };
    case "image":
      return { type, fileId: "", alt: "", caption: "" };
    case "practical":
      return { type, title: "", description: "", files: [], steps: [], durationMin: 30, host: { prepNotes: "", vms: [], snapshot: "", expected: "" } };
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

export function BlockEditor({ block, onChange, anims, idp }: { block: Block; onChange: (b: Block) => void; anims: AnimOpt[]; idp: string }) {
  const f = (name: string) => `${idp}-${name}`;
  switch (block.type) {
    case "heading":
      return (
        <div className="studio-fields">
          <input className="input" aria-label="Başlık metni" maxLength={160} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />
          <div className="seg" role="group" aria-label="Seviye">
            <button type="button" aria-pressed={block.level === 1} onClick={() => onChange({ ...block, level: 1 })}>Büyük</button>
            <button type="button" aria-pressed={block.level === 2} onClick={() => onChange({ ...block, level: 2 })}>Küçük</button>
          </div>
        </div>
      );
    case "text":
      return <textarea className="textarea" aria-label="Metin" rows={4} maxLength={2000} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />;
    case "callout":
      return (
        <div className="studio-fields">
          <select className="input select" aria-label="Ton" style={{ width: "auto" }} value={block.tone} onChange={(e) => onChange({ ...block, tone: e.target.value as typeof block.tone })}>
            <option value="info">Bilgi</option>
            <option value="warn">Uyarı</option>
            <option value="success">Başarı</option>
            <option value="danger">Tehlike</option>
          </select>
          <textarea className="textarea" aria-label="Kutu metni" rows={2} maxLength={600} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />
        </div>
      );
    case "bullets":
      return (
        <div className="studio-fields">
          <textarea className="textarea" aria-label="Maddeler (her satır bir madde)" rows={5} value={join(block.items)} onChange={(e) => onChange({ ...block, items: lines(e.target.value).slice(0, 12) })} />
          <label className="check"><input type="checkbox" checked={block.reveal} onChange={(e) => onChange({ ...block, reveal: e.target.checked })} /> Her adımda bir madde aç</label>
        </div>
      );
    case "code":
      return (
        <div className="studio-fields">
          <input className="input" aria-label="Dil" placeholder="dil (ör. python, sql)" maxLength={20} value={block.language} onChange={(e) => onChange({ ...block, language: e.target.value.toLowerCase().replace(/[^a-z0-9+#-]/g, "") })} />
          <textarea className="textarea mono" aria-label="Kod" rows={8} maxLength={4000} spellCheck={false} value={block.code} onChange={(e) => onChange({ ...block, code: e.target.value })} />
          <HlInput value={block.highlightSteps} onChange={(h) => onChange({ ...block, highlightSteps: h })} id={f("hl")} />
        </div>
      );
    case "terminal":
      return (
        <div className="studio-fields">
          {block.lines.map((l, i) => (
            <div key={i} className="studio-term-row">
              <input className="input mono" aria-label={`Komut ${i + 1}`} placeholder="$ komut" maxLength={300} value={l.cmd ?? ""} onChange={(e) => onChange({ ...block, lines: block.lines.map((x, j) => (j === i ? { ...x, cmd: e.target.value } : x)) })} />
              <textarea className="textarea mono" aria-label={`Çıktı ${i + 1}`} placeholder="çıktı" rows={2} maxLength={1000} value={l.out ?? ""} onChange={(e) => onChange({ ...block, lines: block.lines.map((x, j) => (j === i ? { ...x, out: e.target.value } : x)) })} />
              {block.lines.length > 1 && <button type="button" className="btn btn-sm btn-ghost" aria-label={`Satır ${i + 1} sil`} onClick={() => onChange({ ...block, lines: block.lines.filter((_, j) => j !== i) })}>×</button>}
            </div>
          ))}
          <div className="row">
            {block.lines.length < 20 && <button type="button" className="btn btn-sm btn-ghost" onClick={() => onChange({ ...block, lines: [...block.lines, { cmd: "", out: "" }] })}>+ satır</button>}
            <label className="check"><input type="checkbox" checked={block.reveal} onChange={(e) => onChange({ ...block, reveal: e.target.checked })} /> Her adımda bir satır</label>
          </div>
        </div>
      );
    case "animation":
      return (
        <select className="input select" aria-label="Animasyon" value={block.animation} onChange={(e) => onChange({ ...block, animation: e.target.value })}>
          {anims.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
      );
    case "image":
      return <ImageField block={block} onChange={onChange} />;
    case "practical":
      return (
        <div className="studio-fields">
          <input className="input" aria-label="Uygulama başlığı" placeholder="Uygulama başlığı" maxLength={160} value={block.title} onChange={(e) => onChange({ ...block, title: e.target.value })} />
          <textarea className="textarea" aria-label="Açıklama" placeholder="Öğrenciye açıklama" rows={2} maxLength={2000} value={block.description} onChange={(e) => onChange({ ...block, description: e.target.value })} />
          <textarea className="textarea" aria-label="Adımlar (her satır bir adım)" placeholder="Adımlar — her satır bir adım" rows={4} value={join(block.steps)} onChange={(e) => onChange({ ...block, steps: lines(e.target.value).slice(0, 20) })} />
          <input className="input" aria-label="Gerekli dosyalar (virgülle)" placeholder="Gerekli dosyalar (virgülle)" value={block.files.join(", ")} onChange={(e) => onChange({ ...block, files: e.target.value.split(",").map((x) => x.trimStart()).slice(0, 10) })} />
          <label className="small row" style={{ gap: 6 }}>Süre (dk) <input className="input" type="number" min={1} max={240} style={{ width: 90 }} value={block.durationMin} onChange={(e) => onChange({ ...block, durationMin: Number(e.target.value) || 1 })} /></label>
          <div className="studio-host">
            <div className="eyebrow">Yalnız eğitmen görür</div>
            <input className="input" aria-label="VM'ler (virgülle)" placeholder="VM'ler (virgülle)" value={block.host.vms.join(", ")} onChange={(e) => onChange({ ...block, host: { ...block.host, vms: e.target.value.split(",").map((x) => x.trimStart()).slice(0, 10) } })} />
            <input className="input" aria-label="Snapshot" placeholder="Snapshot adı" maxLength={300} value={block.host.snapshot} onChange={(e) => onChange({ ...block, host: { ...block.host, snapshot: e.target.value } })} />
            <textarea className="textarea" aria-label="Hazırlık notları" placeholder="Hazırlık notları" rows={2} maxLength={3000} value={block.host.prepNotes} onChange={(e) => onChange({ ...block, host: { ...block.host, prepNotes: e.target.value } })} />
            <textarea className="textarea" aria-label="Beklenen sonuç" placeholder="Beklenen sonuç" rows={2} maxLength={3000} value={block.host.expected} onChange={(e) => onChange({ ...block, host: { ...block.host, expected: e.target.value } })} />
          </div>
        </div>
      );
  }
}

function HlInput({ value, onChange, id }: { value: number[][]; onChange: (h: number[][]) => void; id: string }) {
  const [text, setText] = useState(fmtHl(value));
  return (
    <div className="field">
      <label htmlFor={id} className="small">Adım adım vurgulanacak satırlar</label>
      <input id={id} className="input mono" placeholder="ör. 1,2 ; 4 ; 6-7 yerine 6,7" value={text} onChange={(e) => { setText(e.target.value); onChange(parseHl(e.target.value)); }} />
      <span className="hint">Noktalı virgül adımları ayırır: “2,3 ; 5” → 1. adımda 2–3, 2. adımda 5. satır.</span>
    </div>
  );
}

function ImageField({ block, onChange }: { block: Extract<Block, { type: "image" }>; onChange: (b: Block) => void }) {
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
        <button type="button" className="btn btn-sm" disabled={busy} onClick={() => ref.current?.click()}><ImagePlus size={14} aria-hidden /> {busy ? "Yükleniyor…" : block.fileId ? "Görseli değiştir" : "Görsel yükle"}</button>
        <span className="hint">PNG, JPEG ya da WebP. Görsel yalnız kulüp üyelerine sunulur.</span>
      </div>
      <input className="input" aria-label="Alt metin" placeholder="Alt metin (görme engelli üyeler için kısa açıklama)" maxLength={200} value={block.alt} onChange={(e) => onChange({ ...block, alt: e.target.value })} />
      <input className="input" aria-label="Alt yazı" placeholder="Alt yazı (isteğe bağlı)" maxLength={300} value={block.caption} onChange={(e) => onChange({ ...block, caption: e.target.value })} />
    </div>
  );
}
