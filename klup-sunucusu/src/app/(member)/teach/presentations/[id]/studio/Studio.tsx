"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Copy, History, Plus, Rocket, Trash2, Undo2 } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { SlideView } from "@/components/presentation/SlideView";
import { slideSteps, type Block, type ClientSlide, type Deck } from "@/lib/deck-schema";
import { formatDateTime } from "@/components/ui/format";
import { BLOCK_LABEL, BlockEditor, newBlock, type AnimOpt } from "./BlockEditor";

type Slide = Deck["slides"][number];
type Version = { id: string; number: number; createdAt: string; author: string; slides: number };
type Issue = { path: string; message: string };
type SaveState = "saved" | "dirty" | "saving" | "error";

const LAYOUTS: Record<Slide["layout"], string> = { default: "Normal", title: "Kapak", section: "Bölüm" };
const AUTOSAVE_MS = 1500;

const emptySlide = (): Slide => ({ title: "Yeni slayt", layout: "default", blocks: [], notes: "" });

// "slides.2.blocks.0.text" → "Slayt 3 · blok 1"
function where(path: string) {
  const m = path.match(/^slides\.(\d+)(?:\.blocks\.(\d+))?/);
  if (!m) return path === "title" ? "Sunum başlığı" : path || "Sunum";
  return `Slayt ${Number(m[1]) + 1}${m[2] !== undefined ? ` · blok ${Number(m[2]) + 1}` : ""}`;
}

