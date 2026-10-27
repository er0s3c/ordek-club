// Club Studio ortak düzenleme: /ws/studio?id=<sunum> — Yjs belgesi + farkındalık (kim hangi slaytta).
// Yükseltmeden önce yol, Origin, oturum, hız sınırı ve sunumu DÜZENLEME yetkisi doğrulanır. Oda ilk bağlantıda
// veritabanındaki taslaktan kurulur; kalıcı kayıt her istemcinin mevcut taslak uç noktasıyla yapılır.
// Protokol y-websocket ile uyumludur: 0 = eşitleme, 1 = farkındalık.
import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer, WebSocket } from "ws";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import { env } from "@/server/env";
import { hit } from "@/server/rate-limit";
import { SESSION_COOKIE, readCookie, validateSessionToken } from "@/server/auth/session";
import { getStudio } from "@/server/presentations";
import { studioDeck } from "@/lib/deck-schema";
import { COLLAB_PATH, seedDoc } from "@/lib/studio-collab";

const MSG_SYNC = 0;
const MSG_AWARENESS = 1;
const MAX_DOC_BYTES = 4 * 1024 * 1024;
const MAX_PEERS = 12;
const RECHECK_MS = 60_000;

type Room = { doc: Y.Doc; awareness: awarenessProtocol.Awareness; conns: Map<WebSocket, Set<number>>; idle: ReturnType<typeof setTimeout> | null };
const rooms = new Map<string, Room>();
const pending = new Map<string, Promise<Room>>();

