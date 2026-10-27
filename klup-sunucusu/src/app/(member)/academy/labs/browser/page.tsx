import type { Metadata } from "next";
import { requirePageSession } from "@/server/auth/page-guard";
import { pageFeature } from "@/server/learning/page-features";
import { BrowserLinux } from "@/components/labs/BrowserLinux";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Tarayıcıda Linux") };
}

// Sunucu gerektirmeyen Linux alıştırma alanı (v86). Kişisel deneme içindir; puanlanmaz.
export default async function BrowserLinuxPage() {
  const t = await getT();
  await requirePageSession();
  await pageFeature("workshops");
  return (
    <div className="stack-lg fade-up">
      <header className="page-head">
        <div className="eyebrow">{t("Ördek Akademi · Uygulama")}</div>
        <h1 className="page-title">{t("Tarayıcıda Linux")}</h1>
        <p className="page-sub">{t("Bilgisayarında, tarayıcının içinde çalışan küçük bir Linux. Ağa çıkamaz, kimseye zarar veremez; kapatınca sıfırlanır. Komutları korkmadan dene.")}</p>
      </header>
      <BrowserLinux />
      <section className="card card-b stack-sm">
        <strong>{t("Denemen için birkaç komut")}</strong>
        <pre className="md-code">{"whoami && id\nls -la /etc | head\necho merhaba > not.txt && chmod 600 not.txt && ls -l not.txt\nps aux | head\ncat /proc/cpuinfo | head -5"}</pre>
      </section>
    </div>
  );
}
