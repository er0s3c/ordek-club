import { describe, expect, it } from "vitest";
import { readStoredTranslation } from "@/server/academy/translation";

// Çeviri inceleme kararı LessonTranslation.activities JSON'unda yaşar; eski kayıtlarla geriye dönük uyum
// korunmalı (yalnız etkinlik dizisi olan kayıtlar "incelenmiş" sayılır, kararı yoktur).
describe("çeviri inceleme kaydı", () => {
  const base = { activities: [], quiz: null, missions: null };

  it("eski biçim (yalnız dizi) incelenmiş sayılır ve karar taşımaz", () => {
    const r = readStoredTranslation([]);
    expect(r.reviewed).toBe(true);
    expect(r.review).toBeNull();
  });

  it("yeni biçimde onay ve gerekçe okunur", () => {
    const review = { stage: "LANGUAGE" as const, decision: "APPROVED" as const, by: "u1", byName: "Deniz", at: "2026-10-27T00:00:00.000Z", note: "" };
    const r = readStoredTranslation({ ...base, reviewed: true, review });
    expect(r.reviewed).toBe(true);
    expect(r.review?.decision).toBe("APPROVED");
    expect(r.review?.byName).toBe("Deniz");
  });

  it("geri gönderme kararı çeviriyi onaysız bırakır", () => {
    const review = { stage: "TECH" as const, decision: "CHANGES" as const, by: "u1", byName: "Deniz", at: "2026-10-27T00:00:00.000Z", note: "Terim tutarsız" };
    const r = readStoredTranslation({ ...base, reviewed: false, review });
    expect(r.reviewed).toBe(false);
    expect(r.review?.note).toBe("Terim tutarsız");
  });

  it("karar alanı olmayan kayıt onaysız sayılır", () => {
    expect(readStoredTranslation({ ...base, reviewed: false }).reviewed).toBe(false);
  });
});
