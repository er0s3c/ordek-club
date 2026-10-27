"use client";
// Terminal bloğunu gerçekçi bir terminal kaydına çevirir: komutlar harf harf yazılır, çıktı ardından gelir.
// Kayıt (asciicast v2) bellekte üretilir ve asciinema-player ile oynatılır; dış dosya ya da ağ isteği yok.
import { useEffect, useRef } from "react";
import "asciinema-player/dist/bundle/asciinema-player.css";
import { useT } from "@/i18n/client";

export type CastLine = { cmd?: string; out?: string };

export function toAsciicast(lines: CastLine[], prompt = "\u001b[1;32mtilki@club\u001b[0m:\u001b[1;34m~\u001b[0m$ "): string {
  const events: [number, "o", string][] = [];
  let t = 0.4;
  for (const l of lines) {
    events.push([t, "o", prompt]);
    t += 0.35;
    for (const ch of l.cmd ?? "") { events.push([t, "o", ch]); t += ch === " " ? 0.09 : 0.045 + ((ch.charCodeAt(0) * 7) % 5) / 100; }
    events.push([t, "o", "\r\n"]);
    t += 0.3;
    for (const row of (l.out ?? "").split("\n").filter((r, i, a) => r || i < a.length - 1)) { events.push([t, "o", `${row}\r\n`]); t += 0.06; }
    t += 0.6;
  }
  events.push([t, "o", prompt]);
  const header = { version: 2, width: 96, height: Math.min(30, Math.max(8, lines.reduce((n, l) => n + 1 + (l.out ?? "").split("\n").length, 1))), timestamp: 0, env: { TERM: "xterm-256color", SHELL: "/bin/bash" } };
  return [JSON.stringify(header), ...events.map((e) => JSON.stringify([Number(e[0].toFixed(3)), e[1], e[2]]))].join("\n");
}

export function TerminalCast({ lines, reducedMotion, speed = 1 }: { lines: CastLine[]; reducedMotion: boolean; speed?: number }) {
  const t = useT();
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let player: { dispose: () => void } | null = null;
    let live = true;
    const el = host.current;
    void import("asciinema-player").then((AP) => {
      if (!live || !host.current) return;
      const data = toAsciicast(lines);
      player = AP.create({ data }, host.current, { autoPlay: !reducedMotion, loop: false, speed, idleTimeLimit: 1.5, fit: "width", theme: "monokai", controls: "auto", startAt: reducedMotion ? 9999 : 0, terminalFontFamily: "JetBrains Mono, monospace" });
    });
    return () => { live = false; player?.dispose(); el?.replaceChildren(); };
  }, [lines, reducedMotion, speed]);
  return <div ref={host} className="terminal-cast" aria-label={t("Terminal kaydı")} />;
}
