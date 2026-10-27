"use client";
// Ders sayfası yardımcıları: bölüm listesi (scrollspy + kaldığın yer), odak modu, yazdırma, sorun bildirimi,
// ders içi sorular ve ders değerlendirmesi.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bug, CheckCircle2, EyeOff, Focus, List, MessageCircleQuestion, Minimize2, Printer, Send, Star } from "lucide-react";
import { api } from "@/lib/api-client";
import { fold } from "@/lib/text";
import { useToast } from "@/components/providers";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState, ErrorRetry, Skeleton, StatusPill } from "@/components/ui/states";
import { useClubReducedMotion } from "@/components/motion/MotionProvider";
import { useT } from "@/i18n/client";

export type Heading = { id: string; text: string; depth: 2 | 3 };

export function LessonToc({ slug, headings, mobile = false }: { slug: string; headings: Heading[]; mobile?: boolean }) {
  const tl = useT();
  const reduced = useClubReducedMotion();
  const [active, setActive] = useState(headings[0]?.id ?? "");
  const last = useRef("");
  useEffect(() => {
    if (!headings.length) return;
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (vis) setActive(vis.target.id);
    }, { rootMargin: "-90px 0px -65% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [headings]);
  // Kaldığın yer: bölüm değişince sessizce kaydedilir (yalnız masaüstü örneği kaydeder; çift istek olmasın).
  useEffect(() => {
    if (mobile || !active || active === last.current) return;
    const t = setTimeout(() => { last.current = active; api(`/api/lessons/${slug}/section`, { method: "PUT", body: { sectionId: active } }).catch(() => {}); }, 1500);
    return () => clearTimeout(t);
  }, [active, slug, mobile]);
  // [ ve ] ile önceki / sonraki bölüm
  useEffect(() => {
    if (mobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))) return;
      if (e.key !== "[" && e.key !== "]") return;
      const i = headings.findIndex((h) => h.id === active);
      const n = headings[e.key === "]" ? Math.min(headings.length - 1, i + 1) : Math.max(0, i - 1)];
      if (n) { e.preventDefault(); document.getElementById(n.id)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }); history.replaceState(null, "", `#${n.id}`); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [headings, active, mobile, reduced]);
  if (!headings.length) return null;
  const list = (
    <ol className="toc">
      {headings.map((h) => <li key={h.id} className={h.depth === 3 ? "toc-sub" : undefined}><a href={`#${h.id}`} aria-current={active === h.id ? "true" : undefined}>{h.text}</a></li>)}
    </ol>
  );
  if (mobile) return <details className="card toc-mobile"><summary className="card-b"><List size={15} aria-hidden />{" "}{tl("Bu dersin bölümleri")}</summary><div className="card-b" style={{ paddingTop: 0 }}>{list}</div></details>;
  return <nav aria-label={tl("Bu dersin bölümleri")}><div className="eyebrow" style={{ marginBottom: 8 }}>{tl("Bölümler")}</div>{list}</nav>;
}

export function FocusToggle() {
  const t = useT();
  const [on, setOn] = useState(false);
  const set = useCallback((v: boolean) => {
    setOn(v);
    document.documentElement.classList.toggle("focus-mode", v);
    try { localStorage.setItem("club:focus", v ? "1" : "0"); } catch { /* depolama kapalı */ }
  }, []);
  useEffect(() => {
    try { if (localStorage.getItem("club:focus") === "1") set(true); } catch { /* depolama kapalı */ }
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))) return;
      if (e.key === "f") { e.preventDefault(); set(!document.documentElement.classList.contains("focus-mode")); }
      if (e.key === "Escape" && document.documentElement.classList.contains("focus-mode")) set(false);
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.documentElement.classList.remove("focus-mode"); };
  }, [set]);
  return <button type="button" className="btn btn-sm" aria-pressed={on} onClick={() => set(!on)} title={t("Kısayol: f")}>{on ? <><Minimize2 size={15} aria-hidden />{" "}{t("Odak modundan çık")}</> : <><Focus size={15} aria-hidden />{" "}{t("Odak modu")}</>}</button>;
}

