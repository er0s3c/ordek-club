import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { sniffFile, validateUpload } from "@/server/files/store";
import { inspectZip } from "@/server/files/scan";
import { extractPptxNotes, notesText } from "@/server/slides/pptx-notes";
import { deckSchema } from "@/lib/deck-schema";
import {
  CONVERTER_MISSING_MESSAGE, IMPORT_LIMITS, buildImportedSlide, buildImportedSlides, checkImportFile, checkPageCount, cleanPageText, importFormatOf, titleFromFileName, trimText,
} from "@/lib/slide-import";

const code = (fn: () => unknown) => {
  try {
    fn();
    return null;
  } catch (e) {
    return (e as { code?: string }).code;
  }
};
const FILE_ID = "c" + "a".repeat(24);

async function zip(files: Record<string, string | Uint8Array>) {
  const z = new JSZip();
  for (const [name, data] of Object.entries(files)) z.file(name, data);
  return new Uint8Array(await z.generateAsync({ type: "uint8array", compression: "DEFLATE" }));
}

const CT = '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>';
const slideXml = (hidden = false) => `<p:sld xmlns:p="p"${hidden ? ' show="0"' : ""}><p:cSld/></p:sld>`;
const notesXml = (text: string) =>
  `<p:notes><p:cSld><p:spTree>` +
  `<p:sp><p:nvSpPr><p:nvPr><p:ph type="sldImg"/></p:nvPr></p:nvSpPr></p:sp>` +
  `<p:sp><p:nvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:txBody>${text}</p:txBody></p:sp>` +
  `<p:sp><p:nvSpPr><p:nvPr><p:ph type="sldNum" idx="5"/></p:nvPr></p:nvSpPr><p:txBody><a:p><a:r><a:t>7</a:t></a:r></a:p></p:txBody></p:sp>` +
  `</p:spTree></p:cSld></p:notes>`;
const rel = (id: string, type: string, target: string) => `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${type}" Target="${target}"/>`;

// 3 slayt: 1 (notlu), 2 (gizli, notlu), 3 (notsuz). Sıra presentation.xml'deki sldIdLst'ten gelir (dosya adından değil).
async function samplePptx() {
  return zip({
    "[Content_Types].xml": CT,
    "ppt/presentation.xml": `<p:presentation><p:sldIdLst><p:sldId id="256" r:id="rId3"/><p:sldId id="257" r:id="rId2"/><p:sldId id="258" r:id="rId4"/></p:sldIdLst></p:presentation>`,
    "ppt/_rels/presentation.xml.rels": `<Relationships>${rel("rId3", "slide", "slides/slide1.xml")}${rel("rId2", "slide", "slides/slide2.xml")}${rel("rId4", "slide", "/ppt/slides/slide3.xml")}</Relationships>`,
    "ppt/slides/slide1.xml": slideXml(),
    "ppt/slides/slide2.xml": slideXml(true),
    "ppt/slides/slide3.xml": slideXml(),
    "ppt/slides/_rels/slide1.xml.rels": `<Relationships>${rel("rId1", "slideLayout", "../slideLayouts/slideLayout1.xml")}${rel("rId2", "notesSlide", "../notesSlides/notesSlide1.xml")}</Relationships>`,
    "ppt/slides/_rels/slide2.xml.rels": `<Relationships>${rel("rId2", "notesSlide", "../notesSlides/notesSlide2.xml")}</Relationships>`,
    "ppt/notesSlides/notesSlide1.xml": notesXml(`<a:p><a:r><a:t>Önce nmap &amp; </a:t></a:r><a:r><a:t>&lt;hedef&gt;</a:t></a:r></a:p><a:p><a:r><a:t>Sonra soru sor</a:t></a:r></a:p>`),
    "ppt/notesSlides/notesSlide2.xml": notesXml(`<a:p><a:r><a:t>gizli not</a:t></a:r></a:p>`),
  });
}

// OLE bileşik belge başlığı + UTF-16LE dizin adı
const cfb = (stream?: string) =>
  new Uint8Array(Buffer.concat([Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]), Buffer.alloc(504), stream ? Buffer.from(stream, "utf16le") : Buffer.alloc(0), Buffer.alloc(64)]));

