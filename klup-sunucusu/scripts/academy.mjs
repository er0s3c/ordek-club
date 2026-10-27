#!/usr/bin/env node
// ============================================================================
//  Akademi içerik aracı
//    node scripts/academy.mjs check       → tüm sayfaları doğrula (hata varsa çıkış kodu 1)
//    node scripts/academy.mjs gorseller   → GORSELLER.md, KARAKTERLER.md ve KAPAKLAR.md dosyalarını üret
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import YAML from "yaml";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = path.join(ROOT, "content", "academy");
const IMG_DIR = path.join(CONTENT, "gorseller");
const IMG_EXT = [".webp", ".png", ".jpg", ".jpeg"];

// Noir mafya + hacker çizim stili. Stüdyo/sanatçı/oyun adı ve gerçek kişi referansı içermez (bilinçli).
// Midjourney olumsuzlamayı prompt içinde değil --no parametresinde anlar; bu yüzden stil yalnızca olumlu tarif içerir.
// Moderasyona takılmamak için suç/şiddet çağrıştıran kelimeler (crime, mafia, underworld, burglar…) kullanılmaz.
export const STYLE =
  "stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, " +
  "clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, " +
  "line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, " +
  "high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, " +
  "thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion " +
  "mixed with glowing green retro computer terminals and cables, playful and comedic tone";
const MJ_NO = "--no text, letters, words, numbers, logo, watermark, signature";

// Modül kapağı (oda kartı): aynı noir stil, kart düzeninde. Küçük boyutta okunsun diye tek sembol, sade fon, bol boşluk.
export const KAPAK_STYLE =
  "module cover card composition, one bold central symbol placed left of center as the clear focal point, plain dark backdrop, " +
  "noir vignette darkening the edges, the character shown as a half-length portrait in the right third of the frame turned toward the symbol, " +
  "generous empty negative space around the symbol so the image reads clearly at small thumbnail size, " +
  STYLE;

// Sahne metnindeki "(no readable text)" gibi olumsuzlamaları ayıklar; Midjourney bunları tam tersine yorumlar.
const stripNegatives = (s) =>
  s.replace(/\s*\((?:no|without)\b[^)]*\)/gi, "").replace(/(^|\.\s+)No [^.]*\./g, "$1").replace(/\s{2,}/g, " ").trim();

// Midjourney'ye yapıştırılmaya hazır tek satır.
function mj(text, ar) {
  return `${stripNegatives(text).replace(/\.\s*$/, "")}. ${STYLE} --ar ${ar} --v 7 ${MJ_NO}`;
}

const LIMITS = { warnWords: 450, maxWords: 600 };
const TYPES = new Set(["bilgi", "ders", "uygulama", "quiz"]);

// ── karakter kayıt defteri ─────────────────────────────────────────────────
export function loadCharacters() {
  const raw = YAML.parse(fs.readFileSync(path.join(CONTENT, "karakterler.yaml"), "utf8"));
  const byId = new Map(raw.karakterler.map((k) => [k.id, k]));
  return { family: raw.aile, list: raw.karakterler, byId, story: raw.hikaye };
}

// Sayfalarda karakter portresine bu kimlikle başvurulur: ![…](../../gorseller/karakter-tevfik.webp)
const portraitId = (id) => `karakter-${id}`;
const isModule = (k) => /^M\d{2}$/.test(k.modul);
// Hikâyede bölümü olan birimler: temel modüller (Sezon 1) ve uzmanlık yolları (Sezon 2)
const isStoryUnit = (k) => isModule(k) || /^Yol [A-G]$/.test(k.modul);
const unitMatch = (k) =>
  isModule(k) ? (rel) => rel.includes(`/${k.modul.toLowerCase()}-`) : (rel) => rel.startsWith(`02-uzmanlik/yol-${k.modul.slice(-1).toLowerCase()}-`);
const unitLabel = (k, i) => (isModule(k) ? `${i + 1} · ${k.modul}` : `S2 · ${k.modul}`);

function portraitPrompt(k) {
  return mj(
    `Full-body character design portrait of ${k.tarif.trim()}. Three-quarter view, the entire figure visible, ` +
      "plain dark smoky background under a single soft spotlight, character sheet clarity",
    "2:3",
  );
}

function familyPrompt(family) {
  return mj(
    `Group lineup illustration of ${family.tarif.trim()}. All figures stand on the same horizontal ground line, ` +
      "the boss exactly in the center, one shared soft light source from the same angle, overall warm dark color correction",
    "16:9",
  );
}

// Sahne promptunu tamamlar: karakter tarifi + sahne + stil + Midjourney parametreleri.
function fullPrompt(g, chars) {
  const who =
    g.karakter === "aile" ? `The family is ${chars.family.tarif.trim()}. ` : g.karakter ? `The main character is ${chars.byId.get(g.karakter).tarif.trim()}. ` : "";
  // Sayfalarda "the villain" yazılır (doğrulayıcı buna bakar); Midjourney'ye nötr "the character" gider.
  const scene = g.prompt.trim().replace(/\b([Tt])he villain\b/g, (_, t) => `${t}he character`);
  return mj(who + scene, "16:9");
}

// Kapak promptu: sembol + sahne + kötü adam tarifi + kart stili. Portresi hazır kötü adam Omni Reference ile sabitlenir.
function coverPrompt(c, k) {
  const scene = `Module cover illustration. The single central symbol is ${c.sembol.trim()}, ${c.sahne.trim()}. The character in the right third is ${k.tarif.trim()}`;
  const portrait = imageFile(portraitId(k.id));
  const oref = portrait ? ` --oref <${path.basename(portrait)} URL'si> --ow 100` : "";
  return `${stripNegatives(scene).replace(/\.\s*$/, "")}. ${KAPAK_STYLE} --ar 16:9 --v 7 ${MJ_NO}${oref}`;
}

// Lab ve atölye ikonları: kare rozet, kapaklardan sade. Karakter yok; tek sembol 64 px'te okunmalı.
// Anahtarlar src/lib/labs-catalog.ts ve content/pilot/sk101/sk101-mN-lab.md ile aynıdır; dosya adı lab-<anahtar>.webp.
export const LAB_ICON_STYLE =
  "square badge icon, one bold simple central symbol filling the middle of the frame, plain flat dark charcoal background " +
  "with a soft amber glow behind the symbol and a gentle noir vignette at the corners, thick confident ink-navy outline around every shape, " +
  "few large flat shapes with minimal interior detail so it stays readable at 64 pixels, hard cel shading, " +
  "warm worn-out desaturated vintage palette with glowing cyan-green and amber accents, flat 2D film noir comic icon look, no people or characters";