export function PrintButton() {
  const t = useT();
  return <button type="button" className="btn btn-sm btn-ghost" onClick={() => window.print()}><Printer size={15} aria-hidden />{" "}{t("Özet yazdır")}</button>;
}

export function IssueButton({ slug, location }: { slug?: string; location: string }) {
  const t = useT();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("CONTENT");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  async function send() {
    setBusy(true);
    try {
      const r = await api<{ number: string }>("/api/issues", { body: { lessonSlug: slug ?? null, location: `${location}${typeof window !== "undefined" ? window.location.hash : ""}`, kind, body } });
      setDone(r.number); setBody("");
    } catch (e) { toast("error", (e as Error).message); } finally { setBusy(false); }
  }
  return <>
    <button type="button" className="btn btn-sm btn-ghost" onClick={() => { setOpen(true); setDone(null); }}><Bug size={15} aria-hidden />{" "}{t("Hata bildir")}</button>
    <Drawer open={open} onClose={() => setOpen(false)} title={t("Sorun bildir")}>
      {done ? (
        <div className="stack">
          <div className="alert alert-ok"><CheckCircle2 size={18} aria-hidden /><span>{t("Bildirimin alındı. Takip numaran")}{" "}<strong>{done}</strong>{t(". Durumunu “Sorun bildirimlerim” sayfasından izleyebilirsin.")}</span></div>
          <a className="btn btn-sm" href="/reports">{t("Bildirimlerimi gör")}</a>
        </div>
      ) : (
        <div className="stack">
          <label className="field">{t("Tür")}
            <select className="select" value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="CONTENT">{t("İçerik hatası (yanlış bilgi, eksik açıklama)")}</option>
              <option value="TRANSLATION">{t("Çeviri / dil hatası")}</option>
              <option value="TECHNICAL">{t("Teknik sorun (çalışmayan düğme, lab)")}</option>
            </select>
          </label>
          <label className="field">{t("Ne fark ettin?")}<textarea className="textarea" rows={6} maxLength={3000} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("Örn. “Bölüm 3’teki örnekte port numarası 433 yazıyor, 443 olmalı.”")} /></label>
          <p className="tiny faint">{t("Bulunduğun sayfa ve bölüm bildirime otomatik eklenir. Kişisel bilgi ya da parola yazma.")}</p>
          <button type="button" className="btn btn-primary" disabled={busy || body.trim().length < 10} onClick={send}><Send size={15} aria-hidden />{" "}{t("Gönder")}</button>
        </div>
      )}
    </Drawer>
  </>;
}

type Q = { id: string; sectionId: string; body: string; status: string; createdAt: string; author: string; mine: boolean; answers: { id: string; body: string; staff: boolean; accepted: boolean; author: string; mine: boolean; createdAt: string }[] };

