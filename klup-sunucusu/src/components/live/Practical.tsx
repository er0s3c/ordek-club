"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, FlaskConical, Paperclip, RefreshCw, Server } from "lucide-react";
import { useToast } from "@/components/providers";
import { api, ApiError } from "@/lib/api-client";
import type { Block } from "@/lib/deck-schema";
import { useCountdown } from "./Poll";
import { FILE_ACCEPT } from "@/components/classroom/labels";
import { useT } from "@/i18n/client";

type PracticalBlock = Extract<Block, { type: "practical" }>;
type Mine = { status: "SUBMITTED" | "RETURNED" | "APPROVED" | "REJECTED"; late: boolean; feedback: string; score: number | null; files: { id: string; name: string }[] } | null;

const SUB_STATUS = { SUBMITTED: ["Teslim edildi · değerlendirme bekliyor", "badge-amber"], RETURNED: ["Düzeltme istendi", "badge-red"], APPROVED: ["Onaylandı", "badge-ok"], REJECTED: ["Reddedildi", "badge-red"] } as const;

export function fmtClock(sec: number) {
  const m = Math.floor(sec / 60);
  return `${m}:${String(sec % 60).padStart(2, "0")}`;
}

// Öğrenci: uygulama molası teslim formu (metin + dosya). Görev API'sine gider; XP onaydan sonra.
export function StudentPractical({ assignmentId, dueAt, block, skew }: { assignmentId: string; dueAt: number; block: PracticalBlock; skew: number }) {
  const t = useT();
  const toast = useToast();
  const left = useCountdown(dueAt, skew);
  const [mine, setMine] = useState<Mine>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const a = await api<{ mine: Mine }>(`/api/tasks/${encodeURIComponent(assignmentId)}`);
      setMine(a.mine);
    } catch {
      /* görev henüz görünmüyorsa sessiz geç */
    }
  }, [assignmentId]);
  useEffect(() => void load(), [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const form = new FormData();
    form.set("text", text);
    for (const f of Array.from(fileRef.current?.files ?? [])) form.append("files", f);
    setBusy(true);
    try {
      await api(`/api/tasks/${encodeURIComponent(assignmentId)}/submit`, { method: "POST", form });
      toast("ok", t("Teslimin alındı. Eğitmen değerlendirince bildirim gelecek."));
      setText("");
      if (fileRef.current) fileRef.current.value = "";
      await load();
    } catch (err) {
      toast("error", err instanceof ApiError ? err.message : t("Teslim gönderilemedi."));
    } finally {
      setBusy(false);
    }
  }

  const locked = mine?.status === "APPROVED" || mine?.status === "REJECTED";
  return (
    <section className="card practical-card" aria-labelledby="pr-h">
      <div className="card-h">
        <h2 id="pr-h"><FlaskConical size={15} aria-hidden /> {block.title}</h2>
        <span className={left > 0 ? "badge badge-amber" : "badge badge-red"}><Clock size={12} aria-hidden /> {left > 0 ? fmtClock(left) : t("süre doldu")}</span>
      </div>
      <div className="card-b stack-sm">
        {mine && (
          <div className="row" style={{ flexWrap: "wrap" }}>
            <span className={`badge ${SUB_STATUS[mine.status][1]}`}>{t(SUB_STATUS[mine.status][0])}</span>
            {mine.late && <span className="badge">{t("geç")}</span>}
            {mine.score !== null && <span className="small mono">{t("{score} puan", { score: mine.score })}</span>}
          </div>
        )}
        {mine?.feedback && <div className="alert alert-info small" style={{ whiteSpace: "pre-wrap" }}>{mine.feedback}</div>}
        {locked ? (
          <p className="small muted" style={{ margin: 0 }}>{t("Bu teslim değerlendirildi. Ayrıntı:")}{" "}<Link href={`/tasks/${assignmentId}`}>{t("görev sayfası")}</Link></p>
        ) : (
          <form className="stack-sm" onSubmit={submit}>
            <label htmlFor="pr-text" className="small">{t("Sonuç / açıklama")}</label>
            <textarea id="pr-text" className="textarea" rows={4} maxLength={20000} required placeholder={t("Ne yaptın, ne buldun? Komut çıktısı veya ekran görüntüsü de ekleyebilirsin.")} value={text} onChange={(e) => setText(e.target.value)} />
            <label htmlFor="pr-files" className="small"><Paperclip size={13} aria-hidden />{" "}{t("Dosyalar (isteğe bağlı, en fazla 5)")}</label>
            <input id="pr-files" ref={fileRef} type="file" multiple className="input" accept={FILE_ACCEPT} />
            <button className="btn btn-primary btn-sm" disabled={busy || !text.trim()}>{busy ? t("Gönderiliyor…") : mine ? t("Teslimi güncelle") : t("Teslim et")}</button>
            {left === 0 && <p className="tiny faint" style={{ margin: 0 }}>{t("Süre doldu; teslimin geç olarak işaretlenir.")}</p>}
          </form>
        )}
      </div>
    </section>
  );
}

