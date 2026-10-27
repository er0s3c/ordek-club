// PPTX konuşmacı notları (ppt/notesSlides/*.xml) — slayt sırasıyla, gizli slaytlar atlanarak
// (LibreOffice PDF'e gizli slaytları koymaz; notlar PDF sayfalarıyla hizalı kalmalı).
// Dosya bu noktada inspectZip'ten geçmiştir (yol, boyut, sıkıştırma oranı); yine de her XML için üst sınır var.
import JSZip from "jszip";

const MAX_XML = 2 * 1024 * 1024;
const REL_NOTES = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide";

function decodeXml(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|lt|gt|quot|apos|amp);/gi, (_, e: string) => {
    const k = e.toLowerCase();
    if (k === "lt") return "<";
    if (k === "gt") return ">";
    if (k === "quot") return '"';
    if (k === "apos") return "'";
    if (k === "amp") return "&";
    const code = k.startsWith("#x") ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10);
    return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : "";
  });
}

const attr = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

// a:p → satır, a:t → metin. Yalnız gövde yer tutucusundaki (type="body") şekiller okunur;
// slayt küçük resmi, sayfa numarası ve üst/alt bilgi atlanır.
export function notesText(xml: string): string {
  const out: string[] = [];
  for (const sp of xml.match(/<p:sp\b[\s\S]*?<\/p:sp>/g) ?? []) {
    if (!/<p:ph\b[^>]*\btype="body"/.test(sp)) continue;
    for (const para of sp.match(/<a:p\b[\s\S]*?<\/a:p>/g) ?? []) {
      let line = "";
      for (const m of para.matchAll(/<a:br\b[^>]*?(?:\/>|>[\s\S]*?<\/a:br>)|<a:t(?:\s[^>]*)?>([\s\S]*?)<\/a:t>/g)) line += m[1] === undefined ? "\n" : decodeXml(m[1]);
      out.push(line);
    }
  }
  return out.join("\n").trim();
}

function resolveTarget(baseDir: string, target: string): string {
  const parts = (target.startsWith("/") ? target.slice(1) : `${baseDir}/${target}`).split("/");
  const stack: string[] = [];
  for (const p of parts) {
    if (p === "..") stack.pop();
    else if (p && p !== ".") stack.push(p);
  }
  return stack.join("/");
}

function rels(xml: string): Map<string, { type: string; target: string }> {
  const m = new Map<string, { type: string; target: string }>();
  for (const tag of xml.match(/<Relationship\b[^>]*>/g) ?? []) {
    const id = attr(tag, "Id");
    const target = attr(tag, "Target");
    if (id && target) m.set(id, { type: attr(tag, "Type") ?? "", target: decodeXml(target) });
  }
  return m;
}

async function readXml(zip: JSZip, path: string): Promise<string | null> {
  const f = zip.file(path);
  if (!f) return null;
  const buf = await f.async("uint8array");
  return buf.length > MAX_XML ? null : new TextDecoder("utf-8").decode(buf);
}

// Dönüş: dışa aktarılan her slayt için bir not (boş olabilir). Okunamayan dosyada boş liste.
export async function extractPptxNotes(buf: Uint8Array, maxSlides = 500): Promise<string[]> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buf);
  } catch {
    return [];
  }
  const pres = await readXml(zip, "ppt/presentation.xml");
  const presRels = await readXml(zip, "ppt/_rels/presentation.xml.rels");
  if (!pres || !presRels) return [];
  const pr = rels(presRels);
  const ids = (pres.match(/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/)?.[0].match(/<p:sldId\b[^>]*>/g) ?? []).map((t) => attr(t, "r:id")).filter((x): x is string => !!x);
  const notes: string[] = [];
  for (const rid of ids.slice(0, maxSlides)) {
    const rel = pr.get(rid);
    if (!rel) continue;
    const slidePath = resolveTarget("ppt", rel.target);
    const slide = await readXml(zip, slidePath);
    if (!slide) continue;
    if (/<p:sld\b[^>]*\bshow="(0|false)"/.test(slide)) continue; // gizli slayt
    const dir = slidePath.slice(0, slidePath.lastIndexOf("/"));
    const name = slidePath.slice(slidePath.lastIndexOf("/") + 1);
    const slideRels = await readXml(zip, `${dir}/_rels/${name}.rels`);
    const noteRel = slideRels ? [...rels(slideRels).values()].find((r) => r.type === REL_NOTES) : undefined;
    const noteXml = noteRel ? await readXml(zip, resolveTarget(dir, noteRel.target)) : null;
    notes.push(noteXml ? notesText(noteXml) : "");
  }
  return notes;
}
