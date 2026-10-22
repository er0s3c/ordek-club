// Tarayıcı tarafı API istemcisi. Tüm istekler aynı origin'e, JSON ile gider;
// sunucunun hata biçimi ({ error: { code, message, fields } }) ApiError'a dönüştürülür.
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields: Record<string, string> = {},
    public retryAfterSec?: number,
  ) {
    super(message);
  }
}

type Opts = { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown; form?: FormData; signal?: AbortSignal };

export async function api<T = unknown>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }
  let res: Response;
  try {
    res = await fetch(path, {
      method: opts.method ?? (body ? "POST" : "GET"),
      headers,
      body,
      credentials: "same-origin",
      cache: "no-store",
      signal: opts.signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError(0, "NETWORK", "Sunucuya ulaşılamadı. Bağlantını kontrol edip tekrar dene.");
  }
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* JSON olmayan yanıt */
  }
  if (!res.ok) {
    const e = (data as { error?: { code?: string; message?: string; fields?: Record<string, string>; retryAfterSec?: number } } | null)?.error;
    throw new ApiError(res.status, e?.code ?? "HTTP_" + res.status, e?.message ?? "Beklenmeyen bir hata oluştu.", e?.fields ?? {}, e?.retryAfterSec);
  }
  return data as T;
}
