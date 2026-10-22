"use client";

import { useEffect, useRef } from "react";
import {
  Laptop, Server, Database, Globe, Router, BrickWall, User, Skull, Mail, Shield, Lock, Cloud, Radar, AppWindow, Network, Wifi, Headset, KeyRound,
  type LucideIcon,
} from "lucide-react";
import type { Actor, FlowAnimation, IconKey, StepTone } from "@/animations/types";

const ICONS: Record<IconKey, LucideIcon> = {
  laptop: Laptop, server: Server, database: Database, globe: Globe, router: Router, firewall: BrickWall, user: User,
  attacker: Skull, mail: Mail, shield: Shield, lock: Lock, cloud: Cloud, siem: Radar, browser: AppWindow, switch: Network,
  wifi: Wifi, analyst: Headset, key: KeyRound,
};

const TONE: Record<StepTone, string> = {
  request: "var(--blue)",
  reply: "var(--lime)",
  attack: "var(--red)",
  secure: "#7ee0a1",
  info: "var(--amber)",
};

const ACTOR_RING = { neutral: "var(--line)", infra: "#3d5a6c", good: "var(--lime-deep)", bad: "#8a3a22" } as const;
const ZONE = { trusted: "rgba(166,227,74,.06)", dmz: "rgba(229,171,58,.07)", untrusted: "rgba(224,96,58,.06)" } as const;
const ZONE_LINE = { trusted: "rgba(166,227,74,.35)", dmz: "rgba(229,171,58,.4)", untrusted: "rgba(224,96,58,.35)" } as const;

const R = 30; // aktör yarıçapı

// İki aktör arasındaki oku, aynı çiftteki istek/yanıt üst üste binmesin diye dik eksende kaydırır.
function segment(a: Actor, b: Actor) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len;
  const side = a.id < b.id ? -1 : 1;
  const ox = -uy * 8 * side, oy = ux * 8 * side;
  return {
    x1: a.x + ux * (R + 6) + ox, y1: a.y + uy * (R + 6) + oy,
    x2: b.x - ux * (R + 10) + ox, y2: b.y - uy * (R + 10) + oy,
    mx: (a.x + b.x) / 2 + ox * 2.2, my: (a.y + b.y) / 2 + oy * 2.2,
  };
}

type Props = { def: FlowAnimation; step: number; speed: number; reducedMotion: boolean; stepKey: string | number };

export function FlowAnimationView({ def, step, speed, reducedMotion, stepKey }: Props) {
  const actors = new Map(def.actors.map((a) => [a.id, a]));
  const k = Math.min(Math.max(0, step), def.steps.length);
  const current = k > 0 ? def.steps[k - 1] : undefined;
  const packet = useRef<SVGCircleElement>(null);
  const uid = def.id.replace(/[^a-z0-9]/gi, "");

  // Mevcut adımın paketi: kaynaktan hedefe Web Animations API ile (her istemcide yerel çalışır).
  useEffect(() => {
    const el = packet.current;
    if (!el || !current || current.from === current.to) return;
    const a = actors.get(current.from), b = actors.get(current.to);
    if (!a || !b) return;
    const s = segment(a, b);
    if (reducedMotion) {
      el.setAttribute("cx", String(s.x2));
      el.setAttribute("cy", String(s.y2));
      return;
    }
    const anim = el.animate(
      [
        { transform: `translate(${s.x1}px, ${s.y1}px)`, opacity: 0 },
        { opacity: 1, offset: 0.1 },
        { transform: `translate(${s.x2}px, ${s.y2}px)`, opacity: 1 },
      ],
      { duration: 1100 / speed, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" },
    );
    return () => anim.cancel();
    // stepKey değişince (yeni adım / yeniden oynat) animasyon baştan çalışır
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepKey, k, speed, reducedMotion, def.id]);

  const focus = new Set<string>(current ? [current.from, current.to, ...(current.focus ?? [])] : []);
  const moving = current && current.from !== current.to;

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
        </defs>

        {def.zones?.map((z) => (
          <g key={z.label}>
            <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={12} fill={ZONE[z.tone]} stroke={ZONE_LINE[z.tone]} strokeDasharray="5 5" />
            <text x={z.x + 10} y={z.y + 18} className="anim-zone">{z.label}</text>
          </g>
        ))}

        {def.links?.map(([a, b]) => {
          const A = actors.get(a), B = actors.get(b);
          return A && B ? <line key={`${a}-${b}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--line)" strokeWidth={2} /> : null;
        })}

        {/* tamamlanan adımlar: soluk oklar */}
        {def.steps.slice(0, Math.max(0, k - 1)).map((st, i) => {
          if (st.from === st.to) return null;
          const A = actors.get(st.from), B = actors.get(st.to);
          if (!A || !B) return null;
          const s = segment(A, B);
          return <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={TONE[st.tone ?? "request"]} strokeOpacity={0.22} strokeWidth={2} markerEnd={`url(#${uid}-arr-${st.tone ?? "request"})`} />;
        })}

        {/* mevcut adım */}
        {current && moving && (() => {
          const A = actors.get(current.from)!, B = actors.get(current.to)!;
          const s = segment(A, B);
          const tone = current.tone ?? "request";
          return (
            <g key={`cur-${stepKey}-${k}`} className="anim-current">
              <line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke={TONE[tone]} strokeWidth={3} markerEnd={`url(#${uid}-arr-${tone})`} strokeDasharray={tone === "attack" ? "7 5" : undefined} />
              <Label x={s.mx} y={s.my - 10} text={current.label} color={TONE[tone]} />
            </g>
          );
        })()}

        {def.actors.map((a) => {
          const Icon = ICONS[a.icon];
          const active = focus.has(a.id);
          const selfStep = current && current.from === current.to && current.from === a.id;
          return (
            <g key={a.id} className={active ? "anim-actor is-active" : "anim-actor"}>
              {selfStep && <circle cx={a.x} cy={a.y} r={R + 10} fill="none" stroke={TONE[current.tone ?? "info"]} strokeWidth={2} className={reducedMotion ? undefined : "anim-pulse"} />}
              <circle cx={a.x} cy={a.y} r={R} fill="var(--bg-1)" stroke={active ? "var(--lime)" : ACTOR_RING[a.tone ?? "neutral"]} strokeWidth={active ? 2.5 : 1.5} />
              <Icon x={a.x - 13} y={a.y - 13} width={26} height={26} color={a.tone === "bad" ? "var(--red)" : active ? "var(--lime-bright)" : "var(--ink-dim)"} aria-hidden />
              <text x={a.x} y={a.y + R + 18} textAnchor="middle" className="anim-label">{a.label}</text>
              {a.sub && <text x={a.x} y={a.y + R + 33} textAnchor="middle" className="anim-sub">{a.sub}</text>}
              {selfStep && <Label x={a.x} y={a.y - R - 20} text={current.label} color={TONE[current.tone ?? "info"]} />}
            </g>
          );
        })}

        {moving && <circle ref={packet} r={7} cx={0} cy={0} fill={TONE[current.tone ?? "request"]} className="anim-packet" key={`p-${stepKey}-${k}`} />}
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
