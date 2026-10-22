import { z } from "zod";

// Ders kimliği ve görsel adı yalnızca bu biçimlerde kabul edilir (yol geçişi / enjeksiyon yüzeyi yok).
export const slugParam = z.string().regex(/^[a-z0-9-]{1,40}$/, "Geçersiz ders kimliği.");
export const imageParam = z.string().regex(/^[a-z0-9-]{1,80}\.(webp|png|jpe?g)$/, "Geçersiz görsel adı.");
