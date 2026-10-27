#!/usr/bin/env node
// İngilizce sözlük bakımı. Anahtar: kaynak koddaki Türkçe metin (bkz. src/i18n/translate.ts).
//   node scripts/i18n.mjs check            t("…") metinlerinden İngilizcesi eksik olanları listeler (eksikse çıkış 1)
//   node scripts/i18n.mjs extract <out>    çevrilecek tüm metinleri (t() + Türkçe karakterli sabitler) TSV olarak yazar
//   node scripts/i18n.mjs merge <tsv>...   "kimlik<TAB>İngilizce" satırlarını alan dosyalarına ekler
//   node scripts/i18n.mjs unused           sözlükte olup kaynakta artık geçmeyen anahtarlar
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const require = createRequire(path.join(root, "package.json"));
const ts = require("typescript");
const SRC = path.join(root, "src");
const DICT_DIR = path.join(SRC, "i18n", "en-strings");
const AREAS = ["app", "academy", "admin", "teach", "server", "content"];
const TR = /[çğıöşüÇĞİÖŞÜ]/;
const LETTER = /\p{L}/u;
const T_CALLEE = /^(t|tl|tt|translateClient|tr)$/;
const UI_KEYS = new Set(["label", "title", "text", "hint", "description", "placeholder", "message", "help", "summary", "body", "caption", "empty", "tooltip", "sub", "subtitle", "heading", "cta", "detail", "explanation", "note", "intro", "lead", "question", "prompt", "story", "why", "tip", "desc", "name", "tr", "short", "long", "headline", "tagline", "verb", "noun", "ok", "fail", "success", "error"]);
const DATA_KEYS = new Set(["kind", "status", "type", "key", "id", "value", "slug", "href", "icon", "tone", "variant", "code", "className", "path", "url", "src", "method", "role", "action", "event", "field", "lang", "locale", "mime", "format", "mode", "color", "theme", "unit", "scope", "target", "fill", "stroke", "font", "fontFamily", "animation", "scene", "image", "cover", "file", "command", "cmd", "regex", "pattern", "answer", "username", "email", "ip", "host", "port", "flag", "hash"]);

const id = (text) => crypto.createHash("sha1").update(text).digest("hex").slice(0, 10);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (p === path.join(SRC, "i18n")) continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(e.name) && !/\.test\.tsx?$/.test(e.name)) out.push(p);
  }
  return out;
}

