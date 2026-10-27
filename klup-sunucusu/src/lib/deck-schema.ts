// Sunum (deste) JSON biçimi — istemci ve sunucu ortak. İçerik her zaman düz metindir;
// HTML/Markdown yorumlanmaz, animasyonlar yalnızca kayıtlı kimlikle seçilir (çalıştırılabilir içerik yok).
import { z } from "zod";
import { ANIMATION_IDS, getAnimation } from "@/animations/registry";
import { animationStepCount } from "@/animations/types";
import { LOTTIE_IDS } from "@/animations/lottie";
import { SCENE_IDS } from "@/animations/scenes";

// Sıra diyagramındaki mesaj sayısı (adım adım açılım için): "A->>B", "A-->>B", "A->B" ve "A-xB" satırları.
export const diagramMessages = (source: string) => source.split("\n").filter((l) => /^\s*[\w"' -]+?\s*(-{1,2}>>|-{1,2}>|-{1,2}[x)])\s*[\w"' -]+\s*:/.test(l)).length;

export const DECK_SCHEMA_VERSION = 1;

const text = (max: number) =>
  z
    .string()
    .max(max, `En fazla ${max} karakter.`)
    .transform((s) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f‪-‮⁦-⁩]/g, ""));

export const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text: text(160), level: z.union([z.literal(1), z.literal(2)]).default(2) }),
  z.object({ type: z.literal("text"), text: text(2000) }),
  z.object({
    type: z.literal("bullets"),
    items: z.array(text(300)).min(1).max(12),
    // true → her adımda bir madde açılır
    reveal: z.boolean().default(false),
  }),
  z.object({
    type: z.literal("code"),
    language: z.string().max(20).regex(/^[a-z0-9+#-]*$/).default(""),
    code: text(4000),
    // adım başına vurgulanacak satırlar (1 tabanlı); boşsa vurgu yok
    highlightSteps: z.array(z.array(z.number().int().min(1).max(200)).max(50)).max(20).default([]),
    // Kodun sonraki hâlleri: adım k'da morphs[k-1] gösterilir; geçiş magic-move ile canlandırılır.
    morphs: z.array(text(4000)).max(10).default([]),
  }),
  z.object({
    type: z.literal("terminal"),
    lines: z
      .array(z.object({ cmd: text(300).optional(), out: text(1000).optional() }))
      .min(1)
      .max(20),
    // true → her adımda bir satır çalışır
    reveal: z.boolean().default(true),
    // true → komutlar harf harf yazılan gerçekçi terminal kaydı (asciinema-player); adım adım açılımla birlikte kullanılmaz
    cast: z.boolean().default(false),
  }),
  // Mermaid diyagramı (sıra/akış/durum). reveal → sıra diyagramında mesajlar adım adım görünür.
  z.object({ type: z.literal("diagram"), source: text(4000).pipe(z.string().min(3, "Diyagram metni gerekli.")), reveal: z.boolean().default(false) }),
  // Excalidraw çizimi: sahne JSON'u (yalnız çizim öğeleri; görsel dosya eklenmez).
  z.object({ type: z.literal("sketch"), scene: z.string().max(150_000, "Çizim çok büyük."), alt: text(200).pipe(z.string().min(1, "Çizim için kısa bir açıklama yaz.")) }),
  // Özgün Lottie animasyonu (kayıt defterinden kimlikle).
  z.object({ type: z.literal("lottie"), animation: z.enum(LOTTIE_IDS), caption: text(200).default("") }),
  // Motion Canvas anlatım sahnesi (kayıt defterinden kimlikle).
  z.object({ type: z.literal("scene"), scene: z.enum(SCENE_IDS) }),
  z.object({
    type: z.literal("callout"),
    tone: z.enum(["info", "warn", "success", "danger"]).default("info"),
    text: text(600),
  }),
  z.object({ type: z.literal("animation"), animation: z.enum(ANIMATION_IDS) }),
  // Görsel: yalnız kulübe yüklenmiş raster görsel (dosya kimliği); sunucu kaydederken dosyanın varlığını ve türünü doğrular.
  z.object({
    type: z.literal("image"),
    fileId: z.string().regex(/^c[a-z0-9]{20,30}$/, "Geçersiz görsel."),
    alt: text(200).pipe(z.string().min(1, "Görsel için kısa bir açıklama (alt metin) yaz.")),
    caption: text(300).default(""),
  }),
  // Mini görev köprüsü (docs/design-council/07 Adım 5): eğitmen görev slaytına geçer, öğrenci görevi KENDİ cihazında
  // akademide çözer; XP aynı uç noktadan gelir. Canlı hub/protokol görev için değişmez. Sunucu kaydederken ders ve
  // görevin varlığını doğrular (görsel bloğu gibi).
  z.object({
    type: z.literal("mission"),
    lesson: z.string().regex(/^[a-z0-9-]{1,40}$/, "Geçersiz ders."),
    mission: z.string().regex(/^[a-z0-9-]{1,40}$/, "Geçersiz görev."),
    title: text(160).default(""),
  }),
  // VMware uygulama molası: öğrenci talimatları + teslim; `host` alanı yalnız eğitmene gider.
  // Sistem VMware'i başlatmaz/yönetmez; uygulamayı eğitmen kendi ortamında yürütür.
  z.object({
    type: z.literal("practical"),
    title: text(160).pipe(z.string().min(1, "Uygulama başlığı gerekli.")),
    description: text(2000).default(""),
    files: z.array(text(120)).max(10).default([]),
    steps: z.array(text(300)).max(20).default([]),
    durationMin: z.number().int().min(1).max(240).default(30),
    host: z
      .object({
        prepNotes: text(3000).default(""),
        vms: z.array(text(160)).max(10).default([]),
        snapshot: text(300).default(""),
        expected: text(3000).default(""),
      })
      .prefault({}),
  }),
]);

