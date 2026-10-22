// Bellek içi kayan pencere hız sınırlayıcı. Tek süreçli kurulum için yeterlidir;
// birden çok uygulama örneği çalıştırılırsa paylaşımlı depoya (Redis) taşınmalıdır.
type Bucket = { hits: number[] };

const g = globalThis as unknown as { __clubRate?: Map<string, Bucket> };
const buckets: Map<string, Bucket> = g.__clubRate ?? new Map();
g.__clubRate = buckets;

export type RateResult = { ok: true } | { ok: false; retryAfterSec: number };

export function hit(key: string, limit: number, windowMs: number, now = Date.now()): RateResult {
  const b = buckets.get(key) ?? { hits: [] };
  b.hits = b.hits.filter((t) => now - t < windowMs);
  if (b.hits.length >= limit) {
    buckets.set(key, b);
    const oldest = b.hits[0] ?? now;
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)) };
  }
  b.hits.push(now);
  buckets.set(key, b);
  return { ok: true };
}

export function reset(key: string) {
  buckets.delete(key);
}

export function resetAll() {
  buckets.clear();
}

// Bellek sızıntısını önlemek için süresi geçmiş kovaları temizle.
export function sweep(maxWindowMs = 60 * 60 * 1000, now = Date.now()) {
  for (const [k, b] of buckets) {
    if (b.hits.every((t) => now - t >= maxWindowMs)) buckets.delete(k);
  }
}

// Önceden tanımlı limitler (deneme sayısı, pencere)
export const LIMITS = {
  loginPerIp: [20, 15 * 60_000],
  loginPerUser: [8, 15 * 60_000],
  registerPerIp: [10, 60 * 60_000],
  setupPerIp: [10, 15 * 60_000],
  passwordPerUser: [10, 15 * 60_000],
  adminWritePerUser: [120, 60_000],
} as const satisfies Record<string, readonly [number, number]>;
