// Dosyadan slayt içe aktarma (PDF/PPTX/PPT) — istemci ve sunucu ortak kurallar.
// Her sayfa tek bir görsel bloğuna dönüşür (yeni blok türü yok): canlı senkron, sürümler ve Studio aynen çalışır.
import type { Deck } from "@/lib/deck-schema";

const MB = 1024 * 1024;

export const IMPORT_LIMITS = {
  pages: 150,
  bytes: 60 * MB,
  renderWidth: 1920,
  alt: 200,
  title: 80,
  notes: 5000,
} as const;

export type ImportFormat = "pdf" | "pptx" | "ppt";

export const CONVERTER_MISSING_MESSAGE = "Sunucuda dönüştürücü kurulu değil — dosyayı PDF olarak dışa aktarıp yükleyin.";

export function importFormatOf(name: string): ImportFormat | null {
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toLowerCase() : "";
  return ext === "pdf" || ext === "pptx" || ext === "ppt" ? ext : null;
}

// Dosya seçilir seçilmez (yüklemeden önce) yapılan kontrol; sorun varsa Türkçe mesaj döner.
export function checkImportFile(f: { name: string; size: number }, converterEnabled: boolean): string | null {
  const fmt = importFormatOf(f.name);
  if (!fmt) return "Yalnız PDF, PPTX ve PPT dosyaları içe aktarılabilir.";
  if (fmt !== "pdf" && !converterEnabled) return CONVERTER_MISSING_MESSAGE;
  if (f.size === 0) return "Dosya boş.";
  if (f.size > IMPORT_LIMITS.bytes) return `Dosya en fazla ${IMPORT_LIMITS.bytes / MB} MB olabilir.`;
  return null;
}

export function checkPageCount(n: number): string | null {
  if (n < 1) return "Dosyada sayfa bulunamadı.";
  if (n > IMPORT_LIMITS.pages) return `En fazla ${IMPORT_LIMITS.pages} sayfa içe aktarılabilir (bu dosyada ${n} var). Dosyayı bölüp parça parça yükle.`;
  return null;
}

// Sayfa metni: kontrol/yön değiştiren karakterler atılır, boşluklar sadeleşir, satır yapısı korunur.
export function cleanPageText(raw: string): string {
  return raw
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f‪-‮⁦-⁩]/g, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.replace(/[ \t ]+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

// Uzun metni kelime sınırında keser ve "…" ekler (sonuç en fazla `max` karakter).
export function trimText(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const sp = cut.search(/\s\S*$/);
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).trimEnd() + "…";
}

export type ImportedPage = { fileId: string; text: string; notes: string };
type Slide = Deck["slides"][number];

// Bir sayfanın slaytı: başlık = metnin ilk satırı (yoksa "Slayt N"), alt = metnin özeti,
// eğitmen notu = konuşmacı notları + sayfanın tam metni.
export function buildImportedSlide(page: ImportedPage, index: number): Slide {
  const text = cleanPageText(page.text);
  const speaker = cleanPageText(page.notes);
  const fallback = `Slayt ${index + 1}`;
  const firstLine = text.split("\n")[0] ?? "";
  const notes = speaker && text ? `${speaker}\n\n— Slayttaki metin —\n${text}` : speaker || text;
  return {
    title: firstLine ? trimText(firstLine, IMPORT_LIMITS.title) : fallback,
    layout: "default",
    blocks: [{ type: "image", fileId: page.fileId, alt: text ? trimText(text.replace(/\n/g, " "), IMPORT_LIMITS.alt) : fallback, caption: "" }],
    notes: trimText(notes, IMPORT_LIMITS.notes),
    motion: "",
  };
}

export function buildImportedSlides(pages: ImportedPage[], startIndex = 0): Slide[] {
  return pages.map((p, i) => buildImportedSlide(p, startIndex + i));
}

// Dosya adından sunum başlığı: uzantı atılır, ayraçlar boşluğa döner.
export function titleFromFileName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  const t = trimText(base, 160);
  return t.length >= 2 ? t : "İçe aktarılan sunum";
}
