// Terminal bloğu satır modeli ve Markdown kabuk bloklarının ayrıştırılması (sunucu ve istemci ortak; "use client" değil).

export type TermLine =
  | { kind: "cmd"; text: string; user?: string; host?: string; path?: string; symbol?: string; isNew?: boolean }
  | { kind: "out"; text: string; isNew?: boolean; comment?: boolean };

// Markdown kod bloğundan terminal satırları: istemli oturum ("user@host:~$ cmd", "$ cmd", "PS> cmd") ya da
// istemsiz komut listesi (her satır komut).
const PROMPT = /^(?:([\w.-]+)@([\w.-]+)(?::([^\s$#]*))?\s?([$#])|([$#])|(PS(?: [^>]*)?>))\s(.*)$/;

export function parseShell(raw: string, lang: string): TermLine[] {
  const rows = raw.replace(/\n$/, "").split("\n");
  const hasPrompt = rows.some((r) => /^(?:[\w.-]+@[\w.-]+(?::\S*)?\s?[$#]|\$|PS(?: [^>]*)?>)\s/.test(r));
  const ps = lang === "powershell" || lang === "ps1";
  // İstemsiz liste: boş satır boş kalır, yalnız açıklama satırı (# …) istemsiz ve sönük gösterilir.
  if (!hasPrompt)
    return rows.map((text) => (!text.trim() || /^\s*#/.test(text) ? { kind: "out" as const, text, comment: true } : { kind: "cmd" as const, text, symbol: ps ? "PS>" : "$" }));
  return rows.map((r) => {
    const m = r.match(PROMPT);
    if (!m || (m[5] === "#" && !/^#\s+\S+\s/.test(r))) return { kind: "out" as const, text: r };
    if (m[1]) return { kind: "cmd" as const, user: m[1], host: m[2], path: m[3] ?? "", symbol: m[4], text: m[7]! };
    return { kind: "cmd" as const, symbol: m[5] ?? m[6], text: m[7]! };
  });
}

export const SHELL_LANGS = new Set(["bash", "sh", "shell", "zsh", "console", "shell-session", "powershell", "ps1"]);
