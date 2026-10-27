"use client";
import { useState } from "react";
import { Check, HandHeart, Plus, Trash2, Undo2 } from "lucide-react";
import { useClubAction } from "@/components/club/useClubAction";
import { EmptyState } from "@/components/ui/states";
import { useT } from "@/i18n/client";

type Task = { id: string; title: string; description: string; dueAt: string | null; status: string; claimedBy: { id: string; name: string } | null };
const COLS: [string, string][] = [["OPEN", "Açık"], ["CLAIMED", "Üstlenildi"], ["DONE", "Tamamlandı"]];

export function VolunteerBoard({ rows, userId, staff }: { rows: Task[]; userId: string; staff: boolean }) {
  const tl = useT();
  const act = useClubAction();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [due, setDue] = useState("");
  return (
    <div className="stack">
      {staff && (
        <section className="card card-b stack-sm" aria-label={tl("Yeni gönüllü görev")}>
          <div className="row">
            <input className="input" style={{ flex: 2, minWidth: 200 }} aria-label={tl("Başlık")} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tl("Etkinlik için afiş hazırla")} />
            <input className="input" style={{ maxWidth: 220 }} aria-label={tl("Son tarih")} type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <input className="input" aria-label={tl("Açıklama")} maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={tl("Ayrıntı (isteğe bağlı)")} />
          <div><button type="button" className="btn btn-sm btn-primary" disabled={title.trim().length < 3} onClick={async () => { if (await act({ action: "task.create", data: { title, description, dueAt: due ? new Date(due).toISOString() : null } }, tl("Görev eklendi."))) { setTitle(""); setDescription(""); setDue(""); } }}><Plus size={14} aria-hidden />{" "}{tl("Ekle")}</button></div>
        </section>
      )}
      {rows.length === 0 ? <EmptyState icon={HandHeart} title={tl("Şu an gönüllü görev yok")} /> : (
        <div className="kanban">
          {COLS.map(([k, label]) => (
            <section key={k} className="kanban-col" aria-labelledby={`col-${k}`}>
              <h2 id={`col-${k}`} className="eyebrow">{tl(label)} ({rows.filter((t) => t.status === k).length})</h2>
              {rows.filter((t) => t.status === k).map((t) => (
                <article key={t.id} className="card card-b stack-sm">
                  <strong className="small">{t.title}</strong>
                  {t.description && <span className="tiny faint">{t.description}</span>}
                  {t.dueAt && <span className="tiny">{tl("Son tarih:")}{" "}{new Date(t.dueAt).toLocaleString(tl.intl)}</span>}
                  {t.claimedBy && <span className="tiny">{tl("Üstlenen: {name}", { name: t.claimedBy.name })}</span>}
                  <div className="row">
                    {t.status === "OPEN" && <button type="button" className="btn btn-sm btn-primary" onClick={() => act({ action: "task.move", id: t.id, move: "claim" }, tl("Görevi üstlendin."))}><HandHeart size={13} aria-hidden />{" "}{tl("Üstlen")}</button>}
                    {t.status === "CLAIMED" && (t.claimedBy?.id === userId || staff) && <><button type="button" className="btn btn-sm" onClick={() => act({ action: "task.move", id: t.id, move: "done" }, tl("Teşekkürler!"))}><Check size={13} aria-hidden />{" "}{tl("Bitti")}</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => act({ action: "task.move", id: t.id, move: "release" })}><Undo2 size={13} aria-hidden />{" "}{tl("Bırak")}</button></>}
                    {staff && <button type="button" className="btn btn-ghost btn-sm" aria-label={tl("Görevi sil")} onClick={() => act({ action: "task.move", id: t.id, move: "delete" })}><Trash2 size={13} /></button>}
                  </div>
                </article>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