export const LAB_ICONS = [
  { key: "linux-permissions", title: "Komut Hattı: Linux izinleri", sembol: "a paper file folder with a heavy padlock on its front and a glowing green terminal cursor block beside it" },
  { key: "browser-linux", title: "Tarayıcıda Linux", sembol: "a retro browser window frame whose content area is a small dark terminal box with a glowing green prompt chevron and cursor" },
  { key: "secure-code", title: "Güvenli kod düzeltme atölyesi", sembol: "a short stack of abstract code bars with a jagged crack through the middle bar, an amber patch bandage sealing the crack" },
  { key: "network", title: "Görsel ağ kurma alanı", sembol: "three round network nodes connected by glowing cables, with a sturdy shield standing between two of them as a firewall" },
  { key: "query", title: "Sorgu geliştirme atölyesi", sembol: "a large magnifying glass over a column of horizontal glowing log line bars, one bar highlighted amber under the lens" },
  { key: "timeline", title: "Olay zaman çizelgesi", sembol: "a round pocket clock above a horizontal line of three small evidence cards connected left to right by an arrow" },
  { key: "evidence-map", title: "Kanıt ilişki haritası", sembol: "five small round pins connected by taut red strings into a web, one central pin glowing amber" },
  { key: "sk101-m1-lab", title: "SK-101 · İlk vardiyanın olay kartı", sembol: "two index cards side by side with a small magnifying glass between them, one card stamped with a round wax seal" },
  { key: "sk101-m2-lab", title: "SK-101 · Portal neden açılmıyor?", sembol: "a retro browser window with a pulled-out network plug dangling below it, a small spark between plug and socket" },
  { key: "sk101-m3-lab", title: "SK-101 · Yanlış siparişin izi", sembol: "two parcel boxes side by side with their hanging tags swapped, a thin glowing arrow showing the crossed tags" },
  { key: "sk101-m4-lab", title: "SK-101 · Unutulan izinler", sembol: "a folder with three small toggle switches on its front, two green and one being switched off to amber by a key" },
  { key: "sk101-m5-lab", title: "SK-101 · Gece açılan hesap", sembol: "a simple person-silhouette badge card under a thin crescent moon, a small round clock in the corner of the card" },
  { key: "sk101-m6-lab", title: "SK-101 · Parola deposunu değerlendir", sembol: "a small steel safe with a round dial, a salt shaker standing beside it sprinkling glowing grains onto the safe" },
  { key: "sk101-m7-lab", title: "SK-101 · İlk yarım saatin kayıtları", sembol: "a stopwatch whose face is half filled with amber, in front of a small shield and a stack of two log cards" },
];
const labIconId = (key) => `lab-${key}`;
const labIconPrompt = (l) => `Lab icon. The single central symbol is ${l.sembol}. ${LAB_ICON_STYLE} --ar 1:1 --v 7 ${MJ_NO}`;

// Kapaklar: akademi.yaml yolları + pilot SK-101 modülleri (content/pilot/kapaklar.yaml).
// Kötü adam kapak.karakter ile, yoksa yolun koduyla (karakterler.yaml → modul) bulunur.
function loadCovers(chars, add) {
  const manifest = path.join(CONTENT, "akademi.yaml");
  const pilot = path.join(ROOT, "content", "pilot", "kapaklar.yaml");
  const entries = [
    ...YAML.parse(fs.readFileSync(manifest, "utf8")).yollar.map((t) => ({ file: manifest, key: t.anahtar, title: `${t.kod} · ${t.baslik}`, group: "Akademi yolları", kod: t.kod, kapak: t.kapak })),
    ...(fs.existsSync(pilot) ? YAML.parse(fs.readFileSync(pilot, "utf8")).kapaklar ?? [] : []).map((m) => ({ file: pilot, key: m.anahtar, title: `SK-101 · ${m.baslik}`, group: "SK-101 pilot modülleri", kod: null, kapak: m.kapak })),
  ];
  const covers = [];
  const seen = new Set();
  for (const e of entries) {
    const err = (m) => add(e.file, "hata", `kapak ${e.key}: ${m}`);
    if (!/^[a-z0-9-]{1,40}$/.test(e.key ?? "")) { err("geçersiz anahtar"); continue; }
    if (seen.has(e.key)) err("anahtar tekrar ediyor");
    seen.add(e.key);
    const c = e.kapak;
    if (!c) { err("'kapak' alanı eksik"); continue; }
    for (const f of ["sembol", "sahne", "alt"]) if (!c[f]) err(`'${f}' eksik`);
    const k = c.karakter ? chars.byId.get(c.karakter) : chars.list.find((x) => x.modul === e.kod);
    if (!k) { err(c.karakter ? `bilinmeyen karakter '${c.karakter}'` : `${e.kod} için kötü adam yok; 'karakter' yazın`); continue; }
    const text = `${c.sembol ?? ""} ${c.sahne ?? ""}`;
    if (/\b(duck|duckling|mascot)\b/i.test(text)) err("kapakta maskot/ördek olmaz");
    if (/\b(text|words?|letters?|numbers?|logo)\b/i.test(text)) add(e.file, "uyarı", `kapak ${e.key}: sembol/sahne yazı istiyor gibi`);
    covers.push({ id: `kapak-${e.key}`, ...e, c, k });
  }
  return covers;
}

// Gölge Ağ çizgi romanı (cizgi-roman.yaml). Paneller yazısız; anlatıcı kutusu ve balonlar platformda çizilir.
// Üstü sakin bırakılır, çünkü anlatıcı kutusu oraya oturur.
export const CIZGI_STYLE =
  // "panel" / "boş üst alan" demek modele çerçeve, letterbox ve boş kutu çizdiriyordu: sahne kenardan kenara dolu çizilir,
  // anlatıcı kutusu ve balonlar platformda üstüne biner.
  "full-bleed cinematic comic book illustration that fills the entire canvas edge to edge, dynamic camera angle, " +
  "strong storytelling pose and clear facial expressions, " +
  STYLE;
const BUBBLE_KINDS = new Set(["konusma", "dusunce", "fisilti"]);
const BUBBLE_SPOTS = new Set(["sol-ust", "sag-ust", "sol-alt", "sag-alt"]);

function loadComics(chars, add) {
  const file = path.join(CONTENT, "cizgi-roman.yaml");
  if (!fs.existsSync(file)) return { strips: {}, tarifler: {} };
  const raw = YAML.parse(fs.readFileSync(file, "utf8")) ?? {};
  const tarifler = raw.tarifler ?? {};
  const strips = raw.seritler ?? {};
  const ids = new Set();
  for (const [sid, s] of Object.entries(strips)) {
    const err = (m) => add(file, "hata", `${sid}: ${m}`);
    if (!/^[a-z0-9-]{1,60}$/.test(sid)) err("geçersiz şerit kimliği");
    if (!s?.baslik) err("baslik eksik");
    if ((s?.devam ?? "").length > 200) err("devam kutusu en fazla 200 karakter");
    if ((s?.en?.devam ?? "").length > 200) err("en.devam kutusu en fazla 200 karakter");
    if (!Array.isArray(s?.paneller) || s.paneller.length < 1 || s.paneller.length > 4) { err("1–4 panel olmalı"); continue; }
    s.paneller.forEach((p, i) => {
      const pe = (m) => err(`panel ${i + 1}: ${m}`);
      if (!/^[a-z0-9-]{1,80}$/.test(p.gorsel ?? "")) pe("geçersiz gorsel kimliği");
      if (ids.has(p.gorsel)) pe(`gorsel kimliği tekrar ediyor: ${p.gorsel}`);
      ids.add(p.gorsel);
      if (!p.alt || !p.prompt) pe("alt ve prompt zorunlu");
      if (p.karakter !== undefined && !chars.byId.has(p.karakter)) pe(`bilinmeyen karakter '${p.karakter}'`);
      if (/\bthe villain\b/i.test(p.prompt ?? "") && !p.karakter) pe('prompt "the villain" diyor ama karakter seçilmemiş');
      for (const t of (p.prompt ?? "").matchAll(/\{([a-z-]+)\}/g)) if (!tarifler[t[1]]) pe(`bilinmeyen tarif {${t[1]}}`);
      if (/\b(text|words?|letters?)\b/i.test(p.prompt ?? "")) add(file, "uyarı", `${sid} panel ${i + 1}: prompt yazı istiyor gibi`);
      if ((p.anlatici ?? "").length > 220) pe("anlatıcı kutusu en fazla 220 karakter");
      if ((p.en?.anlatici ?? "").length > 220) pe("en.anlatici en fazla 220 karakter");
      if (p.en?.ses !== undefined && (!p.en.ses || p.en.ses.length > 16)) pe("en.ses 1–16 karakter olmalı");
      if (p.en?.anlatici && !p.anlatici) pe("en.anlatici var ama Türkçe anlatici yok");
      if ((p.balonlar ?? []).length > 2) pe("en fazla 2 balon");
      for (const b of p.balonlar ?? []) {
        if (!b.kim || !b.metin) pe("balonda kim ve metin zorunlu");
        if ((b.metin ?? "").length > 100) pe(`balon çok uzun (${b.metin.length} > 100)`);
        if ((b.en ?? "").length > 100) pe(`İngilizce balon çok uzun (${b.en.length} > 100)`);
        if (b.tur && !BUBBLE_KINDS.has(b.tur)) pe(`geçersiz balon türü: ${b.tur}`);
        if (b.yer && !BUBBLE_SPOTS.has(b.yer)) pe(`geçersiz balon yeri: ${b.yer}`);
      }
      if (p.ses !== undefined) {
        if (!p.ses?.metin || p.ses.metin.length > 16) pe("ses efekti 1–16 karakter olmalı");
        if (p.ses?.yer && !BUBBLE_SPOTS.has(p.ses.yer)) pe(`geçersiz ses yeri: ${p.ses.yer}`);
      }
      if (!p.anlatici && !(p.balonlar ?? []).length) add(file, "uyarı", `${sid} panel ${i + 1}: ne anlatıcı ne balon var`);
    });
  }
  return { strips, tarifler };
}

