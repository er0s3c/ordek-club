"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Copy, GripVertical, History, Plus, Rocket, Trash2, Undo2 } from "lucide-react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { SlideView } from "@/components/presentation/SlideView";
import { slideSteps, type Block, type ClientSlide, type Deck } from "@/lib/deck-schema";
import { formatDateTime } from "@/components/ui/format";
import { ImportDeck, type ImportResult } from "@/components/presentation/ImportDeck";
import { BLOCK_LABEL, BlockEditor, newBlock, type AnimOpt, type MissionOpt } from "./BlockEditor";
import { ChoreoEditor } from "./ChoreoEditor";
import { useCollab } from "./useCollab";
import { MarpImport } from "./MarpImport";
import { useT } from "@/i18n/client";

type Slide = Deck["slides"][number];
type Version = { id: string; number: number; createdAt: string; author: string; slides: number };
type Issue = { path: string; message: string };
type SaveState = "saved" | "dirty" | "saving" | "error";

const LAYOUTS: Record<Slide["layout"], string> = { default: "Normal", title: "Kapak", section: "Bölüm" };
const AUTOSAVE_MS = 1500;

const emptySlide = (): Slide => ({ title: "Yeni slayt", layout: "default", blocks: [], notes: "", motion: "" });

// "slides.2.blocks.0.text" → "Slayt 3 · blok 1"
function where(path: string) {
  const m = path.match(/^slides\.(\d+)(?:\.blocks\.(\d+))?/);
  if (!m) return path === "title" ? "Sunum başlığı" : path || "Sunum";
  return `Slayt ${Number(m[1]) + 1}${m[2] !== undefined ? ` · blok ${Number(m[2]) + 1}` : ""}`;
}

function SlideChip({ id, index, slide, current, onPick, children }: { id: string; index: number; slide: Slide; current: boolean; onPick: () => void; children?: React.ReactNode }) {
  const t = useT();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`slide-chip-row${isDragging ? " is-dragging" : ""}`}>
      <button type="button" className="slide-grip" aria-label={t("{v0}. slaytı sürükle", { v0: index + 1 })} {...attributes} {...listeners}><GripVertical size={14} aria-hidden /></button>
      <button type="button" className="slide-chip" aria-current={current} onClick={onPick}>
        <div className="n">{index + 1} · {t(LAYOUTS[slide.layout])}{slide.motion ? " · ✦" : ""}</div>
        <div>{slide.title || t("(başlıksız)")}</div>
        <div className="tiny faint">{t("{length} blok", { length: slide.blocks.length })}</div>
        {children}
      </button>
    </li>
  );
}

