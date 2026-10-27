import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { STAFF_ROLES } from "@/server/auth/guard";
import { pageFeature } from "@/server/learning/page-features";
import { translationQueue } from "@/server/teaching/translations";
import { TranslationReviewer } from "./TranslationReviewer";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Çeviri incelemesi") };
}

// Dil ve teknik inceleme kuyruğu: 178 dersin TR/EN çevirisi, yapısal sapma uyarıları ve onay/geri gönderme.
export default async function TranslationReviewPage() {
  const t = await getT();
  await requirePageSession(STAFF_ROLES);
  await pageFeature("teacher-plus");
  const rows = await translationQueue();
  const counts = {
    total: rows.length,
    missing: rows.filter((r) => r.status === "missing").length,
    draft: rows.filter((r) => r.status === "draft").length,
    reviewed: rows.filter((r) => r.status === "reviewed").length,
  };
  return (
    <div className="stack fade-up">
      <header className="page-head">
        <div className="eyebrow">{t("Eğitmen")}</div>
        <h1 className="page-title">{t("Çeviri incelemesi")}</h1>
        <p className="page-sub">
          {t("Derslerin Türkçe ve İngilizce sürümlerini yan yana karşılaştır, dil ve teknik aşamada onayla. Onaylanan çeviride öğrenciye gösterilen \"incelenmedi\" notu kalkar.")}
        </p>
      </header>
      <TranslationReviewer rows={rows} counts={counts} />
    </div>
  );
}
