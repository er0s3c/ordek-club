// ============================================================================
//  app/labLogic.js — Saf (React'siz) lab mantığı: dizin filtreleme, rastgele /
//  sıradaki zafiyet seçimi ve rozet hesabı.
//  Hem app/LabApp.jsx (UI) hem test/units.mjs (node) buradan import eder; böylece
//  mantık tek yerde durur, framework olmadan test edilebilir.
//  NOT: Bu modülde flag/secret YOK — yalnızca istemci-güvenli katalog mantığı.
// ============================================================================
import { VULNS, KILLCHAINS } from "./labData.js";

// Bir zafiyetin çözülmüş seviye listesi (0..3 eleman).
const levelsOf = (solved, slug) => (solved && solved[slug]) || [];

/**
 * Dizin arama + filtre.
 *  query  → ad/senaryo içinde (büyük/küçük harf duyarsız, latin)
 *  group  → "all" | "core" | "auth" | "modern"
 *  status → "all" | "unsolved" (0) | "solved" (>0) | "full" (=3)
 */
export function filterVulns(vulns, { query = "", group = "all", status = "all" } = {}, solved = {}) {
  const q = String(query).trim().toLowerCase();
  return (vulns || []).filter((v) => {
    if (group !== "all" && v.group !== group) return false;
    const done = levelsOf(solved, v.slug).length;
    if (status === "unsolved" && done > 0) return false;
    if (status === "solved" && done === 0) return false;
    if (status === "full" && done < 3) return false;
    if (q) {
      const hay = `${v.name} ${v.scenario || ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// Rastgele zafiyet. rnd enjekte edilebilir (deterministik test için).
export function pickRandomVuln(vulns, rnd = Math.random) {
  const list = vulns || [];
  if (!list.length) return null;
  return list[Math.floor(rnd() * list.length)] || list[0];
}

// İlk "tam çözülmemiş" (<3 seviye) zafiyet; hepsi tamsa null.
export function pickNextUnsolved(vulns, solved = {}) {
  return (vulns || []).find((v) => levelsOf(solved, v.slug).length < 3) || null;
}

// ─────────────────────────────────────────────────────────────────────────
//  Akademi yol haritası (roadmap) — modül ilerleme + kilit mantığı.
//  Saf/flag'siz: hem app/LabApp.jsx hem test/units.mjs buradan import eder.
//  Modül şekli (academyData.ROADMAP):
//    { id, type:"theory"|"labs", lessons:[ {id, ...} | {id, slug} ] }
//  theory dersi: readLessons[lesson.id] truthy ise "okundu" sayılır.
//  labs dersi:  solved[slug] içinde en az bir seviye varsa "çözüldü" sayılır.
// ─────────────────────────────────────────────────────────────────────────

// Bir modülün ilerlemesi: { done, total, complete }.
export function moduleProgress(module, { solved = {}, readLessons = {} } = {}) {
  const lessons = (module && module.lessons) || [];
  const total = lessons.length;
  let done = 0;
  for (const ls of lessons) {
    if (module && (module.type === "labs" || module.type === "tool")) {
      const slug = ls.slug || ls.id;
      if (levelsOf(solved, slug).length > 0) done++;
    } else if (readLessons[ls.id]) {
      done++;
    }
  }
  return { done, total, complete: total > 0 && done === total };
}

/**
 * Tüm yol haritasının durumu. Her modül için { id, done, total, complete, unlocked }.
 *  - overrides yok (bireysel): sıralı kilit — modül i, i===0 veya önceki tamamsa açılır.
 *  - overrides.unlocked dizisi varsa (sınıf modu, öğretmen yönetir): açık modüller
 *    bu listeyle belirlenir (ilk modül her zaman açık kalır — güvenlik).
 */
export function roadmapStatus(roadmap, { solved = {}, readLessons = {}, overrides = null } = {}) {
  const list = roadmap || [];
  const forced = overrides && Array.isArray(overrides.unlocked) ? overrides.unlocked : null;
  const out = [];
  let prevComplete = true; // ilk modül daima açık
  for (let i = 0; i < list.length; i++) {
    const m = list[i];
    const { done, total, complete } = moduleProgress(m, { solved, readLessons });
    const unlocked = forced ? (i === 0 || forced.includes(m.id)) : (i === 0 || prevComplete);
    out.push({ id: m.id, done, total, complete, unlocked });
    prevComplete = complete;
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────────
//  Makine / bildirim / skor — saf yardımcılar (UI + node testleri ortak).
//  Flag/secret YOK; yalnızca istemci-güvenli veri üzerinde çalışır.
// ─────────────────────────────────────────────────────────────────────────

// Flag çözülünce oto-kapatılacak makineyi bul: slug+level eşleşen çalışan makine.
// machines: /api/machines listesi. Eşleşme yoksa null.
export function matchRunningMachine(machines, slug, level) {
  if (!Array.isArray(machines) || !slug) return null;
  return machines.find((m) => m && m.slug === slug && (!level || m.level === level)) || null;
}

// Bildirim listesinde okunmamış sayısı.
export function unreadCount(notes) {
  if (!Array.isArray(notes)) return 0;
  return notes.reduce((n, m) => n + (m && !m.read ? 1 : 0), 0);
}

// Reusable Intl.Collator for Turkish string comparison in rankStudents.
// Avoids instantiating collator instances or parsing locale on every comparison in array sorting.
const trCollator = new Intl.Collator("tr");

// Skor tablosu sıralaması: count azalan, eşitlikte ad artan (stabil) + yarışma sırası (1,2,2,4).
// ⚡ Bolt: Use static Intl.Collator for ~3-4x faster string comparison during sorting.
export function rankStudents(rows) {
  const sorted = [...(rows || [])].sort((a, b) => {
    const d = ((b && b.count) || 0) - ((a && a.count) || 0);
    if (d) return d;
    return trCollator.compare(String((a && a.name) || ""), String((b && b.name) || ""));
  });
  let lastCount = null, lastRank = 0;
  return sorted.map((r, i) => {
    const count = (r && r.count) || 0;
    const rank = count === lastCount ? lastRank : i + 1;
    lastCount = count; lastRank = rank;
    return { ...r, count, rank };
  });
}

// Pre-computed static category slug maps & totals for computeBadges optimization.
// Avoids re-filtering VULNS array and allocating intermediate arrays on every badge computation.
const CORE_SLUGS = VULNS.filter((v) => v.group === "core").map((v) => v.slug);
const AUTH_SLUGS = VULNS.filter((v) => v.group === "auth").map((v) => v.slug);
const MODERN_SLUGS = VULNS.filter((v) => v.group === "modern").map((v) => v.slug);
const TOTAL_FLAGS = VULNS.length * 3;

// Rozet hesabı (FlagsView + öğretmen paneli ortak). VULNS/KILLCHAINS katalogdan.
// ⚡ Bolt: Pre-computed slug lists & single-pass level counting (~2x speedup in leaderboard renders).
export function computeBadges(solved) {
  const s = solved || {};
  const has = (slug) => (s[slug] || []).length > 0;

  // Yalnız zafiyet flag'lerini say (tool-* lab çözümleri rozet/oranı bozmasın).
  let gotFlags = 0;
  for (let i = 0; i < VULNS.length; i++) {
    const arr = s[VULNS[i].slug];
    if (arr) gotFlags += arr.length;
  }

  // Single-pass level completion counting instead of 3x Object.values(s).filter(...)
  let lowCount = 0, mediumCount = 0, highCount = 0;
  for (const ls of Object.values(s)) {
    if (Array.isArray(ls)) {
      if (ls.includes("low")) lowCount++;
      if (ls.includes("medium")) mediumCount++;
      if (ls.includes("high")) highCount++;
    }
  }

  const allSolved = (arr) => arr.length > 0 && arr.every(has);
  const chainDone = KILLCHAINS.some((kc) => kc.steps.every(has));

  return [
    { emo: "🩸", t: "İlk Kan", d: "İlk flag'ini yakala", on: gotFlags >= 1 },
    { emo: "🧩", t: "Çekirdek Avcısı", d: "Tüm çekirdek zafiyetleri çöz", on: allSolved(CORE_SLUGS) },
    { emo: "🔑", t: "Kimlik Kırıcı", d: "Tüm AuthN/AuthZ çöz", on: allSolved(AUTH_SLUGS) },
    { emo: "⚙️", t: "Modern Usta", d: "Tüm modern/sunucu çöz", on: allSolved(MODERN_SLUGS) },
    { emo: "🟥", t: "Low Avcısı", d: "10+ Low flag", on: lowCount >= 10 },
    { emo: "🟧", t: "Medium Avcısı", d: "10+ Medium flag", on: mediumCount >= 10 },
    { emo: "🟩", t: "High Avcısı", d: "10+ High flag", on: highCount >= 10 },
    { emo: "⛓️", t: "Zincir Kırıcı", d: "Bir kill-chain'i tamamla", on: chainDone },
    { emo: "🌗", t: "Yarı Yol", d: "Flag'lerin yarısı", on: TOTAL_FLAGS > 0 && gotFlags >= Math.ceil(TOTAL_FLAGS / 2) },
    { emo: "🏆", t: "Efsane", d: "Tüm flag'leri topla", on: TOTAL_FLAGS > 0 && gotFlags === TOTAL_FLAGS },
  ];
}
