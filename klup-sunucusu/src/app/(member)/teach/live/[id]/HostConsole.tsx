"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ChevronLeft, ChevronRight, Pause, Play, Hand, MessageSquareText, Megaphone, MonitorUp, Square, Users, Check, Unlock, Lock, Timer,
} from "lucide-react";
import { useToast } from "@/components/providers";
import { CopyButton } from "@/components/ui/CopyButton";
import { SlideView } from "@/components/presentation/SlideView";
import { useLiveSession } from "@/hooks/useLiveSession";
import { api } from "@/lib/api-client";
import { SPEEDS, type ControlAction } from "@/lib/live-protocol";
import type { ClientDeck } from "@/lib/deck-schema";

const STATUS_TEXT = { connecting: "bağlanıyor", open: "bağlı", reconnecting: "yeniden bağlanıyor", ended: "bitti", error: "hata" };
const mins = (ms: number) => `${Math.round(ms / 60000)} dk`;

export function HostConsole({ sessionId, code, joinUrl, qr, deck }: { sessionId: string; code: string; joinUrl: string; qr: string; deck: ClientDeck }) {
  const live = useLiveSession(code);
  const toast = useToast();
  const router = useRouter();
  const [announce, setAnnounce] = useState("");
  const [ending, setEnding] = useState(false);
  const { state, send } = live;
  const slide = state ? deck.slides[state.slide] : undefined;
  const nextSlide = state ? deck.slides[state.slide + 1] : undefined;
  const control = (c: ControlAction) => {
    if (!send({ t: "control", c })) toast("error", "Bağlantı yok; yeniden bağlanılıyor…");
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
    if (!window.confirm("Canlı ders bitirilsin mi? Tüm öğrencilerin bağlantısı kapanır.")) return;
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
          <div className="eyebrow">Canlı ders · <span className="conn" data-status={live.status}>{STATUS_TEXT[live.status]}</span></div>
          <h1 className="page-title">{deck.title}</h1>
        </div>
        <div className="row">
          <a className="btn" href={`/live/${code}?present=1`} target="_blank" rel="noopener"><MonitorUp size={16} aria-hidden /> Projeksiyon ekranı</a>
          <button className="btn btn-danger" onClick={end} disabled={ending}><Square size={15} aria-hidden /> Dersi bitir</button>
        </div>
      </div>

      <div className="console">
        <div className="stack">
          <div className="stage-wrap">
            {slide && state ? <SlideView slide={slide} step={state.step} speed={state.speed} stepKey={live.stateKey} /> : <div className="stage skeleton" />}
            {state?.paused && <div className="stage-overlay"><div><h2>Duraklatıldı</h2><p className="muted">Öğrenciler mola ekranını görüyor.</p></div></div>}
          </div>

          <div className="console-controls">
            <button className="btn" onClick={() => control({ action: "prev" })} aria-label="Önceki adım"><ChevronLeft size={18} aria-hidden /></button>
            <button className="btn btn-primary" onClick={() => control({ action: "next" })} aria-label="Sonraki adım"><ChevronRight size={18} aria-hidden /> İleri</button>
            <span className="small mono muted">
              {state ? `Slayt ${state.slide + 1}/${deck.slides.length} · adım ${state.step + 1}/${slide?.steps ?? 1}` : "—"}
            </span>
            <span style={{ flex: 1 }} />
            <button className="btn" aria-pressed={state?.autoplay ?? false} onClick={() => control({ action: "autoplay", value: !state?.autoplay })}>
              <Timer size={16} aria-hidden /> {state?.autoplay ? "Otomatik: açık" : "Otomatik oynat"}
            </button>
            <div className="seg" role="group" aria-label="Animasyon hızı">
              {SPEEDS.map((sp) => (
                <button key={sp} aria-pressed={state?.speed === sp} onClick={() => control({ action: "speed", value: sp })}>{sp}×</button>
              ))}
            </div>
            <button className="btn" aria-pressed={state?.paused ?? false} onClick={() => control({ action: "pause", value: !state?.paused })}>
              {state?.paused ? <><Play size={16} aria-hidden /> Devam et</> : <><Pause size={16} aria-hidden /> Duraklat</>}
            </button>
            <button className="btn" aria-pressed={state?.freeNav ?? false} onClick={() => control({ action: "freeNav", value: !state?.freeNav })} title="Öğrencilerin slaytlarda kendi başına gezinmesine izin ver">
              {state?.freeNav ? <><Unlock size={16} aria-hidden /> Serbest gezinme açık</> : <><Lock size={16} aria-hidden /> Akış sende</>}
            </button>
          </div>

          <div className="slide-strip" role="list" aria-label="Slaytlar">
            {deck.slides.map((s, i) => (
              <button key={s.id} role="listitem" className="slide-chip" aria-current={state?.slide === i} onClick={() => control({ action: "goto", slide: i, step: 0 })}>
                <div className="n">{i + 1}</div>
                <div>{s.title}</div>
              </button>
            ))}
          </div>

          <div className="grid-2">
            <section className="card">
              <div className="card-h"><h2>Eğitmen notları</h2><span className="tiny faint">yalnızca sen görürsün</span></div>
              <div className="card-b"><div className="notes">{slide?.notes || "— bu slayt için not yok —"}</div></div>
            </section>
            <section className="card">
              <div className="card-h"><h2>Sıradaki slayt</h2></div>
              <div className="card-b mini-stage">{nextSlide ? <SlideView slide={nextSlide} step={nextSlide.steps - 1} /> : <p className="muted">Son slayttasın.</p>}</div>
            </section>
          </div>
        </div>

        <aside className="console-side">
          <section className="card">
            <div className="card-b stack-sm" style={{ alignItems: "center", textAlign: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="qr" src={qr} alt={`Katılım QR kodu: ${joinUrl}`} />
              <div className="code-big" aria-label={`Oturum kodu ${code.split("").join(" ")}`}>{code}</div>
              <div className="tiny muted mono" style={{ wordBreak: "break-all" }}>{joinUrl}</div>
              <CopyButton value={joinUrl} />
            </div>
          </section>

          <section className="card" aria-labelledby="ppl-h">
            <div className="card-h"><h2 id="ppl-h"><Users size={15} aria-hidden /> Katılımcılar</h2><span className="badge badge-lime">{live.online} çevrimiçi</span></div>
            <div className="card-b" style={{ maxHeight: 260, overflow: "auto" }}>
              {live.participants.length === 0 ? <p className="muted small" style={{ margin: 0 }}>Henüz katılan yok. Kodu veya QR&apos;ı paylaş.</p> : (
                <ul className="list-tight">
                  {live.participants.map((p) => (
                    <li key={p.userId}>
                      <span className={p.online ? "dot on" : "dot"} aria-label={p.online ? "çevrimiçi" : "çevrimdışı"} />
                      <span style={{ flex: 1 }}>{p.displayName}<span className="tiny faint"> · {mins(p.connectedMs)}</span></span>
                      {p.handRaised && (
                        <button className="btn btn-sm" onClick={() => send({ t: "lowerHand", userId: p.userId })} aria-label={`${p.displayName} elini indir`}>
                          <Hand size={14} color="var(--amber)" aria-hidden /> indir
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {hands.length > 0 && <div className="alert alert-warn small"><Hand size={16} aria-hidden /> {hands.length} kişi el kaldırdı</div>}

          <section className="card" aria-labelledby="q-h">
            <div className="card-h"><h2 id="q-h"><MessageSquareText size={15} aria-hidden /> Sorular</h2>{openQ.length > 0 && <span className="badge badge-amber">{openQ.length}</span>}</div>
            <div className="card-b" style={{ maxHeight: 260, overflow: "auto" }}>
              {live.questions.length === 0 ? <p className="muted small" style={{ margin: 0 }}>Henüz soru yok.</p> : (
                <ul className="list-tight">
                  {[...live.questions].reverse().map((q) => (
                    <li key={q.id} style={{ alignItems: "flex-start", opacity: q.resolved ? 0.5 : 1 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ whiteSpace: "pre-wrap" }}>{q.text}</div>
                        <div className="tiny faint">{q.displayName}</div>
                      </div>
                      {!q.resolved && (
                        <button className="btn btn-sm btn-ghost" onClick={() => send({ t: "resolve", id: q.id })} aria-label="Yanıtlandı olarak işaretle"><Check size={14} aria-hidden /></button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="card" aria-labelledby="ann-h">
            <div className="card-h"><h2 id="ann-h"><Megaphone size={15} aria-hidden /> Duyuru gönder</h2></div>
            <form
              className="card-b stack-sm"
              onSubmit={(e) => {
                e.preventDefault();
                const text = announce.trim();
                if (!text) return;
                if (send({ t: "announce", text })) {
                  setAnnounce("");
                  toast("ok", "Duyuru tüm katılımcılara gönderildi.");
                }
              }}
            >
              <label htmlFor="ann" className="sr-only">Duyuru metni</label>
              <input id="ann" className="input" maxLength={300} placeholder="ör. 5 dakika mola, VM'leri açın" value={announce} onChange={(e) => setAnnounce(e.target.value)} />
              <button className="btn btn-sm" disabled={!announce.trim()}>Herkese gönder</button>
            </form>
          </section>
        </aside>
      </div>
    </div>
  );
}
