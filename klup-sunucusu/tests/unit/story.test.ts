import { describe, expect, it } from "vitest";
import { chapterNeighbours, storyFor } from "@/server/academy/story";
import { comicFileSchema } from "@/lib/comic";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";

const DIR = path.resolve(__dirname, "../../content/academy");

// Gölge Ağ okuyucu, karakterler.yaml'daki bölüm sırasını ve cizgi-roman.yaml'daki açılış/kapanış
// şeritlerini birleştirir. Bu testler iki dosyanın ayrışmasını (eksik şerit, çevrilmemiş bölüm) yakalar.
describe("Gölge Ağ hikâyesi", () => {
  const chars = YAML.parse(fs.readFileSync(path.join(DIR, "karakterler.yaml"), "utf8"));
  const comics = comicFileSchema.parse(YAML.parse(fs.readFileSync(path.join(DIR, "cizgi-roman.yaml"), "utf8")));
  const chapters = Object.keys(chars.hikaye.bolumler);

  it("her bölümün açılış ve kapanış şeridi tanımlı", () => {
    expect(chapters.length).toBe(18);
    for (const key of chapters) {
      expect(comics.seritler[`${key}-acilis`], `${key}-acilis`).toBeDefined();
      expect(comics.seritler[`${key}-kapanis`], `${key}-kapanis`).toBeDefined();
    }
  });

  it("Türkçe okuma tüm bölümleri sırayla verir", () => {
    const story = storyFor("tr");
    expect(story?.chapters.map((c) => c.key)).toEqual(chapters);
    for (const c of story!.chapters) {
      expect(c.title).toBeTruthy();
      expect(c.intro).toBeTruthy();
      expect(c.closing).toBeTruthy();
      expect(c.strips).toHaveLength(2);
      expect(c.strips.every((s) => s.panels.length > 0)).toBe(true);
    }
  });

  it("İngilizce okuma her bölümde İngilizce metin ve İngilizce şerit verir", () => {
    const story = storyFor("en");
    expect(story?.title).toContain("Shadow Network");
    // Özel adlar (Rıza, Tarık…) Türkçe karakter taşır; yalnızca bunları hoş görüyoruz.
    const PROPER = /Rıza|Tarık|Ayşe|Bilişim Suçları Yasası|Kişisel Verilerin Korunması Yasası|Kuzey Kıyı|NovaKıbrıs|Nova Kıbrıs/g;
    const noProper = (s: string) => s.replace(PROPER, "");
    for (const c of story!.chapters) {
      expect(c.intro, c.key).toMatch(/[A-Za-z]/);
      expect(c.closing, c.key).toBeTruthy();
      expect(noProper(c.intro), `${c.key}: giriş`).not.toMatch(/[ğĞışŞ]/);
      expect(noProper(c.closing), `${c.key}: kapanış`).not.toMatch(/[ğĞışŞ]/);
      for (const s of c.strips) {
        expect(s.lang, `${c.key}/${s.id}`).toBe("en");
        for (const p of s.panels) {
          expect(noProper(p.caption ?? ""), `${s.id}: anlatıcı`).not.toMatch(/[ğĞışŞ]/);
          for (const b of p.bubbles) expect(noProper(b.text), `${s.id}: balon`).not.toMatch(/[ğĞışŞ]/);
        }
      }
    }
  });

  it("önceki/sonraki bölüm gezinmesi sınırlarda doğru", () => {
    expect(chapterNeighbours(chapters[0]!)).toMatchObject({ prev: null, next: chapters[1], index: 0, total: 18 });
    const last = chapterNeighbours(chapters.at(-1)!);
    expect(last.next).toBeNull();
    expect(last.prev).toBe(chapters.at(-2));
  });

  it("bilinmeyen bölüm boş sonuç verir", () => {
    expect(storyFor("tr", "yok-boyle-bolum")?.chapters).toEqual([]);
  });
});