export const EMPTY_PRACTICAL_HOST = { prepNotes: "", vms: [] as string[], snapshot: "", expected: "" };
export type Block = z.output<typeof blockSchema>;

export const slideSchema = z.object({
  title: text(160).pipe(z.string().min(1, "Slayt başlığı gerekli.")),
  layout: z.enum(["default", "title", "section"]).default("default"),
  blocks: z.array(blockSchema).max(12, "Bir slaytta en fazla 12 blok olabilir.").default([]),
  notes: text(5000).default(""),
  // Theatre.js giriş koreografisi (proje durumu JSON'u; yalnız sayısal anahtar kareler). Boşsa varsayılan geçişler.
  motion: z.string().max(60_000, "Hareket zaman çizelgesi çok büyük.").default(""),
});
export type SlideInput = z.output<typeof slideSchema>;

export const deckSchema = z.object({
  schema: z.literal(DECK_SCHEMA_VERSION).default(DECK_SCHEMA_VERSION),
  title: text(160).pipe(z.string().min(2, "Sunum başlığı gerekli.")),
  description: text(1000).default(""),
  slides: z.array(slideSchema).min(1, "En az bir slayt gerekli.").max(200, "En fazla 200 slayt."),
});
export type Deck = z.output<typeof deckSchema>;

// Bir bloğun kaç adımı var (adım 0 dahil). Slaytın adım sayısı = blokların en büyüğü.
export function blockSteps(b: Block): number {
  switch (b.type) {
    case "bullets":
      return b.reveal ? b.items.length : 1;
    case "terminal":
      return b.reveal && !b.cast ? b.lines.length : 1;
    case "diagram":
      return b.reveal ? diagramMessages(b.source) + 1 : 1;
    case "code":
      return Math.max(1, Math.max(b.highlightSteps.length, b.morphs.length) + 1);
    case "animation": {
      const a = getAnimation(b.animation);
      return a ? animationStepCount(a) : 1;
    }
    default:
      return 1;
  }
}

export function slideSteps(blocks: Block[]): number {
  return Math.max(1, ...blocks.map(blockSteps));
}

// İstemciye giden slayt biçimi (DB satırından). notes yalnızca sunucu yetkili kişiye eklendiğinde dolu.
export type ClientSlide = { id: string; position: number; title: string; layout: SlideInput["layout"]; blocks: Block[]; steps: number; notes?: string; motion?: string };

// Studio'nun düzenleyebileceği biçim: kısmen geçersiz taslakta eksik alanlar varsayılanla tamamlanır.
export function studioDeck(raw: unknown): Deck {
  const r = (raw ?? {}) as Partial<Deck>;
  return {
    schema: DECK_SCHEMA_VERSION,
    title: typeof r.title === "string" ? r.title : "",
    description: typeof r.description === "string" ? r.description : "",
    slides: Array.isArray(r.slides) && r.slides.length
      ? r.slides.map((sl) => ({ title: sl?.title ?? "", layout: sl?.layout ?? "default", blocks: Array.isArray(sl?.blocks) ? sl.blocks : [], notes: sl?.notes ?? "", motion: typeof sl?.motion === "string" ? sl.motion : "" }))
      : [{ title: "Yeni slayt", layout: "default", blocks: [], notes: "", motion: "" }],
  };
}
export type ClientDeck = { title: string; description: string; slides: ClientSlide[] };
