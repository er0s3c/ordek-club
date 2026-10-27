"use client";
// Tarayıcı içi atölyeler: güvenli kod düzeltme, görsel ağ kurma, sorgu geliştirme, olay zaman çizelgesi ve kanıt
// ilişki haritası. Önizleme istemcide, puanlama her zaman sunucuda yapılır. Gerçek hedefe hiçbir trafik gitmez.
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, CheckCircle2, CircleX, GripVertical, Link2, Play, Plus, RotateCcw, Send, Terminal as TermIcon, Trash2 } from "lucide-react";
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { api } from "@/lib/api-client";
import { evaluateFirewall, runQuery, type FwRule, type Row } from "@/lib/workshop-query";
import { useToast } from "@/components/providers";
import { SplitPane } from "@/components/ui/SplitPane";
import { StatusPill } from "@/components/ui/states";
import { Duck } from "@/components/ui/Duck";
import { CodeEditor } from "@/components/ui/CodeEditor";
import { usePython } from "./usePython";
import { useT } from "@/i18n/client";
import type { T } from "@/i18n/translate";

const mapBox = () => <div className="skeleton flow-map" />;
const NetFlow = dynamic(() => import("./FlowMaps").then((m) => m.NetFlow), { ssr: false, loading: mapBox });
const EvidenceFlow = dynamic(() => import("./FlowMaps").then((m) => m.EvidenceFlow), { ssr: false, loading: mapBox });

type Result = { score: number; passed: boolean; checks: { name: string; ok: boolean; hint?: string }[]; explanation?: string; xp: number };

function useSubmit(kind: string) {
  const toast = useToast();
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  async function submit(key: string, payload: unknown) {
    setBusy(true);
    try { const r = await api<Result>(`/api/workshops/${kind}/${key}`, { body: { payload } }); setResult(r); if (r.passed) router.refresh(); }
    catch (e) { toast("error", (e as Error).message); } finally { setBusy(false); }
  }
  return { result, setResult, busy, submit };
}

function ResultBox({ r }: { r: Result | null }) {
  const t = useT();
  if (!r) return null;
  return (
    <section className={`card ${r.passed ? "card-primary" : ""}`} aria-live="polite" aria-label={t("Sonuç")}>
      <div className="card-b stack-sm">
        <div className="row-between">{r.passed ? <span className="row"><Duck pose="cheer" size={40} /><strong>{t("Tamamlandı")}{r.xp ? t(" · +{xp} XP", { xp: r.xp }) : ""}</strong></span> : <strong>{t("Henüz değil · %{score}", { score: r.score })}</strong>}<StatusPill tone={r.passed ? "ok" : "warn"}>%{r.score}</StatusPill></div>
        <ul className="list-tight">{r.checks.map((c) => <li key={c.name} style={{ alignItems: "flex-start" }}>{c.ok ? <CheckCircle2 size={16} color="var(--ok)" aria-label={t("geçti")} /> : <CircleX size={16} color="var(--err)" aria-label={t("geçmedi")} />}<span style={{ flex: 1 }}>{c.name}{!c.ok && c.hint && <span className="tiny faint" style={{ display: "block" }}>{c.hint}</span>}</span></li>)}</ul>
        {r.explanation && <p className="small" style={{ margin: 0 }}>{r.explanation}</p>}
      </div>
    </section>
  );
}

function ScenarioPicker<T extends { key: string; title: string }>({ items, value, onChange, done }: { items: T[]; value: string; onChange: (k: string) => void; done: string[] }) {
  const t = useT();
  return <div className="chips" role="radiogroup" aria-label={t("Senaryo")}>{items.map((i) => <button key={i.key} type="button" className="chip" role="radio" aria-checked={value === i.key} onClick={() => onChange(i.key)}>{done.includes(i.key) ? "✓ " : ""}{i.title}</button>)}</div>;
}

// ── güvenli kod ──
type Code = { key: string; title: string; story: string; language: string; lines: string[]; sandbox: string | null };

