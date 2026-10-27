// Kişisel veri dışa aktarma (KVKK): öğrenci kendi ilerleme, not, teslim ve öğrenme kayıtlarını JSON olarak indirir.
import { Download } from "lucide-react";
import { getT } from "@/i18n/server";

export async function DataExportCard() {
  const t = await getT();
  return (
    <section className="card" aria-labelledby="export-h">
      <div className="card-h"><h2 id="export-h">{t("Verilerim")}</h2></div>
      <div className="card-b stack-sm">
        <p className="small muted" style={{ margin: 0 }}>{t("Hesabına ait ilerleme, notlar, teslimler, XP hareketleri, çalışma oturumları ve bildirimlerin tek bir JSON dosyasında. Başka kişilerin verisi ve dosya içerikleri dahil değildir.")}</p>
        <div><a className="btn btn-sm" href="/api/account/export" download><Download size={14} aria-hidden />{" "}{t("Verilerimi indir (JSON)")}</a></div>
      </div>
    </section>
  );
}
