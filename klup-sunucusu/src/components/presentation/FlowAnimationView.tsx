"use client";

import { useEffect, useRef } from "react";
import {
  Laptop, Server, Database, Globe, Router, BrickWall, User, Skull, Mail, Shield, Lock, Cloud, Radar, AppWindow, Network, Wifi, Headset, KeyRound,
  type LucideIcon,
} from "lucide-react";
import type { FlowAnimation, IconKey, StepTone } from "@/animations/types";
import { R, curve, useElkLayout, useSketch } from "./flow-layout";

const ICONS: Record<IconKey, LucideIcon> = {
  laptop: Laptop, server: Server, database: Database, globe: Globe, router: Router, firewall: BrickWall, user: User,
  attacker: Skull, mail: Mail, shield: Shield, lock: Lock, cloud: Cloud, siem: Radar, browser: AppWindow, switch: Network,
  wifi: Wifi, analyst: Headset, key: KeyRound,
};

const TONE: Record<StepTone, string> = {
  request: "var(--anim-request)",
  reply: "var(--anim-reply)",
  attack: "var(--red)",
  secure: "var(--anim-secure)",
  info: "var(--anim-info)",
};

const ACTOR_RING = { neutral: "var(--color-iron)", infra: "var(--color-iron)", good: "var(--color-ash)", bad: "var(--color-arterial-red)" } as const;
// Bölgeler ton farkıyla; güvenilmeyen bölge tek kırmızı ince çizgiyle.
const ZONE = { trusted: "rgba(252,252,252,.035)", dmz: "rgba(252,252,252,.015)", untrusted: "transparent" } as const;
const ZONE_LINE = { trusted: "rgba(252,252,252,.3)", dmz: "rgba(252,252,252,.18)", untrusted: "rgba(254,30,52,.55)" } as const;

type Props = { def: FlowAnimation; step: number; speed: number; reducedMotion: boolean; stepKey: string | number };