// Tek panelli şerit (derste kısa sahne) geniş 16:9 çizilir; çok panelli şeritlerin panelleri 4:3.
function comicPrompt(p, comics, chars, single = false) {
  const who = p.karakter ? `The main character is ${chars.byId.get(p.karakter).tarif.trim()}. ` : "";
  const scene = p.prompt.trim().replace(/\{([a-z-]+)\}/g, (_, t) => comics.tarifler[t].trim()).replace(/\b([Tt])he villain\b/g, (_, t) => `${t}he character`);
  return `${stripNegatives(who + scene).replace(/\.\s*$/, "")}. ${CIZGI_STYLE} --ar ${single ? "16:9" : "4:3"} --v 7 ${MJ_NO}`;
}

// SK-101 pilot görselleri: taslak .md'ler write-pilot-drafts.mjs ile yeniden üretildiği için promptlar
// content/pilot/gorseller.yaml'da tutulur (alanlar sayfa gorseller: ile aynı, + sayfa). Her pilot sayfasında en az bir görsel olur.
function loadPilotImages(chars, add) {
  const file = path.join(ROOT, "content", "pilot", "gorseller.yaml");
  const dir = path.join(ROOT, "content", "pilot", "sk101");
  if (!fs.existsSync(file) || !fs.existsSync(dir)) return [];
  const pages = new Map();
  for (const n of fs.readdirSync(dir).filter((n) => n.endsWith(".md"))) {
    const { meta } = parse(path.join(dir, n));
    if (meta?.id) pages.set(meta.id, { rel: `../pilot/sk101/${n}`, meta });
  }
  const out = [];
  const seen = new Set();
  for (const g of YAML.parse(fs.readFileSync(file, "utf8")).gorseller ?? []) {
    const err = (m) => add(file, "hata", `${g?.id ?? "?"}: ${m}`);
    const p = pages.get(g?.sayfa);
    if (!p) { err(`bilinmeyen pilot sayfası '${g?.sayfa}'`); continue; }
    if (!String(g.id ?? "").startsWith(`${g.sayfa}-`)) err("görsel id sayfa id'siyle başlamalı");
    if (seen.has(g.id)) err("görsel id tekrar ediyor");
    seen.add(g.id);
    if (g.tur !== "ai" || !g.alt || !g.prompt) err("tur: ai, alt ve prompt zorunlu");
    if (g.karakter !== undefined && !chars.byId.has(g.karakter)) err(`bilinmeyen karakter '${g.karakter}'`);
    if (/\bthe villain\b/i.test(g.prompt ?? "") && !g.karakter) err('prompt "the villain" diyor ama karakter seçilmemiş');
    if (/\b(text|words?|letters?)\b/i.test(g.prompt ?? "")) add(file, "uyarı", `${g.id}: prompt yazı istiyor gibi; AI yazıyı bozar`);
    out.push({ g, p });
  }
  for (const [id, p] of pages) if (!out.some((i) => i.p === p)) add(file, "hata", `${id}: pilot sayfasının görseli yok`);
  return out;
}

// Geçerli animasyon kimlikleri: src/animations/*.ts içindeki tanımlardan okunur (tek kaynak).
function animationIds() {
  const dir = path.join(ROOT, "src", "animations");
  const ids = new Set();
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".ts") || f === "registry.ts" || f === "types.ts") continue;
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    for (const m of src.matchAll(/kind:\s*"(?:flow|code)",\s*\n\s*id:\s*"([a-z0-9-]+)"/g)) ids.add(m[1]);
  }
  return ids;
}

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "gorseller" && e.name !== "lab") out.push(...walk(p)); // lab/: ders dosyaları, sayfa değil
    } else if (e.name.endsWith(".md") && !e.name.endsWith(".en.md") && dir !== CONTENT) out.push(p);
  }
  return out;
}

// İngilizce çeviriler: "<ders>.en.md" aynı klasörde durur ve aynı id'yi taşır (bkz. src/server/academy/translation.ts).
// Yapı uyumu (etkinlik/soru/görev biçimi) içe aktarmada da denetlenir; burada id, başlık ve yetim dosya kontrolü yapılır.
function checkTranslations(pages, add) {
  let done = 0;
  const translationFiles = [];
  (function scan(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== "gorseller" && e.name !== "lab") scan(p); }
      else if (e.name.endsWith(".en.md")) translationFiles.push(p);
    }
  })(CONTENT);
  const byFile = new Map(pages.map((pg) => [pg.file, pg]));
  for (const file of translationFiles) {
    const page = byFile.get(file.replace(/\.en\.md$/, ".md"));
    if (!page) { add(file, "hata", "Türkçe karşılığı (aynı adlı .md) yok"); continue; }
    const { meta, body, error } = parse(file);
    if (error) { add(file, "hata", error); continue; }
    if (meta.id !== page.meta.id) add(file, "hata", `id Türkçe dersle aynı olmalı (${page.meta.id})`);
    if (!meta.baslik) add(file, "hata", "baslik eksik");
    if (!body.trim()) add(file, "hata", "gövde boş");
    for (const k of ["sorular", "gorevler", "etkinlikler"]) if (meta[k] && (meta[k].length ?? 0) !== (page.meta[k]?.length ?? 0)) add(file, "hata", `${k} sayısı Türkçe dersle aynı olmalı`);
    if (page.meta.tur === "quiz" && !meta.sorular) add(file, "uyarı", "quiz soruları çevrilmemiş (Türkçe gösterilir)");
    if (page.meta.gorevler && !meta.gorevler) add(file, "uyarı", "görevler çevrilmemiş (Türkçe gösterilir)");
    done++;
  }
  return { done, total: pages.length };
}

function parse(file) {
  const raw = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { error: "front-matter (--- … ---) bulunamadı" };
  try {
    return { meta: YAML.parse(m[1]) ?? {}, body: m[2] };
  } catch (e) {
    return { error: `YAML hatası: ${e.message.split("\n")[0]}` };
  }
}

