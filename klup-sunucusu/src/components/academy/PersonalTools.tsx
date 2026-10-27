"use client";
import { useEffect, useRef, useState } from "react";
import { Bookmark, NotebookPen } from "lucide-react";
import { api } from "@/lib/api-client";
import { Drawer } from "@/components/ui/Drawer";
import { SaveStatus, Skeleton, type SaveState } from "@/components/ui/states";
import { useT } from "@/i18n/client";

type Data = { note: string; bookmarked: boolean; updatedAt: string | null };

// Ders notu ve kaydetme; yan panelde açılır, öğrenci okuduğu paragraftan ayrılmaz. Kayıt durumu panelde görünür.
export function PersonalNotes({ slug }: { slug: string }) {
  const t = useT();
  const [data, setData] = useState<Data | null>(null);
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string | undefined>();
  const saving = useRef(false);
  const revision = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { let live = true; api<Data>(`/api/learning/personal/${slug}`).then(v => { if (live) setData(v); }).catch(e => { if (live) { setState("error"); setMessage(e.message); } }); return () => { live = false; }; }, [slug]);
  useEffect(() => { if (state !== "dirty") return; const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); }; window.addEventListener("beforeunload", warn); return () => window.removeEventListener("beforeunload", warn); }, [state]);
  async function save(next: Data) {
    if (saving.current) return;
    saving.current = true;
    const at = revision.current;
    setState("saving"); setMessage(undefined);
    try {
      const result = await api<{ updatedAt: string }>(`/api/learning/personal/${slug}`, { method: "PUT", body: next });
      setData(d => d ? { ...d, updatedAt: result.updatedAt } : d);
      setState(revision.current === at ? "saved" : "dirty");
    } catch (e) { setState("error"); setMessage((e as Error).message); } finally { saving.current = false; }
  }
  function change(next: Data, immediate = false) {
    revision.current++;
    setData(next); setState("dirty");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void save({ ...next }), immediate ? 0 : 1200);
  }
  if (!data) return state === "error" ? <SaveStatus state="error" message={message} /> : <Skeleton lines={4} />;
  return <div className="stack">
    <label className="learning-check"><input type="checkbox" checked={data.bookmarked} onChange={e => change({ ...data, bookmarked: e.target.checked }, true)} /><Bookmark size={16} aria-hidden />{" "}{t("Daha sonra çalışmak için kaydet")}</label>
    <label className="field">{t("Yalnızca sana görünen ders notu")}<textarea className="textarea" rows={12} maxLength={20000} value={data.note} onChange={e => change({ ...data, note: e.target.value })} /></label>
    <div className="row-between"><SaveStatus state={state} message={message} /><span className="tiny faint">{t("Yazmayı bıraktığında kendiliğinden kaydedilir.")}</span></div>
  </div>;
}

export function NotesButton({ slug }: { slug: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  return <>
    <button type="button" className="btn btn-sm" onClick={() => setOpen(true)} aria-haspopup="dialog"><NotebookPen size={15} aria-hidden />{" "}{t("Notlarım")}</button>
    <Drawer open={open} onClose={() => setOpen(false)} title={t("Notlarım ve kaydet")}><PersonalNotes slug={slug} /></Drawer>
  </>;
}

// Eski yerleşim (ders sonu katlı kart) için sarmalayıcı.
export function PersonalTools({ slug }: { slug: string }) {
  const t = useT();
  return <details className="card personal-tools"><summary><NotebookPen size={16} aria-hidden />{" "}{t("Notlarım ve kaydet")}</summary><div className="card-b"><PersonalNotes slug={slug} /></div></details>;
}
