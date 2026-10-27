"use client";
// Aylık kulüp bülteni: son 30 günün verilerinden düzenlenebilir taslak; onaylanınca duyuru olarak yayınlanır.
import { useState } from "react";
import { Newspaper, Send, Wand2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { useClubAction } from "@/components/club/useClubAction";
import { useT } from "@/i18n/client";

export function Newsletter() {
  const t = useT();
  const toast = useToast();
  const act = useClubAction();
  const [draft, setDraft] = useState<{ title: string; body: string } | null>(null);
  async function make() {
    try { setDraft(await api<{ title: string; body: string }>("/api/club")); } catch (e) { toast("error", (e as Error).message); }
  }
  return (
    <section className="card" aria-labelledby="nl-h">
      <div className="card-h"><h2 id="nl-h"><Newspaper size={16} aria-hidden />{" "}{t("Aylık bülten taslağı")}</h2></div>
      <div className="card-b stack-sm">
        {!draft ? (
          <>
            <p className="small muted" style={{ margin: 0 }}>{t("Etkinlikler, katılım, akademideki yenilikler ve kulüp hedeflerinden bir taslak hazırlanır. Göndermeden önce düzenleyebilirsin.")}</p>
            <div><button type="button" className="btn btn-sm btn-primary" onClick={make}><Wand2 size={14} aria-hidden />{" "}{t("Taslak hazırla")}</button></div>
          </>
        ) : (
          <>
            <label className="field">{t("Başlık")}<input className="input" maxLength={140} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></label>
            <label className="field">{t("Metin (Markdown)")}<textarea className="textarea mono" rows={14} maxLength={10000} value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} /></label>
            <div className="row">
              <button type="button" className="btn btn-sm btn-primary" onClick={async () => { if (await act({ action: "newsletter.publish", title: draft.title, body: draft.body }, t("Bülten duyuru olarak yayınlandı."))) setDraft(null); }}><Send size={14} aria-hidden />{" "}{t("Duyuru olarak yayınla")}</button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setDraft(null)}>{t("Vazgeç")}</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