// Özgün koda göre değişen bölge: ortak baş/son satırlar atılır; zafiyetli satır bölgedeyse onun numarası gönderilir.
function changedRegion(orig: string[], next: string[]): { line: number; span: number; fix: string; from: number; to: number } | null {
  let p = 0;
  while (p < orig.length && p < next.length && orig[p] === next[p]) p++;
  let q = 0;
  while (q < orig.length - p && q < next.length - p && orig[orig.length - 1 - q] === next[next.length - 1 - q]) q++;
  if (p === orig.length && p === next.length) return null;
  return { line: p, span: orig.length - q - p, fix: next.slice(p, next.length - q).join("\n"), from: p + 1, to: Math.max(p + 1, next.length - q) };
}

export function SecureCodeWorkshop({ items, done }: { items: Code[]; done: string[] }) {
  const t = useT();
  const [key, setKey] = useState(items[0]!.key);
  const s = items.find((i) => i.key === key)!;
  const [code, setCode] = useState(s.lines.join("\n"));
  const [run, setRun] = useState<{ ok: boolean; out: string; error?: string } | null>(null);
  const { result, setResult, busy, submit } = useSubmit("secure-code");
  const py = usePython();
  const pick = (k: string) => { setKey(k); setCode(items.find((i) => i.key === k)!.lines.join("\n")); setRun(null); setResult(null); };
  const region = useMemo(() => changedRegion(s.lines, code.split("\n")), [s.lines, code]);
  const canRun = s.language === "python" && !!s.sandbox;
  return (
    <div className="stack">
      <ScenarioPicker items={items} value={key} onChange={pick} done={done} />
      <p className="muted" style={{ margin: 0 }}>{s.story}</p>
      <SplitPane storageKey="ws-code" leftLabel="Kod" rightLabel="Testler" left={
        <div className="stack-sm" style={{ paddingRight: 8 }}>
          <div className="row-between">
            <span className="tiny faint">{t("Zafiyetli satırı bul ve düzenleyicide düzelt · {language}", { language: s.language })}</span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={!region} onClick={() => { setCode(s.lines.join("\n")); setRun(null); setResult(null); }}><RotateCcw size={13} aria-hidden />{" "}{t("Sıfırla")}</button>
          </div>
          <CodeEditor value={code} onChange={(v) => { setCode(v); setResult(null); }} language={s.language} height={240} ariaLabel={t("Düzeltilecek kod")} />
          <span className="tiny faint" role="status">{region ? t("Değişen bölüm: {v0}", { v0: region.from === region.to ? `${region.from}. satır` : `${region.from}–${region.to}. satırlar` }) : t("Henüz değişiklik yok.")}</span>
        </div>
      } right={
        <div className="stack-sm" style={{ paddingLeft: 8 }}>
          {canRun && (
            <section className="card card-b stack-sm" aria-label={t("Tarayıcıda dene")}>
              <div className="row-between"><strong className="small">{t("Saldırı girdisiyle dene")}</strong><button type="button" className="btn btn-sm" disabled={py.running} onClick={async () => setRun(await py.run(`${code}\n\n${s.sandbox}`))}><TermIcon size={13} aria-hidden /> {py.running ? t("Çalışıyor…") : t("Tarayıcıda çalıştır")}</button></div>
              <p className="tiny faint" style={{ margin: 0 }}>{t("Kodun Pyodide ile yalnız senin tarayıcında çalışır; gerçek veritabanı ya da kabuk yerine çağrıları kaydeden sahte nesneler kullanılır. İlk çalıştırma Python'u yüklediği için birkaç saniye sürer.")}</p>
              {run && <pre className={`ws-run-out${run.ok ? "" : " is-err"}`} aria-live="polite">{run.out}{run.error ? `${run.out ? "\n" : ""}Hata: ${run.error}` : ""}</pre>}
            </section>
          )}
          <p className="tiny faint" style={{ margin: 0 }}>{t("Puanlayan testler: zafiyet giderildi mi, mevcut davranış korundu mu? Sunucu kodu çalıştırmaz; kurallar metni denetler.")}</p>
          <div><button type="button" className="btn btn-primary btn-sm" disabled={busy || !region || !region.fix.trim()} onClick={() => region && submit(key, { line: region.line, span: region.span, fix: region.fix })}><Play size={14} aria-hidden />{" "}{t("Testleri çalıştır")}</button></div>
          <ResultBox r={result} />
        </div>
      } />
    </div>
  );
}

