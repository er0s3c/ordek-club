import { z } from "zod";

// Gölge Ağ çizgi romanı (content/academy/cizgi-roman.yaml). Paneller yazısız üretilir; anlatıcı kutusu ve
// konuşma balonları platformda gerçek metin olarak panelin üstüne yerleşir (AI görselde yazıyı bozar).
// Gövdeye yerleştirme ayracı: ::cizgi[şerit-id]. Yazarlık kuralları scripts/academy.mjs check ile denetlenir.
// İngilizce: şerit, panel ve balonlarda isteğe bağlı `en` alanı (görsel aynı kalır, yalnız metin değişir):
//   şerit.en: { baslik, devam } · panel.en: { alt, anlatici, ses } · balon.en: "metin"
export const COMIC = /^::cizgi\[([a-z0-9-]{1,60})\]$/;

export const BUBBLE_KINDS = ["konusma", "dusunce", "fisilti"] as const;
export const BUBBLE_SPOTS = ["sol-ust", "sag-ust", "sol-alt", "sag-alt"] as const;

const bubbleSchema = z.object({
  kim: z.string().trim().min(1).max(30),
  metin: z.string().trim().min(1).max(100),
  tur: z.enum(BUBBLE_KINDS).default("konusma"),
  yer: z.enum(BUBBLE_SPOTS).default("sag-ust"),
  en: z.string().trim().min(1).max(100).optional(),
});

const panelSchema = z.object({
  gorsel: z.string().regex(/^[a-z0-9-]{1,80}$/),
  karakter: z.string().optional(),
  alt: z.string().trim().min(1).max(300),
  prompt: z.string().min(1),
  anlatici: z.string().trim().max(220).optional(),
  balonlar: z.array(bubbleSchema).max(2).default([]),
  // Ses efekti (ör. "BZZT!"): çizgi romanın büyük, eğik harfleri; görselde değil platformda çizilir.
  ses: z.object({ metin: z.string().trim().min(1).max(16), yer: z.enum(BUBBLE_SPOTS).default("sag-alt") }).optional(),
  en: z.object({ alt: z.string().trim().min(1).max(300).optional(), anlatici: z.string().trim().max(220).optional(), ses: z.string().trim().min(1).max(16).optional() }).optional(),
});

export const comicFileSchema = z.object({
  tarifler: z.record(z.string(), z.string()).default({}),
  seritler: z.record(
    z.string().regex(/^[a-z0-9-]{1,60}$/),
    // devam: şeridin altındaki "devam edecek" kutusu (merak kancası)
    z.object({
      baslik: z.string().trim().min(1).max(120),
      paneller: z.array(panelSchema).min(1).max(4),
      devam: z.string().trim().max(200).optional(),
      en: z.object({ baslik: z.string().trim().min(1).max(120).optional(), devam: z.string().trim().max(200).optional() }).optional(),
    }),
  ),
});
export type ComicFile = z.output<typeof comicFileSchema>;

// Sayfaya giden hâli: üretim promptu ve karakter bilgisi istemciye gönderilmez.
export type ComicBubble = { who: string; text: string; kind: (typeof BUBBLE_KINDS)[number]; spot: (typeof BUBBLE_SPOTS)[number] };
export type ComicSfx = { text: string; spot: (typeof BUBBLE_SPOTS)[number] };
export type ComicPanel = { image: string | null; alt: string; caption: string | null; bubbles: ComicBubble[]; sfx: ComicSfx | null };

// Ses efekti için ikinci tercih sırası: balonun bulunduğu köşeden uzak, aynı yatay bantta olmayan köşe.
const SFX_FALLBACK: readonly (typeof BUBBLE_SPOTS)[number][] = ["sag-alt", "sol-alt", "sag-ust", "sol-ust"];

// Panel yerleşimi: her balon tek bir köşeye, ses efekti de balonların boş bıraktığı bir köşeye oturur.
// Yazar/yayın verisi hangi köşeyi seçmiş olursa olsun iki metin aynı köşeye binmez; böylece dar panellerde
// balonlar üst üste gelmez. Anlatıcı kutusu görselin üstünde ayrı bir bantta durduğu için burada sayılmaz.
export function layoutComicPanel(panel: Pick<ComicPanel, "caption" | "bubbles" | "sfx">): Pick<ComicPanel, "caption" | "bubbles" | "sfx"> {
  const used = new Set<(typeof BUBBLE_SPOTS)[number]>();
  const bubbles = panel.bubbles.map((b) => {
    const spot = used.has(b.spot) ? (BUBBLE_SPOTS.find((x) => !used.has(x)) ?? b.spot) : b.spot;
    used.add(spot);
    return spot === b.spot ? b : { ...b, spot };
  });
  let sfx = panel.sfx;
  if (sfx) {
    const spot = used.has(sfx.spot) ? (SFX_FALLBACK.find((x) => !used.has(x)) ?? sfx.spot) : sfx.spot;
    used.add(spot);
    sfx = spot === sfx.spot ? sfx : { ...sfx, spot };
  }
  return { caption: panel.caption, bubbles, sfx };
}

// lang: şeridin gösterildiği dil (büyük harf dönüşümü dile göre yapılır: i → İ yalnız Türkçede).
export type ComicStripData = { id: string; lang: "tr" | "en"; title: string; panels: ComicPanel[]; next: string | null };

// Gövdede (blok alıntılar dâhil) geçen şerit kimlikleri.
export const comicIds = (body: string): string[] =>
  [...new Set(body.split("\n").map((l) => l.replace(/^(>\s*)+/, "").trim().match(COMIC)?.[1]).filter((x): x is string => !!x))];
