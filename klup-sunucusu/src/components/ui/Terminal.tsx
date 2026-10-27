"use client";

import { useRef, useState, type ReactNode } from "react";
import { WrapText } from "lucide-react";
import { CopyMark } from "@/components/motion/CopyMark";
import type { TermLine } from "./terminal-parse";
import { useT } from "@/i18n/client";

// Terminal bloğu (docs/TASARIM-SISTEMI.md §5.14): koyu pencere, üç noktalı başlık çubuğu, hover'da beliren
// kopyala / satır kaydır kontrolleri. Bu projeye özgü yazılmıştır; ikonlar Lucide (ISC).

// Alt komut alan araçlar: ikinci kelime "fonksiyon" rengini alır (apt install, git status…).
const SUBCOMMAND_TOOLS = new Set(["apt", "apt-get", "git", "docker", "npm", "pip", "pip3", "systemctl", "kubectl", "journalctl", "ip", "nmcli", "snap", "dnf", "yum", "brew", "gh", "openssl"]);

// Bir komut satırını renk parçalarına ayırır (yalnız görüntü; kopyalanan metin ham kalır).
function commandTokens(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  // satır sonu açıklaması: boşluktan sonra gelen # … (tırnak içinde değilse)
  let body = text;
  let comment = "";
  const m = text.match(/^((?:[^'"#]|'[^']*'|"[^"]*")*?)(\s+#.*)$/);
  if (m) {
    body = m[1]!;
    comment = m[2]!;
  } else if (/^\s*#/.test(text)) {
    return [<span key="c" className="t-comment">{text}</span>];
  }
  const parts = body.match(/("[^"]*"|'[^']*'|\s+|[^\s]+)/g) ?? [];
  // "sudo" komutu kaydırır: asıl komut bir sonraki kelimedir.
  const words = parts.filter((p) => !/^\s+$/.test(p));
  const cmdAt = words[0] === "sudo" ? 1 : 0;
  const tool = words[cmdAt] ?? "";
  let word = 0;
  parts.forEach((p, i) => {
    if (/^\s+$/.test(p)) return out.push(p);
    let cls = "t-cmd";
    if (word <= cmdAt) cls = "t-cmd";
    else if (/^-/.test(p)) cls = "t-param";
    else if (/^\d+(\.\d+)*$/.test(p)) cls = "t-num";
    else if (/^["']/.test(p)) cls = "t-param";
    else if (word === cmdAt + 1 && SUBCOMMAND_TOOLS.has(tool)) cls = "t-fn";
    else if (/^(\||&&|;|\d?>{1,2}|<)/.test(p)) cls = "t-path";
    word++;
    out.push(<span key={i} className={cls}>{p}</span>);
  });
  if (comment) out.push(<span key="c" className="t-comment">{comment}</span>);
  return out;
}

export function Terminal({ lines, title = "Terminal", variant = "default", className = "", controls = true }: {
  lines: TermLine[];
  title?: string;
  variant?: "default" | "attacker" | "defender";
  className?: string;
  controls?: boolean;
}) {
  const t = useT();
  const [wrapped, setWrapped] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function copy() {
    // Yalnız komut + çıktı (başlık ve istem hariç)
    const text = lines.map((l) => l.text).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* pano izni yoksa sessiz geç */
    }
  }

  return (
    <figure className={`ciu-terminal${wrapped ? " is-wrapped" : ""} ${className}`} data-variant={variant}>
      <div className="ciu-terminal__bar">
        <span className="ciu-terminal__dots" aria-hidden><i /><i /><i /></span>
        <figcaption className="ciu-terminal__title">{title}</figcaption>
        {controls && (
          <div className="ciu-terminal__controls">
            <button type="button" className={`ciu-terminal__btn${copied ? " is-copied" : ""}`} onClick={copy} aria-label={copied ? t("Kopyalandı") : t("Kopyala")} title={copied ? t("Kopyalandı") : t("Kopyala")}>
              <CopyMark copied={copied} />
            </button>
            <button type="button" className="ciu-terminal__btn" onClick={() => setWrapped((w) => !w)} aria-pressed={wrapped} aria-label={t("Satırları kaydır")} title={t("Satırları kaydır")}>
              <WrapText aria-hidden />
            </button>
          </div>
        )}
        {copied && <span className="sr-only" role="status">{t("Panoya kopyalandı")}</span>}
      </div>
      <pre className="ciu-terminal__body" tabIndex={0}>
        <code>
          {lines.map((l, i) => (
            <span key={i} className={`t-line${l.isNew ? " is-new" : ""}`}>
              {l.kind === "cmd" ? (
                <>
                  {l.user && <span className="t-user">{l.user}</span>}
                  {l.host && <span className="t-path">@{l.host}</span>}
                  {l.path && <span className="t-path">:{l.path}</span>}
                  <span className="t-symbol">{l.symbol ?? "$"}</span>{" "}
                  {commandTokens(l.text)}
                </>
              ) : (
                <span className={l.comment ? "t-comment" : "t-out"}>{l.text}</span>
              )}
              {i < lines.length - 1 ? "\n" : null}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
