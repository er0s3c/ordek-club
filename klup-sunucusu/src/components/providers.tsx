"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import type { Messages } from "@/i18n";

const MessagesCtx = createContext<Messages | null>(null);

export function useMessages(): Messages {
  const m = useContext(MessagesCtx);
  if (!m) throw new Error("MessagesProvider eksik");
  return m;
}

type ToastKind = "ok" | "error" | "info";
type Toast = { id: number; kind: ToastKind; text: string };
const ToastCtx = createContext<(kind: ToastKind, text: string) => void>(() => {});

export const useToast = () => useContext(ToastCtx);

export function Providers({ messages, children }: { messages: Messages; children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);
  const push = useCallback((kind: ToastKind, text: string) => {
    const id = ++seq.current;
    setToasts((t) => [...t.slice(-3), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 7000 : 4000);
  }, []);
  const value = useMemo(() => messages, [messages]);
  return (
    <MessagesCtx.Provider value={value}>
      <ToastCtx.Provider value={push}>
        {children}
        <div className="toasts" role="status" aria-live="polite">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast-${t.kind}`}>
              {t.kind === "ok" ? <CheckCircle2 size={18} color="var(--term)" aria-hidden /> : t.kind === "error" ? <XCircle size={18} color="var(--red)" aria-hidden /> : <Info size={18} color="var(--blue)" aria-hidden />}
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      </ToastCtx.Provider>
    </MessagesCtx.Provider>
  );
}
