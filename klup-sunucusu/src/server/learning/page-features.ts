import { notFound } from "next/navigation";
import { featureEnabled, type FeatureKey } from "@/server/learning/features";

// Sayfalar için: anahtar kapalıysa 404 sayfası (özel sunucu paketine girmesin diye ayrı dosyada).
export async function pageFeature(key: FeatureKey) {
  if (!await featureEnabled(key)) notFound();
}
