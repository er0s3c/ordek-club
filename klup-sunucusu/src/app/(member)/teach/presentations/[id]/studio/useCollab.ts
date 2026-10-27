"use client";
// Studio ortak düzenleme kancası (Yjs + y-protocols, sunucu: /ws/studio). Bağlantı yoksa editör tek başına
// çalışmaya devam eder; yeniden bağlanınca belge sunucudakiyle eşitlenir.
import { useCallback, useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import type { Deck } from "@/lib/deck-schema";
import { COLLAB_PATH, ops, readDoc } from "@/lib/studio-collab";

export type Peer = { clientId: number; name: string; color: string; slide: number };
export type CollabStatus = "connecting" | "live" | "offline";
type Ops = typeof ops;
type OpArgs<K extends keyof Ops> = Ops[K] extends (doc: Y.Doc, ...a: infer A) => void ? A : never;

const REMOTE = Symbol("remote");
const COLORS = ["#5c1fe2", "#e2531f", "#1f8be2", "#11a85a", "#c21fe2", "#e2a91f"];

export function useCollab(id: string, me: { name: string }, slide: number, onRemote: (deck: Deck) => void, getLocal: () => Deck) {
  const doc = useRef<Y.Doc | null>(null);
  const aw = useRef<awarenessProtocol.Awareness | null>(null);
  const sock = useRef<WebSocket | null>(null);
  const remote = useRef(onRemote);
  remote.current = onRemote;
  const local = useRef(getLocal);
  local.current = getLocal;
  // Bağlantı yokken yapılan düzenlemeler: yeniden bağlanınca yerel deste belgeye yazılır (yerel kazanır).
  const offlineDirty = useRef(false);
  const [status, setStatus] = useState<CollabStatus>("connecting");
  const [peers, setPeers] = useState<Peer[]>([]);

  useEffect(() => {
    const d = new Y.Doc();
    const a = new awarenessProtocol.Awareness(d);
    a.setLocalState({ name: me.name, color: COLORS[d.clientID % COLORS.length], slide: 0 });
    doc.current = d;
    aw.current = a;
    let closed = false;
    let retry = 0;
    let synced = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const out = (bytes: Uint8Array) => { const s = sock.current; if (s?.readyState === WebSocket.OPEN) s.send(bytes); };
    d.on("update", (update: Uint8Array, origin: unknown) => {
      if (origin === REMOTE) { if (synced) { const deck = readDoc(d); if (deck) remote.current(deck); } return; }
      const e = encoding.createEncoder();
      encoding.writeVarUint(e, 0);
      syncProtocol.writeUpdate(e, update);
      out(encoding.toUint8Array(e));
    });
    a.on("update", ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }, origin: unknown) => {
      const list: Peer[] = [];
      a.getStates().forEach((st, cid) => { if (cid !== d.clientID && st?.name) list.push({ clientId: cid, name: String(st.name), color: String(st.color ?? COLORS[0]), slide: Number(st.slide ?? 0) }); });
      setPeers(list);
      if (origin === REMOTE) return;
      const e = encoding.createEncoder();
      encoding.writeVarUint(e, 1);
      encoding.writeVarUint8Array(e, awarenessProtocol.encodeAwarenessUpdate(a, [...added, ...updated, ...removed]));
      out(encoding.toUint8Array(e));
    });

    const connect = () => {
      if (closed) return;
      setStatus("connecting");
      const proto = location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${proto}//${location.host}${COLLAB_PATH}?id=${encodeURIComponent(id)}`);
      ws.binaryType = "arraybuffer";
      sock.current = ws;
      ws.onopen = () => {
        retry = 0;
        const e = encoding.createEncoder();
        encoding.writeVarUint(e, 0);
        syncProtocol.writeSyncStep1(e, d);
        ws.send(encoding.toUint8Array(e));
        const s = encoding.createEncoder();
        encoding.writeVarUint(s, 1);
        encoding.writeVarUint8Array(s, awarenessProtocol.encodeAwarenessUpdate(a, [d.clientID]));
        ws.send(encoding.toUint8Array(s));
      };
      ws.onmessage = (ev: MessageEvent<ArrayBuffer>) => {
        const dec = decoding.createDecoder(new Uint8Array(ev.data));
        const type = decoding.readVarUint(dec);
        if (type === 0) {
          const e = encoding.createEncoder();
          encoding.writeVarUint(e, 0);
          const kind = syncProtocol.readSyncMessage(dec, e, d, REMOTE);
          if (encoding.length(e) > 1) ws.send(encoding.toUint8Array(e));
          // İlk eşitleme (adım 2) tamamlanınca sunucudaki belge editöre yansır.
          if (kind === syncProtocol.messageYjsSyncStep2 && !synced) {
            synced = true;
            setStatus("live");
            if (offlineDirty.current) { offlineDirty.current = false; d.transact(() => ops.replace(d, local.current())); }
            else { const deck = readDoc(d); if (deck) remote.current(deck); }
          }
        } else if (type === 1) {
          awarenessProtocol.applyAwarenessUpdate(a, decoding.readVarUint8Array(dec), REMOTE);
        }
      };
      ws.onclose = () => {
        sock.current = null;
        synced = false;
        awarenessProtocol.removeAwarenessStates(a, [...a.getStates().keys()].filter((c) => c !== d.clientID), REMOTE);
        if (closed) return;
        setStatus("offline");
        timer = setTimeout(connect, Math.min(15_000, 1000 * 2 ** retry++));
      };
    };
    connect();
    return () => {
      closed = true;
      if (timer) clearTimeout(timer);
      sock.current?.close();
      a.destroy();
      d.destroy();
    };
  }, [id, me.name]);

  // Kendi konumumuz (hangi slayttayız) farkındalıkla paylaşılır.
  useEffect(() => { aw.current?.setLocalStateField("slide", slide); }, [slide]);

  const apply = useCallback(<K extends keyof Ops>(op: K, ...args: OpArgs<K>) => {
    const d = doc.current;
    if (!d || status !== "live") { offlineDirty.current = true; return; }
    d.transact(() => (ops[op] as unknown as (doc: Y.Doc, ...a: OpArgs<K>) => void)(d, ...args));
  }, [status]);

  return { status, peers, apply };
}