export function Studio({ id, me, initial, savedAt, hasDraft, version, versions, anims, missions = [], timezone, converterEnabled = false }: {
  id: string;
  me: { name: string };
  initial: Deck;
  savedAt: string | null;
  hasDraft: boolean;
  version: number;
  versions: Version[];
  anims: AnimOpt[];
  missions?: MissionOpt[];
  timezone: string;
  converterEnabled?: boolean;
}) {
  const tl = useT();
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
  const [choreoOn, setChoreoOn] = useState(false);
  const [blocksRef] = useAutoAnimate<HTMLDivElement>({ duration: 220 });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
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
      toast("error", tl("Otomatik kayıt başarısız: {message}", { message: (e as Error).message }));
    }
  }, [id, toast, tl]);

  // Her değişiklikten sonra kısa bir beklemeyle otomatik kayıt
  const change = (next: Deck) => {
    setDeck(next);
    latest.current = next;
    setState("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(), AUTOSAVE_MS);
  };

  // Ortak düzenleme (Yjs): başka eğitmenin değişikliği gelince editör güncellenir ve taslak yeniden kaydedilir.
  const collab = useCollab(id, me, sel, (next) => { change(next); setSel((x) => Math.min(x, next.slides.length - 1)); }, () => latest.current);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (state === "dirty" || state === "saving") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [state]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const slide = deck.slides[Math.min(sel, deck.slides.length - 1)];
  const setSlide = (s: Slide) => { change({ ...deck, slides: deck.slides.map((x, i) => (i === sel ? s : x)) }); collab.apply("update", sel, s); };
  const insertSlide = (at: number, s: Slide) => { change({ ...deck, slides: [...deck.slides.slice(0, at), s, ...deck.slides.slice(at)] }); collab.apply("insert", at, s); setSel(at); };
  const setBlocks = (blocks: Block[]) => slide && setSlide({ ...slide, blocks });
  const steps = slide ? slideSteps(slide.blocks.length ? slide.blocks : []) : 1;
  // Zaman çizelgesi açıkken önizlemedeki hareketi Theatre Studio yönetir.
  const preview: ClientSlide | null = slide ? { id: `s${sel}`, position: sel, title: slide.title || " ", layout: slide.layout, blocks: slide.blocks, steps, motion: choreoOn ? undefined : slide.motion } : null;

  function moveSlide(i: number, d: -1 | 1) {
    const n = [...deck.slides];
    [n[i], n[i + d]] = [n[i + d]!, n[i]!];
    change({ ...deck, slides: n });
    collab.apply("move", i, i + d);
    setSel(i + d);
  }
  function dropSlide(e: DragEndEvent) {
    const from = Number(String(e.active.id).slice(6)), to = e.over ? Number(String(e.over.id).slice(6)) : from;
    if (from === to) return;
    const n = [...deck.slides];
    const [m] = n.splice(from, 1);
    n.splice(to, 0, m!);
    change({ ...deck, slides: n });
    collab.apply("move", from, to);
    setSel(sel === from ? to : sel > from && sel <= to ? sel - 1 : sel < from && sel >= to ? sel + 1 : sel);
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
      toast("ok", tl("v{version} yayınlandı. Yeni canlı dersler bu sürümle başlar.", { version: r.version }));
      setDraft(false);
      router.refresh();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function discard() {
    if (!window.confirm(tl("Yayınlanmamış değişiklikler silinsin ve son sürüme dönülsün mü?"))) return;
    if (timer.current) clearTimeout(timer.current);
    try {
      await api(`/api/presentations/${id}/draft`, { method: "DELETE" });
      toast("ok", tl("Taslak silindi."));
      window.location.reload();
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }

  async function restore(v: Version) {
    if (!window.confirm(tl("v{number} taslağa yüklensin mi? Yayınlayınca yeni sürüm olarak eklenir; geçmiş silinmez.", { number: v.number }))) return;
    if (timer.current) clearTimeout(timer.current);
    try {
      const r = await api<{ deck: Deck }>(`/api/presentations/${id}/versions/${v.id}/restore`, { method: "POST" });
      setDeck(r.deck);
      collab.apply("replace", r.deck);
      setSel(0);
      setDraft(true);
      setState("saved");
      setShowVersions(false);
      toast("ok", tl("v{number} taslağa yüklendi.", { number: v.number }));
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }

  // Dosyadan içe aktarma sayfaları sunucuda taslağa ekler; editör o taslağı alır.
  function imported(r: ImportResult) {
    if (!r.deck) return;
    const first = deck.slides.length;
    setDeck(r.deck);
    collab.apply("replace", r.deck);
    setIssues(r.issues ?? []);
    setDraft(true);
    setState("saved");
    setLastSaved(new Date().toISOString());
    setSel(Math.min(first, r.deck.slides.length - 1));
    setStep(0);
  }

  const STATUS: Record<SaveState, string> = {
    saved: draft ? `Taslak kaydedildi${lastSaved ? ` · ${formatDateTime(lastSaved, timezone, tl.intl)}` : ""}` : tl("Yayındaki sürümle aynı (v{version})", { version }),
    dirty: tl("Kaydedilmemiş değişiklik…"),
    saving: "Kaydediliyor…",
    error: tl("Kaydedilemedi — bağlantıyı kontrol et"),
  };

  return (
    <div className="stack">
      <div className="studio-bar">
        <input className="input studio-title" aria-label={tl("Sunum başlığı")} maxLength={160} value={deck.title} onChange={(e) => { change({ ...deck, title: e.target.value }); collab.apply("meta", e.target.value, deck.description); }} />
        <span className="small" data-state={state} role="status">{STATUS[state]}</span>
        <span className={`collab-pill is-${collab.status}`} title={collab.status === "live" ? tl("Ortak düzenleme açık") : collab.status === "offline" ? tl("Ortak düzenleme bağlantısı yok; değişiklikler yine kaydedilir") : tl("Bağlanıyor…")}>
          <span className="collab-dot" aria-hidden />
          {collab.peers.length ? <>{collab.peers.map((p) => <span key={p.clientId} className="peer-avatar" style={{ background: p.color }} title={tl("{name} · {v0}. slayt", { name: p.name, v0: p.slide + 1 })}>{p.name.slice(0, 1).toLocaleUpperCase("tr")}</span>)} <span className="tiny">{tl("birlikte düzenleniyor")}</span></> : <span className="tiny">{collab.status === "live" ? tl("Canlı") : collab.status === "offline" ? tl("Çevrimdışı") : tl("Bağlanıyor")}</span>}
        </span>
        <span style={{ flex: 1 }} />
        <MarpImport room={200 - deck.slides.length} onAppend={(add) => {
          const at = deck.slides.length;
          change({ ...deck, slides: [...deck.slides, ...add] });
          add.forEach((sl, k) => collab.apply("insert", at + k, sl));
          setSel(at);
          setStep(0);
          toast("ok", tl("{length} slayt eklendi.", { length: add.length }));
        }} />
        <ImportDeck converterEnabled={converterEnabled} presentationId={id} deckTitle={deck.title} beforeImport={flush} onImported={imported} />
        <button className="btn btn-sm" onClick={() => setShowVersions((v) => !v)} aria-expanded={showVersions}><History size={14} aria-hidden />{" "}{tl("Sürümler")}</button>
        {draft && <button className="btn btn-sm" onClick={discard}><Undo2 size={14} aria-hidden />{" "}{tl("Taslağı at")}</button>}
        <button className="btn btn-sm btn-primary" disabled={busy || !draft || issues.length > 0 || state === "error"} onClick={publish} title={issues.length ? tl("Önce aşağıdaki sorunları düzelt") : undefined}>
          <Rocket size={14} aria-hidden />{" "}{tl("Yayınla (v{v0})", { v0: version + 1 })}
        </button>
      </div>

      {issues.length > 0 && (
        <div className="alert alert-warn small" role="alert">
          <div>
            <strong>{tl("Yayınlamadan önce düzelt:")}</strong>
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
          <div className="card-h"><h2>{tl("Sürüm geçmişi")}</h2><span className="tiny faint">{tl("canlı dersler başlatıldıkları sürümü kullanır")}</span></div>
          <div className="card-b"><ul className="list-tight">
            {versions.map((v) => (
              <li key={v.id}>
                <span className="mono">{tl("v{number}", { number: v.number })}</span>
                <span style={{ flex: 1 }} className="small">{tl("{v0} · {author} · {slides} slayt", { v0: formatDateTime(v.createdAt, timezone, tl.intl), author: v.author, slides: v.slides })}</span>
                <button className="btn btn-sm" onClick={() => restore(v)}>{tl("Taslağa yükle")}</button>
              </li>
            ))}
          </ul></div>
        </section>
      )}

      <div className="studio">
        <nav className="studio-slides" aria-label={tl("Slaytlar")}>
          <DndContext id="studio-slides" sensors={sensors} collisionDetection={closestCenter} onDragEnd={dropSlide} accessibility={{ screenReaderInstructions: { draggable: tl("Slaytı almak için Boşluk, taşımak için ok tuşları, bırakmak için Boşluk; vazgeçmek için Esc.") } }}>
            <SortableContext items={deck.slides.map((_, i) => `slide-${i}`)} strategy={verticalListSortingStrategy}>
              <ol>
                {deck.slides.map((s, i) => (
                  <SlideChip key={`slide-${i}`} id={`slide-${i}`} index={i} slide={s} current={i === sel} onPick={() => { setSel(i); setStep(0); }}>
                    {collab.peers.some((p) => p.slide === i) && <span className="chip-peers">{collab.peers.filter((p) => p.slide === i).map((p) => <span key={p.clientId} className="peer-avatar is-sm" style={{ background: p.color }} title={tl("{name} bu slaytta", { name: p.name })}>{p.name.slice(0, 1).toLocaleUpperCase("tr")}</span>)}</span>}
                  </SlideChip>
                ))}
              </ol>
            </SortableContext>
          </DndContext>
          <button type="button" className="btn btn-sm" onClick={() => insertSlide(sel + 1, emptySlide())} disabled={deck.slides.length >= 200}>
            <Plus size={14} aria-hidden />{" "}{tl("Slayt ekle")}
          </button>
        </nav>

        {slide && (
          <section className="studio-edit" aria-label={tl("Slayt {v0} düzenleyici", { v0: sel + 1 })}>
            <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
              <input className="input" style={{ flex: "1 1 220px" }} aria-label={tl("Slayt başlığı")} maxLength={160} value={slide.title} onChange={(e) => setSlide({ ...slide, title: e.target.value })} />
              <select className="input select" style={{ width: "auto" }} aria-label={tl("Düzen")} value={slide.layout} onChange={(e) => setSlide({ ...slide, layout: e.target.value as Slide["layout"] })}>
                {Object.entries(LAYOUTS).map(([k, l]) => <option key={k} value={k}>{tl(l)}</option>)}
              </select>
              <button className="btn btn-sm btn-ghost" aria-label={tl("Slaytı yukarı taşı")} disabled={sel === 0} onClick={() => moveSlide(sel, -1)}><ArrowUp size={14} aria-hidden /></button>
              <button className="btn btn-sm btn-ghost" aria-label={tl("Slaytı aşağı taşı")} disabled={sel === deck.slides.length - 1} onClick={() => moveSlide(sel, 1)}><ArrowDown size={14} aria-hidden /></button>
              <button className="btn btn-sm btn-ghost" aria-label={tl("Slaytı çoğalt")} onClick={() => insertSlide(sel + 1, structuredClone(slide))}><Copy size={14} aria-hidden /></button>
              <button className="btn btn-sm btn-ghost" aria-label={tl("Slaytı sil")} disabled={deck.slides.length === 1} onClick={() => { if (window.confirm("Slayt silinsin mi?")) { change({ ...deck, slides: deck.slides.filter((_, i) => i !== sel) }); collab.apply("remove", sel); setSel(Math.max(0, sel - 1)); } }}><Trash2 size={14} aria-hidden /></button>
            </div>

            <ChoreoEditor motion={slide.motion} count={slide.blocks.length} slideKey={sel} previewSelector=".studio-preview .slide" onActive={setChoreoOn} onChange={(motion) => setSlide({ ...latest.current.slides[sel]!, motion })} />

            <div ref={blocksRef} className="stack-sm">
            {slide.blocks.map((b, i) => (
              <div key={i} className="studio-block">
                <div className="row" style={{ gap: 6 }}>
                  <span className="eyebrow" style={{ flex: 1 }}>{i + 1}. {tl(BLOCK_LABEL[b.type])}</span>
                  <button className="btn btn-sm btn-ghost" aria-label={tl("Blok {v0} yukarı", { v0: i + 1 })} disabled={i === 0} onClick={() => moveBlock(i, -1)}><ArrowUp size={13} aria-hidden /></button>
                  <button className="btn btn-sm btn-ghost" aria-label={tl("Blok {v0} aşağı", { v0: i + 1 })} disabled={i === slide.blocks.length - 1} onClick={() => moveBlock(i, 1)}><ArrowDown size={13} aria-hidden /></button>
                  <button className="btn btn-sm btn-ghost" aria-label={tl("Blok {v0} sil", { v0: i + 1 })} onClick={() => setBlocks(slide.blocks.filter((_, j) => j !== i))}><Trash2 size={13} aria-hidden /></button>
                </div>
                <BlockEditor block={b} anims={anims} missions={missions} idp={`b${sel}-${i}`} onChange={(nb) => setBlocks(slide.blocks.map((x, j) => (j === i ? nb : x)))} />
              </div>
            ))}
            </div>

            {slide.blocks.length < 12 && (
              <div className="studio-add" role="group" aria-label={tl("Blok ekle")}>
                <span className="small faint">{tl("Blok ekle:")}</span>
                {(Object.keys(BLOCK_LABEL) as Block["type"][]).map((t) => (
                  <button key={t} type="button" className="btn btn-sm btn-ghost" onClick={() => setBlocks([...slide.blocks, newBlock(t, anims, missions)])}>+ {tl(BLOCK_LABEL[t])}</button>
                ))}
              </div>
            )}

            <div className="field">
              <label htmlFor="studio-notes">{tl("Eğitmen notları (öğrenciler görmez)")}</label>
              <textarea id="studio-notes" className="textarea" rows={3} maxLength={5000} value={slide.notes} onChange={(e) => setSlide({ ...slide, notes: e.target.value })} />
            </div>
          </section>
        )}

        <aside className="studio-preview" aria-label={tl("Önizleme")}>
          {preview && <SlideView slide={preview} step={Math.min(step, steps - 1)} stepKey={`${sel}:${step}`} />}
          <div className="row small" style={{ justifyContent: "space-between" }}>
            <button className="btn btn-sm" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>{tl("‹ Adım")}</button>
            <span className="mono">{tl("adım {v0}/{steps}", { v0: Math.min(step, steps - 1) + 1, steps })}</span>
            <button className="btn btn-sm" disabled={step >= steps - 1} onClick={() => setStep((s) => s + 1)}>{tl("Adım ›")}</button>
          </div>
          <p className="tiny faint" style={{ margin: 0 }}>
            {tl("Değişiklikler otomatik kaydedilir (taslak). Öğrenciler ve canlı dersler yalnız yayınlanan sürümü görür.")}{" "}<Link href={`/teach/presentations/${id}`}>{tl("Sunum sayfası")}</Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
