"use client";

// "Dosyadan içe aktar": PDF/PPTX/PPT → her sayfa bir slayt (görsel bloğu + sayfa metni alt metin/eğitmen notu olarak).
// PDF tarayıcıda çizilir; PPTX/PPT önce sunucudaki ayrı dönüştürücüyle PDF'e çevrilir.
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FileUp, X } from "lucide-react";
import { useToast } from "@/components/providers";
import { ApiError, api } from "@/lib/api-client";
import { openPdf, renderPage } from "@/lib/pdf-render";
import {
  CONVERTER_MISSING_MESSAGE, IMPORT_LIMITS, checkImportFile, checkPageCount, importFormatOf, titleFromFileName, type ImportedPage,
} from "@/lib/slide-import";
import type { DeckIssue } from "@/server/presentations";
import type { Deck } from "@/lib/deck-schema";
import { useT } from "@/i18n/client";

export type ImportResult = { id: string; created: boolean; slides: number; deck?: Deck; issues?: DeckIssue[] };
type Progress = { label: string; done: number; total: number };

const MB = 1024 * 1024;
const ACCEPT_PDF = ".pdf,application/pdf";
const ACCEPT_ALL = `${ACCEPT_PDF},.pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint`;
const abortError = () => new DOMException("İptal edildi", "AbortError");
const isAbort = (e: unknown) => (e as Error)?.name === "AbortError";

// PPTX/PPT → PDF + konuşmacı notları (sunucu yanıtı multipart/form-data).
async function convertOnServer(file: File, signal: AbortSignal): Promise<{ pdf: Uint8Array; notes: string[] }> {
  const form = new FormData();
  form.set("file", file);
  let res: Response;
  try {
    res = await fetch("/api/presentations/import/convert", { method: "POST", body: form, credentials: "same-origin", cache: "no-store", signal });
  } catch (err) {
    if (isAbort(err)) throw err;
    throw new ApiError(0, "NETWORK", "Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.");
  }
  if (!res.ok) {
    const e = (await res.json().catch(() => null))?.error as { code?: string; message?: string } | undefined;
    throw new ApiError(res.status, e?.code ?? `HTTP_${res.status}`, e?.message ?? "Sunum dönüştürülemedi.");
  }
  const out = await res.formData();
  const pdf = out.get("pdf");
  if (!(pdf instanceof Blob)) throw new ApiError(502, "CONVERT_FAILED", "Dönüştürücü PDF döndürmedi.");
  let notes: string[] = [];
  try {
    const parsed: unknown = JSON.parse(String(out.get("notes") ?? "[]"));
    if (Array.isArray(parsed)) notes = parsed.map((x) => (typeof x === "string" ? x : ""));
  } catch {
    /* notlar isteğe bağlı */
  }
  return { pdf: new Uint8Array(await pdf.arrayBuffer()), notes };
}