function areaOf(rel) {
  if (/^src\/(app\/admin|components\/admin)\//.test(rel)) return "admin";
  if (/^src\/(app\/\(member\)\/teach|components\/presentation|app\/\(member\)\/teach)\//.test(rel) || /studio/.test(rel)) return "teach";
  if (/^src\/(app\/\(member\)\/academy|components\/(academy|learning|labs|workshops)|server\/(academy|workshops|ctf|learning)|lib\/(academy|labs))/.test(rel)) return "academy";
  if (/^src\/(animations|templates)\//.test(rel)) return "content";
  if (/^src\/(server|lib)\//.test(rel)) return "server";
  return "app";
}

function loadDict() {
  const dict = {};
  const byArea = {};
  for (const a of AREAS) {
    const f = path.join(DICT_DIR, `${a}.json`);
    byArea[a] = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : {};
    Object.assign(dict, byArea[a]);
  }
  return { dict, byArea };
}

function placeholder(expr, sf, used) {
  let base = ts.isIdentifier(expr) ? expr.text : ts.isPropertyAccessExpression(expr) ? expr.name.text : "v";
  if (!/^[A-Za-z_]\w*$/.test(base)) base = "v";
  const text = expr.getText(sf);
  for (const [n, e] of used) if (e === text) return n;
  let name = base === "v" ? "v0" : base, i = 1;
  while (used.has(name)) name = (base === "v" ? "v" : base) + i++;
  used.set(name, text);
  return name;
}

// Kaynaktaki metinler: { text, kind: "t" | "literal", files:Set }
function collect() {
  const found = new Map();
  const add = (text, kind, rel) => {
    if (!text || !LETTER.test(text)) return;
    const cur = found.get(text) ?? { text, kind, files: new Set() };
    if (kind === "t") cur.kind = "t";
    cur.files.add(rel);
    found.set(text, cur);
  };
  for (const file of walk(SRC)) {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    const text = fs.readFileSync(file, "utf8");
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const visit = (node) => {
      if (ts.isCallExpression(node) && node.arguments.length) {
        const callee = node.expression.getText(sf);
        const isT = T_CALLEE.test(callee) || /^\(await getT\(\)\)$/.test(callee) || /^tFor\(.*\)$/.test(callee);
        const isTranslateFor = /^translateFor$/.test(callee) && node.arguments.length > 1;
        const arg = isTranslateFor ? node.arguments[1] : node.arguments[0];
        if ((isT || isTranslateFor) && (ts.isStringLiteral(arg) || ts.isNoSubstitutionTemplateLiteral(arg))) add(arg.text, "t", rel);
      }
      if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) && TR.test(node.text)) {
        const p = node.parent;
        if (!(ts.isImportDeclaration(p) || ts.isExportDeclaration(p) || ts.isLiteralTypeNode(p) || (ts.isPropertyAssignment(p) && p.name === node))) add(node.text, "literal", rel);
      }
      // Etiket tabloları (bileşen dışında tanımlanıp gösterildiği yerde t() ile çevrilir):
      // UI adlı alanların değerleri ve Türkçe metin içeren nesne/dizi sabitlerinin kardeş metinleri.
      if (ts.isObjectLiteralExpression(node) || ts.isArrayLiteralExpression(node)) {
        const vals = ts.isObjectLiteralExpression(node)
          ? node.properties.filter(ts.isPropertyAssignment).map((p) => ({ key: p.name.getText(sf).replace(/["']/g, ""), v: p.initializer }))
          : node.elements.map((v) => ({ key: "", v }));
        const strs = vals.filter(({ v }) => ts.isStringLiteral(v) || ts.isNoSubstitutionTemplateLiteral(v));
        const hasTr = strs.some(({ v }) => TR.test(v.text));
        for (const { key, v } of strs) {
          if (DATA_KEYS.has(key) || !LETTER.test(v.text) || !/^[\p{Lu}\d]|\s/u.test(v.text) || /^[\w.-]+\/[\w./-]*$|^#|^var\(|^https?:/.test(v.text)) continue;
          if (UI_KEYS.has(key) || (hasTr && (ts.isArrayLiteralExpression(node) ? true : key !== ""))) add(v.text, "literal", rel);
        }
      }
      if (ts.isTemplateExpression(node)) {
        const raw = node.head.text + node.templateSpans.map((s) => s.literal.text).join("");
        if (TR.test(raw)) {
          const used = new Map();
          let tpl = node.head.text;
          for (const span of node.templateSpans) tpl += `{${placeholder(span.expression, sf, used)}}` + span.literal.text;
          add(tpl, "literal", rel);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
  }
  return found;
}

const cmd = process.argv[2];
const { dict, byArea } = loadDict();

if (cmd === "check") {
  const found = collect();
  const missing = [...found.values()].filter((f) => f.kind === "t" && !dict[f.text]);
  for (const m of missing.slice(0, 200)) console.log(`✗ ${[...m.files][0]}: ${m.text}`);
  const total = [...found.values()].filter((f) => f.kind === "t").length;
  console.log(`${total} t() metni · ${missing.length} İngilizcesi eksik · sözlükte ${Object.keys(dict).length} girdi`);
  process.exit(missing.length ? 1 : 0);
} else if (cmd === "extract") {
  const out = process.argv[3] ?? "i18n-missing.tsv";
  const found = collect();
  const rows = [...found.values()].filter((f) => !dict[f.text]).map((f) => [id(f.text), areaOf([...f.files][0]), f.kind, [...f.files][0], f.text.replace(/\t/g, "\\t").replace(/\n/g, "\\n")].join("\t"));
  fs.writeFileSync(out, rows.join("\n") + "\n");
  console.log(`${rows.length} eksik metin → ${out}`);
} else if (cmd === "merge") {
  // Kaynak metinleri kimlikle eşle
  const found = collect();
  const byId = new Map([...found.values()].map((f) => [id(f.text), f]));
  let added = 0;
  const unknown = [];
  for (const file of process.argv.slice(3)) {
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      if (!line.trim() || line.startsWith("#")) continue;
      const tab = line.indexOf("\t") >= 0 ? line.indexOf("\t") : line.indexOf("|");
      const key = line.slice(0, tab).trim();
      const en = line.slice(tab + 1).replace(/\\n/g, "\n").replace(/\\t/g, "\t");
      const f = byId.get(key);
      if (!f) { unknown.push(key); continue; }
      if (!en.trim()) continue;
      const area = areaOf([...f.files][0]);
      byArea[area][f.text] = en;
      added++;
    }
  }
  for (const a of AREAS) {
    const sorted = Object.fromEntries(Object.entries(byArea[a]).sort(([x], [y]) => x.localeCompare(y, "tr")));
    fs.writeFileSync(path.join(DICT_DIR, `${a}.json`), JSON.stringify(sorted, null, 1) + "\n");
  }
  console.log(`${added} çeviri eklendi${unknown.length ? ` · ${unknown.length} bilinmeyen kimlik: ${unknown.slice(0, 10).join(", ")}` : ""}`);
} else if (cmd === "unused") {
  const found = collect();
  const unused = Object.keys(dict).filter((k) => !found.has(k));
  for (const k of unused) console.log(k);
  console.log(`${unused.length} kullanılmayan girdi`);
} else {
  console.log("Kullanım: node scripts/i18n.mjs check | extract <out.tsv> | merge <tsv>... | unused");
  process.exit(2);
}