// Ağ akışı animasyonu. Mevcut adımda: bağlantı eğrisi GSAP DrawSVG ile çizilir, paket ve izi anime.js ile eğri
// boyunca akar, hedefte dalga yayılır; saldırı adımında hedef kısa bir sarsıntı yapar. Azaltılmış harekette son durum.
export function FlowAnimationView({ def, step, speed, reducedMotion, stepKey }: Props) {
  const placed = useElkLayout(def);
  const sketch = useSketch(def, placed);
  const actors = new Map(placed.map((a) => [a.id, a]));
  const k = Math.min(Math.max(0, step), def.steps.length);
  const current = k > 0 ? def.steps[k - 1] : undefined;
  const path = useRef<SVGPathElement>(null);
  const packet = useRef<SVGGElement>(null);
  const ripple = useRef<SVGCircleElement>(null);
  const target = useRef<SVGGElement>(null);
  const uid = def.id.replace(/[^a-z0-9]/gi, "");
  const moving = !!current && current.from !== current.to;

  useEffect(() => {
    const line = path.current, dot = packet.current, wave = ripple.current, hit = target.current;
    if (!current || !line) return;
    const dur = 1.1 / speed;
    if (reducedMotion) {
      if (dot) dot.style.opacity = "0";
      return;
    }
    let cancelled = false;
    const stops: (() => void)[] = [];
    void Promise.all([import("gsap"), import("gsap/DrawSVGPlugin"), import("animejs")]).then(([{ gsap }, { DrawSVGPlugin }, anime]) => {
      if (cancelled) return;
      gsap.registerPlugin(DrawSVGPlugin);
      const draw = gsap.fromTo(line, { drawSVG: "0%" }, { drawSVG: "100%", duration: dur * 0.55, ease: "power2.out" });
      stops.push(() => draw.kill());
      if (!moving || !dot) return;
      const { translateX, translateY } = anime.svg.createMotionPath(line);
      const trail = [...dot.querySelectorAll<SVGCircleElement>("circle")];
      const run = anime.animate(trail, {
        translateX, translateY,
        opacity: [0, 1],
        delay: anime.stagger(55),
        duration: dur * 1000,
        ease: "inOutQuad",
        onComplete: () => {
          if (cancelled || !wave) return;
          const w = anime.animate(wave, { r: [R, R + 28], opacity: [0.7, 0], duration: 650, ease: "outQuad" });
          stops.push(() => w.pause());
          if (current.tone === "attack" && hit) {
            const s = anime.animate(hit, { x: [0, -4, 4, -3, 3, 0], duration: 360, ease: "linear" });
            stops.push(() => s.pause());
          }
        },
      });
      stops.push(() => run.pause());
    });
    return () => { cancelled = true; stops.forEach((s) => s()); };
    // stepKey değişince (yeni adım / yeniden oynat) animasyon baştan çalışır
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey, k, speed, reducedMotion, def.id, placed]);

  const focus = new Set<string>(current ? [current.from, current.to, ...(current.focus ?? [])] : []);
  const tone = current?.tone ?? (moving ? "request" : "info");
  const curSeg = moving ? curve(actors.get(current!.from)!, actors.get(current!.to)!) : null;

  return (
    <figure className="anim" aria-label={def.title}>
      <svg viewBox="0 0 800 360" role="img" aria-labelledby={`${uid}-t`} className="anim-svg">
        <title id={`${uid}-t`}>{def.title}</title>
        <defs>
          {(Object.keys(TONE) as StepTone[]).map((t) => (
            <marker key={t} id={`${uid}-arr-${t}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill={TONE[t]} />
            </marker>
          ))}
          <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>

        {def.zones?.map((z, i) => (
          <g key={z.label}>
            {sketch ? sketch.zones[i]?.map((p, j) => <path key={j} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill="none" opacity={0.6} />)
              : <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={12} fill={ZONE[z.tone]} stroke={ZONE_LINE[z.tone]} strokeDasharray="5 5" />}
            <text x={z.x + 10} y={z.y + 18} className="anim-zone">{z.label}</text>
          </g>
        ))}

        {def.links?.map(([a, b], i) => {
          const A = actors.get(a), B = actors.get(b);
          if (!A || !B) return null;
          return sketch ? <g key={`${a}-${b}`}>{sketch.links[i]?.map((p, j) => <path key={j} d={p.d} stroke={p.stroke} strokeWidth={p.strokeWidth} fill="none" />)}</g>
            : <line key={`${a}-${b}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--line)" strokeWidth={2} />;
        })}

        {/* tamamlanan adımlar: soluk eğriler */}
        {def.steps.slice(0, Math.max(0, k - 1)).map((st, i) => {
          if (st.from === st.to) return null;
          const A = actors.get(st.from), B = actors.get(st.to);
          if (!A || !B) return null;
          return <path key={i} d={curve(A, B).d} fill="none" stroke={TONE[st.tone ?? "request"]} strokeOpacity={0.22} strokeWidth={2} markerEnd={`url(#${uid}-arr-${st.tone ?? "request"})`} />;
        })}

        {/* mevcut adım */}
        {curSeg && (
          <g key={`cur-${stepKey}-${k}`} className="anim-current">
            <path ref={path} d={curSeg.d} fill="none" stroke={TONE[tone]} strokeWidth={3} strokeLinecap="round" markerEnd={`url(#${uid}-arr-${tone})`} strokeDasharray={tone === "attack" ? "7 5" : undefined} />
            <Label x={curSeg.mx} y={curSeg.my - 14} text={current!.label} color={TONE[tone]} />
          </g>
        )}

        {placed.map((a) => {
          const Icon = ICONS[a.icon];
          const active = focus.has(a.id);
          const isTarget = moving && current!.to === a.id;
          const selfStep = current && current.from === current.to && current.from === a.id;
          return (
            <g key={a.id} ref={isTarget ? target : undefined} className={active ? "anim-actor is-active" : "anim-actor"} style={{ transition: "transform .5s var(--ease)" }}>
              {(isTarget || selfStep) && <circle ref={isTarget ? ripple : undefined} cx={a.x} cy={a.y} r={R + 10} fill="none" stroke={TONE[tone]} strokeWidth={2} opacity={isTarget ? 0 : 1} className={selfStep && !reducedMotion ? "anim-pulse" : undefined} />}
              <circle cx={a.x} cy={a.y} r={R} fill="var(--bg-1)" stroke={active ? "var(--gold)" : ACTOR_RING[a.tone ?? "neutral"]} strokeWidth={active ? 2.5 : 1.5} filter={active ? `url(#${uid}-glow)` : undefined} />
              <Icon x={a.x - 13} y={a.y - 13} width={26} height={26} color={a.tone === "bad" ? "var(--red)" : active ? "var(--gold-bright)" : "var(--ink-dim)"} aria-hidden />
              <text x={a.x} y={a.y + R + 18} textAnchor="middle" className="anim-label">{a.label}</text>
              {a.sub && <text x={a.x} y={a.y + R + 33} textAnchor="middle" className="anim-sub">{a.sub}</text>}
              {selfStep && <Label x={a.x} y={a.y - R - 20} text={current.label} color={TONE[current.tone ?? "info"]} />}
            </g>
          );
        })}

        {/* paket + iz: anime.js motion path ile eğri boyunca akar */}
        {moving && (
          <g ref={packet} key={`p-${stepKey}-${k}`} className="anim-packet" filter={`url(#${uid}-glow)`}>
            {[7, 5, 3.5].map((r, i) => <circle key={i} r={r} cx={0} cy={0} fill={TONE[tone]} fillOpacity={[1, 0.45, 0.25][i]} opacity={reducedMotion && i === 0 ? 1 : 0} transform={reducedMotion && curSeg ? `translate(${curSeg.x2} ${curSeg.y2})` : undefined} />)}
          </g>
        )}
      </svg>
      <figcaption className="anim-note" aria-live="polite">
        <span className="anim-step mono">{k}/{def.steps.length}</span>
        <span>{current ? current.note : def.summary}</span>
      </figcaption>
    </figure>
  );
}

function Label({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  const w = Math.min(380, text.length * 7.2 + 18);
  return (
    <g>
      <rect x={x - w / 2} y={y - 13} width={w} height={22} rx={6} fill="var(--bg-0)" stroke={color} strokeOpacity={0.6} />
      <text x={x} y={y + 2} textAnchor="middle" className="anim-tag" fill={color}>{text}</text>
    </g>
  );
}