export function ImportDeck({ converterEnabled, presentationId, deckTitle, beforeImport, onImported, className = "btn btn-sm" }: {
  converterEnabled: boolean;
  // Verilirse sayfalar bu sunumun taslağına eklenir; yoksa yeni sunum oluşturulur.
  presentationId?: string;
  deckTitle?: string;
  beforeImport?: () => Promise<void>;
  onImported?: (r: ImportResult) => void;
  className?: string;
}) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const abort = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [share, setShare] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const working = progress !== null;
  const fmt = file ? importFormatOf(file.name) : null;

  useEffect(() => () => { if (thumb) URL.revokeObjectURL(thumb); }, [thumb]);
  useEffect(() => () => abort.current?.abort(), []);

  function pick(f: File | undefined) {
    if (input.current) input.current.value = "";
    if (!f) return;
    const problem = checkImportFile(f, converterEnabled);
    if (problem) return toast("error", problem);
    setFile(f);
    setTitle(titleFromFileName(f.name));
    setError(null);
    setThumb(null);
    dialog.current?.showModal();
  }

  function close() {
    if (working) return;
    dialog.current?.close();
    setFile(null);
  }

  async function run() {
    if (!file || !fmt) return;
    const ctrl = new AbortController();
    abort.current = ctrl;
    const uploaded: string[] = [];
    let imported = false;
    setError(null);
    try {
      if (beforeImport) {
        setProgress({ label: t("Açık değişiklikler kaydediliyor…"), done: 0, total: 0 });
        await beforeImport();
      }
      let data: Uint8Array;
      let notes: string[] = [];
      if (fmt === "pdf") data = new Uint8Array(await file.arrayBuffer());
      else {
        setProgress({ label: t("Sunucuda PDF'e dönüştürülüyor (büyük sunumlarda bir dakikayı bulabilir)…"), done: 0, total: 0 });
        ({ pdf: data, notes } = await convertOnServer(file, ctrl.signal));
      }
      if (ctrl.signal.aborted) throw abortError();
      setProgress({ label: t("PDF açılıyor…"), done: 0, total: 0 });
      const pdf = await openPdf(data).catch(() => {
        throw new Error(t("PDF açılamadı (bozuk ya da parola korumalı olabilir)."));
      });
      const pages: ImportedPage[] = [];
      try {
        const tooMany = checkPageCount(pdf.pageCount);
        if (tooMany) throw new Error(tooMany);
        for (let n = 1; n <= pdf.pageCount; n++) {
          if (ctrl.signal.aborted) throw abortError();
          setProgress({ label: t("Sayfa {n}/{pageCount} işleniyor…", { n, pageCount: pdf.pageCount }), done: n - 1, total: pdf.pageCount });
          const r = await renderPage(pdf.doc, n);
          setThumb(URL.createObjectURL(r.blob));
          const form = new FormData();
          form.set("file", r.blob, `slayt-${String(n).padStart(3, "0")}.${r.ext}`);
          const up = await api<{ id: string }>("/api/presentations/import/pages", { form, signal: ctrl.signal });
          uploaded.push(up.id);
          pages.push({ fileId: up.id, text: r.text.slice(0, 20_000), notes: (notes[n - 1] ?? "").slice(0, 20_000) });
        }
      } finally {
        await pdf.close().catch(() => {});
      }
      setProgress({ label: presentationId ? t("Slaytlar taslağa ekleniyor…") : t("Sunum oluşturuluyor…"), done: pages.length, total: pages.length });
      const body = presentationId ? { presentationId, pages } : { title: title.trim(), pages };
      const result = await api<ImportResult>("/api/presentations/import", { body, signal: ctrl.signal });
      imported = true;

      if (share) {
        setProgress({ label: t("Orijinal dosya paylaşılıyor…"), done: pages.length, total: pages.length });
        const form = new FormData();
        form.set("file", file);
        form.set("scope", "CLUB");
        form.set("description", t("Sunum dosyası: {v0}", { v0: (presentationId ? deckTitle : title.trim()) ?? "" }).slice(0, 300));
        try {
          await api("/api/files", { form });
        } catch (e) {
          toast("error", t("Slaytlar eklendi ama dosya paylaşılamadı: {message}", { message: (e as Error).message }));
        }
      }

      toast("ok", presentationId ? t("{slides} slayt taslağa eklendi. Kontrol edip yayınla.", { slides: result.slides }) : t("{slides} slaytlık sunum oluşturuldu.", { slides: result.slides }));
      setProgress(null);
      dialog.current?.close();
      setFile(null);
      if (onImported) onImported(result);
      else router.push(`/teach/presentations/${result.id}/studio`);
    } catch (e) {
      setProgress(null);
      if (!imported && uploaded.length) {
        // İptal/hata: yüklenmiş ama kullanılmayacak sayfa görsellerini sil (en iyi çaba).
        void Promise.allSettled(uploaded.map((id) => api(`/api/files/${id}`, { method: "DELETE" })));
      }
      if (isAbort(e)) toast("ok", t("İçe aktarma iptal edildi."));
      else setError((e as Error).message || t("İçe aktarma başarısız oldu."));
    } finally {
      abort.current = null;
    }
  }

  const pct = progress && progress.total ? Math.round((progress.done / progress.total) * 100) : null;

  return (
    <>
      <input ref={input} type="file" accept={converterEnabled ? ACCEPT_ALL : ACCEPT_PDF} className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => pick(e.target.files?.[0])} />
      <button type="button" className={className} onClick={() => input.current?.click()} title={converterEnabled ? t("PDF, PPTX ya da PPT") : t("PDF (PPTX/PPT için sunucuda dönüştürücü gerekli)")}>
        <FileUp size={15} aria-hidden />{" "}{t("Dosyadan içe aktar")}
      </button>

      <dialog ref={dialog} className="modal import-deck" aria-labelledby="import-deck-h" onCancel={(e) => { e.preventDefault(); if (!working) close(); }}>
        <div className="card-b stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <h2 id="import-deck-h" style={{ fontSize: 17, margin: 0 }}>{presentationId ? t("Dosyadan slayt ekle") : t("Dosyadan sunum oluştur")}</h2>
            <button type="button" className="btn btn-sm btn-ghost" onClick={close} disabled={working} aria-label={t("Kapat")}><X size={15} aria-hidden /></button>
          </div>

          {file && (
            <p className="small muted" style={{ margin: 0 }}>
              <strong>{file.name}</strong>{" "}{t("· {v0} MB · {v1}", { v0: (file.size / MB).toFixed(1), v1: fmt?.toUpperCase() })}
              <br />
              {t("Her sayfa bir slayt olur (görsel). Sayfadaki metin alt metin ve eğitmen notu olarak eklenir")}
              {fmt === "pptx" ? t("; konuşmacı notları da nota taşınır") : ""}{t(". En fazla {pages} sayfa / {v0} MB.", { pages: IMPORT_LIMITS.pages, v0: IMPORT_LIMITS.bytes / MB })}
              {fmt !== "pdf" && t(" Dosya önce sunucudaki dönüştürücüyle PDF'e çevrilir.")}
            </p>
          )}
          {!converterEnabled && <p className="tiny faint" style={{ margin: 0 }}>{t("PowerPoint (PPTX/PPT): {CONVERTER_MISSING_MESSAGE}", { CONVERTER_MISSING_MESSAGE })}</p>}

          {!presentationId && (
            <div className="field">
              <label htmlFor="import-deck-title">{t("Sunum başlığı")}</label>
              <input id="import-deck-title" className="input" maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} disabled={working} />
            </div>
          )}

          <label className="check small">
            <input type="checkbox" checked={share} onChange={(e) => setShare(e.target.checked)} disabled={working} />
            <span>{t("Orijinal dosyayı öğrencilerle de paylaş (Dosyalar → kulüp kütüphanesi)")}</span>
          </label>

          {progress && (
            <div className="stack-sm" role="status" aria-live="polite">
              <div className="small">{progress.label}</div>
              <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct ?? undefined} aria-label={t("İlerleme")}>
                <span style={{ width: pct === null ? "100%" : `${pct}%`, opacity: pct === null ? 0.4 : 1 }} />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element -- yerel blob önizlemesi */}
              {thumb && <img className="import-deck-thumb" src={thumb} alt={t("İşlenen sayfanın önizlemesi")} />}
            </div>
          )}

          {error && <div className="alert alert-error small" role="alert">{error}</div>}

          <div className="row" style={{ justifyContent: "flex-end" }}>
            {working ? (
              <button type="button" className="btn" onClick={() => abort.current?.abort()}>{t("İptal et")}</button>
            ) : (
              <>
                <button type="button" className="btn btn-ghost" onClick={close}>{t("Vazgeç")}</button>
                <button type="button" className="btn btn-primary" onClick={run} disabled={!file || (!presentationId && title.trim().length < 2)}>
                  {error ? t("Tekrar dene") : t("İçe aktar")}
                </button>
              </>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