type StaffView = {
  id: string;
  title: string;
  status: string;
  dueAt: string | null;
  submissions: { id: string; status: keyof typeof SUB_STATUS; late: boolean; submittedAt: string; user: { displayName: string; username: string }; files: { id: string }[] }[];
};

// Eğitmen: hazırlık notları (yalnız eğitmene gelir) + teslim durumu (5 sn'de bir yenilenir).
export function HostPractical({ assignmentId, dueAt, block, skew, online }: { assignmentId: string | null; dueAt: number | null; block: PracticalBlock; skew: number; online: number }) {
  const tl = useT();
  const left = useCountdown(dueAt, skew);
  const [data, setData] = useState<StaffView | null>(null);

  useEffect(() => {
    if (!assignmentId) return;
    let stop = false;
    const tick = async () => {
      try {
        const d = await api<StaffView>(`/api/teach/tasks/${encodeURIComponent(assignmentId)}`);
        if (!stop) setData(d);
      } catch {
        /* geçici hata: bir sonraki turda tekrar */
      }
    };
    void tick();
    const t = setInterval(tick, 5000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [assignmentId]);

  const h = block.host;
  const subs = data?.submissions ?? [];
  const pending = subs.filter((s) => s.status === "SUBMITTED").length;
  return (
    <section className="card practical-card" aria-labelledby="hp-h">
      <div className="card-h">
        <h2 id="hp-h"><FlaskConical size={15} aria-hidden />{" "}{tl("Uygulama molası")}</h2>
        {dueAt && <span className={left > 0 ? "badge badge-amber" : "badge badge-red"}>{left > 0 ? fmtClock(left) : tl("süre doldu")}</span>}
      </div>
      <div className="card-b stack-sm">
        <p className="tiny faint" style={{ margin: 0 }}>{tl("Sistem VMware'i başlatmaz/yönetmez. Ortamı sen hazırlarsın; öğrenciler sonucu buradan teslim eder.")}</p>
        {(h.prepNotes || h.vms.length > 0 || h.snapshot) && (
          <div className="notes small stack-sm">
            {h.vms.length > 0 && <div><Server size={13} aria-hidden /> <strong>{tl("VM'ler:")}</strong> {h.vms.join(" · ")}</div>}
            {h.snapshot && <div><strong>{tl("Snapshot:")}</strong> {h.snapshot}</div>}
            {h.prepNotes && <div>{h.prepNotes}</div>}
          </div>
        )}
        {h.expected && (
          <details className="small">
            <summary>{tl("Beklenen sonuç (yalnız sen görürsün)")}</summary>
            <div className="notes" style={{ marginTop: 6 }}>{h.expected}</div>
          </details>
        )}
        {!assignmentId ? (
          <p className="small muted" style={{ margin: 0 }}><RefreshCw size={13} aria-hidden />{" "}{tl("Teslim görevi hazırlanıyor…")}</p>
        ) : (
          <>
            <div className="row small" style={{ flexWrap: "wrap" }}>
              <span className="badge badge-lime">{tl("{length} teslim", { length: subs.length })}</span>
              <span className="badge badge-amber">{tl("{pending} bekliyor", { pending })}</span>
              <span className="faint">{tl("{online} çevrimiçi", { online })}</span>
              <span style={{ flex: 1 }} />
              <Link className="btn btn-sm" href={`/teach/tasks/${assignmentId}`} target="_blank" rel="noopener">{tl("Değerlendir")}</Link>
            </div>
            {subs.length > 0 && (
              <ul className="list-tight" style={{ maxHeight: 200, overflow: "auto" }}>
                {subs.map((s) => (
                  <li key={s.id}>
                    <span style={{ flex: 1 }}>{s.user.displayName}{s.files.length > 0 && <span className="tiny faint">{" "}{tl("· {length} dosya", { length: s.files.length })}</span>}</span>
                    {s.late && <span className="badge">{tl("geç")}</span>}
                    <span className={`badge ${SUB_STATUS[s.status][1]}`}>{s.status === "SUBMITTED" ? tl("bekliyor") : tl(SUB_STATUS[s.status][0]).toLocaleLowerCase()}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </section>
  );
}
