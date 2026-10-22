import { tr, type Messages } from "./tr";
import { en } from "./en";

export type Locale = "tr" | "en";
const LOCALES: Record<Locale, unknown> = { tr, en };

function merge<T>(base: T, over: unknown): T {
  if (!over || typeof over !== "object") return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
    const b = out[k];
    out[k] = b && typeof b === "object" && v && typeof v === "object" ? merge(b, v) : v ?? b;
  }
  return out as T;
}

const cache = new Map<string, Messages>();

export function getMessages(locale: string | null | undefined): Messages {
  const key = locale === "en" ? "en" : "tr";
  let m = cache.get(key);
  if (!m) {
    m = key === "tr" ? (tr as Messages) : merge(tr as Messages, LOCALES[key]);
    cache.set(key, m);
  }
  return m;
}

export type { Messages };
