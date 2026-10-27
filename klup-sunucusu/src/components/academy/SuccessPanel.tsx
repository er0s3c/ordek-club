// Öğretici başarı ekranı: tamamlanan çalışmadan sonra kazanılan beceri, kısa açıklama ve önerilen sonraki adım.
// Animasyon yalnız ördek simgesinde ve azaltılmış hareket tercihine uyar (ui.css).
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { DuckMascot } from "@/components/motion/DuckMascot";
import { SuccessCheck } from "@/components/presentation/LottiePlayer";
import { getT } from "@/i18n/server";

export async function SuccessPanel({ skills, next, trackHref, trackDone, trackTotal, eventId }: { skills: string[]; next: { href: string; title: string } | null; trackHref: string; trackDone: number; trackTotal: number; eventId?: string }) {
  const t = await getT();
  const finished = trackDone >= trackTotal;
  return (
    <section className="success-panel focus-hide" aria-labelledby="success-h">
      <DuckMascot pose="cheer" size={88} eventId={eventId ?? `lesson:${trackHref}:${trackDone}`} />
      <div className="stack-sm">
        <h2 id="success-h" className="row" style={{ fontSize: 16, gap: 6 }}><SuccessCheck size={26} />{" "}{t("Bu dersi tamamladın")}{" "}<Sparkles size={16} aria-hidden /></h2>
        {skills.length > 0 ? (
          <p className="small" style={{ margin: 0 }}>{t("Bu çalışma")}{" "}<strong>{skills.join(", ")}</strong>{" "}{t("becerine kanıt olarak eklendi. Becerilerim sayfasında hangi derslerin bu beceriyi desteklediğini görebilirsin.")}</p>
        ) : <p className="small" style={{ margin: 0 }}>{t("İlerlemen kaydedildi. Öğrendiklerini tekrar kartlarıyla pekiştirebilirsin.")}</p>}
        <p className="tiny faint" style={{ margin: 0 }}>{finished ? t("Bu yoldaki bütün dersler bitti — yol sınavını deneyebilirsin.") : t("Yolda {trackDone}/{trackTotal} ders tamam.", { trackDone, trackTotal })}</p>
        <div className="row">
          {next ? <Link className="btn btn-primary btn-sm" href={next.href}>{t("Sonraki adım: {title}", { title: next.title })}{" "}<ArrowRight size={14} aria-hidden /></Link> : <Link className="btn btn-primary btn-sm" href={trackHref}>{t("Yola dön")}{" "}<ArrowRight size={14} aria-hidden /></Link>}
        </div>
      </div>
    </section>
  );
}
