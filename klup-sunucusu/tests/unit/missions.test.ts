import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadAcademy } from "@/server/academy/content";
import { gradeMission, gradeStep, missionProblems, missionSchema, publicMission, type Mission } from "@/server/academy/missions";
import { deckSchema } from "@/lib/deck-schema";

// docs/design-council/07 §7.1 (U1–U3, U6) — saf görev şeması ve puanlama.
const raw = {
  id: "deneme",
  baslik: "Deneme görevi",
  kanca: { saat: "23:47", metin: "Bir mesaj geldi." },
  posta: { gonderen: "Burs Ofisi", adres: "burs@sahte-okul.example", saat: "23:47", konu: "Onay", govde: "Giriş yap.", dugme: "Doğrula", hedef: "giris.sahte-okul.example", resmi: "okul.edu.example" },
  adimlar: [
    {
      tur: "sec",
      baslik: "Ne yapsın?",
      soru: "İlk hamle?",
      secenekler: [
        { metin: "Bağlantıya dokun", sahne: "giris", geri: "Simülasyon." },
        { metin: "Göndereni incele", dogru: true, geri: "Sen yakaladın." },
        { metin: "Emin değilim", ipucu: true, geri: "Dürüst cevap." },
      ],
      ipuclari: ["Adrese bak.", "Harf harf."],
      cozum: "Birlikte bakalım: adres.",
    },
    {
      tur: "kanit",
      baslik: "Kanıt",
      soru: "Seni ne ikna etti?",
      en_az: 1,
      secenekler: [
        { metin: "Adres farklı", cekirdek: true },
        { metin: "Acele ettiriyor", geri: "Acele de bir işaret." },
        { metin: "Merhaba diyor", geri: "Selam kanıt değil." },
      ],
      dogru_geri: "Adres en güçlü kanıt.",
      eksik: "Bu tek başına kanıt değil.",
      cozum: "Birlikte bakalım.",
    },
  ],
  kapanis: { ifsa: "Tevfik.", kurallar: ["Bir", "İki", "Üç"], sonraki: "00:12 yeni mesaj." },
};
const m = missionSchema.parse(raw) as Mission;

describe("görev şeması (U1)", () => {
  it("geçerli tanımı kabul eder, tutarlılık sorunu yoktur", () => {
    expect(missionProblems(m)).toEqual([]);
  });

  it("gerçek alan adı, gerçek bağlantı ve bilinmeyen adım tipi reddedilir", () => {
    expect(missionSchema.safeParse({ ...raw, posta: { ...raw.posta, adres: "burs@gercek-okul.edu.tr" } }).success).toBe(false);
    expect(missionSchema.safeParse({ ...raw, kanca: { saat: "1", metin: "bak https://ornek.com" } }).success).toBe(false);
    expect(missionSchema.safeParse({ ...raw, adimlar: [{ ...raw.adimlar[0], tur: "classify" }] }).success).toBe(false);
  });

  it("tek doğru seçenek, çeldirici ve karar tavanı denetlenir", () => {
    const twoRight = missionSchema.parse({ ...raw, adimlar: [{ ...raw.adimlar[0], secenekler: raw.adimlar[0]!.secenekler!.map((o) => ({ ...o, dogru: true })) }] });
    expect(missionProblems(twoRight).join()).toMatch(/tam bir doğru/);
    expect(missionSchema.safeParse({ ...raw, adimlar: [raw.adimlar[0], raw.adimlar[0], raw.adimlar[0], raw.adimlar[0]] }).success).toBe(false);
  });
});

describe("istemciye giden görev (U2)", () => {
  it("doğru bayrağı, geri bildirim, çekirdek işareti, çözüm ve kapanış içermez", () => {
    const json = JSON.stringify(publicMission(m));
    for (const secret of ['"dogru"', '"geri"', '"cekirdek"', '"cozum"', "Sen yakaladın", "Birlikte bakalım", "Tevfik", "dogru_geri"]) expect(json).not.toContain(secret);
    expect(json).toContain("Göndereni incele");
  });
});

describe("puanlama (U3)", () => {
  it("karar: doğru/yanlış, ipucu ve simülasyon sahnesi işaretleri", () => {
    expect(gradeStep(m.adimlar[0]!, 1)).toMatchObject({ correct: true, feedback: "Sen yakaladın.", hint: false, scene: null });
    expect(gradeStep(m.adimlar[0]!, 0)).toMatchObject({ correct: false, scene: "giris" });
    expect(gradeStep(m.adimlar[0]!, 2)).toMatchObject({ correct: false, hint: true });
    expect(gradeStep(m.adimlar[0]!, null).correct).toBe(false);
    expect(gradeStep(m.adimlar[0]!, 9).correct).toBe(false);
  });

  it("kanıt: çekirdek şart; yem tek başına geçmez, çekirdekle birlikte geçer ve not eklenir", () => {
    const ev = m.adimlar[1]!;
    expect(gradeStep(ev, [2])).toMatchObject({ correct: false, feedback: "Bu tek başına kanıt değil." });
    expect(gradeStep(ev, [1])).toMatchObject({ correct: false });
    const both = gradeStep(ev, [0, 2]);
    expect(both.correct).toBe(true);
    expect(both.feedback).toContain("Selam kanıt değil.");
    expect(gradeStep(ev, [0, 7]).correct).toBe(false);
  });

  it("tek seçimli kanıtta seçilen çeldiricinin kendi açıklaması döner", () => {
    const single = missionSchema.parse({ ...raw, adimlar: [{ ...raw.adimlar[1], tek: true }] }).adimlar[0]!;
    expect(gradeStep(single, 2).feedback).toBe("Selam kanıt değil.");
    expect(gradeStep(single, [0, 1]).correct).toBe(false);
    expect(gradeStep(single, 0).correct).toBe(true);
  });

  it("bütün görev ancak her adım doğruysa çözülmüş sayılır", () => {
    expect(gradeMission(m, [1, [0]])).toBe(true);
    expect(gradeMission(m, [1, [2]])).toBe(false);
    expect(gradeMission(m, [1])).toBe(false);
  });
});

describe("gerçek içerik", () => {
  it("m01-05 görevi şemaya ve kurallara uyar; gövdede ::gorev ile yerleştirilmiş", () => {
    const { tracks, problems } = loadAcademy(path.resolve(__dirname, "../../content/academy"));
    expect(problems).toEqual([]);
    const l = tracks.flatMap((t) => t.lessons).find((x) => x.slug === "m01-05")!;
    expect(l.missions?.[0]?.id).toBe("sahte-burs");
    expect(l.missions![0]!.adimlar.length).toBeLessThanOrEqual(3);
    expect(l.body).toContain("::gorev[sahte-burs]");
    expect(JSON.stringify(l.missions)).not.toMatch(/https?:\/\/|www\./);
  });
});

describe("sunum şeması (U6)", () => {
  it("mission bloğu kabul edilir, eski desteler geçerli kalır", () => {
    expect(deckSchema.safeParse({ title: "Eski", slides: [{ title: "A", blocks: [{ type: "text", text: "x" }] }] }).success).toBe(true);
    const r = deckSchema.safeParse({ title: "Görevli", slides: [{ title: "Görev", blocks: [{ type: "mission", lesson: "m01-05", mission: "sahte-burs" }] }] });
    expect(r.success).toBe(true);
    expect(deckSchema.safeParse({ title: "Kötü", slides: [{ title: "G", blocks: [{ type: "mission", lesson: "../x", mission: "a" }] }] }).success).toBe(false);
  });
});
