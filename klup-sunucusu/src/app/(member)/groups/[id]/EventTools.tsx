"use client";
// Etkinlik araçları: öğrenci kod/QR ile katılımını doğrular, dolu etkinlikte bekleme listesine girer, etkinlik
// bitince geri bildirim verir. Düzenleyen personel kısa süreli kodu açar, QR'ı yansıtır ve yoklamayı görür.
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, QrCode, Star, UserCheck } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { StatusPill } from "@/components/ui/states";
import { useT } from "@/i18n/client";

type Stats = { checkIns: number; waitlist: number; avg: number | null; feedback: number } | null;

export function EventTools({ groupId, staff, canEdit, isMember, full, checkedIn, waiting, feedbackGiven, ended, codeOpenUntil, stats }: { groupId: string; staff: boolean; canEdit: boolean; isMember: boolean; full: boolean; checkedIn: boolean; waiting: boolean; feedbackGiven: boolean; ended: boolean; codeOpenUntil: string | null; stats: Stats }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const [code, setCode] = useState(params.get("checkin") ?? "");
  const [open, setOpen] = useState<{ code: string; qr: string; expiresAt: string } | null>(null);
  const [rows, setRows] = useState<{ name: string; username: string; method: string; at: string }[] | null>(null);
  const [manual, setManual] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const post = async (body: unknown, ok?: string) => {
    try { const r = await api(`/api/events/${groupId}`, { body }); if (ok) toast("ok", ok); router.refresh(); return r; } catch (e) { toast("error", (e as Error).message); return null; }
  };
  useEffect(() => { if (params.get("checkin") && !checkedIn) document.getElementById("checkin")?.scrollIntoView({ block: "center" }); }, [params, checkedIn]);
  return (
    <section id="checkin" className="card" aria-labelledby="ev-h">
      <div className="card-h"><h2 id="ev-h"><UserCheck size={16} aria-hidden />{" "}{t("Katılım")}</h2>{checkedIn ? <StatusPill tone="ok">{t("katılımın doğrulandı")}</StatusPill> : codeOpenUntil ? <StatusPill tone="info">{t("kod açık")}</StatusPill> : null}</div>
      <div className="card-b stack">
        {!staff && !checkedIn && (
          <div className="row">
            <input className="input mono" style={{ maxWidth: 200, textTransform: "uppercase" }} aria-label={t("Katılım kodu")} maxLength={12} value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("Ekrandaki kod")} />
            <button type="button" className="btn btn-sm btn-primary" disabled={code.trim().length < 4} onClick={() => post({ action: "checkin", code }, t("Katılımın kaydedildi."))}><CheckCircle2 size={14} aria-hidden />{" "}{t("Katıldım")}</button>
            <span className="tiny faint">{t("Kodu etkinlikte yansıtılan ekrandan ya da QR’dan al. Katılım XP üretmez; etkinlik geçmişinde görünür.")}</span>
          </div>
        )}
        {!staff && full && !isMember && (
          waiting ? <div className="row"><StatusPill tone="info">{t("bekleme listesindesin")}</StatusPill><button type="button" className="btn btn-ghost btn-sm" onClick={() => post({ action: "waitlist", join: false }, t("Bekleme listesinden çıktın."))}>{t("Listeden çık")}</button></div>
            : <div><button type="button" className="btn btn-sm" onClick={() => post({ action: "waitlist", join: true }, t("Bekleme listesine eklendin; yer açılınca bildirim alacaksın."))}><Clock size={14} aria-hidden />{" "}{t("Bekleme listesine gir")}</button></div>
        )}
        {!staff && ended && (isMember || checkedIn) && (
          feedbackGiven ? <p className="small muted" style={{ margin: 0 }}>{t("Geri bildirimin için teşekkürler.")}</p> : (
            <div className="stack-sm">
              <strong className="small">{t("Etkinlik nasıldı?")}</strong>
              <div className="row" role="radiogroup" aria-label={t("Puan")}>{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className="chip" role="radio" aria-checked={rating === n} onClick={() => setRating(n)}>{n} <Star size={12} aria-hidden /></button>)}</div>
              <input className="input" maxLength={1000} aria-label={t("Yorum")} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t("Bir dahaki sefere neyi farklı yapalım?")} />
              <div><button type="button" className="btn btn-sm" disabled={!rating} onClick={() => post({ action: "feedback", data: { rating, comment } }, t("Teşekkürler!"))}>{t("Gönder")}</button></div>
            </div>
          )
        )}
        {staff && canEdit && (
          <div className="stack-sm">
            <div className="row">
              <button type="button" className="btn btn-sm btn-primary" onClick={async () => { const r = (await post({ action: "open", minutes: 5 })) as typeof open; if (r) setOpen(r); }}><QrCode size={14} aria-hidden />{" "}{t("5 dakikalık kod aç")}</button>
              {(open || codeOpenUntil) && <button type="button" className="btn btn-sm" onClick={async () => { await post({ action: "close" }, t("Kod kapatıldı.")); setOpen(null); }}>{t("Kodu kapat")}</button>}
              <button type="button" className="btn btn-sm btn-ghost" onClick={async () => { try { setRows((await api<{ attendance: NonNullable<typeof rows> }>(`/api/events/${groupId}`)).attendance); } catch (e) { toast("error", (e as Error).message); } }}>{t("Yoklamayı göster")}</button>
            </div>
            {open && (
              <div className="checkin-show">
                {/* eslint-disable-next-line @next/next/no-img-element -- sunucunun ürettiği veri URL'si */}
                <img src={open.qr} alt={t("Katılım QR kodu, kod {code}", { code: open.code })} width={220} height={220} />
                <div className="stack-sm"><span className="checkin-code mono">{open.code}</span><span className="tiny faint">{t("{time} saatine kadar geçerli", { time: new Date(open.expiresAt).toLocaleTimeString(t.intl, { hour: "2-digit", minute: "2-digit" }) })}</span></div>
              </div>
            )}
            <div className="row"><input className="input" style={{ maxWidth: 220 }} aria-label={t("Kullanıcı adı")} value={manual} onChange={(e) => setManual(e.target.value)} placeholder={t("kullanıcı adı")} /><button type="button" className="btn btn-sm" disabled={!manual.trim()} onClick={async () => { if (await post({ action: "manual", username: manual }, "Elle eklendi.")) setManual(""); }}>{t("Elle katılım ekle")}</button></div>
            {rows && (rows.length ? <ul className="list-tight">{rows.map((r) => <li key={r.username}><span style={{ flex: 1 }}>{r.name}</span><span className="tiny faint">{r.method === "MANUAL" ? "elle" : "kod"} · {new Date(r.at).toLocaleTimeString(t.intl, { hour: "2-digit", minute: "2-digit" })}</span></li>)}</ul> : <p className="small muted">{t("Henüz katılım yok.")}</p>)}
          </div>
        )}
        {stats && <p className="tiny faint" style={{ margin: 0 }}>{t("{checkIns} doğrulanmış katılım · {waitlist} kişi bekleme listesinde ·", { checkIns: stats.checkIns, waitlist: stats.waitlist })}{" "}{stats.feedback ? t("geri bildirim ort. {avg} ({feedback})", { avg: stats.avg?.toFixed(1), feedback: stats.feedback }) : t("henüz geri bildirim yok")}</p>}
      </div>
    </section>
  );
}
