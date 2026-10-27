import fs from "node:fs";
import path from "node:path";
import { env } from "@/server/env";

// Hazır olan ders görselleri (gorseller/ klasöründeki dosya adları). Olmayanlar yer tutucuyla gösterilir.
export function availableImages(): Set<string> {
  try {
    return new Set(fs.readdirSync(path.join(env().academyDir, "gorseller")).filter((n) => /^[a-z0-9-]+\.(webp|png|jpe?g)$/.test(n)));
  } catch {
    return new Set();
  }
}

export const portraitUrl = (villainId: string, images: ReadonlySet<string>) =>
  images.has(`karakter-${villainId}.webp`) ? `/api/academy/images/karakter-${villainId}.webp` : null;

// Modül kapağı: yol anahtarı (m05, yol-a) ya da pilot modül anahtarı (sk101-m2). Promptlar content/academy/KAPAKLAR.md'de.
export const coverUrl = (key: string, images: ReadonlySet<string>) =>
  images.has(`kapak-${key}.webp`) ? `/api/academy/images/kapak-${key}.webp` : null;

// Lab / atölye ikonu: katalog anahtarı (secure-code, network…) ya da vaka labı kimliği (sk101-m2-lab).
export const labIconUrl = (key: string, images: ReadonlySet<string>) =>
  images.has(`lab-${key}.webp`) ? `/api/academy/images/lab-${key}.webp` : null;
