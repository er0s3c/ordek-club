"use client";
// Canlı ders sinyalleri: yardım kuyruğu (bekleme süresi ve takılınan görevle), anonim anlama göstergesi ve söz sırası.
import { useEffect, useState } from "react";
import { Check, Gauge, Hand, LifeBuoy, Mic, Rabbit, RotateCcw, Turtle, X } from "lucide-react";
import type { ClientMessage, HelpView, ParticipantView, PulseStats } from "@/lib/live-protocol";
import { useT } from "@/i18n/client";
import type { T } from "@/i18n/translate";

type Send = (m: ClientMessage) => boolean;
const wait = (at: number, now: number, t: T) => { const m = Math.floor((now - at) / 60000); return m < 1 ? t("az önce") : t("{m} dk", { m }); };

function useNow(ms = 15_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return now;
}

export function HostSignals({ help, pulse, participants, send }: { help: HelpView[]; pulse: PulseStats | null; participants: ParticipantView[]; send: Send }) {
  const t = useT();
  const now = useNow();
  const queue = participants.filter((p) => p.handRaised).sort((a, b) => (a.handAt ?? 0) - (b.handAt ?? 0));
  const answered = pulse ? pulse.ok + pulse.slow + pulse.repeat : 0;
  const pct = (n: number) => (answered ? Math.round((n / answered) * 100) : 0);
  return (
    <>
      <section className="card" aria-labelledby="help-h">
        <div className="card-h"><h2 id="help-h"><LifeBuoy size={15} aria-hidden />{" "}{t("Yardım kuyruğu")}</h2>{help.length > 0 && <span className="badge badge-amber">{help.length}</span>}</div>
        <div className="card-b" style={{ maxHeight: 260, overflow: "auto" }}>
          {help.length === 0 ? <p className="muted small" style={{ margin: 0 }}>{t("Yardım bekleyen yok.")}</p> : (
            <ol className="list-tight">
              {help.map((h, i) => (
                <li key={h.id} style={{ alignItems: "flex-start" }}>
                  <span className="mono small">{i + 1}.</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong className="small">{h.displayName}</strong> <span className="tiny faint">{t("· {v0} bekliyor", { v0: wait(h.at, now, t) })}</span>
                    {h.taskRef && <div className="tiny">{t("Takıldığı yer: {taskRef}", { taskRef: h.taskRef })}</div>}
                    {h.note && <div className="tiny faint" style={{ whiteSpace: "pre-wrap" }}>{h.note}</div>}
                  </div>
                  <button className="btn btn-sm btn-ghost" onClick={() => send({ t: "help.resolve", id: h.id })} aria-label={t("{displayName} yardım edildi", { displayName: h.displayName })}><Check size={14} aria-hidden /></button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>
      <section className="card" aria-labelledby="pulse-h">
        <div className="card-h"><h2 id="pulse-h"><Gauge size={15} aria-hidden />{" "}{t("Anlama göstergesi")}</h2><span className="tiny faint">{t("{answered}/{v0} öğrenci · anonim", { answered, v0: pulse?.online ?? 0 })}</span></div>
        <div className="card-b stack-sm">
          {[[t("Anladım"), pulse?.ok ?? 0, "var(--ok)"], [t("Yavaşla"), pulse?.slow ?? 0, "var(--warn)"], ["Tekrar anlat", pulse?.repeat ?? 0, "var(--err)"]].map(([l, n, c]) => (
            <div key={l as string} className="dist"><span className="dist-label small">{l}</span><div className="bar"><span style={{ width: `${pct(n as number)}%`, background: c as string }} /></div><span className="tiny mono">{n as number} · %{pct(n as number)}</span></div>
          ))}
          <span className="tiny faint">{t("Slayt değişince sıfırlanır.")}</span>
        </div>
      </section>
      <section className="card" aria-labelledby="spk-h">
        <div className="card-h"><h2 id="spk-h"><Mic size={15} aria-hidden />{" "}{t("Söz sırası")}</h2>{queue.length > 0 && <span className="badge">{queue.length}</span>}</div>
        <div className="card-b stack-sm">
          {queue.length ? <ol className="small" style={{ margin: 0, paddingLeft: 18 }}>{queue.map((p) => <li key={p.userId}>{p.displayName} <span className="tiny faint">{p.handAt ? wait(p.handAt, now, t) : ""}</span></li>)}</ol> : <p className="muted small" style={{ margin: 0 }}>{t("El kaldıran yok.")}</p>}
          <div><button className="btn btn-sm" disabled={!queue.length} onClick={() => send({ t: "speaker.next" })}><Hand size={14} aria-hidden />{" "}{t("Sıradakine söz ver")}</button></div>
        </div>
      </section>
    </>
  );
}

export function StudentSignals({ helpYou, pulseYou, turnAt, send }: { helpYou: { pending: boolean; position: number | null }; pulseYou: "ok" | "slow" | "repeat" | null; turnAt: number | null; send: Send }) {
  const tl = useT();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [taskRef, setTaskRef] = useState("");
  const [turn, setTurn] = useState(false);
  useEffect(() => { if (turnAt && Date.now() - turnAt < 60_000) { setTurn(true); const t = setTimeout(() => setTurn(false), 20_000); return () => clearTimeout(t); } }, [turnAt]);
  const pulseBtn = (v: "ok" | "slow" | "repeat", label: string, Icon: typeof Rabbit) => (
    <button type="button" className="chip" aria-pressed={pulseYou === v} onClick={() => send({ t: "pulse", value: pulseYou === v ? null : v })}><Icon size={13} aria-hidden /> {label}</button>
  );
  return (
    <div className="live-signals stack-sm">
      {turn && <div className="alert alert-ok" role="status"><Mic size={16} aria-hidden />{" "}{tl("Söz sende! Eğitmen seni dinliyor.")}</div>}
      <div className="row" role="group" aria-label={tl("Anlama göstergesi (anonim)")}>
        <span className="tiny faint">{tl("Bu slayt:")}</span>
        {pulseBtn("ok", tl("Anladım"), Rabbit)}
        {pulseBtn("slow", tl("Yavaşla"), Turtle)}
        {pulseBtn("repeat", "Tekrar", RotateCcw)}
      </div>
      {helpYou.pending ? (
        <div className="row"><span className="pill pill-warn"><LifeBuoy size={13} aria-hidden />{" "}{tl("Yardım sırasındasın · {position}. sıra", { position: helpYou.position })}</span><button type="button" className="btn btn-ghost btn-sm" onClick={() => send({ t: "help.cancel" })}><X size={13} aria-hidden />{" "}{tl("Vazgeç")}</button></div>
      ) : open ? (
        <div className="stack-sm card card-b">
          <input className="input" maxLength={80} aria-label={tl("Takıldığın görev")} value={taskRef} onChange={(e) => setTaskRef(e.target.value)} placeholder={tl("Takıldığın görev/adım (örn. 3. adım: ping)")} />
          <input className="input" maxLength={200} aria-label={tl("Kısa not")} value={note} onChange={(e) => setNote(e.target.value)} placeholder={tl("Ne oldu? (isteğe bağlı)")} />
          <div className="row"><button type="button" className="btn btn-sm btn-primary" onClick={() => { if (send({ t: "help", note, taskRef })) { setOpen(false); setNote(""); setTaskRef(""); } }}><LifeBuoy size={14} aria-hidden />{" "}{tl("Sıraya gir")}</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>{tl("Vazgeç")}</button></div>
        </div>
      ) : <div><button type="button" className="btn btn-sm" onClick={() => setOpen(true)}><LifeBuoy size={14} aria-hidden />{" "}{tl("Yardım gerekiyor")}</button></div>}
    </div>
  );
}
