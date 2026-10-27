"use client";
// Rota segmentleri için ortak yükleniyor / hata görünümleri.
import { useEffect } from "react";
import { Skeleton, ErrorRetry } from "@/components/ui/states";
import { useT } from "@/i18n/client";

export function PageLoading() {
  return (
    <div className="stack" aria-busy="true">
      <div className="skeleton" style={{ height: 14, width: 120 }} />
      <div className="skeleton" style={{ height: 42, width: "55%" }} />
      <div className="grid-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}</div>
      <Skeleton lines={4} />
    </div>
  );
}

export function PageError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="stack">
      <header className="page-head"><div className="eyebrow">{t("Hata")}</div><h1 className="page-title">{t("Bu sayfa açılamadı")}</h1></header>
      <ErrorRetry message={t("Beklenmeyen bir sorun oluştu{v0}. Bağlantını kontrol edip tekrar dene.", { v0: error.digest ? ` (ref: ${error.digest})` : "" })} onRetry={reset} />
    </div>
  );
}
