import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fromAcceptLanguage, resolveLocale } from "@/i18n/locale";
import { makeT, translateMessage } from "@/i18n/translate";
import { EN } from "@/i18n/en-strings";
import { loadAcademy } from "@/server/academy/content";

describe("Akademi İngilizce kapsamı", () => {
  const DIR = path.resolve(__dirname, "../../content/academy");

  it("her ders sayfası, quiz/görev metni, karakter ve bölüm İngilizce karşılığını taşır", () => {
    const out = execFileSync(process.execPath, [path.resolve(__dirname, "../../scripts/i18n-coverage.mjs"), "--json"], { encoding: "utf8" });
    const r = JSON.parse(out);
    expect(r.lessons.missing, "çevrilmemiş ders sayfası").toEqual([]);
    expect(r.quizzes.missing).toEqual([]);
    expect(r.missions.missing).toEqual([]);
    expect(r.comics.missing, "çevrilmemiş çizgi roman şeridi").toEqual([]);
    expect(r.comics.panelsTranslated).toBe(r.comics.panels);
    expect(r.characters.missing).toEqual([]);
    expect(r.story.missing).toEqual([]);
    expect(r.catalog.missing, "sözlükte karşılığı olmayan lab/rehber metni").toEqual([]);
  });

  it("çeviri dosyası kimliği Türkçe dersle aynıdır", () => {
    const { tracks } = loadAcademy(DIR);
    const pages = tracks.flatMap((t) => t.lessons);
    expect(pages.length).toBeGreaterThan(170);
    for (const l of pages) expect(l.english?.title, l.slug).toBeTruthy();
  });
});

describe("dil seçimi", () => {
  it("Türkçe tarayıcı Türkçe, diğer her dil İngilizce açar", () => {
    expect(fromAcceptLanguage("tr-TR,tr;q=0.9,en;q=0.8")).toBe("tr");
    expect(fromAcceptLanguage("tr")).toBe("tr");
    expect(fromAcceptLanguage("de-DE,de;q=0.9")).toBe("en");
    expect(fromAcceptLanguage("en-US")).toBe("en");
    expect(fromAcceptLanguage("en;q=0.5,tr;q=0.9")).toBe("tr");
    expect(fromAcceptLanguage("*")).toBeNull();
    expect(fromAcceptLanguage("")).toBeNull();
    expect(fromAcceptLanguage(null)).toBeNull();
  });

  it("öncelik: kayıtlı tercih → çerez → tarayıcı → kulüp varsayılanı", () => {
    expect(resolveLocale({ pref: "en", cookie: "tr", acceptLanguage: "tr-TR" })).toBe("en");
    expect(resolveLocale({ pref: "auto", cookie: "en", acceptLanguage: "tr-TR" })).toBe("en");
    expect(resolveLocale({ pref: "auto", acceptLanguage: "fr-FR" })).toBe("en");
    expect(resolveLocale({ pref: null, acceptLanguage: "tr-CY" })).toBe("tr");
    expect(resolveLocale({ fallback: "en" })).toBe("en");
    expect(resolveLocale({})).toBe("tr");
  });
});

describe("çeviri", () => {
  it("anahtar Türkçe metindir; eksik çeviri Türkçe kalır, yer tutucular doldurulur", () => {
    const t = makeT({ Kaydet: "Save", "{n} görev": "{n} tasks" });
    expect(t("Kaydet")).toBe("Save");
    expect(t("{n} görev", { n: 3 })).toBe("3 tasks");
    expect(t("Çevrilmemiş")).toBe("Çevrilmemiş");
    expect(t.intl).toBe("en-GB");
    expect(makeT(null)("{n} görev", { n: 2 })).toBe("2 görev");
  });

  it("sunucu mesajlarında kalıp eşleşmesi ve sabit parçaların çevirisi", () => {
    const dict = { "Ek süre {v0}: {title}": "Extension {v0}: {title}", onaylandı: "approved" };
    expect(translateMessage(dict, "Ek süre onaylandı: Ağ raporu")).toBe("Extension approved: Ağ raporu");
    expect(translateMessage(dict, "Bilinmeyen")).toBe("Bilinmeyen");
  });

  it("İngilizce sözlük yer tutucuları korur", () => {
    // CTF bayrak biçimleri (ordek{...}) yer tutucu değil, metnin parçasıdır.
    const names = (s: string) => [...s.replace(/ordek\{[^}]*\}/g, "").matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
    const broken = Object.entries(EN).filter(([tr, en]) => names(en) !== names(tr)).map(([tr]) => tr);
    expect(broken).toEqual([]);
  });

  it("kaynaktaki her t() metninin İngilizcesi var", () => {
    const root = path.resolve(__dirname, "../..");
    expect(() => execFileSync(process.execPath, [path.join(root, "scripts/i18n.mjs"), "check"], { cwd: root, stdio: "pipe" })).not.toThrow();
  });

  it("bildirim başlığı/gövdesi kalıplarının İngilizcesi var", () => {
    // notify(...) çağrıları veritabanına Türkçe yazar, okunurken çevrilir. Kapsanmayan bir kalıp
    // İngilizce modda Türkçe bildirim gösterir; bu test yeni eklenen kalıpları yakalar.
    // Kullanıcı içeriği (duyuru başlığı, teslim adı) çevrilmez: yalnız sabit metinler denetlenir.
    const root = path.resolve(__dirname, "../..");
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith(".ts")) files.push(p);
      }
    };
    walk(path.join(root, "src/server"));
    const literal = /(?:title|body):\s*(`[^`]*`|"(?:[^"\\]|\\.)*")/g;
    const missing: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, "utf8");
      if (!src.includes("notify(")) continue;
      for (const m of src.matchAll(literal)) {
        const raw = m[1]!;
        const text = raw.startsWith("`") ? raw.slice(1, -1).replace(/\$\{[^}]*\}/g, "{v0}") : JSON.parse(raw);
        if (!/[ğĞışŞ]/.test(text)) continue;
        if (!(text in EN)) missing.push(text);
      }
    }
    expect([...new Set(missing)]).toEqual([]);
  });
});
