"use client";
// Lottie oynatıcıları: slaytlarda dotLottie (tuval, WASM yerelden), küçük arayüz anlarında lottie-web (SVG).
// Azaltılmış harekette son kare durağan gösterilir.
import { useEffect, useRef } from "react";
import { LOTTIE, type LottieId } from "@/animations/lottie";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function DotLottieView({ id, reducedMotion, loop = true, size = 320 }: { id: LottieId; reducedMotion: boolean; loop?: boolean; size?: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let player: { destroy: () => void; setFrame: (f: number) => void; totalFrames: number } | null = null;
    let live = true;
    void import("@lottiefiles/dotlottie-web").then(({ DotLottie }) => {
      if (!live || !canvas.current) return;
      DotLottie.setWasmUrl("/vendor/dotlottie/dotlottie-player.wasm");
      const p = new DotLottie({ canvas: canvas.current, data: JSON.stringify(LOTTIE[id].data), autoplay: !reducedMotion, loop: loop && !reducedMotion });
      if (reducedMotion) p.addEventListener("load", () => p.setFrame(Math.max(0, p.totalFrames - 1)));
      player = p;
    });
    return () => { live = false; player?.destroy(); };
  }, [id, reducedMotion, loop]);
  return <canvas ref={canvas} width={size} height={size} className="lottie-canvas" role="img" aria-label={LOTTIE[id].title} />;
}

export function LottieSvg({ id, reducedMotion, loop = false, size = 96 }: { id: LottieId; reducedMotion: boolean; loop?: boolean; size?: number }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let a: { destroy: () => void; goToAndStop: (f: number, isFrame?: boolean) => void; totalFrames: number } | null = null;
    let live = true;
    void import("lottie-web/build/player/lottie_light").then(({ default: lottie }) => {
      if (!live || !host.current) return;
      // Lottie verisi oynatıcı tarafından değiştirildiği için kopyası verilir.
      const anim = lottie.loadAnimation({ container: host.current, renderer: "svg", loop: loop && !reducedMotion, autoplay: !reducedMotion, animationData: structuredClone(LOTTIE[id].data) });
      if (reducedMotion) anim.addEventListener("DOMLoaded", () => anim.goToAndStop(anim.totalFrames - 1, true));
      a = anim;
    });
    return () => { live = false; a?.destroy(); };
  }, [id, reducedMotion, loop]);
  return <div ref={host} className="lottie-svg" style={{ width: size, height: size }} role="img" aria-label={LOTTIE[id].title} />;
}

// Sunucu bileşenlerinden kullanılabilen küçük başarı onayı (hareket tercihi istemcide okunur).
export function SuccessCheck({ size = 28 }: { size?: number }) {
  const reducedMotion = useReducedMotion();
  return <LottieSvg id="check-draw" reducedMotion={reducedMotion} size={size} />;
}
