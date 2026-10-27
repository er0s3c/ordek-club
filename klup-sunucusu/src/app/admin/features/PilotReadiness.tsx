// SK-101 pilot hazırlığı: canlı akademideki yayın durumu ile content/pilot taslaklarının durumu ayrı adımlar olarak gösterilir.
// Taslaklar bağımsız yazar/teknik/dil incelemesi onaylanmadan canlıya alınmaz; bu ekran onay vermez, yalnız durumu gösterir.
import { CheckCircle2, CircleDashed, FileText, ShieldCheck, UploadCloud } from "lucide-react";
import type { pilotReadiness } from "@/server/academy/pilot";
import { StatusPill } from "@/components/ui/states";
import { getT } from "@/i18n/server";

type Pilot = ReturnType<typeof pilotReadiness>;

function Step({ done, icon: Icon, title, children }: { done: boolean; icon: typeof FileText; title: string; children: React.ReactNode }) {
  return (
    <li className="pilot-step" data-done={done}>
      <span className="pilot-step-icon" aria-hidden>{done ? <CheckCircle2 size={18} /> : <Icon size={18} />}</span>
      <div className="stack-sm" style={{ gap: 4 }}><strong>{title}</strong>{children}</div>
    </li>
  );
}

export async function PilotReadiness({ pilot }: { pilot: Pilot }) {
  const t = await getT();
  const d = pilot.drafts;
  const drafted = d ? d.lessons === 28 && d.labs === 7 && d.bilingualPairs === 35 : false;
  const structural = d ? d.problems.length === 0 : false;
  const reviewed = d ? d.reviewedPairs === 35 : false;
  const live = pilot.ready;
  const status = live ? <StatusPill tone="ok">{t("yayında")}</StatusPill> : reviewed ? <StatusPill tone="info">{t("içe aktarmaya hazır")}</StatusPill> : drafted ? <StatusPill tone="warn">{t("inceleme bekliyor")}</StatusPill> : <StatusPill tone="neutral">{t("taslak eksik")}</StatusPill>;
  return (
    <section className="card" aria-labelledby="pilot-h">
      <div className="card-h"><h2 id="pilot-h">{t("SK-101 pilot hazırlığı")}</h2>{status}</div>
      <div className="card-b stack">
        <ol className="pilot-steps">
          <Step done={drafted} icon={FileText} title={t("1. Editör taslakları (content/pilot)")}>
            {d ? <span className="small">{t("{lessons}/28 ders · {labs}/7 lab · {bilingualPairs}/35 TR/EN çifti", { lessons: d.lessons, labs: d.labs, bilingualPairs: d.bilingualPairs })}</span> : <span className="small muted">{t("Taslak klasörü bu sunucuda yok (Docker imajına eklenmez). Denetim geliştirme ortamında çalışır.")}</span>}
          </Step>
          <Step done={structural} icon={CircleDashed} title={t("2. Yapısal denetim")}>
            {d ? (d.problems.length ? <details><summary className="small">{t("{length} sorun", { length: d.problems.length })}</summary><ul className="small">{d.problems.map((p) => <li key={p}>{p}</li>)}</ul></details> : <span className="small">{t("Kimlikler, TR/EN etkinlik yapısı ve ders başına 3–6 etkinlik uygun. Etkinlik türleri: {v0}.", { v0: d.activityKinds.join(", ") })}</span>) : <span className="small muted">—</span>}
          </Step>
          <Step done={reviewed} icon={ShieldCheck} title={t("3. Bağımsız inceleme (yazar · teknik · dil)")}>
            {d ? <span className="small">{t("{reviewedPairs}/35 TR/EN çifti onaylı. Her dosyada", { reviewedPairs: d.reviewedPairs })}{" "}<code>inceleme.teknik</code>, <code>inceleme.dil</code>{" "}{t("doldurulmalı, teknik inceleyen yazardan farklı olmalı ve")}{" "}<code>onayli: true</code>{" "}{t("yapılmalı.")}</span> : <span className="small muted">—</span>}
          </Step>
          <Step done={live} icon={UploadCloud} title={t("4. Canlı akademiye alma")}>
            <span className="small">{t("{lessons}/28 ders · {labs}/7 lab canlı akademide. İnceleme tamamlanınca iki dil birlikte", { lessons: pilot.lessons, labs: pilot.labs })}{" "}<code>content/academy</code>{" "}{t("manifestine alınır ve Yönetim → Akademi’den içe aktarılır; eksik varsa içe aktarma bütünüyle reddedilir.")}</span>
            {!live && pilot.lessons + pilot.labs > 0 && <details><summary className="small">{t("Canlı içerikteki eksikler ({length})", { length: pilot.missing.length })}</summary><ul className="small">{pilot.missing.map((m) => <li key={m}>{m}</li>)}</ul></details>}
          </Step>
        </ol>
        <p className="small muted" style={{ margin: 0 }}>{t("Kontrol")}{" "}<code>npm run academy:pilot-check</code>{" "}{t("ile de çalıştırılabilir. Bu kontrol teknik altyapı ve 20 oturumlu yük testinin yerine geçmez.")}</p>
      </div>
    </section>
  );
}