describe("slayt dosyası imza tespiti", () => {
  it("PPTX: ZIP + [Content_Types].xml + ppt/ öğesi; DOCX ve düz ZIP yine zip", async () => {
    expect(sniffFile(await samplePptx())?.kind).toBe("pptx");
    expect(sniffFile(await zip({ "[Content_Types].xml": CT, "word/document.xml": "<w/>" }))?.kind).toBe("zip");
    expect(sniffFile(await zip({ "ppt/slides/slide1.xml": "<p/>" }))?.kind).toBe("zip"); // Content_Types yok
    expect(sniffFile(new Uint8Array([0x50, 0x4b, 0x03, 0x04, 1, 2]))?.kind).toBe("zip");
  });

  it("PPT: OLE başlığı + 'PowerPoint Document' akışı; diğer OLE belgeleri (doc/xls/msi) reddedilir", () => {
    expect(sniffFile(cfb("PowerPoint Document"))?.kind).toBe("ppt");
    expect(sniffFile(cfb("WordDocument"))).toBeNull();
    expect(sniffFile(cfb())).toBeNull();
  });

  it("uzantı ile içerik uyuşmalı (sahte uzantı reddedilir)", async () => {
    const pptx = await samplePptx();
    expect(validateUpload("ders.pptx", pptx).kind).toBe("pptx");
    expect(validateUpload("ders.ppt", cfb("PowerPoint Document")).kind).toBe("ppt");
    expect(validateUpload("ders.pdf", new TextEncoder().encode("%PDF-1.7\n")).kind).toBe("pdf");
    expect(code(() => validateUpload("ders.pptx", new TextEncoder().encode("%PDF-1.7\n")))).toBe("TYPE_MISMATCH");
    expect(code(() => validateUpload("ders.ppt", pptx))).toBe("TYPE_MISMATCH");
    expect(code(() => validateUpload("ders.pptx", cfb("PowerPoint Document")))).toBe("TYPE_MISMATCH");
    expect(code(() => validateUpload("ders.pptx", new Uint8Array([0x4d, 0x5a, 0x90, 0])))).toBe("UNSUPPORTED_CONTENT");
    expect(code(() => validateUpload("ders.pptx", cfb("WordDocument")))).toBe("UNSUPPORTED_CONTENT");
    expect(validateUpload("arsiv.zip", pptx).kind).toBe("zip"); // .zip olarak yüklenen PPTX arşiv sayılır
  });

  it("PPTX ZIP denetimi: makro/ActiveX reddedilir; gömülü grafik verisine (xlsx) izin verilir, düz ZIP'te verilmez", async () => {
    const xlsx = await zip({ "[Content_Types].xml": CT, "xl/workbook.xml": "<w/>" });
    const withChart = Buffer.from(await zip({ "[Content_Types].xml": CT, "ppt/presentation.xml": "<p/>", "ppt/embeddings/Microsoft_Excel_Worksheet.xlsx": xlsx }));
    expect(inspectZip(withChart, { office: true }).entries).toBeGreaterThanOrEqual(3); // JSZip klasör girdileri de yazar
    expect(code(() => inspectZip(withChart))).toBe("ZIP_NESTED");
    const macro = Buffer.from(await zip({ "[Content_Types].xml": CT, "ppt/presentation.xml": "<p/>", "ppt/vbaProject.bin": new Uint8Array([1, 2, 3]) }));
    expect(code(() => inspectZip(macro, { office: true }))).toBe("PPTX_ACTIVE");
    const activeX = Buffer.from(await zip({ "[Content_Types].xml": CT, "ppt/activeX/activeX1.xml": "<a/>" }));
    expect(code(() => inspectZip(activeX, { office: true }))).toBe("PPTX_ACTIVE");
  });
});

describe("konuşmacı notları", () => {
  it("slayt sırasıyla, gizli slayt atlanarak; yalnız gövde metni, XML kaçışları çözülür", async () => {
    expect(await extractPptxNotes(await samplePptx())).toEqual(["Önce nmap & <hedef>\nSonra soru sor", ""]);
    expect(await extractPptxNotes(new Uint8Array([1, 2, 3]))).toEqual([]);
    expect(notesText(notesXml(`<a:p><a:r><a:t xml:space="preserve">a</a:t></a:r><a:br><a:rPr/></a:br><a:r><a:t>b &#x130;</a:t></a:r></a:p>`))).toBe("a\nb İ");
  });
});

