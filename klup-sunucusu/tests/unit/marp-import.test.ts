import { describe, expect, it } from "vitest";
import { marpToSlides } from "@/lib/marp-import";
import { dynamicValue } from "@/server/ctf/data";

const MD = [
  "---",
  "marp: true",
  "theme: default",
  "---",
  "",
  "# Ağ güvenliğine giriş",
  "",
  "Kulüp atölyesi · 1. hafta",
  "",
  "---",
  "",
  "## TLS el sıkışması",
  "",
  "* İstemci merhaba",
  "* Sunucu merhaba",
  "",
  "```mermaid",
  "sequenceDiagram",
  "  A->>B: ClientHello",
  "```",
  "",
  "<!-- Burada sertifika zincirini sor. -->",
  "<!-- _class: lead -->",
  "",
  "---",
  "",
  "## Kod",
  "",
  "```python",
  "print('---')",
  "```",
  "",
  "> **Not:** parametreli sorgu kullan",
  "",
  "![logo](https://example.com/x.png)",
].join("\n");

describe("Marp içe aktarma", () => {
  const { slides } = marpToSlides(MD);
  it("ön bilgiyi atar ve kod içindeki --- ile bölmez", () => {
    expect(slides).toHaveLength(3);
    expect(slides[0]!.title).toBe("Ağ güvenliğine giriş");
    expect(slides[0]!.layout).toBe("title");
  });
  it("* listeyi adım adım açılan maddelere, mermaid'i diyagrama, yorumu notlara çevirir", () => {
    const s = slides[1]!;
    expect(s.blocks[0]).toMatchObject({ type: "bullets", reveal: true, items: ["İstemci merhaba", "Sunucu merhaba"] });
    expect(s.blocks[1]).toMatchObject({ type: "diagram", reveal: true });
    expect(s.notes).toBe("Burada sertifika zincirini sor.");
  });
  it("kod, alıntı ve görseli işler", () => {
    const s = slides[2]!;
    expect(s.blocks[0]).toMatchObject({ type: "code", language: "python", code: "print('---')" });
    expect(s.blocks[1]).toMatchObject({ type: "callout", text: "Not: parametreli sorgu kullan" });
    expect(s.notes).toContain("Görsel aktarılmadı");
  });
});

describe("CTF dinamik puan", () => {
  const c = { initial: 200, minimum: 80, decay: 15 };
  it("ilk çözümde tam değer, çözüm arttıkça düşer, en az minimumda kalır", () => {
    expect(dynamicValue(c, 0)).toBe(200);
    expect(dynamicValue(c, 1)).toBe(200);
    expect(dynamicValue(c, 8)).toBeLessThan(200);
    expect(dynamicValue(c, 8)).toBeGreaterThan(80);
    expect(dynamicValue(c, 100)).toBe(80);
  });
});