// ── ağ kurma ──
type NetNode = { id: string; label: string; ip: string; zone: string; x: number; y: number };
type Net = { key: string; title: string; story: string; nodes: NetNode[]; starter: FwRule[]; packets: { from: string; to: string; port: number }[] };
export function NetworkWorkshop({ items, done }: { items: Net[]; done: string[] }) {
  const t = useT();
  const [key, setKey] = useState(items[0]!.key);
  const s = items.find((i) => i.key === key)!;
  const [rules, setRules] = useState<FwRule[]>(s.starter);
  const [sim, setSim] = useState<{ i: number; action: "allow" | "deny" }[] | null>(null);
  const { result, setResult, busy, submit } = useSubmit("network");
  const pick = (k: string) => { setKey(k); setRules(items.find((i) => i.key === k)!.starter); setSim(null); setResult(null); };
  const node = (id: string) => s.nodes.find((n) => n.id === id);
  const opts = [{ id: "any", label: t("her yer") }, ...s.nodes.map((n) => ({ id: n.id, label: `${n.label} (${n.ip})` }))];
  const set = (i: number, patch: Partial<FwRule>) => { setRules(rules.map((r, j) => (j === i ? { ...r, ...patch } : r))); setSim(null); };
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= rules.length) return; const r = [...rules]; [r[i], r[j]] = [r[j]!, r[i]!]; setRules(r); setSim(null); };
  return (
    <div className="stack">
      <ScenarioPicker items={items} value={key} onChange={pick} done={done} />
      <p className="muted" style={{ margin: 0 }}>{s.story}</p>
      <NetFlow key={key} nodes={s.nodes} packets={s.packets} sim={sim} />
      <div className="grid-2" style={{ alignItems: "start" }}>
        <section className="card card-b stack-sm" aria-label={t("Güvenlik duvarı kuralları")}>
          <strong className="small">{t("Kurallar (yukarıdan aşağı, ilk eşleşen uygulanır; eşleşme yoksa red)")}</strong>
          {rules.map((r, i) => (
            <div key={i} className="fw-rule">
              <span className="mono tiny">{i + 1}</span>
              <select className="select" aria-label={t("Kaynak")} value={r.from} onChange={(e) => set(i, { from: e.target.value })}>{opts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
              <select className="select" aria-label={t("Hedef")} value={r.to} onChange={(e) => set(i, { to: e.target.value })}>{opts.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
              <input className="input" aria-label="Port" style={{ width: 80 }} value={r.port} onChange={(e) => set(i, { port: e.target.value.trim() || "any" })} />
              <select className="select" aria-label={t("Eylem")} value={r.action} onChange={(e) => set(i, { action: e.target.value as "allow" | "deny" })}><option value="allow">{t("izin")}</option><option value="deny">{t("reddet")}</option></select>
              <button type="button" className="btn btn-ghost btn-sm" aria-label={t("Yukarı taşı")} onClick={() => move(i, -1)}><ArrowUp size={13} /></button>
              <button type="button" className="btn btn-ghost btn-sm" aria-label={t("Aşağı taşı")} onClick={() => move(i, 1)}><ArrowDown size={13} /></button>
              <button type="button" className="btn btn-ghost btn-sm" aria-label={t("Kuralı sil")} onClick={() => { setRules(rules.filter((_, j) => j !== i)); setSim(null); }}><Trash2 size={13} /></button>
            </div>
          ))}
          <div className="row">
            <button type="button" className="btn btn-sm btn-ghost" disabled={rules.length >= 20} onClick={() => setRules([...rules, { from: "any", to: "any", port: "443", action: "allow" }])}><Plus size={13} aria-hidden />{" "}{t("Kural")}</button>
            <button type="button" className="btn btn-sm" onClick={() => setSim(s.packets.map((p, i) => ({ i, action: evaluateFirewall(rules, p).action })))}><Play size={13} aria-hidden />{" "}{t("Simüle et")}</button>
            <button type="button" className="btn btn-sm btn-primary" disabled={busy} onClick={() => submit(key, { rules })}><Send size={13} aria-hidden />{" "}{t("Gönder")}</button>
          </div>
        </section>
        <section className="card card-b stack-sm" aria-label={t("Test paketleri")}>
          <strong className="small">{t("Test paketleri")}</strong>
          <ul className="list-tight">{s.packets.map((p, i) => { const r = sim?.find((x) => x.i === i); return <li key={i}><span style={{ flex: 1 }}>{node(p.from)?.label} → {node(p.to)?.label} :{p.port}</span>{r ? <StatusPill tone={r.action === "allow" ? "ok" : "err"}>{r.action === "allow" ? t("geçti") : "engellendi"}</StatusPill> : <span className="tiny faint">—</span>}</li>; })}</ul>
          <ResultBox r={result} />
        </section>
      </div>
    </div>
  );
}

// ── sorgu ──
type Query = { key: string; title: string; story: string; question: string; rows: Row[]; example: string };
export function QueryWorkshop({ items, done }: { items: Query[]; done: string[] }) {
  const t = useT();
  const [key, setKey] = useState(items[0]!.key);
  const s = items.find((i) => i.key === key)!;
  const [q, setQ] = useState("where status=FAIL");
  const [answer, setAnswer] = useState("");
  const out = useMemo(() => runQuery(s.rows, q), [s.rows, q]);
  const { result, setResult, busy, submit } = useSubmit("query");
  return (
    <div className="stack">
      <ScenarioPicker items={items} value={key} onChange={(k) => { setKey(k); setResult(null); setAnswer(""); }} done={done} />
      <p className="muted" style={{ margin: 0 }}>{s.story} <strong>{s.question}</strong></p>
      <SplitPane storageKey="ws-query" leftLabel="Sorgu" rightLabel={t("Sonuçlar")} left={
        <div className="stack-sm" style={{ paddingRight: 8 }}>
          <label className="field">{t("Sorgu")}<textarea className="textarea mono" rows={4} spellCheck={false} value={q} onChange={(e) => setQ(e.target.value)} /></label>
          <span className="tiny faint">{t("Komutlar:")}{" "}<code>where alan=değer and alan~parça</code> · <code>| count by alan</code> · <code>| sort alan desc</code> · <code>| fields a,b</code> · <code>| limit 10</code>{t(". Alanlar: {v0}", { v0: Object.keys(s.rows[0] ?? {}).join(", ") })}</span>
          <label className="field">{t("Cevabın")}<input className="input" value={answer} onChange={(e) => setAnswer(e.target.value)} /></label>
          <div><button type="button" className="btn btn-primary btn-sm" disabled={busy || !answer.trim()} onClick={() => submit(key, { query: q, answer })}><Send size={14} aria-hidden />{" "}{t("Gönder")}</button></div>
          <ResultBox r={result} />
        </div>
      } right={
        <div style={{ paddingLeft: 8 }}>
          {!out.ok ? <div className="alert alert-error small">{out.error}</div> : (
            <div className="table-wrap" style={{ maxHeight: 420 }}>
              <span className="tiny faint" role="status">{t("{length} satır", { length: out.rows.length })}</span>
              <table className="table mono" style={{ fontSize: 12.5 }}><thead><tr>{out.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead><tbody>{out.rows.slice(0, 100).map((r, i) => <tr key={i}>{out.columns.map((c) => <td key={c}>{String(r[c] ?? "")}</td>)}</tr>)}</tbody></table>
            </div>
          )}
        </div>
      } />
    </div>
  );
}

// ── zaman çizelgesi ──
type Card = { id: string; source: string; time: string; text: string };
type TL = { key: string; title: string; story: string; cards: Card[] };
export function TimelineWorkshop({ items, done }: { items: TL[]; done: string[] }) {
  const t = useT();
  const [key, setKey] = useState(items[0]!.key);
  const s = items.find((i) => i.key === key)!;
  const [order, setOrder] = useState(s.cards.map((c) => c.id));
  const [text, setText] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onDragEnd = (e: DragEndEvent) => { const to = e.over?.id; if (to && to !== e.active.id) setOrder((o) => arrayMove(o, o.indexOf(String(e.active.id)), o.indexOf(String(to)))); };
  const { result, setResult, busy, submit } = useSubmit("timeline");
  const pick = (k: string) => { setKey(k); setOrder(items.find((i) => i.key === k)!.cards.map((c) => c.id)); setResult(null); };
  const move = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= order.length) return; const o = [...order]; [o[i], o[j]] = [o[j]!, o[i]!]; setOrder(o); };
  const card = (id: string) => s.cards.find((c) => c.id === id)!;
  return (
    <div className="stack">
      <ScenarioPicker items={items} value={key} onChange={pick} done={done} />
      <p className="muted" style={{ margin: 0 }}>{s.story}</p>
      <DndContext id="timeline-cards" sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} accessibility={{ announcements: dndText(t), screenReaderInstructions: { draggable: t("Kartı almak için Boşluk'a bas, ok tuşlarıyla taşı, bırakmak için yine Boşluk; vazgeçmek için Esc.") } }}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ol className="tl-list" aria-label={t("Kanıtları zaman sırasına diz")}>
            {order.map((id, i) => <SortableCard key={id} id={id} index={i} card={card(id)} onMove={move} />)}
          </ol>
        </SortableContext>
      </DndContext>
      <label className="field">{t("Olay nasıl gelişti?")}<textarea className="textarea" rows={4} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Önce …, ardından …; bu yüzden …")} /></label>
      <div><button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => submit(key, { order, explanation: text })}><Send size={14} aria-hidden />{" "}{t("Gönder")}</button></div>
      <ResultBox r={result} />
    </div>
  );
}

