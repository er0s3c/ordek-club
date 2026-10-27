import crypto from "node:crypto";
import { ZodError, type ZodTypeAny, type z } from "zod";
import { HttpError, badRequest, forbidden } from "@/server/errors";
import { env } from "@/server/env";
import { translateFor } from "@/i18n/catalog";
import { localeFromRequest } from "@/i18n/request";

export const REMOTE_ADDR_HEADER = "x-club-remote-addr"; // server.ts tarafından soketten yazılır

export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function errorResponse(err: HttpError): Response {
  const headers: Record<string, string> = {};
  const retry = err.extra?.retryAfterSec;
  if (typeof retry === "number") headers["Retry-After"] = String(retry);
  return json({ error: { code: err.code, message: err.message, ...err.extra } }, { status: err.status, headers });
}

// İstemci IP'si: varsayılan olarak soket adresi (server.ts başlığa yazar, istemcinin gönderdiği aynı adlı
// başlık server.ts'te silinir). TRUST_PROXY=1 ise ters vekilin eklediği en sağdaki X-Forwarded-For girdisi.
export function clientIp(req: Request): string {
  if (env().trustProxy) {
    const xff = req.headers.get("x-forwarded-for");
    const last = xff?.split(",").map((s) => s.trim()).filter(Boolean).pop();
    if (last) return last.slice(0, 64);
  }
  return (req.headers.get(REMOTE_ADDR_HEADER) ?? "unknown").slice(0, 64);
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// CSRF savunması (SameSite=Lax çereze ek olarak): durum değiştiren isteklerde
// Origin'in uygulamanın kendi origin'i olması ve tarayıcının cross-site bildirmemesi gerekir.
export function assertSameOrigin(req: Request) {
  if (SAFE_METHODS.has(req.method)) return;
  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    throw forbidden("İstek reddedildi (çapraz site).");
  }
  const origin = req.headers.get("origin");
  if (!origin) throw forbidden("İstek reddedildi (Origin başlığı yok).");
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw forbidden("İstek reddedildi (geçersiz Origin).");
  }
  const allowed = new Set<string>();
  try { allowed.add(new URL(env().APP_URL).host); } catch { /* yok say */ }
  const host = req.headers.get("host");
  if (host) allowed.add(host);
  if (env().trustProxy) {
    const fwd = req.headers.get("x-forwarded-host");
    if (fwd) allowed.add(fwd.split(",")[0]!.trim());
  }
  if (!allowed.has(originHost)) throw forbidden("İstek reddedildi (Origin uyuşmuyor).");
}

export async function readJson<S extends ZodTypeAny>(req: Request, schema: S, maxBytes = 64 * 1024): Promise<z.output<S>> {
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.toLowerCase().startsWith("application/json")) throw badRequest("İçerik türü application/json olmalı.", "BAD_CONTENT_TYPE");
  const text = await req.text();
  if (Buffer.byteLength(text) > maxBytes) throw badRequest("İstek gövdesi çok büyük.", "BODY_TOO_LARGE");
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw badRequest("Geçersiz JSON.", "BAD_JSON");
  }
  return schema.parse(raw);
}

function zodToHttp(err: ZodError): HttpError {
  const fields: Record<string, string> = {};
  for (const i of err.issues) {
    const k = i.path.join(".") || "_";
    if (!fields[k]) fields[k] = i.message;
  }
  return badRequest("Gönderilen bilgilerde hata var.", "VALIDATION", { fields });
}

// Hata metinleri Türkçe yazılır; istemcinin diline (tercih çerezi → Accept-Language) burada çevrilir.
async function localized(req: Request, err: HttpError): Promise<HttpError> {
  const locale = await localeFromRequest(req).catch(() => "tr" as const);
  if (locale === "tr") return err;
  const fields = err.extra?.fields as Record<string, string> | undefined;
  const extra = fields ? { ...err.extra, fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, translateFor(locale, v)])) } : err.extra;
  return new HttpError(err.status, err.code, translateFor(locale, err.message), extra);
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

// Tüm route handler'ların sarmalayıcısı: CSRF, tutarlı hata biçimi, iç hataların gizlenmesi.
export function route<C = unknown>(fn: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      assertSameOrigin(req);
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof HttpError) return errorResponse(await localized(req, err));
      if (err instanceof ZodError) return errorResponse(await localized(req, zodToHttp(err)));
      const ref = crypto.randomBytes(4).toString("hex");
      console.error(`[club] beklenmeyen hata ref=${ref}`, err);
      return errorResponse(await localized(req, new HttpError(500, "INTERNAL", `Sunucu hatası (ref: ${ref}).`)));
    }
  };
}
