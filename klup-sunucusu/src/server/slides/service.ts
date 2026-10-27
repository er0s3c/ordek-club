// Dosyadan slayt içe aktarma (sunucu tarafı):
//  - PDF sunucuda HİÇ ayrıştırılmaz: tarayıcı sayfaları görsele çevirir, her sayfa MEDIA görseli olarak yüklenir.
//  - PPTX/PPT ayrı dönüştürücü servisine (slide-converter/, LibreOffice) gider; Club süreci ofis dosyasını çalıştırmaz.
//    Club yalnız içerik imzasını, ZIP yapısını ve (varsa) ClamAV taramasını yapar, sonra PDF'i tarayıcıya geri verir.
//  - Sayfa görselleri + metinler tek istekle sunuma dönüşür (yeni sunum ya da var olan sunumun taslağına ekleme).
import { db } from "@/server/db";
import { audit } from "@/server/audit";
import { env } from "@/server/env";
import { HttpError, badRequest, forbidden } from "@/server/errors";
import { canUseTeaching, type Actor } from "@/server/auth/policy";
import { storeFile } from "@/server/files/service";
import { scanUpload } from "@/server/files/scan";
import { cleanFileName, validateUpload } from "@/server/files/store";
import { createPresentation, getStudio, parseDeck, saveDraft } from "@/server/presentations";
import { CONVERTER_MISSING_MESSAGE, IMPORT_LIMITS, buildImportedSlides, importFormatOf, type ImportedPage } from "@/lib/slide-import";
import { DECK_SCHEMA_VERSION, type Deck } from "@/lib/deck-schema";
import { extractPptxNotes } from "./pptx-notes";

const MB = 1024 * 1024;
const CONVERT_TIMEOUT_MS = 150_000; // dönüştürücünün kendi sınırı 90 sn + kuyruk beklemesi
const MAX_PDF_BYTES = 200 * MB;

function requireTeacher(actor: Actor) {
  if (!canUseTeaching(actor)) throw forbidden("Slayt içe aktarma eğitmen ve yöneticilere açıktır.");
}

export const converterEnabled = () => env().SLIDE_CONVERTER_URL !== "";

// Bir sayfa görseli (tarayıcıda PDF'ten üretilmiş WebP/PNG) → MEDIA dosyası.
export async function storeImportPage(actor: Actor, file: File) {
  requireTeacher(actor);
  const f = await storeFile(db, actor, file, { scope: "MEDIA" }, "Dosyadan içe aktarılan slayt");
  return { id: f.id, size: f.size };
}

