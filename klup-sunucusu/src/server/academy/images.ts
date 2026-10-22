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
