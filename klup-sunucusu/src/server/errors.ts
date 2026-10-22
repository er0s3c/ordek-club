// Kullanıcıya gösterilebilir hata. `code` istemcinin dallanması için sabit bir anahtardır,
// `message` Türkçe ve güvenli (iç ayrıntı içermez).
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public extra?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export const badRequest = (message: string, code = "BAD_REQUEST", extra?: Record<string, unknown>) =>
  new HttpError(400, code, message, extra);
export const unauthorized = (message = "Giriş yapmalısın.") => new HttpError(401, "UNAUTHORIZED", message);
export const forbidden = (message = "Bu işlem için yetkin yok.") => new HttpError(403, "FORBIDDEN", message);
export const notFound = (message = "Bulunamadı.") => new HttpError(404, "NOT_FOUND", message);
export const conflict = (message: string, code = "CONFLICT") => new HttpError(409, code, message);
export const tooMany = (retryAfterSec: number) =>
  new HttpError(429, "RATE_LIMITED", "Çok fazla deneme. Lütfen biraz bekleyip tekrar dene.", { retryAfterSec });
