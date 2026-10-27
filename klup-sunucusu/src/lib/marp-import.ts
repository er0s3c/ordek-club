// Marp / Markdown → Club Studio slaytları. Desteklenen: ön bilgi (front matter), "---" slayt ayracı, başlıklar,
// madde listeleri ("*" Marp'ta parça parça açılır → adım adım), kod blokları (mermaid → diyagram bloğu),
// alıntılar (bilgi kutusu), HTML yorumları (Marp'ta sunucu notu → eğitmen notu). Görseller dış adres olduğu için
// alınmaz; yerine not düşülür. Hiçbir HTML yorumlanmaz; her şey düz metindir.
import type { Block, Deck } from "@/lib/deck-schema";

type Slide = Deck["slides"][number];
const MAX_SLIDES = 200;
const FENCE = /^(```|~~~)\s*([\w+#-]*)\s*$/;

function splitSlides(md: string): string[] {
  let text = md.replace(/\r\n?/g, "\n");
  // Ön bilgi: ilk satır "---" ise ikinci "---"ya kadar atılır.
  if (text.startsWith("---\n")) {
    const end = text.indexOf("\n---", 4);
    if (end > 0) text = text.slice(end + 4);
  }
  const out: string[] = [];
  let cur: string[] = [];
  let inFence = false;
  for (const line of text.split("\n")) {
    if (FENCE.test(line.trim())) inFence = !inFence;
    if (!inFence && /^(---|\*\*\*|___)\s*$/.test(line)) { out.push(cur.join("\n")); cur = []; continue; }
    cur.push(line);
  }
  out.push(cur.join("\n"));
  return out.map((s) => s.trim()).filter(Boolean);
}

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const inline = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/__(.+?)__/g, "$1").replace(/`([^`]+)`/g, "$1").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim();

function parseSlide(src: string, index: number): Slide {
  const lines = src.split("\n");
  const blocks: Block[] = [];
  const notes: string[] = [];
  let title = "";
  let layout: Slide["layout"] = "default";
  let para: string[] = [];
  const flushPara = () => { const t = inline(para.join(" ")); if (t) blocks.push({ type: "text", text: clip(t, 2000) }); para = []; };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const trimmed = line.trim();
    // HTML yorumu → eğitmen notu (çok satırlı olabilir); Marp yönergeleri (<!-- _class: ... -->) atlanır.
    if (trimmed.startsWith("<!--")) {
      flushPara();
      let body = trimmed.slice(4);
      while (!body.includes("-->") && i + 1 < lines.length) body += `\n${lines[++i]}`;
      body = body.replace(/--!?>[\s\S]*$/, "").trim();
      if (body && !/^_?\w+\s*:/.test(body)) notes.push(body);
      continue;
    }
    const fence = trimmed.match(FENCE);
    if (fence) {
      flushPara();
      const lang = (fence[2] ?? "").toLowerCase();
      const code: string[] = [];
      while (i + 1 < lines.length && !FENCE.test(lines[i + 1]!.trim())) code.push(lines[++i]!);
      i++;
      if (lang === "mermaid") blocks.push({ type: "diagram", source: clip(code.join("\n"), 4000), reveal: /sequenceDiagram/.test(code.join("\n")) });
      else blocks.push({ type: "code", language: lang.replace(/[^a-z0-9+#-]/g, "").slice(0, 20), code: clip(code.join("\n"), 4000), highlightSteps: [], morphs: [] });
      continue;
    }
    const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara();
      const text = clip(inline(h[2]!), 160);
      if (!title) { title = text; if (h[1] === "#" && blocks.length === 0) layout = index === 0 ? "title" : "section"; }
      else blocks.push({ type: "heading", text, level: h[1]!.length <= 2 ? 1 : 2 });
      continue;
    }
    if (/^\s*([-*+]|\d+[.)])\s+/.test(line)) {
      flushPara();
      const items: string[] = [];
      let fragmented = false;
      while (i < lines.length && /^\s*([-*+]|\d+[.)])\s+/.test(lines[i]!)) {
        if (/^\s*\*\s+/.test(lines[i]!)) fragmented = true;
        items.push(clip(inline(lines[i]!.replace(/^\s*([-*+]|\d+[.)])\s+/, "")), 300));
        i++;
      }
      i--;
      for (let k = 0; k < items.length; k += 12) blocks.push({ type: "bullets", items: items.slice(k, k + 12), reveal: fragmented });
      continue;
    }
    if (trimmed.startsWith(">")) {
      flushPara();
      const quote: string[] = [];
      while (i < lines.length && lines[i]!.trim().startsWith(">")) quote.push(lines[i++]!.trim().replace(/^>\s?/, ""));
      i--;
      blocks.push({ type: "callout", tone: "info", text: clip(inline(quote.join(" ")), 600) });
      continue;
    }
    const img = trimmed.match(/^!\[([^\]]*)\]\(([^)]*)\)/);
    if (img) { flushPara(); if (!/^bg\b/.test(img[1]!)) notes.push(`Görsel aktarılmadı (${img[1] || "açıklamasız"}): ${img[2]}. Studio'da görsel bloğuyla yükleyebilirsin.`); continue; }
    if (!trimmed) { flushPara(); continue; }
    para.push(trimmed);
  }
  flushPara();
  return { title: title || `Slayt ${index + 1}`, layout, blocks: blocks.slice(0, 12), notes: clip(notes.join("\n\n"), 5000), motion: "" };
}

export function marpToSlides(md: string): { slides: Slide[]; truncated: boolean } {
  const parts = splitSlides(md);
  return { slides: parts.slice(0, MAX_SLIDES).map(parseSlide), truncated: parts.length > MAX_SLIDES };
}