async function readCapped(res: Response, max: number): Promise<Uint8Array<ArrayBuffer>> {
  const len = Number(res.headers.get("content-length") ?? NaN);
  if (Number.isFinite(len) && len > max) throw new HttpError(502, "CONVERT_FAILED", "Dönüştürülen dosya beklenenden büyük.");
  if (!res.body) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  const reader = res.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel();
      throw new HttpError(502, "CONVERT_FAILED", "Dönüştürülen dosya beklenenden büyük.");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

const CONVERTER_ERRORS: Record<number, [number, string, string]> = {
  413: [400, "FILE_TOO_LARGE", `Dosya en fazla ${IMPORT_LIMITS.bytes / MB} MB olabilir.`],
  415: [400, "UNSUPPORTED_CONTENT", "Dönüştürücü bu dosyayı PowerPoint sunumu olarak tanımadı."],
  422: [422, "CONVERT_FAILED", "Sunum dönüştürülemedi (dosya bozuk ya da desteklenmeyen içerik). PDF olarak dışa aktarıp yüklemeyi dene."],
  503: [503, "CONVERTER_BUSY", "Dönüştürücü şu an meşgul. Biraz sonra tekrar dene."],
  504: [504, "CONVERT_TIMEOUT", "Sunum dönüştürme çok uzun sürdü (90 sn). PDF olarak dışa aktarıp yüklemeyi dene."],
};

// PPTX/PPT → PDF (+ PPTX konuşmacı notları). Dosya doğrulanır, taranır, dönüştürücüye iletilir.
export async function convertSlides(actor: Actor, file: File, ip: string): Promise<{ pdf: Uint8Array<ArrayBuffer>; notes: string[] }> {
  requireTeacher(actor);
  const e = env();
  if (!e.SLIDE_CONVERTER_URL) throw new HttpError(503, "CONVERTER_MISSING", CONVERTER_MISSING_MESSAGE);
  if (file.size === 0) throw badRequest("Dosya boş.", "EMPTY_FILE");
  if (file.size > IMPORT_LIMITS.bytes) throw badRequest(`Dosya en fazla ${IMPORT_LIMITS.bytes / MB} MB olabilir.`, "FILE_TOO_LARGE");
  const name = cleanFileName(file.name);
  const fmt = importFormatOf(name);
  if (fmt !== "pptx" && fmt !== "ppt") throw badRequest("Dönüştürücü yalnız PPTX ve PPT dosyalarını kabul eder. PDF doğrudan tarayıcıda işlenir.", "UNSUPPORTED_TYPE");
  const buf = new Uint8Array(await file.arrayBuffer());
  const sniffed = validateUpload(name, buf); // uzantı ↔ içerik imzası (ZIP-OOXML / OLE "PowerPoint Document")
  const scanNote = await scanUpload(sniffed.kind, buf);
  const notes = fmt === "pptx" ? await extractPptxNotes(buf, IMPORT_LIMITS.pages * 3) : [];

  let res: Response;
  try {
    res = await fetch(new URL("/convert", e.SLIDE_CONVERTER_URL), {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream", "X-Converter-Secret": e.SLIDE_CONVERTER_SECRET, "X-File-Type": fmt },
      body: buf,
      signal: AbortSignal.timeout(CONVERT_TIMEOUT_MS),
      redirect: "error",
    });
  } catch (err) {
    console.error("[slides] dönüştürücüye ulaşılamadı", err);
    const timeout = (err as Error).name === "TimeoutError";
    throw new HttpError(timeout ? 504 : 502, timeout ? "CONVERT_TIMEOUT" : "CONVERTER_UNAVAILABLE", timeout ? CONVERTER_ERRORS[504]![2] : "Dönüştürücüye ulaşılamadı. Yöneticiye haber ver ya da dosyayı PDF olarak yükle.");
  }
  if (!res.ok) {
    await res.body?.cancel();
    const known = CONVERTER_ERRORS[res.status];
    if (res.status === 401 || res.status === 403) console.error("[slides] dönüştürücü gizli anahtarı reddetti (SLIDE_CONVERTER_SECRET uyuşmuyor)");
    throw known ? new HttpError(known[0], known[1], known[2]) : new HttpError(502, "CONVERTER_UNAVAILABLE", "Dönüştürücü beklenmeyen bir hata döndürdü.");
  }
  const pdf = await readCapped(res, MAX_PDF_BYTES);
  if (!(pdf[0] === 0x25 && pdf[1] === 0x50 && pdf[2] === 0x44 && pdf[3] === 0x46 && pdf[4] === 0x2d)) throw new HttpError(502, "CONVERT_FAILED", "Dönüştürücü geçerli bir PDF döndürmedi.");
  await audit({ actorId: actor.id, action: "presentation.convert", targetType: "Presentation", meta: { name, format: fmt, size: buf.length, pdfSize: pdf.length, notes: notes.length, scan: scanNote }, ip });
  return { pdf, notes };
}

export type ImportRequest = { title?: string; presentationId?: string; pages: ImportedPage[] };

// Sayfalar → sunum. Her fileId bu kişinin yüklediği, silinmemiş bir MEDIA görseli olmalı.
export async function importSlides(actor: Actor, input: ImportRequest, ip: string) {
  requireTeacher(actor);
  if (!input.pages.length) throw badRequest("İçe aktarılacak sayfa yok.", "NO_PAGES");
  if (input.pages.length > IMPORT_LIMITS.pages) throw badRequest(`En fazla ${IMPORT_LIMITS.pages} sayfa içe aktarılabilir.`, "TOO_MANY_PAGES");
  const ids = [...new Set(input.pages.map((p) => p.fileId))];
  const owned = await db.fileAsset.count({ where: { id: { in: ids }, ownerId: actor.id, scope: "MEDIA", kind: "image", deletedAt: null } });
  if (owned !== ids.length) throw badRequest("Sayfa görsellerinden biri bulunamadı ya da sana ait değil. İçe aktarmayı baştan başlat.", "BAD_MEDIA");

  if (input.presentationId) {
    const st = await getStudio(actor, input.presentationId); // düzenleme yetkisi burada denetlenir
    const raw = (st.deck ?? {}) as Partial<Deck>;
    const existing = Array.isArray(raw.slides) ? raw.slides : [];
    if (existing.length + input.pages.length > 200) throw badRequest(`Bir sunumda en fazla 200 slayt olabilir (şu an ${existing.length}).`, "TOO_MANY_SLIDES");
    const deck = {
      schema: DECK_SCHEMA_VERSION,
      title: raw.title ?? input.title ?? "",
      description: raw.description ?? "",
      slides: [...existing, ...buildImportedSlides(input.pages, existing.length)],
    };
    const r = await saveDraft(actor, input.presentationId, deck);
    await audit({ actorId: actor.id, action: "presentation.import.append", targetType: "Presentation", targetId: input.presentationId, meta: { slides: input.pages.length }, ip });
    return { id: input.presentationId, created: false, slides: input.pages.length, deck, issues: r.issues };
  }

  const deck = parseDeck({ title: input.title ?? "", slides: buildImportedSlides(input.pages) });
  const p = await createPresentation(actor, deck, ip);
  return { id: p.id, created: true, slides: deck.slides.length };
}
