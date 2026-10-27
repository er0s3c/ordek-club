import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AnimatedNumber } from "@/components/motion/Primitives";
import { TrendingDown, TrendingUp } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { featureEnabled } from "@/server/learning/features";
import { workspace } from "@/server/learning/service";
import { streakStrip, weekCompare } from "@/server/learning/insights";
import { LearningWorkspace } from "@/components/academy/LearningWorkspace";
import { WeekStrip } from "@/components/learning/WeekStrip";
import { getT } from "@/i18n/server";
export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Öğrenme alanım") };
}
export default async function Page() {
  const t = await getT();
  const { user } = await requirePageSession();
  if (!await featureEnabled("learning")) notFound();
  const [data, compare, strip] = await Promise.all([workspace({ id: user.id, role: user.role, status: user.status }), weekCompare(user.id), streakStrip(user.id)]);
  return (
    <div className="stack">
      <LearningWorkspace data={data} />
      <div className="grid-2">
        {/* Seri açıklama paneli: bir güne tıklayınca yapılan çalışma, telafi veya sınav koruması görünür */}
        <section className="card" aria-labelledby="why-h">
          <div className="card-h"><h2 id="why-h">{t("Serin neden korundu?")}</h2></div>
          <div className="card-b stack-sm"><WeekStrip days={strip.days} interactive /><span className="tiny faint">{t("Bir güne dokun: o gün yaptığın çalışmalar ve serinin nasıl korunduğu açılır.")}</span></div>
        </section>
        <section className="card" aria-labelledby="cmp-h">
          <div className="card-h"><h2 id="cmp-h">{t("Bu hafta / geçen hafta")}</h2><span className="tiny faint">{t("yalnız seninle")}</span></div>
          <div className="card-b">
            <div className="compare">
              <span className="tiny faint">{t("Ölçü")}</span><span className="tiny faint num">{t("Geçen")}</span><span className="tiny faint num">{t("Bu")}</span><span className="tiny faint num">{t("Fark")}</span>
              {compare.map((m) => [
                <span key={`${m.label}-l`}>{m.label}</span>,
                <span key={`${m.label}-p`} className="num">{m.prev}</span>,
                <span key={`${m.label}-c`} className="num"><strong><AnimatedNumber value={m.cur} /></strong></span>,
                <span key={`${m.label}-d`} className={`num ${m.delta > 0 ? "trend-up" : m.delta < 0 ? "trend-down" : ""}`}>{m.delta > 0 ? <><TrendingUp size={13} aria-hidden /> +{m.delta}</> : m.delta < 0 ? <><TrendingDown size={13} aria-hidden /> {m.delta}</> : "="}</span>,
              ])}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
