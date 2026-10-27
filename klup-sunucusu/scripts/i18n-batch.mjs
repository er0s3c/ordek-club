#!/usr/bin/env node
// Çeviri partisi için kaynak metni dışa aktarır: ajanlar 230 KB'lık çizgi-roman.yaml yerine yalnız
// kendi partilerinin Türkçe metnini okur. Çıktı, apply-i18n.mjs'in beklediği biçimin Türkçe ikizidir.
//
// Kullanım:
//   node scripts/i18n-batch.mjs comics <cikti.json> <serit-id> [<serit-id> ...]
//   node scripts/i18n-batch.mjs characters <cikti.json> [<karakter-id> ...]
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT = path.join(ROOT, "content", "academy");
const [mode, outFile, ...ids] = process.argv.slice(2);
if (!mode || !outFile) {
  console.error("Kullanım: node scripts/i18n-batch.mjs <comics|characters> <cikti.json> [id ...]");
  process.exit(2);
}

if (mode === "comics") {
  const data = YAML.parse(fs.readFileSync(path.join(CONTENT, "cizgi-roman.yaml"), "utf8"));
  const want = ids.length ? ids : Object.keys(data.seritler);
  const out = {};
  for (const id of want) {
    const s = data.seritler[id];
    if (!s) {
      console.error(`bilinmeyen şerit '${id}'`);
      process.exit(1);
    }
    out[id] = {
      baslik: s.baslik,
      devam: s.devam ?? null,
      paneller: s.paneller.map((p) => ({
        gorsel: p.gorsel,
        alt: p.alt,
        anlatici: p.anlatici ?? null,
        ses: p.ses?.metin ?? null,
        balonlar: (p.balonlar ?? []).map((b) => ({ kim: b.kim, metin: b.metin, tur: b.tur ?? "konusma" })),
      })),
    };
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 1), "utf8");
  console.log(`${Object.keys(out).length} şerit → ${outFile}`);
} else if (mode === "characters") {
  const data = YAML.parse(fs.readFileSync(path.join(CONTENT, "karakterler.yaml"), "utf8"));
  const out = {};
  const chapters = data.hikaye?.bolumler ?? {};
  for (const id of ids) {
    const c = (data.karakterler ?? []).find((x) => x.id === id);
    if (c) {
      out[id] = { ad: c.ad, unvan: c.unvan, tehdit: c.tehdit, ozet: c.ozet, modul: c.modul };
      continue;
    }
    if (chapters[id]) {
      out[`story/${id}`] = { baslik: chapters[id].baslik, giris: chapters[id].giris };
      continue;
    }
    console.error(`bilinmeyen karakter/bölüm '${id}'`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(out, null, 1), "utf8");
  console.log(`${Object.keys(out).length} kayıt → ${outFile}`);
} else {
  console.error(`bilinmeyen mod '${mode}'`);
  process.exit(2);
}
