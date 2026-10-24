// Mini görevler (docs/design-council/07 Adım 3, 05 §6): ders front-matter'ındaki `gorevler:` tanımı, istemciye giden
// süzülmüş biçim ve saf puanlama. DB'ye dokunmaz; içerik yükleyici, servis ve testler ortak kullanır.
//
// Güvenlik kapsamı (interactive-mission): sahne tamamen kurgudur. Adresler yalnızca RFC 2606 alan adlarıdır
// (.example / .invalid), hiçbir metin gerçek bir URL içermez; istemci tarafında bağlantı ya da parola alanı çizilmez.
import { z } from "zod";

const FAKE_DOMAIN = /^([^\s@]+@)?[a-z0-9.-]+\.(example|invalid)(\/\S*)?$/i;
const NO_URL = (s: string) => !/https?:\/\/|www\./i.test(s);
const text = (max: number) => z.coerce.string().min(1).max(max).refine(NO_URL, "metinde gerçek bağlantı olamaz");
const fakeAddress = z.string().regex(FAKE_DOMAIN, "adres .example veya .invalid alan adı olmalı");
const hints = z.array(text(300)).max(2).default([]);

// Karar: tek doğru seçenek. `ipucu` seçilince ilk ipucu kendiliğinden açılır ("Emin değilim" + net kart);
// `sahne: giris` seçilince simülasyon giriş ekranı gösterilir (input içermez).
const chooseStep = z.object({
  tur: z.literal("sec"),
  baslik: text(80),
  soru: text(300),
  panel: z.boolean().default(false), // önce "Gönderene dokun" panelinin açılması gerekir
  secenekler: z
    .array(z.object({ metin: text(120), dogru: z.boolean().default(false), geri: text(400), ipucu: z.boolean().default(false), sahne: z.enum(["giris"]).optional() }))
    .min(2)
    .max(5),
  ipuclari: hints,
  cozum: text(800),
});

// Kanıt: en az `en_az` çekirdek kanıt seçilince doğru. Destek/yem seçmek tek başına geçirmez ama çekirdekle birlikte
// kartı bozmaz (05 §6.3 Sayfa 3); yem için kısa not eklenir. `tek: true` → tek seçim ("En güçlü kanıtı seç").
const evidenceStep = z.object({
  tur: z.literal("kanit"),
  baslik: text(80),
  soru: text(300),
  tek: z.boolean().default(false),
  en_az: z.number().int().min(1).max(5).default(1),
  secenekler: z.array(z.object({ metin: text(120), cekirdek: z.boolean().default(false), geri: text(400).optional() })).min(3).max(8),
  dogru_geri: text(400),
  eksik: text(400),
  ipuclari: hints,
  cozum: text(800),
});

export const missionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  baslik: text(120),
  kanca: z.object({ saat: text(10), metin: text(300) }),
  posta: z.object({
    gonderen: text(80),
    adres: fakeAddress,
    saat: text(20),
    konu: text(160),
    govde: text(2000),
    dugme: text(60).optional(),
    hedef: fakeAddress.optional(),
    resmi: fakeAddress, // okulun yer imindeki (kurgu) adresi: karşılaştırma panelinde gösterilir
  }),
  adimlar: z.array(z.discriminatedUnion("tur", [chooseStep, evidenceStep])).min(1).max(3),
  kapanis: z.object({ ifsa: text(400), kurallar: z.array(text(160)).min(1).max(3), sonraki: text(300).optional() }),
});

export type Mission = z.infer<typeof missionSchema>;
type Step = Mission["adimlar"][number];

// Ders başına karar anı tavanı (03 P0 #3; ana ajan kararı: 3 — 07 §10).
export const MAX_DECISIONS = 3;

// Tanımın kendi içinde tutarlılığı (zod'un ifade edemediği kurallar). Boş dizi = sorun yok.
export function missionProblems(m: Mission): string[] {
  const out: string[] = [];
  if (m.adimlar.length > MAX_DECISIONS) out.push(`${m.id}: en fazla ${MAX_DECISIONS} karar adımı olabilir`);
  m.adimlar.forEach((s, i) => {
    const at = `${m.id}: adım ${i + 1}`;
    if (s.tur === "sec" && s.secenekler.filter((o) => o.dogru).length !== 1) out.push(`${at} tam bir doğru seçenek içermeli`);
    if (s.tur === "kanit") {
      const core = s.secenekler.filter((o) => o.cekirdek).length;
      if (core < s.en_az) out.push(`${at} en_az (${s.en_az}) kadar çekirdek kanıt içermeli`);
      if (core === s.secenekler.length) out.push(`${at} en az bir çeldirici içermeli`);
      if (s.tek && s.en_az !== 1) out.push(`${at} tek seçimde en_az 1 olmalı`);
      if (s.tek && s.secenekler.some((o) => !o.cekirdek && !o.geri)) out.push(`${at} tek seçimde her çeldiricinin "neden yanlış" (geri) metni olmalı`);
    }
  });
  return out;
}

