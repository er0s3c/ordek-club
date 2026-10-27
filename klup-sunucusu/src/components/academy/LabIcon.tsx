// Lab / atölye ikonu: üretilmiş görsel varsa onu, yoksa türüne göre simgeyi aynı kare çerçevede gösterir.
import { FlaskConical, TerminalSquare } from "lucide-react";

export function LabIcon({ src, kind = "workshop", size = 48 }: { src: string | null; kind?: "terminal" | "workshop"; size?: number }) {
  const Icon = kind === "terminal" ? TerminalSquare : FlaskConical;
  return (
    <span className="lab-icon-box" style={{ width: size, height: size }} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- kendi API'mizden, optimizasyon kapalı */}
      {src ? <img src={src} alt="" width={size} height={size} loading="lazy" /> : <Icon size={Math.round(size * 0.46)} />}
    </span>
  );
}
