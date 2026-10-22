"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Hand, Maximize2, Megaphone, MessageSquareText, Radio, Users, X, Coffee } from "lucide-react";
import { useToast } from "@/components/providers";
import { SlideView } from "@/components/presentation/SlideView";
import { nextPos, prevPos, type Position } from "@/components/presentation/DeckPlayer";
import { useLiveSession } from "@/hooks/useLiveSession";
import type { ClientDeck } from "@/lib/deck-schema";

const STATUS_TEXT = { connecting: "Bağlanıyor…", open: "Canlı", reconnecting: "Yeniden bağlanıyor…", ended: "Ders bitti", error: "Bağlantı hatası" };

export function LiveViewer({ code, title, deck, present }: { code: string; title: string; deck: ClientDeck; present: boolean }) {
  const live = useLiveSession(code);
  const toast = useToast();
  const shell = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [question, setQuestion] = useState("");
  // Serbest gezinmede öğrencinin yerel konumu (null → canlı akışı izle)
  const [local, setLocal] = useState<Position | null>(null);
  const [localKey, setLocalKey] = useState(0);
  const { state } = live;

  // Eğitmen serbest gezinmeyi kapatınca öğrenci canlı akışa döner.
  useEffect(() => {
    if (state && !state.freeNav) setLocal(null);
  }, [state]);

  useEffect(() => {
    if (live.error) {
      toast("error", live.error);
      live.clearError();
    }
  }, [live.error, live, toast]);

  // Duyuru 12 sn sonra kendiliğinden kapanır
  useEffect(() => {
    if (!live.announcement) return;
    const t = setTimeout(live.dismissAnnouncement, 12_000);
    return () => clearTimeout(t);
  }, [live.announcement, live.dismissAnnouncement]);

  const following = local === null;
  const pos: Position | null = following ? (state ? { slide: state.slide, step: state.step } : null) : local;
  const slide = pos ? deck.slides[Math.min(pos.slide, deck.slides.length - 1)] : undefined;

  useEffect(() => {
    if (!state?.freeNav) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const base = local ?? (state ? { slide: state.slide, step: state.step } : null);
      if (!base) return;
      if (e.key === "ArrowRight") { setLocal(nextPos(deck, base)); setLocalKey((k) => k + 1); }
      if (e.key === "ArrowLeft") { setLocal(prevPos(deck, base)); setLocalKey((k) => k + 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, local, deck]);

  if (live.status === "ended") {
    return (
      <div className="auth-wrap">
        <div className="card auth-card"><div className="card-b stack" style={{ textAlign: "center", alignItems: "center" }}>
          <Radio size={32} color="var(--lime)" aria-hidden />
          <h1 className="page-title">Ders sona erdi</h1>
          <p className="muted">Katıldığın için teşekkürler! Katılımın kaydedildi.</p>
          <Link className="btn btn-primary" href="/dashboard">Ana sayfaya dön</Link>
        </div></div>
      </div>
    );
  }

  return (
    <div ref={shell} className={`live-shell${present ? " live-present" : ""}`}>
      <header className="live-top">
        <div className="row">
          <Link href="/live" className="small" aria-label="Canlı ders sayfasına dön">←</Link>
          <strong>{title}</strong>
          <span className="conn" data-status={live.status} role="status">{STATUS_TEXT[live.status]}</span>
        </div>
        <div className="row small muted">
          <Users size={15} aria-hidden /> {live.online}
          <span className="mono">{code}</span>
        </div>
      </header>

      {live.announcement && (
        <div className="announce-banner" role="alert">
          <Megaphone size={18} aria-hidden />
          <span style={{ flex: 1 }}>{live.announcement.text}</span>
          <button className="btn btn-ghost btn-sm" onClick={live.dismissAnnouncement} aria-label="Duyuruyu kapat"><X size={14} aria-hidden /></button>
        </div>
      )}

      <main className="live-main">
        <div className="stage-wrap" style={{ width: "100%", display: "grid", placeItems: "center" }}>
          {slide && pos && state ? (
            <SlideView slide={slide} step={pos.step} speed={state.speed} stepKey={following ? live.stateKey : `l${localKey}`} />
          ) : (
            <div className="stage skeleton" aria-busy="true" aria-label="Ders yükleniyor" />
          )}
          {state?.paused && following && (
            <div className="stage-overlay"><div className="stack-sm" style={{ alignItems: "center" }}><Coffee size={34} color="var(--lime)" aria-hidden /><h2>Kısa bir ara</h2><p className="muted">Eğitmen dersi duraklattı. Ekran kendiliğinden devam edecek.</p></div></div>
          )}
          {live.status === "reconnecting" && (
            <div className="stage-overlay" style={{ background: "rgba(10,12,9,.55)" }}><div className="stack-sm" style={{ alignItems: "center" }}><span className="spinner" aria-hidden /><span>Bağlantı koptu, yeniden bağlanılıyor…</span></div></div>
          )}
        </div>
      </main>

      <footer className="live-bottom">
        {state?.freeNav && (
          <>
            <button className="btn btn-sm" onClick={() => { const b = local ?? { slide: state.slide, step: state.step }; setLocal(prevPos(deck, b)); setLocalKey((k) => k + 1); }} aria-label="Önceki"><ChevronLeft size={16} aria-hidden /></button>
            <button className="btn btn-sm" onClick={() => { const b = local ?? { slide: state.slide, step: state.step }; setLocal(nextPos(deck, b)); setLocalKey((k) => k + 1); }} aria-label="Sonraki"><ChevronRight size={16} aria-hidden /></button>
            {!following && <button className="btn btn-sm btn-primary" onClick={() => setLocal(null)}>Canlıya dön</button>}
            <span className="tiny faint">Serbest gezinme açık</span>
          </>
        )}
        <span className="small mono muted">{pos ? `${pos.slide + 1}/${deck.slides.length}` : ""}</span>
        <button className="btn btn-sm" aria-pressed={live.handRaised} onClick={() => live.send({ t: "hand", raised: !live.handRaised })} disabled={live.status !== "open"}>
          <Hand size={15} color={live.handRaised ? "var(--amber)" : undefined} aria-hidden /> {live.handRaised ? "Elini indir" : "El kaldır"}
        </button>
        <button className="btn btn-sm" onClick={() => dialog.current?.showModal()} disabled={live.status !== "open"}>
          <MessageSquareText size={15} aria-hidden /> Soru sor
        </button>
        <button className="btn btn-sm btn-ghost" onClick={() => shell.current?.requestFullscreen?.()} aria-label="Tam ekran"><Maximize2 size={15} aria-hidden /></button>
      </footer>

      <dialog ref={dialog} className="modal" aria-labelledby="q-title">
        <form
          method="dialog"
          className="card-b stack"
          onSubmit={(e) => {
            const text = question.trim();
            if (!text) return e.preventDefault();
            if (live.send({ t: "question", text })) {
              setQuestion("");
              toast("ok", "Sorun eğitmene iletildi.");
            } else {
              e.preventDefault();
              toast("error", "Bağlantı yok, biraz sonra tekrar dene.");
            }
          }}
        >
          <h2 id="q-title" style={{ fontSize: 17 }}>Eğitmene soru sor</h2>
          <p className="small muted" style={{ margin: 0 }}>Sorunu yalnızca eğitmen görür.</p>
          <label htmlFor="q" className="sr-only">Soru</label>
          <textarea id="q" className="textarea" maxLength={500} value={question} onChange={(e) => setQuestion(e.target.value)} autoFocus />
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={() => dialog.current?.close()}>Vazgeç</button>
            <button className="btn btn-primary" disabled={!question.trim()}>Gönder</button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
