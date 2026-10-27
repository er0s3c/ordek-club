// Yol kitabı: bir öğrenme yolunun bütün derslerini (çizgi roman diyalogları dâhil) tek PDF'e basar.
// Öğretmenin sınıfa dağıtabileceği materyal. Görseller gömülmez (webp pdf-lib ile gömülemez); çizgi
// romanlar anlatıcı + balon metni olarak basılır, yani kâğıtta okunabilir bir senaryo olur.
import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { db } from "@/server/db";
import { notFound } from "@/server/errors";
import { trackText } from "./content-i18n";
import { comicsFor } from "./comics";
import { availableImages } from "./images";

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 56;

type Fonts = { regular: PDFFont; bold: PDFFont };

async function loadFonts(pdf: PDFDocument): Promise<Fonts> {
  pdf.registerFontkit(fontkit);
  const dir = path.join(process.cwd(), "node_modules", "@fontsource", "readex-pro", "files");
  const pick = async (names: string[]) => {
    for (const n of names) {
      try {
        return await pdf.embedFont(await fs.readFile(path.join(dir, n)), { subset: true });
      } catch {
        /* sıradaki */
      }
    }
    throw new Error("Yol kitabı yazı tipi bulunamadı.");
  };
  return {
    regular: await pick(["readex-pro-latin-ext-400-normal.woff", "readex-pro-latin-400-normal.woff"]),
    bold: await pick(["readex-pro-latin-ext-600-normal.woff", "readex-pro-latin-600-normal.woff"]),
  };
}

// Yazı tipinde olmayan karakterleri düşürür (emoji vb.). Türkçe harfler latin-ext'te var.
function cleaner(font: PDFFont) {
  const set = new Set(font.getCharacterSet());
  return (s: string) => {
    let out = "";
    for (const ch of s.normalize("NFC")) out += set.has(ch.codePointAt(0)!) ? ch : "";
    return out.replace(/\s+/g, " ").trim();
  };
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    line = "";
    for (const ch of w) {
      if (font.widthOfTextAtSize(line + ch, size) > maxWidth) {
        lines.push(line);
        line = ch;
      } else line += ch;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

const stripMd = (s: string) =>
  s
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "");

export type BookBlock =
  | { kind: "h1" | "h2" | "h3" | "p" | "quote" | "li" | "oli"; text: string }
  | { kind: "code"; lines: string[] }
  | { kind: "comic"; id: string; title: string; panels: { caption: string | null; bubbles: { who: string; text: string }[] }[] }
  | { kind: "hr" };

// Markdown → basit blok listesi. Yalnız basılı kitapta anlamlı yapılar korunur; tablolar satıra dökülür.
export function parseBookBody(markdown: string, lang: "tr" | "en"): BookBlock[] {
  const strips = comicsFor(markdown, availableImages(), lang);
  const blocks: BookBlock[] = [];
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let i = 0;
  while (i < lines.length) {
    const t = lines[i]!.trim();
    if (!t) {
      i++;
      continue;
    }
    if (t.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i]!.trim().startsWith("```")) code.push(lines[i++]!);
      i++;
      blocks.push({ kind: "code", lines: code });
      continue;
    }
    const comic = t.match(/^::cizgi\[([a-z0-9-]{1,60})\]$/);
    if (comic) {
      const s = strips[comic[1]!];
      if (s) {
        blocks.push({
          kind: "comic",
          id: s.id,
          title: s.title,
          panels: s.panels.map((p) => ({ caption: p.caption, bubbles: p.bubbles.map((b) => ({ who: b.who, text: b.text })) })),
        });
      }
      i++;
      continue;
    }
    if (/^::/.test(t)) {
      i++;
      continue;
    }
    if (/^---+$/.test(t)) {
      blocks.push({ kind: "hr" });
      i++;
      continue;
    }
    const h = t.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1]!.length;
      blocks.push({ kind: level === 1 ? "h1" : level === 2 ? "h2" : "h3", text: stripMd(h[2]!) });
      i++;
      continue;
    }
    if (t.startsWith(">")) {
      const parts: string[] = [];
      while (i < lines.length && lines[i]!.trim().startsWith(">")) parts.push(lines[i++]!.replace(/^\s*>\s?/, ""));
      const text = stripMd(parts.join(" "));
      if (text) blocks.push({ kind: "quote", text });
      continue;
    }
    if (/^[-*]\s+/.test(t)) {
      blocks.push({ kind: "li", text: stripMd(t.replace(/^[-*]\s+/, "")) });
      i++;
      continue;
    }
    if (/^\d+\.\s+/.test(t)) {
      blocks.push({ kind: "oli", text: stripMd(t.replace(/^\d+\.\s+/, "")) });
      i++;
      continue;
    }
    if (t.startsWith("|")) {
      while (i < lines.length && lines[i]!.trim().startsWith("|")) {
        const row = lines[i++]!.trim();
        if (/^\|[\s:|-]+\|$/.test(row)) continue;
        blocks.push({ kind: "li", text: row.replace(/^\||\|$/g, "").split("|").map((c) => stripMd(c.trim())).join("  ·  ") });
      }
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i]!.trim() && !/^(#{1,6}\s|```|>|[-*]\s|\d+\.\s|\||::|---)/.test(lines[i]!.trim())) para.push(lines[i++]!.trim());
    const text = stripMd(para.join(" "));
    if (text) blocks.push({ kind: "p", text });
  }
  return blocks;
}

