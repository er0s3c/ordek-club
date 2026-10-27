"use client";
// 7 günlük seri şeridi. interactive ise güne tıklanınca o günün açıklaması (yapılan çalışma, telafi, sınav koruması) açılır.
import { useState } from "react";
import { Check, Shield } from "lucide-react";
import { api } from "@/lib/api-client";
import { Drawer } from "@/components/ui/Drawer";
import { Skeleton, ErrorRetry } from "@/components/ui/states";
import { m } from "motion/react";
import { useClubReducedMotion } from "@/components/motion/MotionProvider";
import { useT } from "@/i18n/client";

type Day = { day: string; state: string; today?: boolean };
type Detail = { day: string; state: string; reason: string; events: { kind: string; title: string; at: string }[] };
const LABEL: Record<string, string> = { active: "çalışıldı", protected: "telafiyle korundu", exam: "sınav korumasıyla korundu", missed: "çalışılmadı", pending: "bugün, henüz yok" };
const weekday = (d: string, intl = "tr-TR") => new Date(`${d}T12:00:00Z`).toLocaleDateString(intl, { weekday: "short", timeZone: "UTC" });

export function WeekStrip({ days, interactive = false }: { days: Day[]; interactive?: boolean }) {
  const t = useT();
  const reduced = useClubReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [err, setErr] = useState("");
  function load(day: string) {
    setOpen(day); setDetail(null); setErr("");
    api<Detail>(`/api/learning/day?day=${day}`).then(setDetail).catch((e) => setErr((e as Error).message));
  }
  return (
    <>
      <ol className="week-strip" aria-label={t("Son 7 gün")}>
        {days.map((d) => {
          const state = d.state === "active" ? "done" : d.state === "protected" || d.state === "exam" ? "protected" : d.today ? "today" : "none";
          const inner = <><m.span initial={false} animate={{ scale: state === "done" ? 1.04 : 1 }} transition={{ duration: reduced ? 0 : .2 }} className="dot" data-state={state}>{state === "done" ? <Check size={14} aria-hidden /> : state === "protected" ? <Shield size={12} aria-hidden /> : null}</m.span><span>{weekday(d.day, t.intl)}</span></>;
          const label = `${d.day}: ${t(LABEL[d.state] ?? d.state)}`;
          return <li key={d.day} style={{ listStyle: "none" }}>{interactive ? <button type="button" className="day" aria-label={t("{label}. Ayrıntıyı aç", { label })} onClick={() => load(d.day)}>{inner}</button> : <span className="day" aria-label={label}>{inner}</span>}</li>;
        })}
      </ol>
      {interactive && (
        <Drawer open={!!open} onClose={() => setOpen(null)} title={open ? `${new Date(`${open}T12:00:00Z`).toLocaleDateString(t.intl, { day: "numeric", month: "long", weekday: "long", timeZone: "UTC" })}` : ""}>
          {err ? <ErrorRetry message={err} onRetry={() => open && load(open)} /> : !detail ? <Skeleton /> : (
            <div className="stack">
              <p>{detail.reason}</p>
              {detail.events.length ? (
                <ul className="timeline">{detail.events.map((e, i) => <li key={i}><time>{new Date(e.at).toLocaleTimeString(t.intl, { hour: "2-digit", minute: "2-digit" })}</time><span><strong>{e.kind}</strong>{e.title && <> · {e.title}</>}</span></li>)}</ul>
              ) : <p className="muted small">{t("Bu gün için kayıtlı çalışma yok.")}</p>}
            </div>
          )}
        </Drawer>
      )}
    </>
  );
}
