"use client";

import { OperationPanel } from "@/components/live/OperationPanel";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronLeft, ChevronRight, Pause, Play, Hand, MessageSquareText, Megaphone, MonitorUp, Square, Users, Check, Unlock, Lock, Timer,
} from "lucide-react";
import { useToast } from "@/components/providers";
import { CopyButton } from "@/components/ui/CopyButton";
import { SlideView } from "@/components/presentation/SlideView";
import { useLiveSession } from "@/hooks/useLiveSession";
import { HostPollPanel } from "@/components/live/Poll";
import { HostSignals } from "@/components/live/ClassroomSignals";
import { HostPractical } from "@/components/live/Practical";
import { api } from "@/lib/api-client";
import { SPEEDS, type ControlAction } from "@/lib/live-protocol";
import type { ClientDeck } from "@/lib/deck-schema";
import { useT } from "@/i18n/client";

const STATUS_TEXT = { connecting: "bağlanıyor", open: "bağlı", reconnecting: "yeniden bağlanıyor", ended: "bitti", error: "hata" };
const mins = (ms: number) => `${Math.round(ms / 60000)} dk`;

export function HostConsole({ sessionId, code, joinUrl, qr, deck, allowExit = false }: { sessionId: string; code: string; joinUrl: string; qr: string; deck: ClientDeck; allowExit?: boolean }) {
  const t = useT();
  const live = useLiveSession(code);
  const toast = useToast();
  const router = useRouter();
  const [announce, setAnnounce] = useState("");
  const [ending, setEnding] = useState(false);
  const { state, send } = live;
  const slide = state ? deck.slides[state.slide] : undefined;
  const nextSlide = state ? deck.slides[state.slide + 1] : undefined;
  const practical = slide?.blocks.find((b) => b.type === "practical");
  const practicalInfo = state ? state.practicals?.[String(state.slide)] : undefined;
  const control = (c: ControlAction) => {
    if (!send({ t: "control", c })) toast("error", t("Bağlantı yok; yeniden bağlanılıyor…"));
  };

  // Klavye: → / Boşluk / PageDown ileri, ← / PageUp geri
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); control({ action: "next" }); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); control({ action: "prev" }); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [send]);

  useEffect(() => {
    if (live.error) {
      toast("error", live.error);
      live.clearError();
    }
  }, [live.error, live, toast]);

  useEffect(() => {
    if (live.status === "ended") router.replace(`/teach/sessions/${sessionId}`);
  }, [live.status, router, sessionId]);

  async function end() {
    if (!window.confirm(t("Canlı ders bitirilsin mi? Tüm öğrencilerin bağlantısı kapanır."))) return;
    setEnding(true);
    try {
      await api(`/api/live/${encodeURIComponent(sessionId)}/end`, { method: "POST" });
      router.replace(`/teach/sessions/${sessionId}`);
    } catch (e) {
      toast("error", (e as Error).message);
      setEnding(false);
    }
  }

  const hands = live.participants.filter((p) => p.handRaised);
  const openQ = live.questions.filter((q) => !q.resolved);

  return (
    <div className="stack fade-up">
      <div className="row-between">
        <div>
          <div className="eyebrow">{t("Canlı ders ·")}{" "}<span className="conn" data-status={live.status}>{t(STATUS_TEXT[live.status])}</span></div>
          <h1 className="page-title">{deck.title}</h1>
        </div>
        <div className="row">
          <a className="btn" href={`/live/${code}?present=1`} target="_blank" rel="noopener"><MonitorUp size={16} aria-hidden />{" "}{t("Projeksiyon ekranı")}</a>
          <button className="btn btn-danger" onClick={end} disabled={ending}><Square size={15} aria-hidden />{" "}{t("Dersi bitir")}</button>
        </div>
      </div>

      <div className="console">
        <div className="stack">
          <div className="stage-wrap">
            {slide && state ? <SlideView slide={slide} step={state.step} speed={state.speed} stepKey={live.stateKey} /> : <div className="stage skeleton" />}
            {state?.paused && <div className="stage-overlay"><div><h2>{t("Duraklatıldı")}</h2><p className="muted">{t("Öğrenciler mola ekranını görüyor.")}</p></div></div>}
          </div>

          <div className="console-controls">
            <button className="btn" onClick={() => control({ action: "prev" })} aria-label={t("Önceki adım")}><ChevronLeft size={18} aria-hidden /></button>
            <button className="btn btn-primary" onClick={() => control({ action: "next" })} aria-label={t("Sonraki adım")}><ChevronRight size={18} aria-hidden />{" "}{t("İleri")}</button>
            <span className="small mono muted">
              {state ? t("Slayt {v0}/{length} · adım {v1}/{v2}", { v0: state.slide + 1, length: deck.slides.length, v1: state.step + 1, v2: slide?.steps ?? 1 }) : "—"}
            </span>
            <span style={{ flex: 1 }} />
            <button className="btn" aria-pressed={state?.autoplay ?? false} onClick={() => control({ action: "autoplay", value: !state?.autoplay })}>
              <Timer size={16} aria-hidden /> {state?.autoplay ? t("Otomatik: açık") : t("Otomatik oynat")}
            </button>
            <div className="seg" role="group" aria-label={t("Animasyon hızı")}>
              {SPEEDS.map((sp) => (
                <button key={sp} aria-pressed={state?.speed === sp} onClick={() => control({ action: "speed", value: sp })}>{sp}×</button>
              ))}
            </div>
            <button className="btn" aria-pressed={state?.paused ?? false} onClick={() => control({ action: "pause", value: !state?.paused })}>
              {state?.paused ? <><Play size={16} aria-hidden />{" "}{t("Devam et")}</> : <><Pause size={16} aria-hidden />{" "}{t("Duraklat")}</>}
            </button>
            <button className="btn" aria-pressed={state?.freeNav ?? false} onClick={() => control({ action: "freeNav", value: !state?.freeNav })} title={t("Öğrencilerin slaytlarda kendi başına gezinmesine izin ver")}>
              {state?.freeNav ? <><Unlock size={16} aria-hidden />{" "}{t("Serbest gezinme açık")}</> : <><Lock size={16} aria-hidden />{" "}{t("Akış sende")}</>}
            </button>
          </div>

          <div className="slide-strip" role="list" aria-label={t("Slaytlar")}>
            {deck.slides.map((s, i) => (
              <button key={s.id} role="listitem" className="slide-chip" aria-current={state?.slide === i} onClick={() => control({ action: "goto", slide: i, step: 0 })}>
                <div className="n">{i + 1}</div>
                <div>{s.title}</div>
              </button>
            ))}
          </div>

          {practical?.type === "practical" && (
            <HostPractical assignmentId={practicalInfo?.assignmentId ?? null} dueAt={practicalInfo?.dueAt ?? null} block={practical} skew={live.clockSkew} online={live.online} />
          )}

          <OperationPanel code={code} revision={live.operationRevision} />
          <div className="grid-2">
            <section className="card">
              <div className="card-h"><h2>{t("Eğitmen notları")}</h2><span className="tiny faint">{t("yalnızca sen görürsün")}</span></div>
              <div className="card-b"><div className="notes">{slide?.notes || t("— bu slayt için not yok —")}</div></div>
            </section>
            <section className="card">
              <div className="card-h"><h2>{t("Sıradaki slayt")}</h2></div>
              <div className="card-b mini-stage">{nextSlide ? <SlideView slide={nextSlide} step={nextSlide.steps - 1} /> : <p className="muted">{t("Son slayttasın.")}</p>}</div>
            </section>
          </div>
        </div>

        <aside className="console-side">
          <section className="card">
            <div className="card-b stack-sm" style={{ alignItems: "center", textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="qr" src={qr} alt={t("Katılım QR kodu: {joinUrl}", { joinUrl })} />
              <div className="code-big" aria-label={t("Oturum kodu {v0}", { v0: code.split("").join(" ") })}>{code}</div>
              <div className="tiny muted mono" style={{ wordBreak: "break-all" }}>{joinUrl}</div>
              <CopyButton value={joinUrl} />
            </div>
          </section>

          <section className="card" aria-labelledby="ppl-h">
            <div className="card-h"><h2 id="ppl-h"><Users size={15} aria-hidden />{" "}{t("Katılımcılar")}</h2><span className="badge badge-lime">{t("{online} çevrimiçi", { online: live.online })}</span></div>
            <div className="card-b" style={{ maxHeight: 260, overflow: "auto" }}>
              {live.participants.length === 0 ? <p className="muted small" style={{ margin: 0 }}>{t("Henüz katılan yok. Kodu veya QR'ı paylaş.")}</p> : (
                <ul className="list-tight">
                  {live.participants.map((p) => (
                    <li key={p.userId}>
                      <span className={p.online ? "dot on" : "dot"} aria-label={p.online ? t("çevrimiçi") : t("çevrimdışı")} />
                      <span style={{ flex: 1 }}>{p.displayName}<span className="tiny faint"> · {mins(p.connectedMs)}</span></span>
                      {p.handRaised && (
                        <button className="btn btn-sm" onClick={() => send({ t: "lowerHand", userId: p.userId })} aria-label={t("{displayName} elini indir", { displayName: p.displayName })}>
                          <Hand size={14} color="var(--amber)" aria-hidden />{" "}{t("indir")}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <HostSignals help={live.help} pulse={live.pulse} participants={live.participants} send={send} />

          <HostPollPanel allowExit={allowExit} poll={live.poll} stats={live.pollStats} skew={live.clockSkew} send={send} />

          {hands.length > 0 && <div className="alert alert-warn small"><Hand size={16} aria-hidden />{" "}{t("{length} kişi el kaldırdı", { length: hands.length })}</div>}

          <section className="card" aria-labelledby="q-h">
            <div className="card-h"><h2 id="q-h"><MessageSquareText size={15} aria-hidden />{" "}{t("Sorular")}</h2>{openQ.length > 0 && <span className="badge badge-amber">{openQ.length}</span>}</div>
            <div className="card-b" style={{ maxHeight: 260, overflow: "auto" }}>
              {live.questions.length === 0 ? <p className="muted small" style={{ margin: 0 }}>{t("Henüz soru yok.")}</p> : (
                <ul className="list-tight">
                  {[...live.questions].reverse().map((q) => (
                    <li key={q.id} style={{ alignItems: "flex-start", opacity: q.resolved ? 0.5 : 1 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ whiteSpace: "pre-wrap" }}>{q.text}</div>
                        <div className="tiny faint">{q.displayName}</div>
                      </div>
                      {!q.resolved && (
                        <button className="btn btn-sm btn-ghost" onClick={() => send({ t: "resolve", id: q.id })} aria-label={t("Yanıtlandı olarak işaretle")}><Check size={14} aria-hidden /></button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="card" aria-labelledby="ann-h">
            <div className="card-h"><h2 id="ann-h"><Megaphone size={15} aria-hidden />{" "}{t("Duyuru gönder")}</h2></div>
            <form
              className="card-b stack-sm"
              onSubmit={(e) => {
                e.preventDefault();
                const text = announce.trim();
                if (!text) return;
                if (send({ t: "announce", text })) {
                  setAnnounce("");
                  toast("ok", t("Duyuru tüm katılımcılara gönderildi."));
                }
              }}
            >
              <label htmlFor="ann" className="sr-only">{t("Duyuru metni")}</label>
              <input id="ann" className="input" maxLength={300} placeholder={t("ör. 5 dakika mola, VM'leri açın")} value={announce} onChange={(e) => setAnnounce(e.target.value)} />
              <button className="btn btn-sm" disabled={!announce.trim()}>{t("Herkese gönder")}</button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
