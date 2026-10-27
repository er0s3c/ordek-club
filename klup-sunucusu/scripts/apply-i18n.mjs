#!/usr/bin/env node
// İngilizce çeviri parçalarını YAML kaynaklarına işler. Ajanlar tek tek YAML dosyasına dokunmaz;
// her parti kendi JSON parçasını üretir, bu betik hepsini tek geçişte birleştirir. Böylece eşzamanlı
// düzenlemelerde kayıp/çakışma olmaz ve yorumlar korunur (yaml Document API).
//
// Kullanım:
//   node scripts/apply-i18n.mjs comics <klasör>       # <klasör>/*.json
//   node scripts/apply-i18n.mjs characters <dosya.json>
//
// comics parçası biçimi:
//   { "<serit-id>": { "baslik": "...", "devam": "...", "paneller": [
//       { "alt": "...", "anlatici": "...", "ses": "...", "balonlar": ["...", "..."] } ] } }
// characters parçası biçimi:
//   { "<karakter-id>": { "ad": "...", "unvan": "...", "tehdit": "...", "ozet": "..." },
//     "story/<bolum-id>": { "baslik": "...", "giris": "..." } }
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT = path.join(ROOT, "content", "academy");
const LIMITS = { baslik: 120, devam: 200, anlatici: 220, ses: 16, balon: 100 };
const errors = [];
const warnings = [];
let applied = 0;

const [mode, target] = process.argv.slice(2);
if (!mode || !target) {
  console.error("Kullanım: node scripts/apply-i18n.mjs <comics|characters> <klasör|dosya>");
  process.exit(2);
}

const readDoc = (file) => {
  const src = fs.readFileSync(file, "utf8");
  const doc = YAML.parseDocument(src);
  if (doc.errors.length) throw new Error(`${path.basename(file)}: ${doc.errors[0].message}`);
  return doc;
};

const checkLen = (where, value, max) => {
  if (typeof value !== "string" || !value.trim()) errors.push(`${where}: metin boş`);
  else if (value.length > max) errors.push(`${where}: ${value.length} > ${max} karakter`);
};

function applyComics(files) {
  const file = path.join(CONTENT, "cizgi-roman.yaml");
  const doc = readDoc(file);
  const stripIds = new Set(Object.keys((doc.toJS()?.seritler ?? {})));
  if (!files.length) return; // parça yoksa dosyaya dokunma
  for (const part of files) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(part, "utf8"));
    } catch {
      console.warn(`atlandı (geçerli JSON değil): ${path.basename(part)}`);
      continue;
    }
    for (const [id, en] of Object.entries(data)) {
      if (!stripIds.has(id)) {
        errors.push(`${path.basename(part)}: bilinmeyen şerit '${id}'`);
        continue;
      }
      const base = `seritler.${id}`;
      const trStrip = doc.getIn(["seritler", id]);
      const panels = trStrip.get("paneller")?.items ?? [];
      if (!en.baslik) errors.push(`${base}.en.baslik eksik`);
      else checkLen(`${base}.en.baslik`, en.baslik, LIMITS.baslik);
      if (en.devam) checkLen(`${base}.en.devam`, en.devam, LIMITS.devam);
      if (!Array.isArray(en.paneller) || en.paneller.length !== panels.length) {
        errors.push(`${base}: paneller ${en.paneller?.length ?? 0} ≠ ${panels.length}`);
        continue;
      }
      en.paneller.forEach((pe, i) => {
        const tr = panels[i];
        const at = `${base}.paneller[${i + 1}].en`;
        const trBubbles = tr.get("balonlar")?.items ?? [];
        if (!pe.alt) errors.push(`${at}.alt eksik`);
        if (tr.get("anlatici") && !pe.anlatici) warnings.push(`${at}.anlatici eksik (Türkçe kalır)`);
        if (pe.anlatici) checkLen(`${at}.anlatici`, pe.anlatici, LIMITS.anlatici);
        if (pe.ses) checkLen(`${at}.ses`, pe.ses, LIMITS.ses);
        if (tr.get("ses") && !pe.ses) warnings.push(`${at}.ses eksik (ses efekti Türkçe kalır)`);
        const bubbles = pe.balonlar ?? [];
        if (bubbles.length !== trBubbles.length) {
          errors.push(`${at}: balon ${bubbles.length} ≠ ${trBubbles.length}`);
          return;
        }
        bubbles.forEach((b, j) => checkLen(`${at}.balonlar[${j + 1}]`, b, LIMITS.balon));
      });
      if (errors.some((e) => e.startsWith(base))) continue;

      const enNode = {};
      if (en.baslik) enNode.baslik = en.baslik;
      if (en.devam) enNode.devam = en.devam;
      doc.setIn(["seritler", id, "en"], enNode);
      en.paneller.forEach((pe, i) => {
        const node = { alt: pe.alt };
        if (pe.anlatici) node.anlatici = pe.anlatici;
        if (pe.ses) node.ses = pe.ses;
        doc.setIn(["seritler", id, "paneller", i, "en"], node);
        (pe.balonlar ?? []).forEach((b, j) => doc.setIn(["seritler", id, "paneller", i, "balonlar", j, "en"], b));
      });
      applied++;
    }
  }
  fs.writeFileSync(file, doc.toString({ lineWidth: 0 }), "utf8");
}

function applyCharacters(file) {
  const yamlFile = path.join(CONTENT, "karakterler.yaml");
  const doc = readDoc(yamlFile);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const list = doc.get("karakterler")?.items ?? [];
  const byId = new Map(list.map((n) => [n.get("id"), n]));
  const chapters = doc.getIn(["hikaye", "bolumler"]);
  for (const [key, en] of Object.entries(data)) {
    if (key.startsWith("story/")) {
      const id = key.slice("story/".length);
      const node = chapters?.get?.(id);
      if (!node) {
        errors.push(`bilinmeyen bölüm '${id}'`);
        continue;
      }
      checkLen(`story/${id}.baslik`, en.baslik, 200);
      checkLen(`story/${id}.giris`, en.giris, 1200);
      node.set("en", { baslik: en.baslik, giris: en.giris });
      applied++;
      continue;
    }
    const node = byId.get(key);
    if (!node) {
      errors.push(`bilinmeyen karakter '${key}'`);
      continue;
    }
    for (const f of ["ad", "unvan", "tehdit", "ozet"]) if (!en[f]) errors.push(`${key}.en.${f} eksik`);
    if (errors.some((e) => e.startsWith(key))) continue;
    node.set("en", { ad: en.ad, unvan: en.unvan, tehdit: en.tehdit, ozet: en.ozet });
    applied++;
  }
  fs.writeFileSync(yamlFile, doc.toString({ lineWidth: 0 }), "utf8");
}

try {
  if (mode === "comics") {
    const files = fs.readdirSync(target).filter((n) => /^comics-.*\.json$/.test(n)).map((n) => path.join(target, n));
    if (!files.length) throw new Error(`${target}: JSON parçası yok`);
    applyComics(files);
  } else if (mode === "characters") {
    applyCharacters(target);
  } else throw new Error(`bilinmeyen mod '${mode}'`);
} catch (e) {
  console.error(`Hata: ${e.message}`);
  process.exit(1);
}

for (const w of warnings) console.warn(`uyarı: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`hata: ${e}`);
  console.error(`\n${errors.length} hata; dosya yine de yazıldı, düzeltip tekrar çalıştır.`);
  process.exit(1);
}
console.log(`${applied} kayıt işlendi.`);