// ── PDF çizimi ──────────────────────────────────────────────────────────────
export async function trackBookPdf({ key, lang }: { key: string; lang: "tr" | "en" }) {
  const track = await db.track.findFirst({
    where: { key, archivedAt: null },
    include: {
      lessons: {
        where: { archivedAt: null },
        orderBy: { position: "asc" },
        select: { slug: true, title: true, body: true, goals: true, kind: true, minutes: true, translations: { where: { locale: "en" } } },
      },
    },
  });
  if (!track) throw notFound("Yol bulunamadı.");
  const meta = trackText(track.key, track.title, track.summary, lang);
  const pdf = await PDFDocument.create();
  const fonts = await loadFonts(pdf);
  const cleanR = cleaner(fonts.regular);
  const cleanB = cleaner(fonts.bold);
  pdf.setTitle(`${meta.title} — Ördek Akademi`);
  pdf.setCreator("Ördek Club");
  pdf.setSubject(lang === "en" ? "Course book" : "Ders kitabı");

  const purple = rgb(0.36, 0.12, 0.89);
  const ink = rgb(0.12, 0.12, 0.14);
  const muted = rgb(0.42, 0.42, 0.46);
  const paper = rgb(1, 0.99, 0.96);
  const rule = rgb(0.88, 0.86, 0.8);
  const codeBg = rgb(0.96, 0.955, 0.93);

  let page: PDFPage = pdf.addPage(A4);
  let y = A4[1] - MARGIN;
  let pageNo = 1;

  const paint = (p: PDFPage) => {
    p.drawRectangle({ x: 0, y: 0, width: A4[0], height: A4[1], color: paper });
    p.drawRectangle({ x: 0, y: A4[1] - 18, width: A4[0], height: 18, color: purple });
  };
  paint(page);

  const newPage = () => {
    page.drawText(cleanR(String(pageNo)), { x: A4[0] - MARGIN - 10, y: 30, size: 8, font: fonts.regular, color: muted });
    page = pdf.addPage(A4);
    paint(page);
    pageNo++;
    y = A4[1] - MARGIN;
  };
  const need = (h: number) => {
    if (y - h < 64) newPage();
  };
  type TextOpts = { bold?: boolean; color?: ReturnType<typeof rgb>; indent?: number; lineHeight?: number };
  const text = (s: string, size: number, opts: TextOpts = {}) => {
    const font = opts.bold ? fonts.bold : fonts.regular;
    const body = (opts.bold ? cleanB : cleanR)(s);
    if (!body) return;
    const indent = opts.indent ?? 0;
    const lh = opts.lineHeight ?? size * 1.5;
    for (const line of wrap(body, font, size, A4[0] - MARGIN * 2 - indent)) {
      need(lh);
      page.drawText(line, { x: MARGIN + indent, y, size, font, color: opts.color ?? ink });
      y -= lh;
    }
  };
  const gap = (n = 8) => {
    y -= n;
  };

  // Kapak
  y = A4[1] - 160;
  page.drawRectangle({ x: MARGIN, y: 150, width: 5, height: 500, color: purple });
  page.drawText(cleanR("ÖRDEK AKADEMİ"), { x: MARGIN + 24, y, size: 12, font: fonts.regular, color: muted });
  y -= 40;
  text(meta.title, 32, { bold: true, color: purple, lineHeight: 40, indent: 24 });
  gap(10);
  text(`${track.code} · ${track.lessons.length} ${lang === "en" ? "lessons" : "ders"}`, 12, { color: muted, indent: 24 });
  gap(14);
  text(meta.summary, 12, { indent: 24, lineHeight: 19 });
  y = 210;
  text(lang === "en" ? "Prepared for classroom use. This is not an accredited certificate." : "Sınıf içi kullanım için hazırlandı. Akredite bir belge değildir.", 10, { color: muted, indent: 24 });
  newPage();

  // İçindekiler
  text(lang === "en" ? "Contents" : "İçindekiler", 20, { bold: true, color: purple });
  gap(10);
  track.lessons.forEach((l, i) => {
    const en = lang === "en" ? l.translations[0] : undefined;
    text(`${String(i + 1).padStart(2, "0")}. ${en?.title ?? l.title}`, 11, { lineHeight: 17 });
  });
  newPage();

  // Dersler
  for (const [index, lesson] of track.lessons.entries()) {
    const en = lang === "en" ? lesson.translations[0] : undefined;
    const goals = en?.goals ?? lesson.goals;
    text(`${String(index + 1).padStart(2, "0")} · ${lesson.kind} · ${lesson.minutes} min`, 9, { color: muted });
    text(en?.title ?? lesson.title, 22, { bold: true, color: purple, lineHeight: 28 });
    gap(4);
    page.drawLine({ start: { x: MARGIN, y }, end: { x: A4[0] - MARGIN, y }, thickness: 1, color: rule });
    gap(14);
    for (const g of goals) text(`• ${g}`, 10, { color: muted, indent: 6, lineHeight: 15 });
    if (goals.length) gap(8);

    for (const b of parseBookBody(en?.body ?? lesson.body, lang)) {
      switch (b.kind) {
        case "h1":
          gap(6);
          text(b.text, 18, { bold: true, color: purple, lineHeight: 24 });
          gap(3);
          break;
        case "h2":
          gap(6);
          text(b.text, 14, { bold: true, lineHeight: 20 });
          gap(3);
          break;
        case "h3":
          gap(4);
          text(b.text, 12, { bold: true, lineHeight: 17 });
          break;
        case "quote": {
          const before = y;
          text(b.text, 10, { indent: 10, color: muted, lineHeight: 15 });
          page.drawRectangle({ x: MARGIN + 1, y: y + 4, width: 2.5, height: Math.max(6, before - y), color: purple });
          gap(5);
          break;
        }
        case "li":
          text(`• ${b.text}`, 10, { indent: 10, lineHeight: 15 });
          break;
        case "oli":
          text(`– ${b.text}`, 10, { indent: 10, lineHeight: 15 });
          break;
        case "p":
          text(b.text, 10.5, { lineHeight: 16 });
          gap(5);
          break;
        case "hr":
          gap(6);
          page.drawLine({ start: { x: MARGIN, y }, end: { x: A4[0] - MARGIN, y }, thickness: 0.6, color: rule });
          gap(8);
          break;
        case "code": {
          gap(5);
          const before = y;
          for (const line of b.lines) text(line || " ", 8.5, { indent: 10, lineHeight: 12 });
          page.drawRectangle({ x: MARGIN, y: y + 2, width: A4[0] - MARGIN * 2, height: Math.max(8, before - y), color: codeBg, borderColor: rule, borderWidth: 0.5 });
          gap(9);
          break;
        }
        case "comic": {
          gap(10);
          text(`${lang === "en" ? "COMIC STRIP" : "ÇİZGİ ROMAN"} · ${b.title}`, 9, { bold: true, color: purple });
          gap(3);
          b.panels.forEach((p, pi) => {
            text(`${lang === "en" ? "Panel" : "Panel"} ${pi + 1}`, 8.5, { color: muted });
            if (p.caption) text(p.caption, 9.5, { indent: 8, lineHeight: 14 });
            for (const bub of p.bubbles) text(`${bub.who}: "${bub.text}"`, 9.5, { indent: 8, lineHeight: 14, color: ink });
            gap(4);
          });
          gap(6);
          break;
        }
      }
    }
    newPage();
  }

  page.drawText(cleanR(String(pageNo)), { x: A4[0] - MARGIN - 10, y: 30, size: 8, font: fonts.regular, color: muted });
  return { bytes: await pdf.save(), title: meta.title, pages: pdf.getPageCount() };
}
