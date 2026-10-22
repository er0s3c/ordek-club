// WebSocket yükseltme işleyicisi: /ws/live?code=XXXXXX
// Yükseltmeden ÖNCE: yol, Origin (CSWSH'ye karşı), çerez oturumu, IP hız sınırı ve oturum varlığı doğrulanır.
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer, WebSocket } from "ws";
import { db } from "@/server/db";
import { env } from "@/server/env";
import { hit } from "@/server/rate-limit";
import { SESSION_COOKIE, readCookie, validateSessionToken } from "@/server/auth/session";
import { WS_PATH, WS_CLOSE } from "@/lib/live-protocol";
import { hub, LiveError, LIMITS, type Conn } from "@/server/live/hub";
import { normalizeCode } from "@/server/live/service";

const HEARTBEAT_MS = 25_000;

function deny(socket: Duplex, status: number, text: string) {
  socket.write(`HTTP/1.1 ${status} ${text}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
  socket.destroy();
}

function remoteIp(req: IncomingMessage): string {
  if (env().trustProxy) {
    const xff = req.headers["x-forwarded-for"];
    const last = (Array.isArray(xff) ? xff.join(",") : xff ?? "").split(",").map((s) => s.trim()).filter(Boolean).pop();
    if (last) return last;
  }
  return req.socket.remoteAddress ?? "unknown";
}

function originAllowed(req: IncomingMessage): boolean {
  const origin = req.headers.origin;
  if (!origin) return false;
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = new Set<string>();
  try { allowed.add(new URL(env().APP_URL).host); } catch { /* yok say */ }
  if (req.headers.host) allowed.add(req.headers.host);
  if (env().trustProxy && typeof req.headers["x-forwarded-host"] === "string") allowed.add(req.headers["x-forwarded-host"].split(",")[0]!.trim());
  return allowed.has(host);
}

export function createLiveUpgradeHandler() {
  const wss = new WebSocketServer({ noServer: true, maxPayload: LIMITS.maxMessageBytes * 2, perMessageDeflate: false });

  return {
    wss,
    /** true döner → istek bu işleyici tarafından üstlenildi. */
    handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer): boolean {
      const url = new URL(req.url ?? "/", "http://x");
      if (url.pathname !== WS_PATH) return false;
      void (async () => {
        try {
          if (!originAllowed(req)) return deny(socket, 403, "Forbidden");
          const ip = remoteIp(req);
          if (!hit(`ws:ip:${ip}`, 40, 60_000).ok) return deny(socket, 429, "Too Many Requests");

          const token = readCookie(req.headers.cookie ?? null, SESSION_COOKIE);
          const session = await validateSessionToken(token);
          if (!session) return deny(socket, 401, "Unauthorized");

          const code = normalizeCode(url.searchParams.get("code") ?? "");
          const live = code ? await db.liveSession.findUnique({ where: { code }, select: { id: true, status: true } }) : null;
          if (!live || live.status !== "ACTIVE") return deny(socket, 404, "Not Found");

          wss.handleUpgrade(req, socket, head, (ws) => void attach(ws, live.id, session.user, token));
        } catch (err) {
          console.error("[live] yükseltme hatası", err);
          deny(socket, 500, "Internal Server Error");
        }
      })();
      return true;
    },
  };
}

async function attach(
  ws: WebSocket,
  sessionId: string,
  user: { id: string; displayName: string; username: string; role: import("@prisma/client").Role; status: import("@prisma/client").MemberStatus },
  token: string | null,
) {
  const conn: Conn = {
    send: (d) => ws.send(d),
    close: (code, reason) => ws.close(code, reason),
    isOpen: () => ws.readyState === WebSocket.OPEN,
  };
  // join tamamlanmadan gelen mesajlar kaybolmasın
  const queue: string[] = [];
  let client: Awaited<ReturnType<typeof hub.join>> | null = null;
  ws.on("message", (data, isBinary) => {
    if (isBinary) return ws.close(1003, "binary not supported");
    const text = data.toString();
    if (client) void hub.handle(sessionId, client, text);
    else if (queue.length < 10) queue.push(text);
  });

  let alive = true;
  ws.on("pong", () => (alive = true));
  const hb = setInterval(() => {
    if (!alive) return ws.terminate();
    alive = false;
    ws.ping();
  }, HEARTBEAT_MS);
  hb.unref?.();

  ws.on("close", () => {
    clearInterval(hb);
    if (client) void hub.leave(sessionId, client);
  });
  ws.on("error", () => ws.terminate());

  try {
    if (user.status !== "ACTIVE") throw new LiveError(WS_CLOSE.FORBIDDEN, "Hesap aktif değil.");
    client = await hub.join(sessionId, { ...user, status: "ACTIVE" }, conn, token);
    if (ws.readyState !== WebSocket.OPEN) {
      await hub.leave(sessionId, client);
      return;
    }
    for (const m of queue.splice(0)) await hub.handle(sessionId, client, m);
  } catch (err) {
    const code = err instanceof LiveError ? err.closeCode : 1011;
    if (!(err instanceof LiveError)) console.error("[live] katılım hatası", err);
    // Okunabilir (Türkçe) mesaj veri çerçevesiyle; kapanış nedeni ASCII (123 bayt sınırı).
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ t: "error", code: "JOIN_FAILED", message: err instanceof LiveError ? err.message : "Oturuma katılınamadı." }));
    }
    ws.close(code, "join failed");
  }
}
