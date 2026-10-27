"use client";
// Marp / Markdown'dan slayt ekleme: metni yapıştır ya da .md dosyası seç; önizlemede kaç slayt ve blok çıktığı görünür.
import { useMemo, useRef, useState } from "react";
import { FileText } from "lucide-react";
import { marpToSlides } from "@/lib/marp-import";
import type { Deck } from "@/lib/deck-schema";
import { useT } from "@/i18n/client";

type Slide = Deck["slides"][number];

export function MarpImport({ onAppend, room }: { onAppend: (slides: Slide[]) => void; room: number }) {
  const t = useT();
  const dialog = useRef<HTMLDialogElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [md, setMd] = useState("");
  const parsed = useMemo(() => (md.trim() ? marpToSlides(md) : null), [md]);
  const count = Math.min(parsed?.slides.length ?? 0, room);

  return (
    <>
      <button type="button" className="btn btn-sm" onClick={() => dialog.current?.showModal()}><FileText size={14} aria-hidden />{" "}Markdown/Marp</button>
      <dialog ref={dialog} className="modal import-deck" aria-labelledby="marp-h" onClose={() => setMd("")}>
        <form method="dialog" className="stack" onSubmit={(e) => { e.preventDefault(); if (parsed && count) { onAppend(parsed.slides.slice(0, count)); dialog.current?.close(); } }}>
          <h2 id="marp-h">{t("Markdown / Marp'tan slayt ekle")}</h2>
          <p className="small muted" style={{ margin: 0 }}>{t("Slaytları")}{" "}<code>---</code>{" "}{t("ayırır.")}{" "}<code>*</code>{" "}{t("ile başlayan maddeler adım adım açılır,")}{" "}<code>```mermaid</code>{" "}{t("diyagram olur, HTML yorumları eğitmen notuna gider. Görseller aktarılmaz.")}</p>
          <div className="row">
            <input ref={file} type="file" accept=".md,.markdown,text/markdown,text/plain" className="sr-only" tabIndex={-1} aria-hidden onChange={async (e) => { const f = e.target.files?.[0]; if (f && f.size < 1024 * 1024) setMd(await f.text()); if (file.current) file.current.value = ""; }} />
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => file.current?.click()}>{t(".md dosyası seç")}</button>
          </div>
          <textarea className="textarea mono" rows={12} spellCheck={false} aria-label={t("Markdown metni")} value={md} onChange={(e) => setMd(e.target.value)} placeholder={t("# Başlık\n\n---\n\n## İkinci slayt\n* madde 1\n* madde 2")} />
          <span className="small" role="status">{parsed ? t("{length} slayt · {v0} blok{v1}", { length: parsed.slides.length, v0: parsed.slides.reduce((n, s) => n + s.blocks.length, 0), v1: parsed.slides.length > room ? ` · yalnız ilk ${room} slayt eklenebilir` : "" }) : t("Önizleme için metin gir.")}</span>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => dialog.current?.close()}>{t("Vazgeç")}</button>
            <button className="btn btn-sm btn-primary" disabled={!count}>{count ? t("{count} slaytı sona ekle", { count }) : t("Sona ekle")}</button>
          </div>
        </form>
      </dialog>
    </>
  );
}
