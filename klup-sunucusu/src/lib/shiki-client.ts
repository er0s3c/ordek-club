// Shiki vurgulayıcısı (istemci): WASM yerine JavaScript düzenli ifade motoru; dil ve tema paketleri yerel,
// yalnız gerektiğinde yüklenir. Kod slaytları (magic-move) ve kod animasyonları ortak kullanır.
import type { HighlighterCore } from "shiki/core";

export const CODE_THEME = "github-dark";
const LANGS = {
  python: () => import("@shikijs/langs/python"),
  javascript: () => import("@shikijs/langs/javascript"),
  typescript: () => import("@shikijs/langs/typescript"),
  bash: () => import("@shikijs/langs/bash"),
  powershell: () => import("@shikijs/langs/powershell"),
  sql: () => import("@shikijs/langs/sql"),
  html: () => import("@shikijs/langs/html"),
  json: () => import("@shikijs/langs/json"),
  yaml: () => import("@shikijs/langs/yaml"),
  http: () => import("@shikijs/langs/http"),
  c: () => import("@shikijs/langs/c"),
  php: () => import("@shikijs/langs/php"),
  java: () => import("@shikijs/langs/java"),
  go: () => import("@shikijs/langs/go"),
  ini: () => import("@shikijs/langs/ini"),
  nginx: () => import("@shikijs/langs/nginx"),
  dockerfile: () => import("@shikijs/langs/dockerfile"),
  diff: () => import("@shikijs/langs/diff"),
  log: () => import("@shikijs/langs/log"),
} as const;
const ALIAS: Record<string, keyof typeof LANGS> = { py: "python", js: "javascript", ts: "typescript", sh: "bash", shell: "bash", zsh: "bash", ps1: "powershell", yml: "yaml", htm: "html" };

export function normalizeLang(lang: string | undefined): keyof typeof LANGS | "text" {
  const l = (lang ?? "").toLowerCase();
  return (l in LANGS ? l : ALIAS[l]) as keyof typeof LANGS ?? "text";
}

let pending: Promise<HighlighterCore> | null = null;
export async function highlighter(lang: string): Promise<HighlighterCore> {
  pending ??= (async () => {
    const [{ createHighlighterCore }, { createJavaScriptRegexEngine }, theme] = await Promise.all([import("shiki/core"), import("shiki/engine/javascript"), import("@shikijs/themes/github-dark")]);
    return createHighlighterCore({ themes: [theme.default], langs: [], engine: createJavaScriptRegexEngine() });
  })();
  const h = await pending;
  const key = normalizeLang(lang);
  if (key !== "text" && !h.getLoadedLanguages().includes(key)) await h.loadLanguage((await LANGS[key]()).default);
  return h;
}