// ── İstemciye giden biçim: doğru bayrağı, geri bildirim ve çözüm YOK ─────────────
export type PublicStep =
  | { kind: "choose"; title: string; prompt: string; panel: boolean; options: string[]; hints: string[] }
  | { kind: "evidence"; title: string; prompt: string; single: boolean; min: number; options: string[]; hints: string[] };

export type PublicMission = {
  id: string;
  title: string;
  hook: { time: string; text: string };
  mail: { from: string; address: string; time: string; subject: string; body: string; button: string | null; target: string | null; official: string };
  steps: PublicStep[];
};

export type MissionClosing = { reveal: string; rules: string[]; next: string | null };

export function publicMission(m: Mission): PublicMission {
  return {
    id: m.id,
    title: m.baslik,
    hook: { time: m.kanca.saat, text: m.kanca.metin },
    mail: { from: m.posta.gonderen, address: m.posta.adres, time: m.posta.saat, subject: m.posta.konu, body: m.posta.govde, button: m.posta.dugme ?? null, target: m.posta.hedef ?? null, official: m.posta.resmi },
    steps: m.adimlar.map((s): PublicStep =>
      s.tur === "sec"
        ? { kind: "choose", title: s.baslik, prompt: s.soru, panel: s.panel, options: s.secenekler.map((o) => o.metin), hints: s.ipuclari }
        : { kind: "evidence", title: s.baslik, prompt: s.soru, single: s.tek, min: s.en_az, options: s.secenekler.map((o) => o.metin), hints: s.ipuclari },
    ),
  };
}

// Görev çözülünce gösterilen kapanış (çözülmeden istemciye gitmez: ifşa hikâyenin ödülüdür).
export function missionClosing(m: Mission): MissionClosing {
  return { reveal: m.kapanis.ifsa, rules: m.kapanis.kurallar, next: m.kapanis.sonraki ?? null };
}

// ── Puanlama ─────────────────────────────────────────────────────────────────
export type StepAnswer = number | number[] | null;

export const stepAnswerSchema = z.union([z.number().int().min(0).max(10), z.array(z.number().int().min(0).max(10)).max(10), z.null()]);

export type StepResult = { correct: boolean; feedback: string; hint: boolean; scene: "giris" | null };

export function gradeStep(step: Step, answer: StepAnswer): StepResult {
  const none = { hint: false, scene: null };
  if (step.tur === "sec") {
    const o = typeof answer === "number" ? step.secenekler[answer] : undefined;
    if (!o) return { correct: false, feedback: "Önce bir tahmin seç. Yanlış olsa da olur.", ...none };
    return { correct: o.dogru, feedback: o.geri, hint: !o.dogru && o.ipucu, scene: (!o.dogru && o.sahne) || null };
  }
  const raw = Array.isArray(answer) ? answer : typeof answer === "number" ? [answer] : [];
  const picked = [...new Set(raw)];
  if (!picked.length) return { correct: false, feedback: "Önce bir kanıt seç. Yanlış olsa da olur.", ...none };
  if (step.tek && picked.length > 1) return { correct: false, feedback: "Bir tane seç.", ...none };
  const opts = picked.map((i) => step.secenekler[i]);
  if (opts.some((o) => !o)) return { correct: false, feedback: "Geçersiz seçim.", ...none };
  const core = opts.filter((o) => o!.cekirdek).length;
  if (core < step.en_az) {
    // tek seçimde seçilen çeldiricinin "neden yanlış" metni; çoklu seçimde genel eksik açıklaması
    const why = step.tek ? opts[0]!.geri : undefined;
    return { correct: false, feedback: why ?? step.eksik, ...none };
  }
  const notes = opts.filter((o) => !o!.cekirdek && o!.geri).map((o) => o!.geri!);
  return { correct: true, feedback: [step.dogru_geri, ...notes].join(" "), ...none };
}

// Bütün görev: her karar adımı doğru mu? (sunucu "tamamla" isteğinde istemciye güvenmeden yeniden puanlar)
export function gradeMission(m: Mission, answers: StepAnswer[]): boolean {
  return m.adimlar.length === answers.length && m.adimlar.every((s, i) => gradeStep(s, answers[i] ?? null).correct);
}

export function solutionOf(step: Step): string {
  return step.cozum;
}