// dnd-kit ekran okuyucu duyuruları
const dndText = (t: T) => ({
  onDragStart: ({ active }: { active: { id: string | number } }) => t("Kart {id} alındı.", { id: String(active.id) }),
  onDragOver: ({ over }: { over: { id: string | number } | null }) => (over ? t("Kart {id} kartının yerinde.", { id: String(over.id) }) : t("Liste dışında.")),
  onDragEnd: ({ over }: { over: { id: string | number } | null }) => (over ? t("Kart {id} konumuna bırakıldı.", { id: String(over.id) }) : t("Kart bırakıldı.")),
  onDragCancel: () => t("Taşıma iptal edildi."),
});

function SortableCard({ id, index, card, onMove }: { id: string; index: number; card: Card; onMove: (i: number, d: number) => void }) {
  const t = useT();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`tl-card${isDragging ? " is-dragging" : ""}`}>
      <button type="button" className="tl-grip" aria-label={t("{v0}. kartı sürükle", { v0: index + 1 })} {...attributes} {...listeners}><GripVertical size={15} aria-hidden /></button>
      <span className="tl-no mono">{index + 1}</span>
      <div style={{ flex: 1, minWidth: 0 }}><div className="tiny faint">{card.source} · <span className="mono">{card.time}</span></div><div className="small">{card.text}</div></div>
      <button type="button" className="btn btn-ghost btn-sm" aria-label={t("{v0}. kartı yukarı taşı", { v0: index + 1 })} onClick={() => onMove(index, -1)}><ArrowUp size={13} /></button>
      <button type="button" className="btn btn-ghost btn-sm" aria-label={t("{v0}. kartı aşağı taşı", { v0: index + 1 })} onClick={() => onMove(index, 1)}><ArrowDown size={13} /></button>
    </li>
  );
}

