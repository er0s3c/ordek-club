// Tarayıcıda PDF → sayfa görselleri (pdf.js). Sunucu PDF ayrıştırmaz; her sayfa ~1920 px genişlikte
// canvas'a çizilir, WebP (destek yoksa PNG) olarak dışa verilir ve metni getTextContent() ile çıkarılır.
// pdf.js yalnız içe aktarma açıldığında yüklenir (ayrı paket); worker aynı origin'den, paketten sunulur.
import { IMPORT_LIMITS } from "@/lib/slide-import";

type PdfJs = typeof import("pdfjs-dist/legacy/build/pdf.mjs");
type PdfDoc = Awaited<ReturnType<PdfJs["getDocument"]>["promise"]>;

let lib: Promise<PdfJs> | null = null;

function loadPdfJs(): Promise<PdfJs> {
  lib ??= import("pdfjs-dist/legacy/build/pdf.mjs").then((m) => {
    m.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
    return m;
  });
  return lib;
}

export type OpenedPdf = { pageCount: number; doc: PdfDoc; close: () => Promise<void> };

export async function openPdf(data: Uint8Array): Promise<OpenedPdf> {
  const pdfjs = await loadPdfJs();
  // Betik/XFA formları ve dış kaynak (yazı tipi/cmap/wasm) yüklemesi kapalı: belge yalnız çizilir.
  const task = pdfjs.getDocument({ data, enableXfa: false, useSystemFonts: true, stopAtErrors: false });
  const doc = await task.promise;
  return { pageCount: doc.numPages, doc, close: () => task.destroy() };
}

export type RenderedPage = { blob: Blob; ext: "webp" | "png"; text: string };

const toBlob = (c: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob | null>((resolve) => c.toBlob(resolve, type, quality));

// Sayfa numarası 1 tabanlıdır. Çok uzun sayfalarda (ör. A4 dikey) yükseklik 2× genişlikle sınırlanır.
export async function renderPage(doc: PdfDoc, n: number, width: number = IMPORT_LIMITS.renderWidth): Promise<RenderedPage> {
  const page = await doc.getPage(n);
  try {
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(width / base.width, (width * 2) / base.height, 6);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    await page.render({ canvas, viewport, background: "#ffffff" }).promise;
    const content = await page.getTextContent();
    const text = content.items.map((it) => ("str" in it ? it.str + (it.hasEOL ? "\n" : " ") : "")).join("");
    let blob = await toBlob(canvas, "image/webp", 0.85);
    let ext: RenderedPage["ext"] = "webp";
    if (!blob || blob.type !== "image/webp") {
      blob = await toBlob(canvas, "image/png");
      ext = "png";
    }
    canvas.width = canvas.height = 0; // belleği hemen bırak (150 sayfada önemli)
    if (!blob) throw new Error("Sayfa görsele çevrilemedi.");
    return { blob, ext, text };
  } finally {
    page.cleanup();
  }
}
