// Ders çevirileri. Bir dersin İngilizcesi aynı klasörde "<dosya>.en.md" olarak durur (ör.
// 01-neden-onemli.md → 01-neden-onemli.en.md); eski yöntem olan ön bilgideki `ingilizce:` yolu da
// desteklenir. Çeviri dosyası aynı `id`yi taşır; başlık, hedefler, gövde ve isteğe bağlı olarak
// etkinlikler, quiz soruları (`sorular`) ve görevler (`gorevler`) çevrilebilir. Çevrilen yapılar
// özgünüyle aynı biçimi (kimlikler, doğru cevaplar, seçenek sayıları) korumak zorundadır; puanlama
// her zaman özgün içerikle yapılır. `inceleme` bloğu yoksa çeviri "henüz incelenmedi" sayılır.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { z } from "zod";
import { activitiesSchema, translationCompatible, type Activity } from "@/lib/academy-activities";
import { missionSchema, type Mission } from "./missions";

export type TranslatedQuestion =
  | { kind: "choice"; text: string; options: string[]; answer: number; explanation: string }
  | { kind: "truefalse"; text: string; answer: boolean; explanation: string };

export type TranslationContent = {
  title: string;
  goals: string[];
  body: string;
  activities: Activity[];
  quiz: TranslatedQuestion[] | null;
  missions: Mission[] | null;
  reviewed: boolean;
  contentHash: string;
};

// LessonTranslation.activities sütununda saklanan biçim. Eski kayıtlar yalnız etkinlik dizisidir.
// review: çeviri incelemesinin son kararı (bkz. server/teaching/translations.ts). Dosyadaki `inceleme`
// bloğu import anında okunur; öğretmen kararı veritabanında tutulur ve içerik değişmedikçe import onu korur.
export type TranslationReview = {
  stage: "TECH" | "LANGUAGE";
  decision: "APPROVED" | "CHANGES";
  by: string;
  byName: string;
  at: string;
  note: string;
};
export type StoredTranslation = { activities: Activity[]; quiz: TranslatedQuestion[] | null; missions: Mission[] | null; reviewed: boolean; review: TranslationReview | null };
export function readStoredTranslation(json: unknown): StoredTranslation {
  if (Array.isArray(json) || json == null) return { activities: (json as Activity[] | null) ?? [], quiz: null, missions: null, reviewed: true, review: null };
  const o = json as Partial<StoredTranslation>;
  return { activities: o.activities ?? [], quiz: o.quiz ?? null, missions: o.missions ?? null, reviewed: o.reviewed ?? false, review: o.review ?? null };
}

const questionSchema = z.union([
  z.object({ soru: z.string().min(1), tur: z.literal("coktan"), secenekler: z.array(z.coerce.string()).min(2).max(6), dogru: z.number().int().min(0), aciklama: z.string().min(1) }),
  z.object({ soru: z.string().min(1), tur: z.literal("dogru-yanlis"), dogru: z.boolean(), aciklama: z.string().min(1) }),
]);
const metadata = z.object({
  id: z.string(),
  baslik: z.coerce.string().min(1),
  hedefler: z.array(z.coerce.string()).default([]),
  etkinlikler: activitiesSchema.default([]),
  sorular: z.array(questionSchema).optional(),
  gorevler: z.array(missionSchema).max(3).optional(),
  inceleme: z.object({ teknik: z.string().trim().min(2), dil: z.string().trim().min(2), tarih: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), onayli: z.literal(true) }).optional(),
});

// Metinler dışındaki yapı: kimlik ve sayılar korunur, metinler boşaltılır. Çeviri ile özgün aynı
// iskelete sahip olmalı (aynı doğru cevap, aynı seçenek/adım sayısı, aynı kimlikler).
const KEEP = new Set(["id", "tur", "kind", "sahne"]);
function skeleton(v: unknown, key = ""): unknown {
  if (Array.isArray(v)) return v.map((x) => skeleton(x));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)).map(([k, x]) => [k, skeleton(x, k)]));
  if (typeof v === "string") return KEEP.has(key) ? v : "";
  return v;
}
export const sameShape = (a: unknown, b: unknown) => JSON.stringify(skeleton(a)) === JSON.stringify(skeleton(b));

export const siblingTranslation = (file: string) => file.replace(/\.md$/, ".en.md");
export const isTranslationFile = (name: string) => name.endsWith(".en.md");

export function resolveTranslationFile(root: string, lessonFile: string, pointer: string | undefined): string | null {
  if (pointer) {
    const file = path.resolve(root, pointer);
    if (!file.startsWith(path.resolve(root) + path.sep) || path.extname(file) !== ".md") throw new Error("Çeviri dosyası içerik klasöründe bir Markdown dosyası olmalı.");
    return file;
  }
  const sibling = siblingTranslation(lessonFile);
  return fs.existsSync(sibling) ? sibling : null;
}

export function loadTranslation(file: string, original: { slug: string; activities: Activity[]; quiz: unknown[] | undefined; missions: unknown[] | undefined }): Omit<TranslationContent, "body"> & { rawBody: string } {
  const raw = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("Çeviri ön bilgisi eksik.");
  const data = metadata.parse(YAML.parse(match[1]!));
  if (data.id !== original.slug) throw new Error("Çeviri ve ders kimliği aynı olmalı.");
  if (data.etkinlikler.length && !translationCompatible(original.activities, data.etkinlikler)) throw new Error("Çeviri etkinlikleri aynı kimlik, tür ve seçenek yapısını korumalı.");
  if (data.sorular && !sameShape(original.quiz ?? [], data.sorular)) throw new Error("Çeviri soruları özgünle aynı sayıda, aynı türde ve aynı doğru cevaplı olmalı.");
  if (data.gorevler && !sameShape(original.missions ?? [], data.gorevler)) throw new Error("Çeviri görevleri özgünle aynı yapıyı (kimlikler, adımlar, doğru cevaplar) korumalı.");
  const quiz = data.sorular?.map((q): TranslatedQuestion =>
    q.tur === "coktan" ? { kind: "choice", text: q.soru, options: q.secenekler, answer: q.dogru, explanation: q.aciklama } : { kind: "truefalse", text: q.soru, answer: q.dogru, explanation: q.aciklama },
  ) ?? null;
  return {
    title: data.baslik,
    goals: data.hedefler,
    rawBody: match[2]!.trim(),
    // Etkinlik çevrilmemişse özgünü kullanılır (çözümler özgün içerik özetine bağlıdır).
    activities: data.etkinlikler.length ? data.etkinlikler : original.activities,
    quiz,
    missions: data.gorevler ?? null,
    reviewed: !!data.inceleme,
    contentHash: crypto.createHash("sha256").update(raw).digest("hex"),
  };
}
