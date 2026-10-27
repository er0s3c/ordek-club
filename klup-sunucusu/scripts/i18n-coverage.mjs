#!/usr/bin/env node
// İngilizce kapsam raporu: ders sayfaları, quiz/görev çevirileri, çizgi roman şeritleri,
// karakterler, Gölge Ağ bölümleri ve tek dilli kalan katalog metinleri.
// Kullanım: node scripts/i18n-coverage.mjs [--json]
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT = path.join(ROOT, "content", "academy");
const json = process.argv.includes("--json");

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "gorseller" && e.name !== "lab") walk(p, out);
    } else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

const meta = (file) => {
  const raw = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return {};
  try {
    return YAML.parse(m[1]) ?? {};
  } catch {
    return {};
  }
};

const pages = walk(CONTENT)
  .filter((f) => !f.endsWith(".en.md") && path.dirname(f) !== CONTENT)
  .map((f) => ({ file: f, meta: meta(f) }));
const translations = new Set(walk(CONTENT).filter((f) => f.endsWith(".en.md")).map((f) => f.replace(/\.en\.md$/, ".md")));

const report = { lessons: { total: pages.length, translated: 0, missing: [] }, quizzes: { total: 0, translated: 0, missing: [] }, missions: { total: 0, translated: 0, missing: [] } };

for (const p of pages) {
  const done = translations.has(p.file);
  const rel = path.relative(CONTENT, p.file).replaceAll("\\", "/");
  if (done) report.lessons.translated++;
  else report.lessons.missing.push(rel);
  if (p.meta.sorular?.length) {
    report.quizzes.total++;
    if (done && meta(p.file.replace(/\.md$/, ".en.md")).sorular?.length) report.quizzes.translated++;
    else report.quizzes.missing.push(rel);
  }
  if (p.meta.gorevler?.length) {
    report.missions.total++;
    if (done && meta(p.file.replace(/\.md$/, ".en.md")).gorevler?.length) report.missions.translated++;
    else report.missions.missing.push(rel);
  }
}

const comicsFile = path.join(CONTENT, "cizgi-roman.yaml");
const comics = fs.existsSync(comicsFile) ? (YAML.parse(fs.readFileSync(comicsFile, "utf8"))?.seritler ?? {}) : {};
const strips = Object.entries(comics);
report.comics = { total: strips.length, translated: 0, panels: 0, panelsTranslated: 0, missing: [] };
for (const [id, s] of strips) {
  report.comics.panels += s.paneller?.length ?? 0;
  const complete = !!s.en?.baslik && (s.paneller ?? []).every((p) => p.en?.alt) && (s.paneller ?? []).every((p) => (p.balonlar ?? []).every((b) => b.en));
  if (complete) report.comics.translated++;
  else report.comics.missing.push(id);
}
report.comics.panelsTranslated = strips.reduce((n, [, s]) => n + (s.paneller ?? []).filter((p) => p.en?.alt).length, 0);

const charsFile = path.join(CONTENT, "karakterler.yaml");
const chars = fs.existsSync(charsFile) ? YAML.parse(fs.readFileSync(charsFile, "utf8")) : {};
const list = chars.karakterler ?? [];
const chapters = chars.hikaye?.bolumler ?? {};
report.characters = {
  total: list.length,
  translated: list.filter((c) => c.en?.ad && c.en?.unvan && c.en?.tehdit && c.en?.ozet).length,
  missing: list.filter((c) => !(c.en?.ad && c.en?.unvan && c.en?.tehdit && c.en?.ozet)).map((c) => c.id),
};
report.story = {
  total: Object.keys(chapters).length,
  translated: Object.values(chapters).filter((b) => b.en?.baslik && b.en?.giris).length,
  missing: Object.entries(chapters).filter(([, b]) => !(b.en?.baslik && b.en?.giris)).map(([id]) => id),
};

const labs = fs.readFileSync(path.join(ROOT, "src", "lib", "labs-catalog.ts"), "utf8");
const guides = fs.readFileSync(path.join(ROOT, "src", "lib", "academy-guides.ts"), "utf8");
// Lab kataloğu ve yol kaynakları kaynak dosyada tek dilli; görünen metin `tl(...)` ile en-strings sözlüğünden çevrilir.
// Bu yüzden ölçüt dosya alanı değil, sözlükte karşılığı olup olmaması. Zaten İngilizce olan özel adlar (OWASP, MITRE…)
// sözlükte olmasa da ekranda Türkçe görünmez; onları saymıyoruz.
const dict = {};
const stringsDir = path.join(ROOT, "src", "i18n", "en-strings");
for (const f of fs.readdirSync(stringsDir).filter((n) => n.endsWith(".json"))) Object.assign(dict, JSON.parse(fs.readFileSync(path.join(stringsDir, f), "utf8")));
const grab = (src, key) => [...src.matchAll(new RegExp(`${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`, "g"))].map((m) => JSON.parse(`"${m[1]}"`));
const looksTurkish = (s) => /[ğışİĞŞ]|\b(ve|için|ile|bir|olarak|değil|başlangıç|kurulum|alanı|atölyesi|notları)\b/i.test(s);
const catalogStrings = [...grab(labs, "title"), ...grab(labs, "summary"), ...grab(guides, "title"), ...grab(guides, "note")];
const catalogMissing = catalogStrings.filter((s) => !(s in dict) && looksTurkish(s));
report.catalog = {
  total: catalogStrings.length,
  translated: catalogStrings.length - catalogMissing.length,
  missing: catalogMissing,
};

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 100);
if (json) {
  console.log(JSON.stringify(report, null, 1));
} else {
  console.log(`Ders sayfası        ${report.lessons.translated}/${report.lessons.total}  (%${pct(report.lessons.translated, report.lessons.total)})`);
  console.log(`Quiz çevirisi       ${report.quizzes.translated}/${report.quizzes.total}`);
  console.log(`Görev çevirisi      ${report.missions.translated}/${report.missions.total}`);
  console.log(`Çizgi roman şeridi  ${report.comics.translated}/${report.comics.total}  (panel ${report.comics.panelsTranslated}/${report.comics.panels})`);
  console.log(`Karakter            ${report.characters.translated}/${report.characters.total}`);
  console.log(`Gölge Ağ bölümü     ${report.story.translated}/${report.story.total}`);
  console.log(`Lab/rehber metni    ${report.catalog.translated}/${report.catalog.total}`);
  const missing = report.lessons.missing;
  if (missing.length) console.log(`\nEksik dersler (${missing.length}):\n${missing.join("\n")}`);
}
