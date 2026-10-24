#!/usr/bin/env node
// ============================================================================
//  Akademi içerik aracı
//    node scripts/academy.mjs check       → tüm sayfaları doğrula (hata varsa çıkış kodu 1)
//    node scripts/academy.mjs gorseller   → GORSELLER.md ve KARAKTERLER.md dosyalarını üret
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
    } else if (e.name.endsWith(".md") && dir !== CONTENT) out.push(p);
  }
  return out;
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
    // Temel modüllerde ve uzmanlık yollarında her bölümün kendi kötü adam sahnesi olur
    if (/^0[12]-/.test(rel) && !isMission && ![...declared.values()].some((g) => g.tur === "ai" && g.karakter))
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
      if (!isMission && (meta.gorseller?.length ?? 0) + animUsed.length === 0) err("sayfada hiç görsel/animasyon yok");
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
    if (!first.body.includes("📼 **Bölüm")) add(first.file, "hata", `${k.modul} bölüm girişi (📼 **Bölüm …) yok`);
    if (list.length > 1 && !last.body.includes("🔒 **DOSYA KAPANDI")) add(last.file, "hata", `${k.modul} son sayfasında 🔒 DOSYA KAPANDI kutusu yok`);
  }
  return { pages, problems, chars };
}

function section(rel) {
  if (rel.startsWith("00-program")) return "Akademi hakkında";
  if (rel.startsWith("01-temel")) {
    const m = rel.match(/(m\d{2})-([a-z0-9-]+)/);
    return m ? `Kısım I · ${m[1].toUpperCase()}` : "Kısım I";
  }
  if (rel.startsWith("02-uzmanlik")) return "Kısım II · Uzmanlık yolları";
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

function generate() {
  const { pages, problems, chars } = loadAll();
  const errors = problems.filter((p) => p.level === "hata");
  if (errors.length) {
    report(problems);
    console.error("\nÖnce hataları düzeltin; dosyalar üretilmedi.");
    process.exit(1);
  }
  writeCharacterBook(chars);

  const items = pages.flatMap((p) => (p.meta.gorseller ?? []).map((g) => ({ g, p, done: imageFile(g.id) !== null })));
  const portraits = [
    ...chars.list.map((k) => ({ id: portraitId(k.id), title: `${k.modul} · ${k.ad}`, prompt: portraitPrompt(k), done: imageFile(portraitId(k.id)) !== null })),
    { id: "karakter-aile", title: "Grup sahnesi · Gölge Ağ Ailesi", prompt: familyPrompt(chars.family), done: imageFile("karakter-aile") !== null },
  ];
  const ai = items.filter((i) => i.g.tur === "ai");
  const ekran = items.filter((i) => i.g.tur === "ekran");
  const total = items.length + portraits.length;
  const done = items.filter((i) => i.done).length + portraits.filter((p) => p.done).length;

  const lines = [
    "# Görsel listesi",
    "",
    "> ⚠️ Bu dosya **otomatik üretilir** (`npm run academy:gorseller`). Elle düzenlemeyin;",
    "> görsel bilgisi sayfaların `gorseller:` alanında, karakterler [`karakterler.yaml`](karakterler.yaml) dosyasındadır.",
    "",
    `**Toplam:** ${total} · 🕴️ Karakter portresi: ${portraits.length} · 🎨 Sahne: ${ai.length} · 📸 Ekran görüntüsü: ${ekran.length} · ✅ Hazır: ${done} · ⬜ Bekleyen: ${total - done}`,
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
  fs.writeFileSync(path.join(CONTENT, "GORSELLER.md"), lines.join("\n").trimEnd() + "\n");
  console.log(`GORSELLER.md + KARAKTERLER.md üretildi: ${total} görsel (${portraits.length} portre, ${ai.length} sahne, ${ekran.length} ekran), ${done} hazır.`);
}

function report(problems) {
  for (const p of problems) console.log(`${p.level === "hata" ? "✘" : "!"} ${p.file}: ${p.msg}`);
}

function check() {
  const { pages, problems, chars } = loadAll();
  report(problems);
  const errors = problems.filter((p) => p.level === "hata").length;
  const byType = pages.reduce((a, p) => ((a[p.meta.tur] = (a[p.meta.tur] ?? 0) + 1), a), {});
  const lessons = pages.filter((p) => p.meta.tur === "ders");
  const avg = lessons.length ? Math.round(lessons.reduce((a, p) => a + p.words, 0) / lessons.length) : 0;
  const imgs = pages.reduce((a, p) => a + (p.meta.gorseller?.length ?? 0), 0);
  console.log(`\n${pages.length} sayfa (${Object.entries(byType).map(([k, v]) => `${k}: ${v}`).join(", ")}) · ders başına ort. ${avg} kelime · ${imgs} sahne görseli + ${chars.list.length + 1} karakter portresi`);
  console.log(errors ? `✘ ${errors} hata` : "✔ Hata yok");
  process.exit(errors ? 1 : 0);
}

const cmd = process.argv[2];
if (cmd === "check") check();
else if (cmd === "gorseller") generate();
else {
  console.log("Kullanım: node scripts/academy.mjs <check|gorseller>");
  process.exit(1);
}