function wordCount(body) {
  const text = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<details>[\s\S]*?<\/details>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[|#>*`_\-[\]()]/g, " ");
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

const imageFile = (id) => IMG_EXT.map((e) => path.join(IMG_DIR, id + e)).find((p) => fs.existsSync(p)) ?? null;

export function loadAll() {
  const anims = animationIds();
  const chars = loadCharacters();
  const pages = [];
  const problems = [];
  const seen = new Map();
  const add = (file, level, msg) => problems.push({ file: path.relative(CONTENT, file), level, msg });
  const comics = loadComics(chars, add);
  const comicsUsed = new Set();

  // Kayıt defteri bütünlüğü
  const reg = path.join(CONTENT, "karakterler.yaml");
  const regErr = (m) => add(reg, "hata", m);
  const moduls = new Set();
  for (const k of chars.list) {
    for (const f of ["id", "ad", "modul", "tehdit", "ozet", "fiziksel", "yuz", "poz", "kiyafet", "imza", "palet", "tarif"])
      if (!k[f]) regErr(`${k.id ?? "?"}: '${f}' eksik`);
    if (!/^[a-z]+(-[a-z]+)?$/.test(k.id ?? "")) regErr(`geçersiz karakter id: ${k.id}`);
    if (isStoryUnit(k)) {
      if (moduls.has(k.modul)) regErr(`${k.modul} için birden fazla karakter`);
      moduls.add(k.modul);
      const b = chars.story?.bolumler?.[k.id];
      if (!b?.baslik || !b?.giris || !b?.kapanis) regErr(`${k.id}: hikaye.bolumler içinde baslik/giris/kapanis eksik`);
    }
    if (!chars.story?.baglar?.[k.id]) regErr(`${k.id}: hikaye.baglar içinde ilişki tanımı yok`);
    if (/\b(text|letters?|words?)\b/i.test(k.tarif ?? "") && !/no (readable )?text|abstract lines/i.test(k.tarif ?? "")) add(reg, "uyarı", `${k.id}: tarif yazı istiyor gibi`);
  }
  for (const id of [...Object.keys(chars.story?.bolumler ?? {}), ...Object.keys(chars.story?.baglar ?? {})])
    if (!chars.byId.has(id)) regErr(`hikaye: bilinmeyen karakter '${id}'`);

  for (const file of walk(CONTENT)) {
    const { meta, body, error } = parse(file);
    if (error) {
      add(file, "hata", error);
      continue;
    }
    const rel = path.relative(CONTENT, file).replace(/\\/g, "/");
    const page = { file, rel, meta, body, words: wordCount(body) };
    pages.push(page);
    const err = (m) => add(file, "hata", m);
    const warn = (m) => add(file, "uyarı", m);

    for (const k of ["id", "tur", "baslik", "sure"]) if (meta[k] === undefined || meta[k] === "") err(`'${k}' alanı eksik`);
    if (meta.tur && !TYPES.has(meta.tur)) err(`geçersiz tur: ${meta.tur}`);
    if (meta.id) {
      if (seen.has(meta.id)) err(`id tekrar ediyor (${seen.get(meta.id)})`);
      seen.set(meta.id, rel);
      const num = path.basename(file).match(/^(\d+)-/)?.[1];
      if (num && !String(meta.id).endsWith(`-${num}`)) err(`id (${meta.id}) dosya numarasıyla (${num}) uyuşmuyor`);
      const mod = rel.match(/\/(m\d{2})-/)?.[1];
      if (mod && !String(meta.id).startsWith(mod + "-")) err(`id (${meta.id}) modül klasörüyle (${mod}) uyuşmuyor`);
    }
    if (!/^# .+/m.test(body)) err("sayfada '# Başlık' yok");

    // Görev düzeni (docs/design-council/05 §6): ::gorev[id] ↔ front-matter gorevler. Görev sayfasında maket görselin
    // kendisidir; portre yalnız kapanış kartında gösterilir, bu yüzden gövdede ondan önce görsel/DOSYA bloğu olmaz.
    const missions = Array.isArray(meta.gorevler) ? meta.gorevler : [];
    const missionRefs = [...body.matchAll(/^::gorev\[([a-z0-9-]+)\]\s*$/gm)].map((m) => m[1]);
    const isMission = missions.length > 0;
    for (const id of missionRefs) if (!missions.some((g) => g?.id === id)) err(`::gorev[${id}] tanımlı değil`);
    for (const g of missions) {
      if (!missionRefs.includes(g?.id)) err(`${g?.id}: görev gövdede ::gorev[${g?.id}] ile yerleştirilmemiş`);
      if ((g?.adimlar?.length ?? 0) > 3) err(`${g?.id}: en fazla 3 karar adımı`);
      if ((g?.kapanis?.kurallar?.length ?? 0) !== 3) err(`${g?.id}: kapanış tam 3 kural içermeli`);
      if (/https?:\/\/|www\./i.test(JSON.stringify(g))) err(`${g?.id}: görevde gerçek bağlantı olamaz`);
    }
    if (isMission && /!\[|^> 🕴|^> 🔒/m.test(body.slice(0, body.search(/^::gorev\[/m))))
      err("görev sayfasında ilk etkileşimden önce görsel veya DOSYA bloğu olamaz");

    // Görseller: bildirilen ↔ sayfada kullanılan
    const declared = new Map();
    for (const g of meta.gorseller ?? []) {
      if (!g?.id) { err("kimliksiz görsel"); continue; }
      if (declared.has(g.id) || pages.some((p) => p !== page && (p.meta.gorseller ?? []).some((x) => x.id === g.id))) err(`görsel id tekrar ediyor: ${g.id}`);
      declared.set(g.id, g);
      if (!String(g.id).startsWith(`${meta.id}-`)) err(`görsel id (${g.id}) sayfa id'siyle başlamalı`);
      if (!["ai", "ekran"].includes(g.tur)) err(`${g.id}: tur 'ai' veya 'ekran' olmalı`);
      if (!g.alt) err(`${g.id}: alt metin eksik`);
      if ("maskot" in g) err(`${g.id}: 'maskot' kaldırıldı; 'karakter: <id>' kullanın`);
      if (g.tur === "ai" && !g.prompt) err(`${g.id}: AI görseli için prompt eksik`);
      if (g.tur === "ekran" && !g.nasil) err(`${g.id}: ekran görüntüsü için 'nasil' eksik`);
      if (g.karakter !== undefined && g.karakter !== "aile" && !chars.byId.has(g.karakter)) err(`${g.id}: bilinmeyen karakter '${g.karakter}'`);
      if (g.tur === "ai" && /\bthe villain\b/i.test(g.prompt ?? "") && (!g.karakter || g.karakter === "aile")) err(`${g.id}: prompt "the villain" diyor ama karakter seçilmemiş`);
      if (g.tur === "ai" && /\bthe family\b/i.test(g.prompt ?? "") && g.karakter !== "aile") err(`${g.id}: prompt "the family" diyor; karakter: aile olmalı`);
      if (g.tur === "ai" && /\b(text|words?|letters?)\b(?! \()/i.test(g.prompt ?? "") && !/no (readable )?text|no letters/i.test(g.prompt ?? ""))
        warn(`${g.id}: prompt yazı istiyor gibi; AI yazıyı bozar`);
    }
    const used = new Set();
    for (const m of body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = m[1];
      const id = path.basename(target).replace(/\.[a-z]+$/i, "");
      const resolved = path.resolve(path.dirname(file), target);
      if (path.dirname(resolved) !== IMG_DIR) err(`görsel yolu gorseller/ klasörüne çıkmıyor: ${target}`);
      if (id.startsWith("karakter-")) {
        const cid = id.slice("karakter-".length);
        if (cid !== "aile" && !chars.byId.has(cid)) err(`bilinmeyen karakter portresi: ${id}`);
        continue; // ortak portreler sayfada bildirilmez, kayıt defterinden gelir
      }
      used.add(id);
      if (!declared.has(id)) err(`sayfada kullanılan görsel bildirilmemiş: ${id}`);
    }
    for (const id of declared.keys()) if (!used.has(id)) err(`bildirilen görsel sayfada kullanılmıyor: ${id}`);
    // Çizgi roman şeritleri (::cizgi[id], blok alıntı içinde de olabilir)
    const comicRefs = [...body.matchAll(/^(?:>\s*)*::cizgi\[([a-z0-9-]+)\]\s*$/gm)].map((m) => m[1]);
    page.comics = comicRefs;
    for (const c of comicRefs) {
      comicsUsed.add(c);
      if (!comics.strips[c]) err(`tanımsız çizgi roman şeridi: ${c}`);
      for (const p of comics.strips[c]?.paneller ?? []) if (declared.has(p.gorsel)) err(`${p.gorsel}: hem sayfa görseli hem çizgi roman paneli`);
    }
    const comicVillain = comicRefs.some((c) => comics.strips[c]?.paneller.some((p) => p.karakter));
    // Temel modüllerde ve uzmanlık yollarında her bölümün kendi kötü adam sahnesi olur (sayfada ya da şeritte)
    if (/^0[12]-/.test(rel) && !isMission && !comicVillain && ![...declared.values()].some((g) => g.tur === "ai" && g.karakter))
      err("bu bölüm için kötü adam sahnesi yok (tur: ai + karakter)");

    // Animasyonlar
    const animUsed = [...body.matchAll(/^::animasyon\[([a-z0-9-]+)\]\s*$/gm)].map((m) => m[1]);
    for (const a of animUsed) if (!anims.has(a)) err(`bilinmeyen animasyon: ${a}`);
    const animDecl = meta.animasyonlar ?? [];
    for (const a of animUsed) if (!animDecl.includes(a)) err(`animasyon front-matter'da listelenmemiş: ${a}`);
    for (const a of animDecl) if (!animUsed.includes(a)) err(`listelenen animasyon sayfada yok: ${a}`);

    // İç bağlantılar
    for (const m of body.matchAll(/\]\(((?!https?:|#)[^)]+\.md)\)/g)) {
      if (!fs.existsSync(path.resolve(path.dirname(file), m[1]))) err(`kırık bağlantı: ${m[1]}`);
    }

    // Ders kuralları: kısa, Dene ile biten, tam 3 maddelik özet
    if (meta.tur === "ders" || meta.tur === "uygulama") {
      if (page.words > LIMITS.maxWords) err(`çok uzun: ${page.words} kelime (en fazla ${LIMITS.maxWords})`);
      else if (page.words > LIMITS.warnWords) warn(`uzun: ${page.words} kelime (hedef ≤ ${LIMITS.warnWords})`);
      if (!(meta.hedefler?.length > 0)) err("hedefler eksik");
      // Görev sayfasında görsel = posta maketi; 3 maddelik özet kapanış kartındaki kurallardır.
      if (!isMission && (meta.gorseller?.length ?? 0) + animUsed.length + comicRefs.length === 0) err("sayfada hiç görsel/animasyon yok");
      const sum = body.match(/## ✅ Akılda kalsın\n+((?:- .+\n?)+)/);
      if (!sum && !isMission) err("'## ✅ Akılda kalsın' bölümü yok");
      else if (sum && sum[1].trim().split("\n").length !== 3) err("'Akılda kalsın' tam 3 madde olmalı");
    }
    if (meta.tur === "ders" && !/## 🧪 Dene/.test(body)) err("'## 🧪 Dene' bölümü yok");
    if (meta.tur === "bilgi" && page.words > LIMITS.maxWords) warn(`uzun: ${page.words} kelime`);

    // Quiz
    if (meta.tur === "quiz") {
      const qs = meta.sorular ?? [];
      if (qs.length < 3) err("quiz en az 3 soru içermeli");
      if (typeof meta.gecme !== "number") err("gecme (geçme yüzdesi) eksik");
      qs.forEach((q, i) => {
        const n = `soru ${i + 1}`;
        if (!q.soru) err(`${n}: soru metni yok`);
        if (!q.aciklama) err(`${n}: açıklama yok`);
        if (q.tur === "coktan") {
          if (!Array.isArray(q.secenekler) || q.secenekler.length < 2 || q.secenekler.length > 6) err(`${n}: 2–6 seçenek olmalı`);
          else if (!Number.isInteger(q.dogru) || q.dogru < 0 || q.dogru >= q.secenekler.length) err(`${n}: 'dogru' geçerli bir seçenek indeksi değil`);
        } else if (q.tur === "dogru-yanlis") {
          if (typeof q.dogru !== "boolean") err(`${n}: dogru-yanlis için 'dogru' true/false olmalı`);
        } else err(`${n}: tur 'coktan' veya 'dogru-yanlis' olmalı`);
      });
    }
  }

  // Her modül bir bölümdür: ilk sayfa kötü adamı ve bölümü açar, son sayfa dosyayı kapatır
  for (const k of chars.list.filter(isStoryUnit)) {
    const inUnit = unitMatch(k);
    const list = pages.filter((p) => inUnit(p.rel)).sort((a, b) => a.rel.localeCompare(b.rel));
    if (!list.length) continue;
    const [first, last] = [list[0], list.at(-1)];
    if (!first.body.includes(`gorseller/${portraitId(k.id)}.webp`)) add(first.file, "hata", `${k.modul} kötü adamı (${k.ad}) ilk sayfada tanıtılmıyor`);
    if (!first.body.includes("📼 **Bölüm") && !first.comics?.includes(`${k.id}-acilis`))
      add(first.file, "hata", `${k.modul} bölüm girişi (::cizgi[${k.id}-acilis] ya da 📼 **Bölüm …) yok`);
    if (list.length > 1 && !last.body.includes("🔒 **DOSYA KAPANDI")) add(last.file, "hata", `${k.modul} son sayfasında 🔒 DOSYA KAPANDI kutusu yok`);
  }
  const covers = loadCovers(chars, add);
  const pilotImages = loadPilotImages(chars, add);
  const comicFile = path.join(CONTENT, "cizgi-roman.yaml");
  for (const id of Object.keys(comics.strips)) if (!comicsUsed.has(id)) add(comicFile, "uyarı", `${id}: şerit hiçbir sayfada kullanılmıyor`);
  const pageImages = new Set(pages.flatMap((p) => (p.meta.gorseller ?? []).map((g) => g.id)));
  for (const s of Object.values(comics.strips)) for (const p of s.paneller) if (pageImages.has(p.gorsel)) add(comicFile, "hata", `${p.gorsel}: panel kimliği bir sayfa görseliyle çakışıyor`);
  return { pages, problems, chars, covers, pilotImages, comics };
}

function section(rel) {
  if (rel.startsWith("00-program")) return "Akademi hakkında";
  if (rel.startsWith("01-temel")) {
    const m = rel.match(/(m\d{2})-([a-z0-9-]+)/);
    return m ? `Kısım I · ${m[1].toUpperCase()}` : "Kısım I";
  }
  if (rel.startsWith("02-uzmanlik")) return "Kısım II · Uzmanlık yolları";
  if (rel.startsWith("../pilot/")) return "SK-101 pilot (taslak)";
  return "Diğer";
}

function writeCharacterBook(chars) {
  const f = chars.family;
  const L = [
    "# Gölge Ağ Ailesi — Karakter Kitabı",
    "",
    "> ⚠️ Bu dosya **otomatik üretilir** (`npm run academy:gorseller`) — kaynak: [`karakterler.yaml`](karakterler.yaml).",
    "",
    `${f.ozet}`,
    "",
    "## 1. Evrensel sanat yönetimi",
    "",
    "| Kural | Uygulama |",
    "|---|---|",
    "| **Atmosfer** | Klasik mafya filmlerinin karanlık zarafeti + sokak gerçekçiliği; üstüne parlayan yeşil hacker terminalleri, kablolar. Eğlenceli karikatür form, tehlikeli sinematik yeraltı ağırlığı. |",
    "| **Oranlar** | Yarı-karikatür, 4.5–5.5 kafa boyu. Arketipe göre abartı: iri adamda ters üçgen gövde, babada uzun bacak/ince bel, kısa karakterde geniş duruş. |",
    "| **Silüet** | Aksesuar, telefon, anahtar, puro ve kollar gövdeye yapışmaz; dış konturdan ayrışır, negatif alan oluşturur. Ayaklar sağlam basar; 3/4 pozlarda ayaklar ~90°. |",
    "| **Mürekkep** | Kalın, kesintisiz dış kontur; incelen (tapered) basınçlı iç çizgiler. Çizgiler saf siyah değil, bölgenin koyu tonunda (koyu kahve, bordo, mürekkep lacivert). |",
    "| **Renk** | Sıcak, eskitilmiş, doygunluğu düşük vintage tonlar; yüksek kontrastlı koyu gölgeler. Gölgelerde camgöbeği-yeşil kırılma, ışıkta kehribar/sepya. |",
    "| **Gölgelendirme** | Hibrit: yumuşak airbrush hacim + çene altı, yaka, ceket katlarında net kenarlı cel gölge; kenarlarda ince kontur ışığı. |",
    "| **Asla** | Görselde yazı/harf/rakam, gerçek kişi benzerliği, gerçek marka/kurum, stüdyo veya sanatçı adı. Kadın karakterler cinselleştirilmez. |",
    "",
    "## 2. Kadro",
    "",
    "| Modül | Karakter | Unvan | Temsil ettiği tehdit |",
    "|---|---|---|---|",
    ...chars.list.map((k) => `| ${k.modul} | **${k.ad}** | ${k.unvan} | ${k.tehdit} |`),
    "",
    "## 3. Kimlik kartları",
    "",
  ];
  for (const k of chars.list) {
    L.push(
      `### ${k.modul} — ${k.ad} (${k.unvan})`,
      "",
      `- **Portre dosyası:** \`${portraitId(k.id)}.png\``,
      `- **Özet:** ${k.ozet}`,
      `- **Temsil ettiği tehdit:** ${k.tehdit}`,
      `- **Fiziksel yapı:** ${k.fiziksel}`,
      `- **Yüz ve ifade:** ${k.yuz}`,
      `- **Poz ve silüet:** ${k.poz}`,
      `- **Kıyafet ve aksesuar:** ${k.kiyafet}`,
      `- **İmza detay:** ${k.imza}`,
      `- **Renk paleti:** ${Object.entries(k.palet).map(([n, h]) => `${n} \`${h}\``).join(" · ")}`,
      "",
      `- **Hikâyedeki yeri:** ${chars.story.baglar[k.id]}`,
      "",
      "**Portre promptu (Midjourney):**",
      "",
      "```text",
      portraitPrompt(k),
      "```",
      "",
    );
  }
  L.push("## 4. Grup sahnesi", "", ...f.grup_kurali.map((r) => `- ${r}`), "", "**Grup promptu** (`karakter-aile.png`):", "", "```text", familyPrompt(f), "```", "");
  const s = chars.story;
  L.push(
    `## 5. Hikâye — ${s.ad}`,
    "",
    `Öğrenciye anlatılan tam hikâye: [${s.sayfa}](${s.sayfa}). Her modül bir bölümdür: ilk sayfası 📼 bölüm girişini,`,
    "son sayfası 🔒 DOSYA KAPANDI kutusunu ve bir sonraki kötü adama uzanan ipucunu taşır.",
    "",
    "| Bölüm | Kötü adam | Başlık | Sonunda ne olur? |",
    "|---|---|---|---|",
    ...chars.list.filter(isStoryUnit).map((k, i) => `| ${unitLabel(k, i)} | ${k.ad} | ${s.bolumler[k.id].baslik} | ${s.bolumler[k.id].kapanis.trim()} |`),
    "",
  );
  fs.writeFileSync(path.join(CONTENT, "KARAKTERLER.md"), L.join("\n").trimEnd() + "\n");
}

function writeCoverBook(covers) {
  const ready = covers.filter((c) => imageFile(c.id) !== null).length;
  const L = [
    "# Modül kapakları",
    "",
    "> ⚠️ Bu dosya **otomatik üretilir** (`npm run academy:gorseller`). Elle düzenlemeyin;",
    "> kapak bilgisi [`akademi.yaml`](akademi.yaml) içindeki `kapak:` alanlarında ve [`../pilot/kapaklar.yaml`](../pilot/kapaklar.yaml) dosyasındadır.",
    "",
    `**Toplam:** ${covers.length} · ✅ Hazır: ${ready} · ⬜ Bekleyen: ${covers.length - ready}`,
    "",
    "## Nasıl üretilir?",
    "",
    "1. Kapak bir **oda kartıdır**: ortada tek, kalın bir sembol; sağ üçte birde modülün kötü adamı; sade karanlık fon ve bol boşluk.",
    "2. Kötü adamın portresi hazırsa prompt `--oref <portre URL'si> --ow 100` ile biter: portreyi Midjourney'ye yükleyip",
    "   `<…>` yerine adresini yapıştır (ya da Omni Reference alanına sürükle). Portresi henüz yoksa önce [GORSELLER.md](GORSELLER.md)'deki portreyi üret.",
    "3. Görselde yazı, harf, logo, maskot veya ördek olmamalı. Küçük boyutta (ör. 320×180) hâlâ okunuyor mu, kontrol et.",
    "4. **Dosya adı:** `kapak-<anahtar>.webp` → `gorseller/` klasörüne koy. 1600×900 WebP idealdir.",
    "",
  ];
  let group = null;
  for (const c of covers) {
    if (c.group !== group) L.push(`## ${(group = c.group)}`, "");
    const ok = imageFile(c.id) !== null;
    L.push(
      `### ${ok ? "✅" : "⬜"} \`${c.id}\` · ${c.title} · 🕴️ ${c.k.ad}`,
      "",
      `- **Dosya adı:** \`${c.id}.webp\``,
      `- **Sembol:** ${c.c.sembol}`,
      `- **Ne görünmeli:** ${c.c.alt}`,
      `- **Omni Reference:** \`${portraitId(c.k.id)}.webp\`${imageFile(portraitId(c.k.id)) ? "" : " (portre henüz yok)"}`,
      "",
      "```text",
      coverPrompt(c.c, c.k),
      "```",
      "",
    );
  }
  const labsReady = LAB_ICONS.filter((l) => imageFile(labIconId(l.key)) !== null).length;
  L.push(
    "## Lab ikonları",
    "",
    "> Kare rozet ikonları (`--ar 1:1`): tek sembol, düz koyu fon, kalın kontur; karakter, yazı ve rakam yok. 64 px'te okunmalı.",
    "> Liste `scripts/academy.mjs` içindeki `LAB_ICONS`; anahtarlar `src/lib/labs-catalog.ts` ve SK-101 lab sayfalarıyla aynı. **Dosya adı:** `lab-<anahtar>.webp`, 512×512 WebP.",
    "",
    `**Toplam:** ${LAB_ICONS.length} · ✅ Hazır: ${labsReady} · ⬜ Bekleyen: ${LAB_ICONS.length - labsReady}`,
    "",
  );
  for (const l of LAB_ICONS) {
    const ok = imageFile(labIconId(l.key)) !== null;
    L.push(`### ${ok ? "✅" : "⬜"} \`${labIconId(l.key)}\` · ${l.title}`, "", `- **Sembol:** ${l.sembol}`, "", "```text", labIconPrompt(l), "```", "");
  }
  fs.writeFileSync(path.join(CONTENT, "KAPAKLAR.md"), L.join("\n").trimEnd() + "\n");
  return { ready, labsReady };
}

function generate() {
  const { pages, problems, chars, covers, pilotImages, comics } = loadAll();
  const errors = problems.filter((p) => p.level === "hata");
  if (errors.length) {
    report(problems);
    console.error("\nÖnce hataları düzeltin; dosyalar üretilmedi.");
    process.exit(1);
  }
  writeCharacterBook(chars);

  const items = [...pages.flatMap((p) => (p.meta.gorseller ?? []).map((g) => ({ g, p }))), ...pilotImages].map((i) => ({ ...i, done: imageFile(i.g.id) !== null }));
  const portraits = [
    ...chars.list.map((k) => ({ id: portraitId(k.id), title: `${k.modul} · ${k.ad}`, prompt: portraitPrompt(k), done: imageFile(portraitId(k.id)) !== null })),
    { id: "karakter-aile", title: "Grup sahnesi · Gölge Ağ Ailesi", prompt: familyPrompt(chars.family), done: imageFile("karakter-aile") !== null },
  ];
  const ai = items.filter((i) => i.g.tur === "ai");
  const ekran = items.filter((i) => i.g.tur === "ekran");
  // Çizgi roman panelleri, şeridin ilk kullanıldığı sayfanın sırasıyla
  const stripOrder = [...new Set([...pages].sort((a, b) => a.rel.localeCompare(b.rel)).flatMap((p) => p.comics ?? []))].filter((id) => comics.strips[id]);
  const panels = stripOrder.flatMap((sid) => comics.strips[sid].paneller.map((p, i) => ({ sid, i, p, done: imageFile(p.gorsel) !== null })));
  const total = items.length + portraits.length + panels.length;
  const done = items.filter((i) => i.done).length + portraits.filter((p) => p.done).length + panels.filter((p) => p.done).length;

  const lines = [
    "# Görsel listesi",
    "",
    "> ⚠️ Bu dosya **otomatik üretilir** (`npm run academy:gorseller`). Elle düzenlemeyin;",
    "> görsel bilgisi sayfaların `gorseller:` alanında, karakterler [`karakterler.yaml`](karakterler.yaml) dosyasındadır.",
    "",
    `**Toplam:** ${total} · 🕴️ Karakter portresi: ${portraits.length} · 🎨 Sahne: ${ai.length} · 📸 Ekran görüntüsü: ${ekran.length} · 🎞️ Çizgi roman paneli: ${panels.length} · ✅ Hazır: ${done} · ⬜ Bekleyen: ${total - done}`,
    "",
    "## Nasıl üretilir ve gönderilir?",
    "",
    "1. **Önce karakter portrelerini üret** (Midjourney, `--ar 2:3`). Beğendiğin portreyi sakla; sahnelerde referans olacak.",
    "2. **Sahnelerde karakteri sabitle:** portreyi Midjourney'de **Omni Reference** alanına sürükle",
    "   (ya da promptun sonuna `--oref <portre URL'si> --ow 100` ekle). Her sahnenin üstünde hangi portrenin referans olacağı yazar.",
    "3. 🎨 Promptları **olduğu gibi** kopyala — karakter tarifi, noir stil ve Midjourney parametreleri (`--ar 16:9 --v 7 --no …`) içinde.",
    "4. **Dosya adı = görsel kimliği** (ör. `karakter-tevfik.png`, `m01-04-a.png`). PNG, JPG veya WebP olabilir.",
    "5. 📸 Ekran görüntülerinde kişisel veri olmasın; ilgili yeri kehribar (#C9953B) çerçeveyle işaretle. 1600×900 ideal.",
    "6. Görselde **yazı olmamalı**; AI yazı üretirse sil ya da yeniden üret. Karakterler ve hikâye: [KARAKTERLER.md](KARAKTERLER.md).",
    "",
    "## 🕴️ Önce: karakter portreleri",
    "",
  ];
  for (const p of portraits) {
    lines.push(`### ${p.done ? "✅" : "⬜"} \`${p.id}\` · ${p.title}`, "", `- **Dosya adı:** \`${p.id}.png\``, "", "```text", p.prompt, "```", "");
  }

  const groups = new Map();
  for (const it of items) {
    const s = section(it.p.rel);
    if (!groups.has(s)) groups.set(s, []);
    groups.get(s).push(it);
  }
  for (const [s, list] of groups) {
    lines.push(`## ${s}`, "");
    for (const { g, p, done: ok } of list) {
      const kind = g.tur === "ai" ? "🎨 AI" : "📸 Ekran görüntüsü";
      const who = g.karakter === "aile" ? " · 🕴️ Aile" : g.karakter ? ` · 🕴️ ${chars.byId.get(g.karakter).ad}` : "";
      lines.push(`### ${ok ? "✅" : "⬜"} \`${g.id}\` · ${kind}${who}`, "");
      lines.push(`- **Sayfa:** [${p.meta.baslik}](${p.rel})`);
      lines.push(`- **Ne görünmeli:** ${g.alt}`);
      lines.push(`- **Dosya adı:** \`${g.id}.png\``);
      if (g.karakter && g.karakter !== "aile") lines.push(`- **Omni Reference:** \`${portraitId(g.karakter)}.png\``);
      if (g.tur === "ekran") {
        lines.push(`- **Nasıl çekilir:** ${String(g.nasil).trim()}`, "");
      } else {
        lines.push("", "```text", fullPrompt(g, chars), "```", "");
      }
    }
  }
  lines.push(
    "## 🎞️ Çizgi roman panelleri",
    "",
    "> Kaynak: [`cizgi-roman.yaml`](cizgi-roman.yaml). Paneller **yazısız** üretilir; anlatıcı kutusu ve konuşma balonları platformda",
    "> panelin üstüne gerçek metin olarak yerleşir. Panelin üst kenarı sakin kalsın (anlatıcı kutusu oraya oturur). `--ar 4:3`.",
    "",
  );
  let lastStrip = null;
  for (const { sid, i, p, done: ok } of panels) {
    if (sid !== lastStrip) lines.push(`### 🎞️ ${comics.strips[sid].baslik} (\`${sid}\`)`, "");
    lastStrip = sid;
    const who = p.karakter ? ` · 🕴️ ${chars.byId.get(p.karakter).ad}` : "";
    lines.push(`#### ${ok ? "✅" : "⬜"} \`${p.gorsel}\` · Panel ${i + 1}${who}`, "", `- **Ne görünmeli:** ${p.alt}`, `- **Dosya adı:** \`${p.gorsel}.png\``);
    if (p.karakter) lines.push(`- **Omni Reference:** \`${portraitId(p.karakter)}.png\``);
    const said = [p.anlatici && `📦 ${p.anlatici}`, ...(p.balonlar ?? []).map((b) => `💬 ${b.kim}: “${b.metin}”`)].filter(Boolean);
    if (said.length) lines.push(`- **Panelin metni (platform çizer):** ${said.join(" · ")}`);
    lines.push("", "```text", comicPrompt(p, comics, chars, comics.strips[sid].paneller.length === 1), "```", "");
  }
  fs.writeFileSync(path.join(CONTENT, "GORSELLER.md"), lines.join("\n").trimEnd() + "\n");
  const { ready: coversReady, labsReady } = writeCoverBook(covers);
  console.log(`GORSELLER.md + KARAKTERLER.md üretildi: ${total} görsel (${portraits.length} portre, ${ai.length} sahne, ${ekran.length} ekran, ${panels.length} çizgi roman paneli), ${done} hazır.`);
  console.log(`KAPAKLAR.md üretildi: ${covers.length} kapak, ${coversReady} hazır; ${LAB_ICONS.length} lab ikonu, ${labsReady} hazır.`);
}

function report(problems) {
  for (const p of problems) console.log(`${p.level === "hata" ? "✘" : "!"} ${p.file}: ${p.msg}`);
}

function check() {
  const { pages, problems, chars, pilotImages, comics } = loadAll();
  const en = checkTranslations(pages, (file, level, msg) => problems.push({ file: path.relative(CONTENT, file), level, msg }));
  report(problems);
  const errors = problems.filter((p) => p.level === "hata").length;
  const byType = pages.reduce((a, p) => ((a[p.meta.tur] = (a[p.meta.tur] ?? 0) + 1), a), {});
  const lessons = pages.filter((p) => p.meta.tur === "ders");
  const avg = lessons.length ? Math.round(lessons.reduce((a, p) => a + p.words, 0) / lessons.length) : 0;
  const imgs = pages.reduce((a, p) => a + (p.meta.gorseller?.length ?? 0), 0);
  console.log(`\n${pages.length} sayfa (${Object.entries(byType).map(([k, v]) => `${k}: ${v}`).join(", ")}) · ders başına ort. ${avg} kelime · ${imgs} sahne görseli + ${pilotImages.length} SK-101 pilot görseli + ${Object.values(comics.strips).reduce((a, s) => a + (s.paneller?.length ?? 0), 0)} çizgi roman paneli + ${chars.list.length + 1} karakter portresi`);
  const strips = Object.values(comics.strips);
  console.log(`İngilizce: ${en.done}/${en.total} sayfa · ${strips.filter((x) => x.en?.baslik).length}/${strips.length} çizgi roman şeridi`);
  console.log(errors ? `✘ ${errors} hata` : "✔ Hata yok");
  process.exit(errors ? 1 : 0);
}

// ── Görsel işleri (Gemini/Nano Banana betiği için) ─────────────────────────
// Midjourney promptunu sağlayıcıdan bağımsız parçalara ayırır: sahne + stil metni ve en-boy oranı.
// --no listesi düz cümleye, --oref yer tutucusu referans görsele dönüşür (betik portreyi ayrıca ekler).
const NO_TEXT =
  "There is no text, lettering, signage, numbers, logo, watermark or signature anywhere in the image. " +
  "The artwork runs to every edge with no border, frame, panel outline, letterbox bars or empty boxes.";
function splitMj(prompt) {
  const at = prompt.indexOf(" --ar ");
  return { prompt: `${prompt.slice(0, at).trim().replace(/\.?$/, ".")} ${NO_TEXT}`, aspect: prompt.match(/--ar (\d+:\d+)/)[1] };
}
// Aile sahnesinde en çok 5 karakter referansı (model sınırı); ailenin ön sırası.
const FAMILY_REFS = ["don", "eren", "jasmine", "mine", "ferhat"];

// Tüm görseller üretim sırasıyla: önce portreler (diğerlerinin referansı), sonra kapaklar, sayfalar, pilot, paneller.
export function imageJobs() {
  const { pages, problems, chars, covers, pilotImages, comics } = loadAll();
  const errors = problems.filter((p) => p.level === "hata");
  if (errors.length) throw new Error(`İçerikte ${errors.length} hata var; önce npm run academy:check`);
  const ref = (id) => { const file = imageFile(portraitId(id)); return file ? { id, name: chars.byId.get(id).ad, file } : null; };
  const refsFor = (karakter) => (karakter === "aile" ? FAMILY_REFS.map(ref) : karakter ? [ref(karakter)] : []).filter(Boolean);
  const jobs = [];
  const add = (id, title, mjPrompt, refs) => jobs.push({ id, title, ...splitMj(mjPrompt), refs, done: imageFile(id) !== null });
  for (const k of chars.list) add(portraitId(k.id), `Portre · ${k.ad}`, portraitPrompt(k), []);
  // Çizgi romanın kalıcı kahramanları (kötü adam değil): her panelde aynı görünsünler diye kendi referans portreleri olur.
  const CAST = { tilki: "Tilki", selim: "Selim Hoca" };
  const castRef = (key) => { const file = imageFile(portraitId(key)); return file ? { id: key, name: CAST[key], file } : null; };
  for (const [key, name] of Object.entries(CAST))
    if (comics.tarifler[key]) add(portraitId(key), `Portre · ${name}`, mj(`Full-body character design portrait of ${comics.tarifler[key].trim()}. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity`, "2:3"), []);
  const castRefsIn = (prompt) => Object.keys(CAST).filter((key) => prompt.includes(`{${key}}`)).map(castRef).filter(Boolean);
  add("karakter-aile", "Grup sahnesi · Gölge Ağ Ailesi", familyPrompt(chars.family), refsFor("aile"));
  for (const c of covers) add(c.id, `Kapak · ${c.title}`, coverPrompt(c.c, c.k), refsFor(c.k.id));
  for (const l of LAB_ICONS) add(labIconId(l.key), `Lab ikonu · ${l.title}`, labIconPrompt(l), []);
  for (const p of [...pages].sort((a, b) => a.rel.localeCompare(b.rel)))
    for (const g of p.meta.gorseller ?? []) if (g.tur === "ai") add(g.id, p.meta.baslik, fullPrompt(g, chars), refsFor(g.karakter));
  for (const { g, p } of pilotImages) add(g.id, `SK-101 · ${p.meta.baslik}`, fullPrompt(g, chars), refsFor(g.karakter));
  const strips = [...new Set([...pages].sort((a, b) => a.rel.localeCompare(b.rel)).flatMap((p) => p.comics ?? []))].filter((id) => comics.strips[id]);
  for (const sid of strips)
    comics.strips[sid].paneller.forEach((p, i) => add(p.gorsel, `Çizgi roman · ${comics.strips[sid].baslik} · panel ${i + 1}`, comicPrompt(p, comics, chars, comics.strips[sid].paneller.length === 1), [...refsFor(p.karakter), ...castRefsIn(p.prompt)].slice(0, 5)));
  return jobs;
}

// Betik olarak çalıştırıldığında; başka bir betik içe aktarınca (gemini-images.mjs) komut çalışmaz.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const cmd = process.argv[2];
  if (cmd === "check") check();
  else if (cmd === "gorseller") generate();
  else {
    console.log("Kullanım: node scripts/academy.mjs <check|gorseller>");
    process.exit(1);
  }
}
