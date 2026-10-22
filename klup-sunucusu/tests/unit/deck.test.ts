import { describe, expect, it } from "vitest";
import { ANIMATIONS, getAnimation } from "@/animations/registry";
import { animationStepCount } from "@/animations/types";
import { blockSteps, deckSchema, slideSteps } from "@/lib/deck-schema";
import { clientMessageSchema } from "@/lib/live-protocol";
import { TEMPLATES } from "@/templates";

describe("animasyon kayıt defteri", () => {
  it("15 benzersiz animasyon var", () => {
    expect(ANIMATIONS).toHaveLength(15);
    expect(new Set(ANIMATIONS.map((a) => a.id)).size).toBe(15);
  });

  it("istenen konuların hepsi kapsanıyor", () => {
    for (const id of ["http-request", "dns-resolution", "tcp-handshake", "tls-handshake", "authentication", "sql-injection", "xss", "phishing", "packet-journey", "firewall-decision", "vpn-tunnel", "mitm", "secure-vs-insecure", "network-topology", "soc-alert"]) {
      expect(getAnimation(id), id).toBeDefined();
    }
  });

  it("akış adımları yalnızca var olan aktörlere başvurur, aktörler tuval içinde", () => {
    for (const a of ANIMATIONS) {
      if (a.kind !== "flow") continue;
      const ids = new Set(a.actors.map((x) => x.id));
      expect(ids.size, a.id).toBe(a.actors.length);
      for (const s of a.steps) {
        expect(ids.has(s.from), `${a.id}: ${s.from}`).toBe(true);
        expect(ids.has(s.to), `${a.id}: ${s.to}`).toBe(true);
        for (const f of s.focus ?? []) expect(ids.has(f), `${a.id}: focus ${f}`).toBe(true);
        expect(s.note.length).toBeGreaterThan(10);
      }
      for (const [x, y] of a.links ?? []) expect(ids.has(x) && ids.has(y), `${a.id}: link ${x}-${y}`).toBe(true);
      for (const act of a.actors) {
        expect(act.x).toBeGreaterThanOrEqual(30);
        expect(act.x).toBeLessThanOrEqual(770);
        expect(act.y).toBeGreaterThanOrEqual(30);
        expect(act.y).toBeLessThanOrEqual(330);
      }
    }
  });

  it("kod animasyonlarının vurguları var olan panel ve satırlara işaret eder", () => {
    for (const a of ANIMATIONS) {
      if (a.kind !== "code") continue;
      for (const s of a.steps) {
        for (const h of s.highlight) {
          const panel = a.panels[h.panel];
          expect(panel, `${a.id}: panel ${h.panel}`).toBeDefined();
          for (const l of h.lines) expect(l).toBeLessThan(panel!.lines.length);
        }
        if (s.output) expect(a.panels[s.output.panel]).toBeDefined();
      }
    }
  });
});

describe("sunum şeması", () => {
  it("tüm hazır şablonlar şemadan geçer", () => {
    for (const [key, t] of Object.entries(TEMPLATES)) {
      const r = deckSchema.safeParse(t);
      expect(r.success, `${key}: ${r.success ? "" : JSON.stringify(r.error.issues[0])}`).toBe(true);
    }
  });

  it("bilinmeyen blok türü ve bilinmeyen animasyon reddedilir", () => {
    const base = { title: "Deneme", slides: [{ title: "S1", blocks: [] as unknown[] }] };
    expect(deckSchema.safeParse({ ...base, slides: [{ title: "S", blocks: [{ type: "html", html: "<script>alert(1)</script>" }] }] }).success).toBe(false);
    expect(deckSchema.safeParse({ ...base, slides: [{ title: "S", blocks: [{ type: "animation", animation: "../../etc/passwd" }] }] }).success).toBe(false);
    expect(deckSchema.safeParse({ ...base, slides: [{ title: "S", blocks: [{ type: "script", src: "https://evil" }] }] }).success).toBe(false);
  });

  it("HTML içeren metin yalnızca metin olarak saklanır; kontrol karakterleri temizlenir", () => {
    const d = deckSchema.parse({ title: "Deneme", slides: [{ title: "S‮1", blocks: [{ type: "text", text: "<img src=x onerror=alert(1)>\u0000" }] }] });
    const b = d.slides[0]!.blocks[0]!;
    expect(b.type === "text" && b.text).toBe("<img src=x onerror=alert(1)>");
    expect(d.slides[0]!.title).toBe("S1");
  });

  it("sınırlar uygulanır (slayt sayısı, blok sayısı, boyut)", () => {
    const slide = { title: "S", blocks: [] };
    expect(deckSchema.safeParse({ title: "X", slides: [] }).success).toBe(false);
    expect(deckSchema.safeParse({ title: "Deneme", slides: Array(201).fill(slide) }).success).toBe(false);
    expect(deckSchema.safeParse({ title: "Deneme", slides: [{ title: "S", blocks: Array(13).fill({ type: "text", text: "a" }) }] }).success).toBe(false);
    expect(deckSchema.safeParse({ title: "Deneme", slides: [{ title: "S", blocks: [{ type: "text", text: "a".repeat(2001) }] }] }).success).toBe(false);
  });

  it("adım sayısı blokların en büyüğüdür", () => {
    const anim = getAnimation("tcp-handshake")!;
    expect(blockSteps({ type: "bullets", items: ["a", "b", "c"], reveal: true })).toBe(3);
    expect(blockSteps({ type: "bullets", items: ["a", "b", "c"], reveal: false })).toBe(1);
    expect(blockSteps({ type: "code", language: "", code: "x", highlightSteps: [[1], [2]] })).toBe(3);
    expect(blockSteps({ type: "animation", animation: "tcp-handshake" })).toBe(animationStepCount(anim));
    expect(slideSteps([])).toBe(1);
    expect(slideSteps([{ type: "bullets", items: ["a", "b"], reveal: true }, { type: "animation", animation: "tcp-handshake" }])).toBe(animationStepCount(anim));
  });
});

describe("canlı protokol doğrulaması", () => {
  it("geçerli mesajları kabul eder", () => {
    expect(clientMessageSchema.safeParse({ t: "control", c: { action: "next" } }).success).toBe(true);
    expect(clientMessageSchema.safeParse({ t: "control", c: { action: "speed", value: 1.5 } }).success).toBe(true);
    expect(clientMessageSchema.safeParse({ t: "question", text: "  Neden SYN? " }).success).toBe(true);
  });
  it("bozuk/aşırı mesajları reddeder", () => {
    expect(clientMessageSchema.safeParse({ t: "control", c: { action: "deleteAll" } }).success).toBe(false);
    expect(clientMessageSchema.safeParse({ t: "control", c: { action: "speed", value: 100 } }).success).toBe(false);
    expect(clientMessageSchema.safeParse({ t: "control", c: { action: "goto", slide: -1 } }).success).toBe(false);
    expect(clientMessageSchema.safeParse({ t: "question", text: "x".repeat(501) }).success).toBe(false);
    expect(clientMessageSchema.safeParse({ t: "question", text: "   " }).success).toBe(false);
    expect(clientMessageSchema.safeParse({ t: "state", v: 999, state: {} }).success).toBe(false); // istemci durum dayatamaz
  });
});
