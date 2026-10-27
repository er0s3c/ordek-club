"use client";
// Kod gösterimi: Shiki ile renklendirme (HTML enjekte edilmez, belirteçler React öğesi olarak çizilir) ve
// kod değiştiğinde shiki-magic-move ile belirteçlerin yumuşakça yer değiştirmesi. Satır vurguları üstte şerit olarak.
import { useEffect, useState } from "react";
import type { HighlighterCore, ThemedToken } from "shiki/core";
import { CODE_THEME, highlighter, normalizeLang } from "@/lib/shiki-client";
import "shiki-magic-move/style.css";

type Props = { code: string; lang: string; highlight?: Set<number>; animate?: boolean; className?: string; lineNumbers?: boolean };

function useHighlighter(lang: string) {
  const [h, setH] = useState<HighlighterCore | null>(null);
  useEffect(() => { let live = true; void highlighter(lang).then((x) => { if (live) setH(x); }); return () => { live = false; }; }, [lang]);
  return h;
}

// Statik renklendirme: vurgulanan satırlar (1 tabanlı) belirgin, diğerleri hafif soluk.
export function ShikiCode({ code, lang, highlight, className, lineNumbers = true }: Props) {
  const h = useHighlighter(lang);
  const key = normalizeLang(lang);
  const lines: ThemedToken[][] | null = h && key !== "text" ? h.codeToTokensBase(code, { lang: key, theme: CODE_THEME }) : null;
  const dim = highlight && highlight.size > 0;
  return (
    <pre className={`shiki-code ${className ?? ""}`} data-lang={lang || undefined}>
      {(lines ?? code.split("\n").map((t) => [{ content: t, offset: 0 } as ThemedToken])).map((toks, i) => (
        <div key={i} className={highlight?.has(i + 1) ? "code-line is-hl" : dim ? "code-line is-dim" : "code-line"}>
          {lineNumbers && <span className="ln" aria-hidden>{i + 1}</span>}
          <code>{toks.length ? toks.map((t, j) => <span key={j} style={t.color ? { color: t.color } : undefined}>{t.content}</span>) : " "}</code>
        </div>
      ))}
    </pre>
  );
}

// Adımlar arasında kod değişiyorsa: magic-move geçişi; değişmiyorsa statik görünüm. Vurgular şerit katmanında.
export function MagicCode({ code, lang, highlight, animate = true, className }: Props) {
  const h = useHighlighter(lang);
  const [Magic, setMagic] = useState<typeof import("shiki-magic-move/react").ShikiMagicMove | null>(null);
  useEffect(() => { let live = true; void import("shiki-magic-move/react").then((m) => { if (live) setMagic(() => m.ShikiMagicMove); }); return () => { live = false; }; }, []);
  const key = normalizeLang(lang);
  if (!h || !Magic || key === "text") return <ShikiCode code={code} lang={lang} highlight={highlight} className={className} />;
  return (
    <div className={`magic-code ${className ?? ""}`}>
      {[...(highlight ?? [])].map((n) => <span key={n} className="magic-hl" style={{ top: `calc(${n - 1} * var(--code-lh))` }} aria-hidden />)}
      <Magic highlighter={h} lang={key} theme={CODE_THEME} code={code} options={{ duration: animate ? 650 : 0, stagger: 0.3, lineNumbers: true, animateContainer: false }} className="magic-pre" />
    </div>
  );
}