export function LessonQuestions({ slug, headings, staff }: { slug: string; headings: Heading[]; staff: boolean }) {
  const t = useT();
  const toast = useToast();
  const [rows, setRows] = useState<Q[] | null>(null);
  const [err, setErr] = useState("");
  const [section, setSection] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("");
  const load = useCallback(() => { setErr(""); api<{ questions: Q[] }>(`/api/lessons/${slug}/questions`).then((r) => setRows(r.questions)).catch((e) => setErr((e as Error).message)); }, [slug]);
  useEffect(load, [load]);
  // Benzer sorular: yazılan soruyla aynı kelimeleri içeren, yanıtlanmış sorular (yeni soru açmadan önce)
  const similar = useMemo(() => {
    const words = fold(body).split(/\W+/).filter((w) => w.length > 3);
    if (words.length < 2 || !rows) return [];
    return rows.filter((q) => q.status === "ANSWERED" && words.filter((w) => fold(q.body).includes(w)).length >= 2).slice(0, 3);
  }, [body, rows]);
  const title = (id: string) => headings.find((h) => h.id === id)?.text;
  async function ask() {
    setBusy(true);
    try { await api(`/api/lessons/${slug}/questions`, { body: { sectionId: section, body } }); setBody(""); toast("ok", t("Sorun eklendi. Yanıt geldiğinde bildirim alacaksın.")); load(); }
    catch (e) { toast("error", (e as Error).message); } finally { setBusy(false); }
  }
  async function answer(id: string) {
    try { await api(`/api/lesson-questions/${id}`, { body: { body: reply[id] ?? "" } }); setReply((r) => ({ ...r, [id]: "" })); load(); }
    catch (e) { toast("error", (e as Error).message); }
  }
  async function moderate(id: string, action: string, answerId?: string) {
    try { await api(`/api/lesson-questions/${id}`, { method: "PATCH", body: { action, answerId } }); load(); }
    catch (e) { toast("error", (e as Error).message); }
  }
  const shown = (rows ?? []).filter((q) => !filter || q.sectionId === filter);
  return (
    <section id="sorular" className="card focus-hide" aria-labelledby="q-h">
      <div className="card-h"><h2 id="q-h"><MessageCircleQuestion size={16} aria-hidden />{" "}{t("Bu dersle ilgili sorular")}</h2>
        {headings.length > 0 && <select className="select" style={{ maxWidth: 240 }} aria-label={t("Bölüme göre süz")} value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">{t("Tüm bölümler")}</option>{headings.map((h) => <option key={h.id} value={h.id}>{h.text}</option>)}</select>}
      </div>
      <div className="card-b stack">
        {err ? <ErrorRetry message={err} onRetry={load} /> : !rows ? <Skeleton /> : shown.length === 0 ? <EmptyState title={t("Henüz soru yok")} text={t("Takıldığın yeri sor; öğretmenin yanıtı bu dersi çalışan herkese yardımcı olur.")} /> : (
          <ul className="qa-list">
            {shown.map((q) => (
              <li key={q.id} className="qa-item">
                <div className="row-between">
                  <span className="tiny faint">{q.author} · {new Date(q.createdAt).toLocaleDateString(t.intl)}{q.sectionId && title(q.sectionId) ? <> · <a href={`#${q.sectionId}`}>{title(q.sectionId)}</a></> : null}</span>
                  {q.status === "ANSWERED" ? <StatusPill tone="ok">{t("yanıtlandı")}</StatusPill> : q.status === "HIDDEN" ? <StatusPill tone="neutral">{t("gizli")}</StatusPill> : <StatusPill tone="info">{t("yanıt bekliyor")}</StatusPill>}
                </div>
                <p style={{ margin: "6px 0", whiteSpace: "pre-wrap" }}>{q.body}</p>
                {q.answers.map((a) => (
                  <div key={a.id} className={`qa-answer${a.staff ? " is-staff" : ""}`}>
                    <span className="tiny faint">{a.author}{a.staff ? t(" · öğretmen") : ""}{a.accepted ? t(" · kabul edilen yanıt") : ""}</span>
                    <p style={{ margin: "4px 0 0", whiteSpace: "pre-wrap" }}>{a.body}</p>
                    {q.mine && !a.accepted && !a.mine && <button type="button" className="btn btn-ghost btn-sm" onClick={() => moderate(q.id, "accept", a.id)}><CheckCircle2 size={14} aria-hidden />{" "}{t("Bu yanıt çözdü")}</button>}
                  </div>
                ))}
                <div className="row" style={{ marginTop: 8 }}>
                  <input className="input" style={{ flex: 1, minWidth: 180 }} aria-label={t("Yanıt yaz")} placeholder={staff ? t("Öğretmen yanıtı yaz…") : t("Yardımcı olabilir misin? Yanıt yaz…")} value={reply[q.id] ?? ""} onChange={(e) => setReply((r) => ({ ...r, [q.id]: e.target.value }))} />
                  <button type="button" className="btn btn-sm" disabled={(reply[q.id] ?? "").trim().length < 2} onClick={() => answer(q.id)}>{t("Yanıtla")}</button>
                  {staff && <button type="button" className="btn btn-ghost btn-sm" onClick={() => moderate(q.id, q.status === "HIDDEN" ? "show" : "hide")}><EyeOff size={14} aria-hidden /> {q.status === "HIDDEN" ? t("Göster") : t("Gizle")}</button>}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="stack-sm qa-ask">
          <strong>{t("Soru sor")}</strong>
          {headings.length > 0 && <label className="field"><span className="tiny faint">{t("İlgili bölüm")}</span><select className="select" value={section} onChange={(e) => setSection(e.target.value)}><option value="">{t("Genel")}</option>{headings.map((h) => <option key={h.id} value={h.id}>{h.text}</option>)}</select></label>}
          <textarea className="textarea" rows={3} maxLength={2000} aria-label={t("Sorun")} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("Nerede takıldın? Ne denedin?")} />
          {similar.length > 0 && (
            <div className="alert alert-info"><MessageCircleQuestion size={16} aria-hidden /><div className="stack-sm"><span className="small">{t("Benzer, yanıtlanmış sorular var:")}</span>{similar.map((q) => <span key={q.id} className="small">“{q.body.slice(0, 90)}” → {q.answers.find((a) => a.accepted)?.body.slice(0, 120) ?? q.answers[0]?.body.slice(0, 120)}</span>)}</div></div>
          )}
          <div><button type="button" className="btn btn-primary btn-sm" disabled={busy || body.trim().length < 8} onClick={ask}><Send size={14} aria-hidden />{" "}{t("Soruyu gönder")}</button></div>
        </div>
      </div>
    </section>
  );
}

export function LessonFeedbackForm({ slug }: { slug: string }) {
  const t = useT();
  const toast = useToast();
  const [rating, setRating] = useState<number | null>(null);
  const [unclear, setUnclear] = useState("");
  const [comment, setComment] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => { api<{ feedback: { rating: number | null; comment: string; unclear: string } | null }>(`/api/lessons/${slug}/feedback`).then((r) => { if (r.feedback) { setRating(r.feedback.rating); setUnclear(r.feedback.unclear); setComment(r.feedback.comment); setSaved(true); } }).catch(() => {}); }, [slug]);
  async function save() {
    try { await api(`/api/lessons/${slug}/feedback`, { method: "PUT", body: { rating, unclear, comment } }); setSaved(true); toast("ok", t("Geri bildirimin kaydedildi. Teşekkürler!")); }
    catch (e) { toast("error", (e as Error).message); }
  }
  return (
    <section className="card card-quiet focus-hide no-print" aria-labelledby="fb-h">
      <div className="card-h"><h2 id="fb-h"><Star size={14} aria-hidden />{" "}{t("Bu ders işine yaradı mı?")}</h2>{saved && <StatusPill tone="ok">{t("kaydedildi")}</StatusPill>}</div>
      <div className="card-b stack">
        <div className="row" role="radiogroup" aria-label={t("Puan (1–5)")}>
          {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={rating === n} className={`chip${rating === n ? "" : ""}`} onClick={() => { setRating(n); setSaved(false); }}>{n} <Star size={12} aria-hidden /></button>)}
        </div>
        <label className="field">{t("Bu derste en belirsiz kalan nokta neydi?")}{" "}<span className="tiny faint">{t("(öğretmene isimsiz özet olarak gider)")}</span><input className="input" maxLength={500} value={unclear} onChange={(e) => { setUnclear(e.target.value); setSaved(false); }} /></label>
        <label className="field">{t("Eklemek istediğin bir şey")}<input className="input" maxLength={1000} value={comment} onChange={(e) => { setComment(e.target.value); setSaved(false); }} /></label>
        <div><button type="button" className="btn btn-sm" disabled={saved || (!rating && !unclear.trim() && !comment.trim())} onClick={save}>{t("Gönder")}</button></div>
      </div>
    </section>
  );
}