describe("içe aktarma sınırları ve metin", () => {
  it("biçim, boyut ve dönüştürücü kontrolü", () => {
    expect(importFormatOf("Ders 1.PPTX")).toBe("pptx");
    expect(importFormatOf("notlar.docx")).toBeNull();
    expect(checkImportFile({ name: "a.pdf", size: 1000 }, false)).toBeNull();
    expect(checkImportFile({ name: "a.pptx", size: 1000 }, false)).toBe(CONVERTER_MISSING_MESSAGE);
    expect(checkImportFile({ name: "a.ppt", size: 1000 }, true)).toBeNull();
    expect(checkImportFile({ name: "a.pdf", size: IMPORT_LIMITS.bytes + 1 }, true)).toMatch(/60 MB/);
    expect(checkImportFile({ name: "a.key", size: 10 }, true)).toMatch(/PDF, PPTX/);
  });

  it("sayfa sınırı: 1..150", () => {
    expect(checkPageCount(1)).toBeNull();
    expect(checkPageCount(IMPORT_LIMITS.pages)).toBeNull();
    expect(checkPageCount(IMPORT_LIMITS.pages + 1)).toMatch(/En fazla 150 sayfa/);
    expect(checkPageCount(0)).toMatch(/sayfa bulunamadı/);
  });

  it("metin kırpma: sınırı aşmaz, kelime ortasında kesmez", () => {
    const long = "kelime ".repeat(100).trim();
    const t = trimText(long, 200);
    expect(t.length).toBeLessThanOrEqual(200);
    expect(t.endsWith("kelime…")).toBe(true);
    expect(trimText("kısa", 200)).toBe("kısa");
    expect(trimText("x".repeat(500), 200)).toHaveLength(200);
    expect(cleanPageText("  Başlık ‮\r\n\n  satır   iki\t ")).toBe("Başlık\nsatır iki");
  });

  it("sayfa → slayt: görsel bloğu, alt ≤ 200, başlık ilk satır, notlar = konuşmacı notu + sayfa metni; şemaya uyar", () => {
    const text = "Port Tarama\n" + "nmap ile açık portlar bulunur. ".repeat(40);
    const s = buildImportedSlide({ fileId: FILE_ID, text, notes: "Örnek göster" }, 0);
    expect(s.title).toBe("Port Tarama");
    const img = s.blocks[0]!;
    expect(img.type).toBe("image");
    if (img.type === "image") {
      expect(img.fileId).toBe(FILE_ID);
      expect(img.alt.length).toBeLessThanOrEqual(IMPORT_LIMITS.alt);
      expect(img.alt.startsWith("Port Tarama nmap")).toBe(true);
    }
    expect(s.notes.startsWith("Örnek göster\n\n— Slayttaki metin —\nPort Tarama")).toBe(true);
    expect(s.notes.length).toBeLessThanOrEqual(IMPORT_LIMITS.notes);

    const empty = buildImportedSlide({ fileId: FILE_ID, text: "  ", notes: "" }, 4);
    expect(empty.title).toBe("Slayt 5");
    expect(empty.blocks[0]).toMatchObject({ alt: "Slayt 5" });
    expect(empty.notes).toBe("");

    const huge = buildImportedSlide({ fileId: FILE_ID, text: "a ".repeat(20_000), notes: "b ".repeat(20_000) }, 0);
    expect(huge.notes.length).toBeLessThanOrEqual(IMPORT_LIMITS.notes);

    const pages = Array.from({ length: IMPORT_LIMITS.pages }, (_, i) => ({ fileId: FILE_ID, text: `Sayfa ${i + 1}`, notes: "" }));
    expect(deckSchema.safeParse({ title: titleFromFileName("hafta_3 ağ güvenliği.pdf"), slides: buildImportedSlides(pages) }).success).toBe(true);
    expect(titleFromFileName("hafta_3 ağ güvenliği.pdf")).toBe("hafta 3 ağ güvenliği");
    expect(titleFromFileName("a.pdf")).toBe("İçe aktarılan sunum");
  });
});