export function Studio({ id, initial, savedAt, hasDraft, version, versions, anims, timezone }: {
  id: string;
  initial: Deck;
  savedAt: string | null;
  hasDraft: boolean;
  version: number;
  versions: Version[];
  anims: AnimOpt[];
  timezone: string;
}) {
  const toast = useToast();
  const router = useRouter();
  const [deck, setDeck] = useState<Deck>(initial);
  const [sel, setSel] = useState(0);
  const [step, setStep] = useState(0);
  const [state, setState] = useState<SaveState>("saved");
  const [lastSaved, setLastSaved] = useState<string | null>(savedAt);
  const [draft, setDraft] = useState(hasDraft);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(deck);
  latest.current = deck;

  const save = useCallback(async () => {
    setState("saving");
    try {
      const r = await api<{ savedAt: string; issues: Issue[] }>(`/api/presentations/${id}/draft`, { method: "PUT", body: { content: latest.current } });
      setLastSaved(r.savedAt);
      setIssues(r.issues);
      setDraft(true);
      setState((s) => (s === "saving" ? "saved" : s)); // kayıt sırasında yeni değişiklik geldiyse "dirty" kalır
    } catch (e) {
      setState("error");
      toast("error", `Otomatik kayıt başarısız: ${(e as Error).message}`);
    }
  }, [id, toast]);

  // Her değişiklikten sonra kısa bir beklemeyle otomatik kayıt
  const change = (next: Deck) => {
    setDeck(next);
    setState("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(), AUTOSAVE_MS);
  };

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (state === "dirty" || state === "saving") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [state]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const slide = deck.slides[Math.min(sel, deck.slides.length - 1)];
  const setSlide = (s: Slide) => change({ ...deck, slides: deck.slides.map((x, i) => (i === sel ? s : x)) });
  const setBlocks = (blocks: Block[]) => slide && setSlide({ ...slide, blocks });
  const steps = slide ? slideSteps(slide.blocks.length ? slide.blocks : []) : 1;
  const preview: ClientSlide | null = slide ? { id: `s${sel}`, position: sel, title: slide.title || " ", layout: slide.layout, blocks: slide.blocks, steps } : null;

  function moveSlide(i: number, d: -1 | 1) {
    const n = [...deck.slides];
    [n[i], n[i + d]] = [n[i + d]!, n[i]!];
    change({ ...deck, slides: n });
    setSel(i + d);
  }
  function moveBlock(i: number, d: -1 | 1) {
    if (!slide) return;
    const n = [...slide.blocks];
    [n[i], n[i + d]] = [n[i + d]!, n[i]!];
    setBlocks(n);
  }

  async function flush() {
    if (timer.current) clearTimeout(timer.current);
    if (state !== "saved") await save();
  }

  async function publish() {
    setBusy(true);
    try {
      await flush();
      const r = await api<{ version: number }>(`/api/presentations/${id}/draft`, { method: "POST" });
      toast("ok", `v${r.version} yayınlandı. Yeni canlı dersler bu sürümle başlar.`);
      setDraft(false);
      router.refresh();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function discard() {
    if (!window.confirm("Yayınlanmamış değişiklikler silinsin ve son sürüme dönülsün mü?")) return;
    if (timer.current) clearTimeout(timer.current);
    try {
      await api(`/api/presentations/${id}/draft`, { method: "DELETE" });
      toast("ok", "Taslak silindi.");
      window.location.reload();
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }

  async function restore(v: Version) {
    if (!window.confirm(`v${v.number} taslağa yüklensin mi? Yayınlayınca yeni sürüm olarak eklenir; geçmiş silinmez.`)) return;
    if (timer.current) clearTimeout(timer.current);
    try {
      const r = await api<{ deck: Deck }>(`/api/presentations/${id}/versions/${v.id}/restore`, { method: "POST" });
      setDeck(r.deck);
      setSel(0);
      setDraft(true);
      setState("saved");
      setShowVersions(false);
      toast("ok", `v${v.number} taslağa yüklendi.`);
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }

  const STATUS: Record<SaveState, string> = {
    saved: draft ? `Taslak kaydedildi${lastSaved ? ` · ${formatDateTime(lastSaved, timezone)}` : ""}` : `Yayındaki sürümle aynı (v${version})`,
    dirty: "Kaydedilmemiş değişiklik…",
    saving: "Kaydediliyor…",
    error: "Kaydedilemedi — bağlantıyı kontrol et",
  };

  return (
    <div className="stack">
      <div className="studio-bar">
        <input className="input studio-title" aria-label="Sunum başlığı" maxLength={160} value={deck.title} onChange={(e) => change({ ...deck, title: e.target.value })} />
        <span className="small" data-state={state} role="status">{STATUS[state]}</span>
        <span style={{ flex: 1 }} />
        <button className="btn btn-sm" onClick={() => setShowVersions((v) => !v)} aria-expanded={showVersions}><History size={14} aria-hidden /> Sürümler</button>
        {draft && <button className="btn btn-sm" onClick={discard}><Undo2 size={14} aria-hidden /> Taslağı at</button>}
        <button className="btn btn-sm btn-primary" disabled={busy || !draft || issues.length > 0 || state === "error"} onClick={publish} title={issues.length ? "Önce aşağıdaki sorunları düzelt" : undefined}>
          <Rocket size={14} aria-hidden /> Yayınla (v{version + 1})
        </button>
      </div>

      {issues.length > 0 && (
        <div className="alert alert-warn small" role="alert">
          <div>
            <strong>Yayınlamadan önce düzelt:</strong>
            <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
              {issues.slice(0, 6).map((i, k) => (
                <li key={k}>
                  <button type="button" className="linklike" onClick={() => { const m = i.path.match(/^slides\.(\d+)/); if (m) setSel(Number(m[1])); }}>{where(i.path)}</button>: {i.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {showVersions && (
        <section className="card">
          <div className="card-h"><h2>Sürüm geçmişi</h2><span className="tiny faint">canlı dersler başlatıldıkları sürümü kullanır</span></div>
          <div className="card-b"><ul className="list-tight">
            {versions.map((v) => (
              <li key={v.id}>
                <span className="mono">v{v.number}</span>
                <span style={{ flex: 1 }} className="small">{formatDateTime(v.createdAt, timezone)} · {v.author} · {v.slides} slayt</span>
                <button className="btn btn-sm" onClick={() => restore(v)}>Taslağa yükle</button>
              </li>
            ))}
          </ul></div>
        </section>
      )}

      <div className="studio">
        <nav className="studio-slides" aria-label="Slaytlar">
          <ol>
            {deck.slides.map((s, i) => (
              <li key={i}>
                <button type="button" className="slide-chip" aria-current={i === sel} onClick={() => { setSel(i); setStep(0); }}>
                  <div className="n">{i + 1} · {LAYOUTS[s.layout]}</div>
                  <div>{s.title || "(başlıksız)"}</div>
                  <div className="tiny faint">{s.blocks.length} blok</div>
                </button>
              </li>
            ))}
          </ol>
          <button type="button" className="btn btn-sm" onClick={() => { change({ ...deck, slides: [...deck.slides.slice(0, sel + 1), emptySlide(), ...deck.slides.slice(sel + 1)] }); setSel(sel + 1); }} disabled={deck.slides.length >= 200}>
            <Plus size={14} aria-hidden /> Slayt ekle
          </button>
        </nav>

        {slide && (
          <section className="studio-edit" aria-label={`Slayt ${sel + 1} düzenleyici`}>
            <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
              <input className="input" style={{ flex: "1 1 220px" }} aria-label="Slayt başlığı" maxLength={160} value={slide.title} onChange={(e) => setSlide({ ...slide, title: e.target.value })} />
              <select className="input select" style={{ width: "auto" }} aria-label="Düzen" value={slide.layout} onChange={(e) => setSlide({ ...slide, layout: e.target.value as Slide["layout"] })}>
                {Object.entries(LAYOUTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
              <button className="btn btn-sm btn-ghost" aria-label="Slaytı yukarı taşı" disabled={sel === 0} onClick={() => moveSlide(sel, -1)}><ArrowUp size={14} aria-hidden /></button>
              <button className="btn btn-sm btn-ghost" aria-label="Slaytı aşağı taşı" disabled={sel === deck.slides.length - 1} onClick={() => moveSlide(sel, 1)}><ArrowDown size={14} aria-hidden /></button>
              <button className="btn btn-sm btn-ghost" aria-label="Slaytı çoğalt" onClick={() => { change({ ...deck, slides: [...deck.slides.slice(0, sel + 1), structuredClone(slide), ...deck.slides.slice(sel + 1)] }); setSel(sel + 1); }}><Copy size={14} aria-hidden /></button>
              <button className="btn btn-sm btn-ghost" aria-label="Slaytı sil" disabled={deck.slides.length === 1} onClick={() => { if (window.confirm("Slayt silinsin mi?")) { change({ ...deck, slides: deck.slides.filter((_, i) => i !== sel) }); setSel(Math.max(0, sel - 1)); } }}><Trash2 size={14} aria-hidden /></button>
            </div>

            {slide.blocks.map((b, i) => (
              <div key={i} className="studio-block">
                <div className="row" style={{ gap: 6 }}>
                  <span className="eyebrow" style={{ flex: 1 }}>{i + 1}. {BLOCK_LABEL[b.type]}</span>
                  <button className="btn btn-sm btn-ghost" aria-label={`Blok ${i + 1} yukarı`} disabled={i === 0} onClick={() => moveBlock(i, -1)}><ArrowUp size={13} aria-hidden /></button>
                  <button className="btn btn-sm btn-ghost" aria-label={`Blok ${i + 1} aşağı`} disabled={i === slide.blocks.length - 1} onClick={() => moveBlock(i, 1)}><ArrowDown size={13} aria-hidden /></button>
                  <button className="btn btn-sm btn-ghost" aria-label={`Blok ${i + 1} sil`} onClick={() => setBlocks(slide.blocks.filter((_, j) => j !== i))}><Trash2 size={13} aria-hidden /></button>
                </div>
                <BlockEditor block={b} anims={anims} idp={`b${sel}-${i}`} onChange={(nb) => setBlocks(slide.blocks.map((x, j) => (j === i ? nb : x)))} />
              </div>
            ))}

            {slide.blocks.length < 12 && (
              <div className="studio-add" role="group" aria-label="Blok ekle">
                <span className="small faint">Blok ekle:</span>
                {(Object.keys(BLOCK_LABEL) as Block["type"][]).map((t) => (
                  <button key={t} type="button" className="btn btn-sm btn-ghost" onClick={() => setBlocks([...slide.blocks, newBlock(t, anims)])}>+ {BLOCK_LABEL[t]}</button>
                ))}
              </div>
            )}

            <div className="field">
              <label htmlFor="studio-notes">Eğitmen notları (öğrenciler görmez)</label>
              <textarea id="studio-notes" className="textarea" rows={3} maxLength={5000} value={slide.notes} onChange={(e) => setSlide({ ...slide, notes: e.target.value })} />
            </div>
          </section>
        )}

        <aside className="studio-preview" aria-label="Önizleme">
          {preview && <SlideView slide={preview} step={Math.min(step, steps - 1)} stepKey={`${sel}:${step}`} />}
          <div className="row small" style={{ justifyContent: "space-between" }}>
            <button className="btn btn-sm" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>‹ Adım</button>
            <span className="mono">adım {Math.min(step, steps - 1) + 1}/{steps}</span>
            <button className="btn btn-sm" disabled={step >= steps - 1} onClick={() => setStep((s) => s + 1)}>Adım ›</button>
          </div>
          <p className="tiny faint" style={{ margin: 0 }}>
            Değişiklikler otomatik kaydedilir (taslak). Öğrenciler ve canlı dersler yalnız yayınlanan sürümü görür. <Link href={`/teach/presentations/${id}`}>Sunum sayfası</Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
