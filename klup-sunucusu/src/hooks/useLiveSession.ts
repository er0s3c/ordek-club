"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  WS_CLOSE, WS_PATH,
  type ClientMessage, type LiveState, type ParticipantView, type PollStats, type PollView, type QuestionView, type ServerMessage,
} from "@/lib/live-protocol";

export type ConnStatus = "connecting" | "open" | "reconnecting" | "ended" | "error";
const FATAL = new Set<number>([WS_CLOSE.ENDED, WS_CLOSE.UNAUTHORIZED, WS_CLOSE.FORBIDDEN, WS_CLOSE.NOT_FOUND]);

export type LiveSnapshot = {
  status: ConnStatus;
  error: string | null;
  v: number;
  state: LiveState | null;
  stateKey: number; // her yeni durum mesajında artar (animasyonları yeniden başlatmak için)
  isHost: boolean;
  online: number;
  participants: ParticipantView[];
  questions: QuestionView[];
  handRaised: boolean;
  announcement: { text: string; at: number } | null;
  poll: PollView | null;
  pollStats: PollStats | null; // yalnızca eğitmen
  clockSkew: number; // sunucu saati - yerel saat (ms), geri sayım için
};

// Canlı oturum bağlantısı: otomatik yeniden bağlanma (üstel geri çekilme + jitter),
// sürüm kontrolü (eski durum mesajları yok sayılır) ve yeniden bağlanınca tam senkron.
export function useLiveSession(code: string) {
  const [snap, setSnap] = useState<LiveSnapshot>({
    status: "connecting", error: null, v: -1, state: null, stateKey: 0, isHost: false, online: 0,
    participants: [], questions: [], handRaised: false, announcement: null, poll: null, pollStats: null, clockSkew: 0,
  });
  const ws = useRef<WebSocket | null>(null);
  const vRef = useRef(-1);
  const attempt = useRef(0);
  const stopped = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastError = useRef<string | null>(null);

  const connect = useCallback(() => {
    if (stopped.current) return;
    if (timer.current) clearTimeout(timer.current);
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const sock = new WebSocket(`${proto}://${location.host}${WS_PATH}?code=${encodeURIComponent(code)}`);
    ws.current = sock;

    sock.onopen = () => {
      attempt.current = 0;
      lastError.current = null;
      sock.send(JSON.stringify({ t: "hello", lastVersion: vRef.current } satisfies ClientMessage));
      setSnap((s) => ({ ...s, status: "open", error: null }));
    };

    sock.onmessage = (ev) => {
      let m: ServerMessage;
      try {
        m = JSON.parse(String(ev.data)) as ServerMessage;
      } catch {
        return;
      }
      // Yan etkiler (ref güncellemeleri) updater DIŞINDA: StrictMode updater'ları iki kez çağırır.
      switch (m.t) {
        case "welcome":
          return setSnap((s) => ({ ...s, isHost: m.you.isHost, clockSkew: m.serverNow - Date.now() }));
        case "state": {
          if (m.v <= vRef.current) return; // sıra dışı/eski mesaj
          vRef.current = m.v;
          return setSnap((s) => ({ ...s, v: m.v, state: m.state, stateKey: s.stateKey + 1 }));
        }
        case "presence":
          return setSnap((s) => ({ ...s, online: m.online, participants: m.participants ?? s.participants }));
        case "questions":
          return setSnap((s) => ({ ...s, questions: m.items }));
        case "you":
          return setSnap((s) => ({ ...s, handRaised: m.handRaised }));
        case "poll":
          return setSnap((s) => ({ ...s, poll: m.poll, pollStats: m.poll && s.pollStats?.pollId === m.poll.id ? s.pollStats : null }));
        case "poll.stats":
          return setSnap((s) => ({ ...s, pollStats: m.stats }));
        case "announcement":
          return setSnap((s) => ({ ...s, announcement: { text: m.text, at: m.at } }));
        case "ended":
          stopped.current = true;
          return setSnap((s) => ({ ...s, status: "ended" }));
        case "error":
          lastError.current = m.message;
          return setSnap((s) => ({ ...s, error: m.message }));
      }
    };

    sock.onclose = (ev) => {
      if (ws.current !== sock) return;
      ws.current = null;
      if (stopped.current || FATAL.has(ev.code)) {
        stopped.current = true;
        const err = lastError.current ?? closeMessage(ev.code);
        setSnap((s) => ({
          ...s,
          status: ev.code === WS_CLOSE.ENDED || s.status === "ended" ? "ended" : "error",
          error: s.status === "ended" ? s.error : err,
        }));
        return;
      }
      // Bağlantı kesildi: yeniden dene (0.5s, 1s, 2s … en fazla 10s, ±%30 jitter)
      const delay = Math.min(10_000, 500 * 2 ** attempt.current) * (0.7 + Math.random() * 0.6);
      attempt.current++;
      setSnap((s) => ({ ...s, status: "reconnecting" }));
      // Tarayıcı HTTP düzeyindeki reddi (401/404) yalnızca 1006 olarak bildirir: birkaç denemeden sonra nedenini sor.
      if (attempt.current >= 3) {
        void fetch(`/api/live/join/${encodeURIComponent(code)}`, { cache: "no-store" })
          .then((r) => {
            if (r.status === 404 || r.status === 401 || r.status === 403) {
              stopped.current = true;
              if (timer.current) clearTimeout(timer.current);
              setSnap((s) => ({ ...s, status: r.status === 404 ? "ended" : "error", error: r.status === 404 ? null : closeMessage(WS_CLOSE.UNAUTHORIZED) }));
            }
          })
          .catch(() => {});
      }
      timer.current = setTimeout(connect, delay);
    };
  }, [code]);

  useEffect(() => {
    stopped.current = false;
    connect();
    // Ağ geri gelince / sekme görünür olunca beklemeden yeniden bağlan
    const wake = () => {
      if (!ws.current && !stopped.current) connect();
    };
    window.addEventListener("online", wake);
    document.addEventListener("visibilitychange", wake);
    return () => {
      stopped.current = true;
      window.removeEventListener("online", wake);
      document.removeEventListener("visibilitychange", wake);
      if (timer.current) clearTimeout(timer.current);
      ws.current?.close(1000, "leaving");
      ws.current = null;
    };
  }, [connect]);

  const send = useCallback((m: ClientMessage) => {
    const s = ws.current;
    if (s && s.readyState === WebSocket.OPEN) {
      s.send(JSON.stringify(m));
      return true;
    }
    return false;
  }, []);

  const dismissAnnouncement = useCallback(() => setSnap((s) => ({ ...s, announcement: null })), []);
  const clearError = useCallback(() => setSnap((s) => ({ ...s, error: null })), []);

  return { ...snap, send, dismissAnnouncement, clearError };
}

function closeMessage(code: number): string {
  switch (code) {
    case WS_CLOSE.UNAUTHORIZED:
      return "Oturumun sona erdi. Yeniden giriş yap.";
    case WS_CLOSE.FORBIDDEN:
      return "Bu derse katılma yetkin yok.";
    case WS_CLOSE.NOT_FOUND:
      return "Canlı ders bulunamadı veya sona erdi.";
    default:
      return "Bağlantı kurulamadı.";
  }
}
