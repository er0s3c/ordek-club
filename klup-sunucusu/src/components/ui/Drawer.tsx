"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { animate } from "motion/mini";
import { useClubReducedMotion } from "@/components/motion/MotionProvider";
import { motionTokens } from "@/lib/motion-tokens";
import { useT } from "@/i18n/client";

export function Drawer({ open, onClose, title, side = "right", children, footer }: { open: boolean; onClose: () => void; title: string; side?: "right" | "bottom"; children: ReactNode; footer?: ReactNode }) {
  const t = useT();
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const reduced = useClubReducedMotion();
  useEffect(() => {
    const element = dialog.current, content = panel.current;
    if (!element || !content) return;
    const offset = side === "bottom" ? "translateY(100%)" : "translateX(100%)";
    if (open) {
      if (!element.open) {
        content.style.transform = reduced ? "none" : offset;
        content.style.opacity = reduced ? "1" : ".6";
        element.showModal();
      }
      if (!content.contains(document.activeElement)) content.querySelector<HTMLButtonElement>("button")?.focus();
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const animation = animate(content, { transform: "none", opacity: 1 }, { duration: reduced ? 0 : motionTokens.panel, ease: motionTokens.ease });
      return () => { animation.stop(); document.body.style.overflow = previous; };
    }
    if (!element.open) return;
    let cancelled = false;
    const animation = animate(content, { transform: offset, opacity: .6 }, { duration: reduced ? 0 : motionTokens.exit, ease: motionTokens.ease });
    void animation.then(() => { if (!cancelled) element.close(); });
    return () => { cancelled = true; animation.stop(); };
  }, [open, side, reduced]);
  return (
    <dialog ref={dialog} className="drawer-root" aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }} onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }} onKeyDown={event => {
      if (event.key !== "Tab") return;
      const items = [...event.currentTarget.querySelectorAll<HTMLElement>("a[href],button,input,textarea,select,[tabindex]")].filter(el => el.tabIndex >= 0 && !el.matches(":disabled") && el.getClientRects().length > 0);
      const first = items[0], last = items.at(-1);
      if (!first || !last) { event.preventDefault(); return; }
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }}>
      <div ref={panel} inert={!open} className={`drawer drawer-${side}`}>
        <div className="drawer-h">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} aria-label={t("Kapat")}><X size={16} aria-hidden /></button>
        </div>
        <div className="drawer-b">{children}</div>
        {footer && <div className="drawer-f">{footer}</div>}
      </div>
    </dialog>
  );
}
