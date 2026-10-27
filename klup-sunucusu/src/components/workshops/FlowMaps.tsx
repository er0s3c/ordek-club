"use client";
// xyflow tabanlı etkileşimli haritalar: ağ atölyesinde sürüklenebilir düğümler ve simüle edilen paketler,
// kanıt haritasında tutamaçtan sürükleyerek bağlantı kurma. Klavye kullanıcıları için yanındaki seçim çipleri kalır.
import { useEffect, useMemo } from "react";
import { Background, Controls, Handle, MarkerType, Position, ReactFlow, useNodesState, type Edge, type Node, type NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useT } from "@/i18n/client";
import type { T } from "@/i18n/translate";

type NetData = { label: string; sub: string; tone: string; picked?: boolean };
type NetNodeT = Node<NetData, "club">;

function ClubNode({ data }: NodeProps<NetNodeT>) {
  return (
    <div className={`flow-node tone-${data.tone}${data.picked ? " is-picked" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <strong>{data.label}</strong>
      <span>{data.sub}</span>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
const nodeTypes = { club: ClubNode };
// xyflow ekran okuyucu metinleri (Türkçe)
const aria = (t: T) => ({
  "node.a11yDescription.default": t("Düğümü seçmek için Enter ya da Boşluk; seçiliyken ok tuşlarıyla taşı."),
  "node.a11yDescription.keyboardDisabled": t("Düğümü seçmek için Enter ya da Boşluk."),
  "node.a11yDescription.ariaLiveMessage": ({ direction, x, y }: { direction: string; x: number; y: number }) => t("Düğüm {direction} yönüne taşındı: {x}, {y}", { direction, x, y }),
  "edge.a11yDescription.default": t("Bağlantıyı seçmek için Enter ya da Boşluk."),
  "controls.ariaLabel": t("Harita denetimleri"),
  "controls.zoomIn.ariaLabel": t("Yakınlaştır"),
  "controls.zoomOut.ariaLabel": t("Uzaklaştır"),
  "controls.fitView.ariaLabel": t("Haritayı sığdır"),
  "controls.interactive.ariaLabel": t("Etkileşimi aç/kapat"),
  "minimap.ariaLabel": t("Küçük harita"),
  "handle.ariaLabel": t("Bağlantı tutamacı"),
});

export function NetFlow({ nodes, packets, sim }: { nodes: { id: string; label: string; ip: string; zone: string; x: number; y: number }[]; packets: { from: string; to: string; port: number }[]; sim: { i: number; action: "allow" | "deny" }[] | null }) {
  const t = useT();
  const initial = useMemo<NetNodeT[]>(() => nodes.map((n) => ({ id: n.id, type: "club", position: { x: n.x * 1.5, y: n.y * 1.4 }, data: { label: n.label, sub: `${n.ip} · ${n.zone}`, tone: n.zone.toLowerCase() } })), [nodes]);
  const [ns, setNs, onNodesChange] = useNodesState(initial);
  useEffect(() => setNs(initial), [initial, setNs]);
  const edges = useMemo<Edge[]>(() => packets.map((p, i) => {
    const r = sim?.find((x) => x.i === i);
    const color = r ? (r.action === "allow" ? "var(--ok)" : "var(--err)") : "var(--line-strong, #9a93a8)";
    return {
      id: `p${i}`, source: p.from, target: p.to, label: `:${p.port}${r ? (r.action === "allow" ? " ✓" : " ✗") : ""}`, animated: r?.action === "allow",
      style: { stroke: color, strokeWidth: 2, strokeDasharray: r?.action === "deny" ? "6 5" : undefined }, markerEnd: { type: MarkerType.ArrowClosed, color },
      labelStyle: { fontSize: 11, fontWeight: 600 }, labelBgPadding: [4, 2] as [number, number], labelBgBorderRadius: 4, type: "smoothstep", pathOptions: { offset: 12 + i * 6 },
    };
  }), [packets, sim]);
  return (
    <div className="flow-map" role="img" aria-label={t("Ağ şeması: düğümleri sürükleyebilirsin")}>
      <ReactFlow nodes={ns} edges={edges} onNodesChange={onNodesChange} nodeTypes={nodeTypes} nodesConnectable={false} fitView proOptions={{ hideAttribution: true }} minZoom={0.4} maxZoom={1.8} ariaLabelConfig={aria(t)}>
        <Background gap={18} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

const KIND_TR = { ip: "IP", user: "Kullanıcı", file: "Dosya", event: "Olay" } as const;

export function EvidenceFlow({ nodes, links, picked, onPair }: { nodes: { id: string; kind: keyof typeof KIND_TR; label: string; detail: string }[]; links: { from: string; to: string; reason: string }[]; picked: string[]; onPair: (a: string, b: string) => void }) {
  const t = useT();
  const initial = useMemo<NetNodeT[]>(() => nodes.map((n, i) => {
    const ang = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return { id: n.id, type: "club", position: { x: 380 + Math.cos(ang) * 330, y: 200 + Math.sin(ang) * 170 }, data: { label: n.label, sub: `${t(KIND_TR[n.kind])} · ${n.detail}`, tone: n.kind } };
  }), [nodes, t]);
  const [ns, setNs, onNodesChange] = useNodesState(initial);
  useEffect(() => setNs(initial), [initial, setNs]);
  useEffect(() => setNs((cur) => cur.map((n) => ({ ...n, data: { ...n.data, picked: picked.includes(n.id) } }))), [picked, setNs]);
  const edges = useMemo<Edge[]>(() => links.map((l, i) => ({
    id: `l${i}`, source: l.from, target: l.to, label: l.reason.length > 34 ? `${l.reason.slice(0, 33)}…` : l.reason, animated: true,
    style: { stroke: "var(--accent)", strokeWidth: 2 }, labelStyle: { fontSize: 11 }, labelBgPadding: [4, 2] as [number, number], labelBgBorderRadius: 4,
  })), [links]);
  return (
    <div className="flow-map flow-map-tall" role="img" aria-label={t("Kanıt haritası: bir kanıtın sağ tutamacından diğerine sürükleyerek bağla")}>
      <ReactFlow nodes={ns} edges={edges} onNodesChange={onNodesChange} nodeTypes={nodeTypes} onConnect={(c) => c.source && c.target && c.source !== c.target && onPair(c.source, c.target)} onNodeClick={(_, n) => onPair(n.id, "")} fitView proOptions={{ hideAttribution: true }} minZoom={0.4} maxZoom={1.8} ariaLabelConfig={aria(t)}>
        <Background gap={18} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
