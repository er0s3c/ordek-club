"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState, StatusPill } from "@/components/ui/states";
import { useT } from "@/i18n/client";

type Snippet = { id: string; label: string; text: string };
type Rubric = { id: string; name: string; shared: boolean; mine: boolean; owner: string; rubric: { criterion: string; points: number }[] };
type Misconception = { id: string; title: string; belief: string; explanation: string; skills: string[]; lessonSlugs: string[]; author: string; mine: boolean };

function useAct() {
  const router = useRouter();
  const toast = useToast();
  return async (fn: () => Promise<unknown>, ok?: string) => {
    try { await fn(); if (ok) toast("ok", ok); router.refresh(); return true; } catch (e) { toast("error", (e as Error).message); return false; }
  };
}

function Snippets({ rows }: { rows: Snippet[] }) {
  const t = useT();
  const act = useAct();
  const [label, setLabel] = useState("");
  const [text, setText] = useState("");
  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <section className="card card-b stack">
        <strong>{t("Yeni parça")}</strong>
        <label className="field">{t("Kısa ad")}<input className="input" maxLength={60} value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t("Kanıt eksik")} /></label>
        <label className="field">{t("Metin")}<textarea className="textarea" rows={4} maxLength={2000} value={text} onChange={(e) => setText(e.target.value)} placeholder={t("Bulguyu destekleyen log satırını ya da ekran görüntüsünü eklemen gerekiyor.")} /></label>
        <div><button type="button" className="btn btn-sm btn-primary" disabled={label.trim().length < 2 || text.trim().length < 2} onClick={async () => { if (await act(() => api("/api/teach/library/snippets", { body: { label, text } }), "Eklendi.")) { setLabel(""); setText(""); } }}><Plus size={14} aria-hidden />{" "}{t("Ekle")}</button></div>
      </section>
      <div className="stack-sm">
        {rows.length ? rows.map((s) => (
          <article key={s.id} className="card card-b stack-sm">
            <div className="row-between"><strong>{s.label}</strong><button type="button" className="btn btn-ghost btn-sm" aria-label={t("{label} sil", { label: s.label })} onClick={() => act(() => api(`/api/teach/library/snippets/${s.id}`, { method: "DELETE" }))}><Trash2 size={14} aria-hidden /></button></div>
            <p className="small" style={{ margin: 0, whiteSpace: "pre-wrap" }}>{s.text}</p>
          </article>
        )) : <EmptyState title={t("Henüz parça yok")} text={t("Sık yazdığın geri bildirimleri kaydet; değerlendirme kuyruğunda tek tıkla eklenir.")} />}
      </div>
    </div>
  );
}

function Rubrics({ rows }: { rows: Rubric[] }) {
  const t = useT();
  const act = useAct();
  const toast = useToast();
  const [name, setName] = useState("");
  const [shared, setShared] = useState(false);
  const [items, setItems] = useState([{ criterion: "", points: 25 }]);
  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <section className="card card-b stack">
        <strong>{t("Yeni rubrik şablonu")}</strong>
        <label className="field">{t("Ad")}<input className="input" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Olay raporu rubriği")} /></label>
        {items.map((it, i) => (
          <div key={i} className="row">
            <input className="input" style={{ flex: 1 }} aria-label={t("Ölçüt {v0}", { v0: i + 1 })} maxLength={120} value={it.criterion} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, criterion: e.target.value } : x)))} />
            <input className="input" style={{ width: 90 }} type="number" min={1} max={1000} aria-label={t("Ölçüt {v0} puanı", { v0: i + 1 })} value={it.points} onChange={(e) => setItems(items.map((x, j) => (j === i ? { ...x, points: Number(e.target.value) } : x)))} />
          </div>
        ))}
        <div className="row"><button type="button" className="btn btn-ghost btn-sm" disabled={items.length >= 12} onClick={() => setItems([...items, { criterion: "", points: 25 }])}><Plus size={14} aria-hidden />{" "}{t("Ölçüt")}</button><span className="tiny faint">{t("Toplam {v0}", { v0: items.reduce((a, b) => a + b.points, 0) })}</span></div>
        <label className="check"><input type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} />{" "}{t("Diğer eğitmenlerle paylaş")}</label>
        <div><button type="button" className="btn btn-sm btn-primary" disabled={name.trim().length < 2 || items.some((x) => !x.criterion.trim())} onClick={async () => { if (await act(() => api("/api/teach/library/rubrics", { body: { name, shared, rubric: items } }), t("Şablon kaydedildi."))) { setName(""); setItems([{ criterion: "", points: 25 }]); } }}>{t("Kaydet")}</button></div>
      </section>
      <div className="stack-sm">
        {rows.length ? rows.map((r) => (
          <article key={r.id} className="card card-b stack-sm">
            <div className="row-between"><strong>{r.name}</strong>{r.shared ? <StatusPill tone="info">{t("paylaşılan · {owner}", { owner: r.owner })}</StatusPill> : null}</div>
            <ul className="list-tight">{r.rubric.map((c, i) => <li key={i}><span style={{ flex: 1 }}>{c.criterion}</span><span className="mono small">{c.points}</span></li>)}</ul>
            <div className="row">
              <button type="button" className="btn btn-sm" onClick={async () => { await navigator.clipboard.writeText(JSON.stringify(r.rubric)); toast("ok", t("Rubrik panoya kopyalandı; görev formunda ölçütlere uygulayabilirsin.")); }}><Copy size={14} aria-hidden />{" "}{t("Kopyala")}</button>
              {r.mine && <button type="button" className="btn btn-ghost btn-sm" onClick={() => act(() => api(`/api/teach/library/rubrics/${r.id}`, { method: "DELETE" }))}><Trash2 size={14} aria-hidden />{" "}{t("Sil")}</button>}
            </div>
          </article>
        )) : <EmptyState title={t("Henüz rubrik şablonu yok")} />}
      </div>
    </div>
  );
}

