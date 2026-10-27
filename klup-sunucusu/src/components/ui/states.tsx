"use client";
// Ortak durum bileşenleri: boş, yükleniyor, hata, kayıt durumu ve durum etiketi.
// Her durum simge + metinle anlatılır; renk tek başına anlam taşımaz.
import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, CircleDashed, Clock, Info, Loader2, RotateCcw, XCircle, type LucideIcon } from "lucide-react";
import type { DuckPose } from "./Duck";
import { DuckMascot } from "@/components/motion/DuckMascot";
import { m } from "motion/react";
import { useClubReducedMotion } from "@/components/motion/MotionProvider";
import { useT } from "@/i18n/client";

export function EmptyState({ icon: Icon, title, text, action, duck }: { icon?: LucideIcon; title: string; text?: ReactNode; action?: { href?: string; label: string; onClick?: () => void }; duck?: DuckPose }) {
  return (
    <div className="empty ui-empty">
      {duck ? <DuckMascot pose={duck} size={72} /> : Icon ? <Icon size={28} aria-hidden /> : null}
      <strong className="ui-empty-title">{title}</strong>
      {text && <div className="small muted">{text}</div>}
      {action && (action.href ? <Link className="btn btn-sm" href={action.href}>{action.label}</Link> : <button type="button" className="btn btn-sm" onClick={action.onClick}>{action.label}</button>)}
    </div>
  );
}

export function Skeleton({ lines = 3, height = 18 }: { lines?: number; height?: number }) {
  const t = useT();
  return (
    <div className="stack-sm" aria-busy="true" aria-label={t("Yükleniyor")}>
      {Array.from({ length: lines }, (_, i) => <div key={i} className="skeleton" style={{ height, width: i === lines - 1 ? "60%" : "100%" }} />)}
    </div>
  );
}

export function ErrorRetry({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const t = useT();
  return (
    <div className="alert alert-error" role="alert">
      <XCircle size={18} aria-hidden />
      <div className="stack-sm">
        <span>{message}</span>
        {onRetry && <button type="button" className="btn btn-sm" onClick={onRetry}><RotateCcw size={14} aria-hidden />{" "}{t("Tekrar dene")}</button>}
      </div>
    </div>
  );
}

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";
const SAVE: Record<SaveState, [LucideIcon, string]> = {
  idle: [CircleDashed, ""],
  dirty: [Clock, "Kaydedilmemiş değişiklikler var"],
  saving: [Loader2, "Kaydediliyor…"],
  saved: [CheckCircle2, "Kaydedildi"],
  error: [AlertTriangle, "Kaydedilemedi"],
};
export function SaveStatus({ state, message }: { state: SaveState; message?: string }) {
  const t = useT();
  const reduced = useClubReducedMotion();
  const [Icon, label] = SAVE[state];
  if (state === "idle" && !message) return <span role="status" className="sr-only" />;
  return <m.span key={state} initial={reduced ? false : { opacity: .5, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduced ? 0 : .14 }} role="status" className={`save-status save-${state}`}><Icon size={14} aria-hidden className={state === "saving" ? "ui-spin" : undefined} />{message ?? t(label)}</m.span>;
}

export type Tone = "ok" | "warn" | "err" | "info" | "neutral";
const TONE_ICON: Record<Tone, LucideIcon> = { ok: CheckCircle2, warn: AlertTriangle, err: XCircle, info: Info, neutral: CircleDashed };
export function StatusPill({ tone, children }: { tone: Tone; children: ReactNode }) {
  const Icon = TONE_ICON[tone];
  return <span className={`pill pill-${tone}`}><Icon size={13} aria-hidden />{children}</span>;
}
