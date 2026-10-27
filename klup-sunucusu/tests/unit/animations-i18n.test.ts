import { describe, expect, it } from "vitest";
import { ANIMATIONS, getAnimation } from "@/animations/registry";

// Animasyon tanımları Türkçe yazılır; İngilizce katman yalnız görünen metni değiştirir. Bu testler
// çevirinin eksiksiz olduğunu ve sahne geometrisinin (aktör/adım sayısı) bozulmadığını doğrular.
describe("Animasyon İngilizce katmanı", () => {
  it("her animasyonun İngilizce başlığı ve özeti var", () => {
    for (const def of ANIMATIONS) {
      const en = getAnimation(def.id, "en")!;
      expect(en.title, def.id).toBeTruthy();
      expect(en.summary, def.id).toBeTruthy();
      expect(en.title, `${def.id}: başlık Türkçe kalmış`).not.toBe(def.title);
    }
  });

  it("aktör, adım, bölge ve panel sayıları korunur", () => {
    for (const def of ANIMATIONS) {
      const en = getAnimation(def.id, "en")!;
      if (def.kind === "code") {
        expect(en.kind).toBe("code");
        if (en.kind === "code") expect(en.panels).toHaveLength(def.panels.length);
        continue;
      }
      if (en.kind !== "flow") throw new Error(def.id);
      expect(en.actors, def.id).toHaveLength(def.actors.length);
      expect(en.steps, def.id).toHaveLength(def.steps.length);
      expect(en.zones?.length ?? 0, def.id).toBe(def.zones?.length ?? 0);
      for (const a of en.actors) expect(a.label, `${def.id}/${a.id}`).toBeTruthy();
      for (const s of en.steps) {
        expect(s.label, def.id).toBeTruthy();
        expect(s.note, def.id).toBeTruthy();
      }
    }
  });

  it("Türkçe istekte tanım olduğu gibi döner", () => {
    for (const def of ANIMATIONS) expect(getAnimation(def.id, "tr")).toBe(def);
  });
});