// ── kanıt haritası ──
type MapNode = { id: string; kind: "ip" | "user" | "file" | "event"; label: string; detail: string };
type MapS = { key: string; title: string; story: string; nodes: MapNode[] };
const KIND_TR = { ip: "IP", user: "Kullanıcı", file: "Dosya", event: "Olay" };
export function EvidenceMapWorkshop({ items, done }: { items: MapS[]; done: string[] }) {
  const t = useT();
  const [key, setKey] = useState(items[0]!.key);
  const s = items.find((i) => i.key === key)!;
  const [links, setLinks] = useState<{ from: string; to: string; reason: string }[]>([]);
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const { result, setResult, busy, submit } = useSubmit("evidence-map");
  const choose = (id: string) => { if (!a || (a && b)) { setA(id); setB(null); } else if (id !== a) setB(id); };
  return (
    <div className="stack">
      <ScenarioPicker items={items} value={key} onChange={(k) => { setKey(k); setLinks([]); setResult(null); }} done={done} />
      <p className="muted" style={{ margin: 0 }}>{s.story}</p>
      <EvidenceFlow key={key} nodes={s.nodes} links={links} picked={[a, b].filter((x): x is string => !!x)} onPair={(x, y) => { if (!y) choose(x); else { setA(x); setB(y); } }} />
      <div className="grid-2" style={{ alignItems: "start" }}>
        <section className="card card-b stack-sm" aria-label={t("Kanıtlar")}>
          <strong className="small">{t("1) İki kanıt seç")}</strong>
          <div className="chips">{s.nodes.map((n) => <button key={n.id} type="button" className="chip" aria-pressed={a === n.id || b === n.id} onClick={() => choose(n.id)} title={n.detail}>{t(KIND_TR[n.kind])}: {n.label}</button>)}</div>
          {a && <span className="tiny faint">{s.nodes.find((n) => n.id === a)?.detail}{b && ` · ${s.nodes.find((n) => n.id === b)?.detail}`}</span>}
          <label className="field">{t("2) Gerekçe")}<input className="input" maxLength={400} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("Bu IP'den gelen denemelerin ardından aynı dakikada giriş başarılı oldu.")} /></label>
          <div><button type="button" className="btn btn-sm" disabled={!a || !b || reason.trim().length < 10} onClick={() => { setLinks([...links, { from: a!, to: b!, reason }]); setA(null); setB(null); setReason(""); }}><Link2 size={13} aria-hidden />{" "}{t("Bağla")}</button></div>
        </section>
        <section className="card card-b stack-sm" aria-label={t("Bağlantılar")}>
          <strong className="small">{t("Bağlantılar ({length})", { length: links.length })}</strong>
          <ul className="list-tight">{links.map((l, i) => <li key={i}><span style={{ flex: 1, minWidth: 0 }}>{s.nodes.find((n) => n.id === l.from)?.label} ↔ {s.nodes.find((n) => n.id === l.to)?.label}<span className="tiny faint" style={{ display: "block" }}>{l.reason}</span></span><button type="button" className="btn btn-ghost btn-sm" aria-label={t("Bağlantıyı sil")} onClick={() => setLinks(links.filter((_, j) => j !== i))}><Trash2 size={13} /></button></li>)}</ul>
          <div><button type="button" className="btn btn-primary btn-sm" disabled={busy || !links.length} onClick={() => submit(key, { links })}><Send size={14} aria-hidden />{" "}{t("Gönder")}</button></div>
          <ResultBox r={result} />
        </section>
      </div>
    </div>
  );
}