function Misconceptions({ rows }: { rows: Misconception[] }) {
  const t = useT();
  const act = useAct();
  const [title, setTitle] = useState("");
  const [belief, setBelief] = useState("");
  const [explanation, setExplanation] = useState("");
  const [lessons, setLessons] = useState("");
  return (
    <div className="grid-2" style={{ alignItems: "start" }}>
      <section className="card card-b stack">
        <strong>{t("Yeni kavram yanılgısı")}</strong>
        <label className="field">{t("Başlık")}<input className="input" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Hash ile şifrelemeyi karıştırma")} /></label>
        <label className="field">{t("Öğrencinin yanlış inancı")}<textarea className="textarea" rows={2} maxLength={500} value={belief} onChange={(e) => setBelief(e.target.value)} placeholder={t("“Hash’lenmiş parolayı anahtarla geri çözebiliriz.”")} /></label>
        <label className="field">{t("Doğru açıklama")}<textarea className="textarea" rows={3} maxLength={2000} value={explanation} onChange={(e) => setExplanation(e.target.value)} /></label>
        <label className="field">{t("İlgili ders kimlikleri (virgülle)")}<input className="input" value={lessons} onChange={(e) => setLessons(e.target.value)} placeholder="m08-02, m08-03" /></label>
        <div><button type="button" className="btn btn-sm btn-primary" disabled={title.trim().length < 3 || belief.trim().length < 3 || explanation.trim().length < 3} onClick={async () => { if (await act(() => api("/api/teach/misconceptions", { body: { title, belief, explanation, skills: [], lessonSlugs: lessons.split(/[\s,]+/).filter(Boolean) } }), "Kaydedildi.")) { setTitle(""); setBelief(""); setExplanation(""); setLessons(""); } }}>{t("Kaydet")}</button></div>
      </section>
      <div className="stack-sm">
        {rows.length ? rows.map((m) => (
          <article key={m.id} className="card card-b stack-sm">
            <div className="row-between"><strong>{m.title}</strong>{m.mine && <button type="button" className="btn btn-ghost btn-sm" aria-label={t("{title} sil", { title: m.title })} onClick={() => act(() => api(`/api/teach/misconceptions?id=${encodeURIComponent(m.id)}`, { method: "DELETE" }))}><Trash2 size={14} aria-hidden /></button>}</div>
            <p className="small" style={{ margin: 0 }}><span className="faint">{t("Yanılgı:")}</span> {m.belief}</p>
            <p className="small" style={{ margin: 0 }}><span className="faint">{t("Açıklama:")}</span> {m.explanation}</p>
            {m.lessonSlugs.length > 0 && <span className="tiny faint">{t("Dersler:")}{" "}{m.lessonSlugs.map((s) => <a key={s} href={`/academy/lesson/${s}`} style={{ marginRight: 6 }}>{s}</a>)}</span>}
          </article>
        )) : <EmptyState title={t("Henüz kayıt yok")} text={t("Sık görülen hataları ve açıklamalarını kaydet; ders paketi ve soru hazırlarken yeniden kullan.")} />}
      </div>
    </div>
  );
}

export function LibraryManager({ snippets, rubrics, misconceptions }: { snippets: Snippet[]; rubrics: Rubric[]; misconceptions: Misconception[] }) {
  const t = useT();
  return <Tabs label={t("Kütüphane")} tabs={[
    { id: "snippets", label: t("Yorum bankası ({length})", { length: snippets.length }), content: <Snippets rows={snippets} /> },
    { id: "rubrics", label: t("Rubrikler ({length})", { length: rubrics.length }), content: <Rubrics rows={rubrics} /> },
    { id: "misconceptions", label: t("Kavram yanılgıları ({length})", { length: misconceptions.length }), content: <Misconceptions rows={misconceptions} /> },
  ]} />;
}
