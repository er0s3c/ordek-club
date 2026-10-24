// Ders gövdesini (Markdown) React öğelerine çevirir. HTML hiçbir zaman olduğu gibi basılmaz:
// marked yalnızca belirteç (token) üretir, her belirteç burada izin verilen bir öğeye dönüşür.
// İzinli ham HTML yalnızca <details><summary>; diğer HTML düz metin olarak gösterilir.
import Link from "next/link";
import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { marked, type Token, type Tokens } from "marked";
import { LessonAnimation } from "./LessonAnimation";
import { Terminal } from "@/components/ui/Terminal";
import { parseShell, SHELL_LANGS } from "@/components/ui/terminal-parse";
import { MissionCard, type MissionData } from "./MissionCard";
import { decode, stripTags } from "./markdown-text";

// Gövdedeki görev yerleştirme ayracı (::gorev[id]); tanım ders front-matter'ında (gorevler:).
export type MissionCtx = { slug: string; items: MissionData[]; next: { href: string; title: string } | null; trackHref: string; readOnly?: boolean };
type Ctx = { images: ReadonlySet<string>; skipTitle: boolean; revealEnding: boolean; missions?: MissionCtx };

export function slugify(text: string): string {
  return text
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşü]/g, (c) => ({ ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" })[c] ?? c)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const plain = (tokens: Token[] | undefined): string =>
  (tokens ?? []).map((t) => ("tokens" in t && t.tokens ? plain(t.tokens as Token[]) : "text" in t ? decode(String(t.text)) : "")).join("");

function safeHref(href: string): { kind: "internal" | "external" | "anchor"; href: string } | null {
  if (/^\/(academy|api\/academy\/images)(\/|$)/.test(href)) return { kind: "internal", href };
  if (/^https?:\/\//i.test(href) || /^mailto:/i.test(href)) return { kind: "external", href };
  if (/^#[\w-]+$/.test(href)) return { kind: "anchor", href };
  return null; // göreli/bilinmeyen şema (javascript: vb.) → bağlantı yok
}

const imageName = (href: string) => href.match(/^\/api\/academy\/images\/([a-z0-9-]+\.(?:webp|png|jpe?g))$/)?.[1];
const imageReady = (href: string, ctx: Ctx) => {
  const name = imageName(href);
  return !!name && ctx.images.has(name);
};

// Akademi görselleri aşamalı ekleniyor. Dosyası olmayan görsel hiç çizilmez: "hazırlanıyor" kutusu güven kaybettiriyordu
// (docs/design-council/03 P0 #11).
function Img({ href, alt, ctx, portrait }: { href: string; alt: string; ctx: Ctx; portrait?: boolean }) {
  if (!imageReady(href, ctx)) return null;
  // eslint-disable-next-line @next/next/no-img-element -- görseller kendi API'mizden, optimizasyon kapalı
  return <img className={portrait ? "md-portrait" : "md-img"} src={href} alt={alt} loading="lazy" decoding="async" />;
}

function Inline({ tokens, ctx }: { tokens: Token[] | undefined; ctx: Ctx }): ReactNode {
  return (tokens ?? []).map((t, i) => {
    switch (t.type) {
      case "text":
        return "tokens" in t && t.tokens ? <Inline key={i} tokens={t.tokens} ctx={ctx} /> : decode(t.text);
      case "escape":
        return t.text;
      case "strong":
        return <strong key={i}><Inline tokens={t.tokens} ctx={ctx} /></strong>;
      case "em":
        return <em key={i}><Inline tokens={t.tokens} ctx={ctx} /></em>;
      case "del":
        return <del key={i}><Inline tokens={t.tokens} ctx={ctx} /></del>;
      case "codespan":
        return <code key={i} className="md-codespan">{decode(t.text)}</code>;
      case "br":
        return <br key={i} />;
      case "image": {
        const img = t as Tokens.Image;
        return <Img key={i} href={img.href} alt={img.text} ctx={ctx} portrait={/\/karakter-[a-z-]+\.\w+$/.test(img.href)} />;
      }
      case "link": {
        const l = t as Tokens.Link;
        const s = safeHref(l.href);
        const children = <Inline tokens={l.tokens} ctx={ctx} />;
        if (!s) return <span key={i}>{children}</span>;
        if (s.kind === "internal") return <Link key={i} href={s.href}>{children}</Link>;
        if (s.kind === "anchor") return <a key={i} href={s.href}>{children}</a>;
        return <a key={i} href={s.href} target="_blank" rel="noopener noreferrer">{children}</a>;
      }
      case "html":
        return stripTags(t.text);
      default:
        return "text" in t ? decode(String(t.text)) : null;
    }
  });
}

const ANIM = /^::animasyon\[([a-z0-9-]+)\]$/;
const MISSION = /^::gorev\[([a-z0-9-]{1,40})\]$/;

function Blocks({ tokens, ctx }: { tokens: Token[]; ctx: Ctx }): ReactNode {
  const out: ReactNode[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!;
    const key = out.length;
    switch (t.type) {
      case "space":
      case "def":
        break;
      case "heading": {
        if (t.depth === 1 && ctx.skipTitle) { ctx.skipTitle = false; break; }
        const id = slugify(plain(t.tokens));
        const H = (`h${Math.min(Math.max(t.depth, 2), 4)}`) as "h2" | "h3" | "h4";
        out.push(<H key={key} id={id}><Inline tokens={t.tokens} ctx={ctx} /></H>);
        break;
      }
      case "paragraph": {
        const anim = t.text.trim().match(ANIM);
        if (anim) { out.push(<LessonAnimation key={key} id={anim[1]!} />); break; }
        const gm = t.text.trim().match(MISSION);
        if (gm) {
          const m = ctx.missions?.items.find((x) => x.id === gm[1]);
          // Tanımsız görev dersi kilitlemez; yalnızca yer tutucu (07 I5)
          out.push(m && ctx.missions
            ? <MissionCard key={key} slug={ctx.missions.slug} mission={m} next={ctx.missions.next} trackHref={ctx.missions.trackHref} readOnly={ctx.missions.readOnly} />
            : <p key={key} className="mission-missing">Bu görev hazırlanıyor.</p>);
          break;
        }
        const only = t.tokens?.length === 1 && t.tokens[0]!.type === "image";
        if (only && !imageReady((t.tokens![0] as Tokens.Image).href, ctx)) break;
        out.push(only ? <figure key={key} className="md-figure"><Inline tokens={t.tokens} ctx={ctx} /></figure> : <p key={key}><Inline tokens={t.tokens} ctx={ctx} /></p>);
        break;
      }
      case "text":
        out.push(<p key={key}><Inline tokens={t.tokens ?? [{ type: "text", raw: t.text, text: t.text } as Token]} ctx={ctx} /></p>);
        break;
      case "blockquote": {
        const inner = (t as Tokens.Blockquote).tokens;
        const first = plain((inner[0] as Tokens.Paragraph | undefined)?.tokens).trim();
        // Hikâye kutuları: 🕴️ DOSYA (kötü adam tanıtımı) ve 🔒 DOSYA KAPANDI (bölüm sonu)
        const cls = first.startsWith("🕴") ? "dossier" : first.startsWith("🔒") ? "dossier dossier-closed" : "md-quote";
        // Bölüm sonu (ipucu dahil) ders tamamlanmadan gösterilmez: hikâyenin devamı ödüldür.
        if (cls.includes("dossier-closed") && !ctx.revealEnding) {
          out.push(<div key={key} className="dossier-locked"><Lock size={16} aria-hidden /> Bu dosyanın sonu ve sıradaki ipucu, bölümü tamamlayınca açılır.</div>);
          break;
        }
        out.push(<blockquote key={key} className={cls}><Blocks tokens={inner} ctx={ctx} /></blockquote>);
        break;
      }
      case "list": {
        const L = t.ordered ? "ol" : "ul";
        out.push(
          <L key={key} className="md-list" start={t.ordered && t.start !== "" && t.start !== 1 ? Number(t.start) : undefined}>
            {(t.items as Tokens.ListItem[]).map((it, j) => (
              <li key={j}>{it.loose ? <Blocks tokens={it.tokens} ctx={ctx} /> : <ListItem tokens={it.tokens} ctx={ctx} />}</li>
            ))}
          </L>,
        );
        break;
      }
      case "table": {
        const tb = t as Tokens.Table;
        const align = (a: Tokens.TableCell["align"]) => (a ? { textAlign: a } : undefined);
        out.push(
          <div key={key} className="table-wrap md-table-wrap">
            <table className="table md-table">
              <thead><tr>{tb.header.map((c, j) => <th key={j} style={align(c.align)}><Inline tokens={c.tokens} ctx={ctx} /></th>)}</tr></thead>
              <tbody>{tb.rows.map((r, ri) => <tr key={ri}>{r.map((c, j) => <td key={j} style={align(c.align)}><Inline tokens={c.tokens} ctx={ctx} /></td>)}</tr>)}</tbody>
            </table>
          </div>,
        );
        break;
      }
      case "code":
        // Kabuk blokları terminal bileşeniyle (§5.14); diğer diller koyu kod kutusunda.
        if (SHELL_LANGS.has((t.lang || "").toLowerCase()))
          out.push(<Terminal key={key} lines={parseShell(t.text, (t.lang || "").toLowerCase())} title={/^(powershell|ps1)$/i.test(t.lang || "") ? "PowerShell" : "Terminal"} />);
        else out.push(<pre key={key} className="md-code" data-lang={t.lang || undefined}><code>{t.text}</code></pre>);
        break;
      case "hr":
        out.push(<hr key={key} className="divider" />);
        break;
      case "html": {
        const open = t.text.match(/^\s*<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*)$/i);
        if (!open) {
          const text = stripTags(t.text).trim();
          if (text) out.push(<p key={key}>{text}</p>);
          break;
        }
        const summary = stripTags(open[1]!).trim() || "Ayrıntı";
        let inner: Token[];
        const rest = open[2]!;
        const close = rest.search(/<\/details>/i);
        if (close >= 0) {
          inner = marked.lexer(rest.slice(0, close));
        } else {
          inner = rest.trim() ? marked.lexer(rest) : [];
          while (i + 1 < tokens.length) {
            const n = tokens[++i]!;
            if (n.type === "html" && /<\/details>/i.test(n.text)) break;
            inner.push(n);
          }
        }
        out.push(<details key={key} className="md-details"><summary>{summary}</summary><div className="md-details-body"><Blocks tokens={inner} ctx={ctx} /></div></details>);
        break;
      }
      default:
        break;
    }
  }
  return out;
}

function ListItem({ tokens, ctx }: { tokens: Token[]; ctx: Ctx }): ReactNode {
  return tokens.map((t, i) =>
    t.type === "text" ? <Inline key={i} tokens={(t as Tokens.Text).tokens ?? [t]} ctx={ctx} /> : <Blocks key={i} tokens={[t]} ctx={ctx} />,
  );
}

export function Markdown({ source, images, revealEnding = true, missions }: { source: string; images: ReadonlySet<string>; revealEnding?: boolean; missions?: MissionCtx }) {
  const tokens = marked.lexer(source, { gfm: true });
  return <div className="md"><Blocks tokens={tokens} ctx={{ images, skipTitle: true, revealEnding, missions }} /></div>;
}
