"use client";
// Motion Canvas sahnesini (src/animations/scenes.ts) çekirdek Player + Stage ile tuvalde oynatır.
// Azaltılmış harekette sahnenin son karesi durağan gösterilir.
import { useEffect, useRef, useState } from "react";
import { SCENE_META, type SceneId } from "@/animations/scenes";
import { useT } from "@/i18n/client";

export function MotionScene({ id, reducedMotion, playing = true }: { id: SceneId; reducedMotion: boolean; playing?: boolean }) {
  const t = useT();
  const host = useRef<HTMLDivElement>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    let disposed = false;
    let stop = () => {};
    void (async () => {
      try {
        // Sıra önemli: 2d paketinin kökü önce code/ klasörünü yükler ve webpack'te code ↔ components döngüsü
        // "codeSignal of undefined" hatası verir. Bileşenler önce, sahne yardımcıları sonra yüklenir.
        const core = await import("@motion-canvas/core");
        const components = await import("@motion-canvas/2d/lib/components");
        const scenes2d = await import("@motion-canvas/2d/lib/scenes");
        const { buildScene } = await import("@/animations/scenes");
        if (disposed || !host.current) return;
        const scene = buildScene(id, { ...core, ...components, ...scenes2d } as unknown as Parameters<typeof buildScene>[1]);
        const project = core.bootstrap(id, { core: "3.17.2", two: "3.17.2", ui: null, vitePlugin: null }, [core.DefaultPlugin()], { scenes: [scene] } as never, new core.MetaFile("project", false), new core.MetaFile("settings", false));
        const size = new core.Vector2(1920, 1080);
        const player = new core.Player(project, { size, fps: 30, resolutionScale: 1, background: "#141018" } as never);
        const stage = new core.Stage();
        stage.configure({ size, resolutionScale: 1, background: "#141018" });
        const canvas = stage.finalBuffer;
        canvas.className = "motion-scene-canvas";
        canvas.setAttribute("role", "img");
        canvas.setAttribute("aria-label", SCENE_META[id].title);
        host.current.replaceChildren(canvas);
        const unsub = player.onRender.subscribe(async () => { await stage.render(player.playback.currentScene!, player.playback.previousScene); });
        player.activate();
        player.toggleLoop(!reducedMotion);
        if (reducedMotion) player.requestSeek(Math.round(SCENE_META[id].seconds * 30) - 1);
        else player.togglePlayback(playing);
        stop = () => { unsub(); player.deactivate(); };
      } catch (e) {
        if (!disposed) setErr((e as Error).message);
      }
    })();
    return () => { disposed = true; stop(); };
  }, [id, reducedMotion, playing]);
  return (
    <figure className="motion-scene">
      <div ref={host} className="motion-scene-host" />
      <figcaption className="anim-note"><span className="anim-step mono">{SCENE_META[id].title}</span><span>{err ? t("Sahne yüklenemedi: {err}", { err }) : SCENE_META[id].summary}</span></figcaption>
    </figure>
  );
}
