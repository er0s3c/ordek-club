"use client";

import { useEffect, useRef } from "react";
import { useRive } from "@rive-app/react-canvas";
import { RuntimeLoader, Layout, Fit, Alignment } from "@rive-app/canvas";

// Both primary and compatibility WASM live on our origin. Never fall back to a CDN.
RuntimeLoader.setWasmUrl("/animations/runtime/rive.wasm");
RuntimeLoader.setWasmFallbackUrl("/animations/runtime/rive_fallback.wasm");
const layout = new Layout({ fit: Fit.Contain, alignment: Alignment.Center });

export default function RiveDuck({ pose, visible, onReady, onError, onPlayed }: { pose: string; visible: boolean; onReady: () => void; onError: () => void; onPlayed: () => void }) {
  const callbacks = useRef({ onReady, onError, onPlayed });
  const playedPoses = useRef(new Set<string>());
  useEffect(() => { callbacks.current = { onReady, onError, onPlayed }; }, [onReady, onError, onPlayed]);
  const { rive, RiveComponent } = useRive({
    src: "/animations/ordek-club.riv", stateMachine: `${pose}-state`, layout,
    autoplay: false, shouldDisableRiveListeners: true,
    onLoadError: event => { console.warn("[club] Rive maskot yüklenemedi; SVG gösteriliyor.", event.data); callbacks.current.onError(); },
  });
  useEffect(() => {
    if (!rive) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const play = () => {
      if (playedPoses.current.has(pose) || document.hidden || !visible) return;
      playedPoses.current.add(pose);
      rive.play(`${pose}-state`);
      callbacks.current.onReady();
      callbacks.current.onPlayed();
      timer = setTimeout(() => rive.pause(), 1100);
    };
    const visibility = () => { if (document.hidden || !visible) rive.pause(); else play(); };
    play();
    document.addEventListener("visibilitychange", visibility);
    return () => { if (timer) clearTimeout(timer); document.removeEventListener("visibilitychange", visibility); rive.pause(); };
  }, [rive, pose, visible]);
  return <div className="duck-mascot-canvas"><RiveComponent aria-hidden="true" tabIndex={-1} /></div>;
}