function deny(socket: Duplex, status: number, text: string) {
  socket.write(`HTTP/1.1 ${status} ${text}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
  socket.destroy();
}

function originOk(req: IncomingMessage) {
  const origin = req.headers.origin;
  if (!origin) return false;
  try {
    const host = new URL(origin).host;
    return host === req.headers.host || host === new URL(env().APP_URL).host;
  } catch {
    return false;
  }
}

function send(ws: WebSocket, data: Uint8Array) {
  if (ws.readyState !== WebSocket.OPEN) return;
  if (ws.bufferedAmount > 2 * 1024 * 1024) return ws.close(1009, "slow consumer");
  ws.send(data);
}

function createRoom(id: string, deck: unknown): Room {
  const doc = new Y.Doc({ gc: true });
  seedDoc(doc, studioDeck(deck));
  const awareness = new awarenessProtocol.Awareness(doc);
  awareness.setLocalState(null);
  const room: Room = { doc, awareness, conns: new Map(), idle: null };
  doc.on("update", (update: Uint8Array) => {
    const e = encoding.createEncoder();
    encoding.writeVarUint(e, MSG_SYNC);
    syncProtocol.writeUpdate(e, update);
    const msg = encoding.toUint8Array(e);
    for (const ws of room.conns.keys()) send(ws, msg);
  });
  awareness.on("update", ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }, origin: unknown) => {
    const changed = [...added, ...updated, ...removed];
    if (origin instanceof WebSocket) {
      const ids = room.conns.get(origin);
      if (ids) { added.forEach((c) => ids.add(c)); removed.forEach((c) => ids.delete(c)); }
    }
    const e = encoding.createEncoder();
    encoding.writeVarUint(e, MSG_AWARENESS);
    encoding.writeVarUint8Array(e, awarenessProtocol.encodeAwarenessUpdate(awareness, changed));
    const msg = encoding.toUint8Array(e);
    for (const ws of room.conns.keys()) send(ws, msg);
  });
  rooms.set(id, room);
  return room;
}

function leave(id: string, room: Room, ws: WebSocket) {
  const ids = room.conns.get(ws);
  room.conns.delete(ws);
  if (ids?.size) awarenessProtocol.removeAwarenessStates(room.awareness, [...ids], null);
  if (room.conns.size === 0) {
    // Son kişi çıkınca oda kısa süre bekler (sayfa yenileme), sonra bellekten atılır; kalıcı veri taslaktadır.
    room.idle = setTimeout(() => { if (room.conns.size === 0) { room.doc.destroy(); rooms.delete(id); } }, 60_000);
    room.idle.unref?.();
  }
}

function attach(id: string, room: Room, ws: WebSocket, token: string | null) {
  if (room.idle) { clearTimeout(room.idle); room.idle = null; }
  room.conns.set(ws, new Set());
  let alive = true;
  const beat = setInterval(() => { if (!alive) return ws.terminate(); alive = false; ws.ping(); }, 25_000);
  ws.on("pong", () => { alive = true; });
  // Oturum ve yetki süre içinde düşerse bağlantı kapanır.
  const recheck = setInterval(() => {
    void validateSessionToken(token).then(async (s) => {
      if (!s) return ws.close(1008, "session expired");
      await getStudio({ id: s.user.id, role: s.user.role, status: s.user.status }, id);
    }).catch(() => ws.close(1008, "forbidden"));
  }, RECHECK_MS);

  let bytes = 0, at = Date.now();
  ws.on("message", (data: Buffer, binary: boolean) => {
    if (!binary) return ws.close(1003, "binary only");
    if (Date.now() - at > 1000) { at = Date.now(); bytes = 0; }
    bytes += data.byteLength;
    if (bytes > 1024 * 1024) return ws.close(1008, "rate limit");
    try {
      const decoder = decoding.createDecoder(new Uint8Array(data));
      const type = decoding.readVarUint(decoder);
      if (type === MSG_SYNC) {
        const e = encoding.createEncoder();
        encoding.writeVarUint(e, MSG_SYNC);
        syncProtocol.readSyncMessage(decoder, e, room.doc, ws);
        if (encoding.length(e) > 1) send(ws, encoding.toUint8Array(e));
        if (Y.encodeStateAsUpdate(room.doc).byteLength > MAX_DOC_BYTES) ws.close(1009, "document too large");
      } else if (type === MSG_AWARENESS) {
        awarenessProtocol.applyAwarenessUpdate(room.awareness, decoding.readVarUint8Array(decoder), ws);
      }
    } catch {
      ws.close(1007, "invalid message");
    }
  });
  ws.on("close", () => { clearInterval(beat); clearInterval(recheck); leave(id, room, ws); });
  ws.on("error", () => ws.terminate());

  // İlk eşitleme adımı + mevcut farkındalık durumları
  const e = encoding.createEncoder();
  encoding.writeVarUint(e, MSG_SYNC);
  syncProtocol.writeSyncStep1(e, room.doc);
  send(ws, encoding.toUint8Array(e));
  const states = [...room.awareness.getStates().keys()];
  if (states.length) {
    const a = encoding.createEncoder();
    encoding.writeVarUint(a, MSG_AWARENESS);
    encoding.writeVarUint8Array(a, awarenessProtocol.encodeAwarenessUpdate(room.awareness, states));
    send(ws, encoding.toUint8Array(a));
  }
}

export function createStudioCollabHandler() {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 1024 * 1024, perMessageDeflate: false });
  return {
    wss,
    handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer): boolean {
      const url = new URL(req.url ?? "/", "http://x");
      if (url.pathname !== COLLAB_PATH) return false;
      void (async () => {
        try {
          if (!originOk(req)) return deny(socket, 403, "Forbidden");
          const token = readCookie(req.headers.cookie ?? null, SESSION_COOKIE);
          const session = await validateSessionToken(token);
          if (!session) return deny(socket, 401, "Unauthorized");
          if (!hit(`studio:ws:${session.user.id}`, 20, 60_000).ok) return deny(socket, 429, "Too Many Requests");
          const id = url.searchParams.get("id") ?? "";
          if (!/^[a-z0-9]{10,40}$/i.test(id)) return deny(socket, 404, "Not Found");
          const actor = { id: session.user.id, role: session.user.role, status: session.user.status };
          // getStudio düzenleme yetkisini doğrular (yoksa 403/404 fırlatır) ve odayı kurmak için taslağı verir.
          const st = await getStudio(actor, id).catch(() => null);
          if (!st) return deny(socket, 403, "Forbidden");
          let room = rooms.get(id);
          if (!room) {
            let p = pending.get(id);
            if (!p) { p = Promise.resolve(createRoom(id, st.deck)); pending.set(id, p); }
            room = await p;
            pending.delete(id);
          }
          if (room.conns.size >= MAX_PEERS) return deny(socket, 503, "Room Full");
          const r = room;
          wss.handleUpgrade(req, socket, head, (ws) => attach(id, r, ws, token));
        } catch (err) {
          console.error("[studio] yükseltme hatası", err);
          deny(socket, 500, "Internal Server Error");
        }
      })();
      return true;
    },
  };
}
