import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { pageFeature } from "@/server/learning/page-features";
import { ctfBoard } from "@/server/ctf/service";
import { CtfBoard } from "./CtfBoard";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("CTF panosu") };
}

export default async function CtfPage() {
  const t = await getT();
  const { user } = await requirePageSession();
  await pageFeature("community");
  const board = await ctfBoard({ id: user.id, role: user.role, status: user.status });
  return (
    <div className="stack-lg fade-up">
      <header className="page-head hero-galaxy">
        <div className="eyebrow">{t("Ördek Akademi · Yakala-bayrağı")}</div>
        <h1 className="page-title">{t("CTF panosu")}</h1>
        <p className="page-sub">{t("Her görev çevrimdışı çözülür; hiçbir gerçek sisteme dokunmazsın. Bayrak biçimi")}{" "}<code>ordek{"{...}"}</code>{t(". Çözen sayısı arttıkça görevin değeri düşer; ipuçları puandan düşer, XP'den değil.")}</p>
      </header>
      <CtfBoard data={board} />
    </div>
  );
}
