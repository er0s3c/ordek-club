"use client";
import { useState } from "react";
import { CalendarPlus, Trash2, X } from "lucide-react";
import { useClubAction } from "@/components/club/useClubAction";
import { EmptyState, StatusPill } from "@/components/ui/states";
import { useT } from "@/i18n/client";

type Slot = { id: string; host: string; hostId: string; mine: boolean; startsAt: string; endsAt: string; location: string; capacity: number; booked: number; myBooking: string | null; bookings: { id: string; user: string; topic: string }[] };
const fmt = (s: string, intl = "tr-TR") => new Date(s).toLocaleString(intl, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function NewSlots() {
  const t = useT();
  const act = useClubAction();
  const [startsAt, setStartsAt] = useState("");
  const [minutes, setMinutes] = useState(20);
  const [count, setCount] = useState(3);
  const [location, setLocation] = useState("");
  return (
    <section className="card card-b stack-sm" aria-labelledby="ns-h">
      <strong id="ns-h"><CalendarPlus size={15} aria-hidden />{" "}{t("Saat aç")}</strong>
      <div className="form-grid">
        <label className="field">{t("Başlangıç")}<input className="input" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /></label>
        <label className="field">{t("Süre (dk)")}<input className="input" type="number" min={10} max={120} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} /></label>
        <label className="field">{t("Ardışık dilim")}<input className="input" type="number" min={1} max={12} value={count} onChange={(e) => setCount(Number(e.target.value))} /></label>
        <label className="field">{t("Yer")}<input className="input" maxLength={120} value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("B-204 ya da çevrim içi")} /></label>
      </div>
      <div><button type="button" className="btn btn-sm btn-primary" disabled={!startsAt} onClick={() => act({ action: "slots.create", data: { startsAt: new Date(startsAt).toISOString(), minutes, count, capacity: 1, location } }, t("{count} dilim açıldı.", { count }))}>{t("Aç")}</button></div>
    </section>
  );
}

export function OfficeHours({ slots, staff }: { slots: Slot[]; staff: boolean }) {
  const t = useT();
  const act = useClubAction();
  const [topic, setTopic] = useState<Record<string, string>>({});
  const mine = slots.filter((s) => s.mine);
  const others = slots.filter((s) => !s.mine);
  return (
    <div className="stack">
      {staff && <NewSlots />}
      {staff && mine.length > 0 && (
        <section className="card" aria-labelledby="mine-h">
          <div className="card-h"><h2 id="mine-h">{t("Hazırlık listem")}</h2></div>
          <ul className="qa-list card-b">
            {mine.map((s) => (
              <li key={s.id} className="qa-item">
                <div className="row-between"><strong className="small">{fmt(s.startsAt, t.intl)}{s.location && ` · ${s.location}`}</strong><span className="row"><StatusPill tone={s.booked ? "info" : "neutral"}>{s.booked}/{s.capacity}</StatusPill><button type="button" className="btn btn-ghost btn-sm" aria-label={t("Dilimi sil")} onClick={() => confirm(t("Bu dilim silinsin mi? Kayıtlı öğrencilere bildirim gider.")) && act({ action: "slots.delete", id: s.id }, "Silindi.")}><Trash2 size={13} /></button></span></div>
                {s.bookings.map((b) => <div key={b.id} className="qa-answer"><strong className="small">{b.user}</strong><p className="small" style={{ margin: "2px 0 0" }}>{b.topic}</p></div>)}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="card" aria-labelledby="open-h">
        <div className="card-h"><h2 id="open-h">{t("Açık saatler")}</h2></div>
        <div className="card-b">
          {others.length === 0 ? <EmptyState duck="sleep" title={t("Şu an açık görüşme saati yok")} /> : (
            <ul className="qa-list">
              {others.map((s) => {
                const full = s.booked >= s.capacity;
                return (
                  <li key={s.id} className="qa-item stack-sm">
                    <div className="row-between"><span><strong>{s.host}</strong> <span className="small muted">· {fmt(s.startsAt, t.intl)}{s.location && ` · ${s.location}`}</span></span>{s.myBooking ? <StatusPill tone="ok">{t("kayıtlısın")}</StatusPill> : full ? <StatusPill tone="neutral">{t("dolu")}</StatusPill> : <StatusPill tone="info">{t("boş")}</StatusPill>}</div>
                    {s.myBooking ? <div><button type="button" className="btn btn-ghost btn-sm" onClick={() => act({ action: "slots.cancel", id: s.myBooking }, t("Kaydın iptal edildi."))}><X size={13} aria-hidden />{" "}{t("Kaydı iptal et")}</button></div>
                      : !full && <div className="row"><input className="input" style={{ flex: 1, minWidth: 200 }} aria-label={t("Görüşme konusu")} maxLength={500} value={topic[s.id] ?? ""} onChange={(e) => setTopic({ ...topic, [s.id]: e.target.value })} placeholder={t("Konu: ör. Yol C final projesi için kaynak önerisi")} /><button type="button" className="btn btn-sm btn-primary" disabled={(topic[s.id] ?? "").trim().length < 5} onClick={() => act({ action: "slots.book", id: s.id, topic: topic[s.id] }, t("Kaydın alındı."))}>{t("Kaydol")}</button></div>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
