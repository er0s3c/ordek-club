import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { describe, expect, it } from "vitest";
import { comicFileSchema, comicIds, layoutComicPanel, type ComicBubble, type ComicSfx } from "@/lib/comic";
import { loadAcademy } from "@/server/academy/content";

const DIR = path.resolve(__dirname, "../../content/academy");

describe("Gölge Ağ çizgi romanı", () => {
  const file = comicFileSchema.parse(YAML.parse(fs.readFileSync(path.join(DIR, "cizgi-roman.yaml"), "utf8")));

  it("ayraç blok alıntı içinde de bulunur", () => {
    expect(comicIds("metin\n::cizgi[onsoz]\n> 🔒 x\n>\n> ::cizgi[nuri-kapanis]\n::cizgi[onsoz]")).toEqual(["onsoz", "nuri-kapanis"]);
    expect(comicIds("::cizgi[Yanlış Kimlik]")).toEqual([]);
  });

  it("derslerde geçen her şerit tanımlı ve her bölümün açılış/kapanış şeridi var", () => {
    const { tracks } = loadAcademy(DIR);
    const used = new Set(tracks.flatMap((t) => t.lessons.flatMap((l) => comicIds(l.body))));
    for (const id of used) expect(file.seritler[id], id).toBeDefined();
    for (const t of tracks.filter((x) => x.villain)) {
      expect(used.has(`${t.villain!.id}-acilis`), `${t.key} açılış`).toBe(true);
      expect(used.has(`${t.villain!.id}-kapanis`), `${t.key} kapanış`).toBe(true);
    }
  });

  it("panel görsel kimlikleri tekil ve her panelde metin var", () => {
    const ids = Object.values(file.seritler).flatMap((s) => s.paneller.map((p) => p.gorsel));
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of Object.values(file.seritler)) for (const p of s.paneller) expect(!!p.anlatici || p.balonlar.length > 0).toBe(true);
  });

  it("bölüm açılış/kapanış şeritleri bir merak kancasıyla biter", () => {
    for (const [id, s] of Object.entries(file.seritler).filter(([k]) => /-(acilis|kapanis)$/.test(k))) expect(s.devam, id).toBeTruthy();
  });
});

describe("Çizgi roman panel yerleşimi", () => {
  const file = comicFileSchema.parse(YAML.parse(fs.readFileSync(path.join(DIR, "cizgi-roman.yaml"), "utf8")));
  const bubble = (spot: ComicBubble["spot"], text = "Kısa bir replik."): ComicBubble => ({ who: "Tevfik", text, kind: "konusma", spot });
  const sfx = (spot: ComicSfx["spot"]): ComicSfx => ({ text: "BEEP!", spot });
  const spotsOf = (panel: Parameters<typeof layoutComicPanel>[0]) => {
    const out = layoutComicPanel(panel);
    return [...out.bubbles.map((b) => b.spot), ...(out.sfx ? [out.sfx.spot] : [])];
  };

  it("aynı köşeye atanmış iki balonu ayrı köşelere dağıtır", () => {
    expect(new Set(spotsOf({ caption: null, bubbles: [bubble("sag-ust"), bubble("sag-ust")], sfx: null })).size).toBe(2);
  });

  it("balonla aynı köşedeki ses efektini boş bir köşeye taşır", () => {
    const spots = spotsOf({ caption: null, bubbles: [bubble("sag-ust")], sfx: sfx("sag-ust") });
    expect(new Set(spots).size).toBe(2);
    expect(spots[1]).not.toBe("sag-ust");
  });

  it("anlatıcı kutusu ve balon köşeleri çakışmaz: köşe sayısı metin sayısını karşılar", () => {
    for (const s of Object.values(file.seritler)) {
      for (const p of s.paneller) {
        const panel = {
          caption: p.anlatici ?? null,
          bubbles: p.balonlar.map((b) => bubble(b.yer, b.metin)),
          sfx: p.ses ? sfx(p.ses.yer) : null,
        };
        const spots = spotsOf(panel);
        expect(new Set(spots).size, `${p.gorsel}: ${spots.join(",")}`).toBe(spots.length);
        // Dört köşe var; caption ayrı bantta olduğu için en fazla iki balon + bir ses efekti sığar.
        expect(spots.length).toBeLessThanOrEqual(3);
      }
    }
  });
});
