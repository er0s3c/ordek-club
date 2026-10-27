// ============================================================================
//  lib/session.js — SUNUCU-ONLY panel oturumu (HMAC ile imzalı httpOnly çerez).
//  ⚠ Bu, kasıtlı zafiyetli /jwt challenge'ından TAMAMEN ayrıdır; gerçek panel
//     kimlik doğrulaması içindir. Lab hedef DB'sine (Prisma User) dokunmaz.
//  Token şekli:  base64url(JSON payload) "." base64url(HMAC-SHA256(payload))
//  Payload:      { uid, role, exp }
// ============================================================================
import crypto from "node:crypto";

function parseCookie(str) {
  const obj = {};
  if (typeof str !== "string") return obj;
  for (const pair of str.split(";")) {
    const eq = pair.indexOf("=");
    if (eq > 0) {
      const key = pair.slice(0, eq).trim();
      const val = pair.slice(eq + 1).trim();
      obj[key] = val;
    }
  }
  return obj;
}

function serializeCookie(name, val, opts = {}) {
  let str = `${name}=${val}; Path=${opts.path || "/"}`;
  if (opts.maxAge !== undefined) str += `; Max-Age=${opts.maxAge}`;
  if (opts.httpOnly) str += `; HttpOnly`;
  if (opts.sameSite) str += `; SameSite=${opts.sameSite}`;
  return str;
}

export const COOKIE = "ordek_session";
const MAXAGE_S = 60 * 60 * 24 * 7; // 7 gün

// Lab-only: env yoksa sabit fallback (oturumlar yeniden başlatmada bozulmasın).
// setup.mjs üretimde LAB_SESSION_SECRET yazar.
function secret() {
  return process.env.LAB_SESSION_SECRET || "ordek-lab-dev-session-secret-change-me";
}

const b64u = (buf) => Buffer.from(buf).toString("base64url");
const hmac = (data) => crypto.createHmac("sha256", secret()).update(data).digest();

function sign(payload) {
  const body = b64u(JSON.stringify(payload));
  const sig = b64u(hmac(body));
  return `${body}.${sig}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let expected;
  try { expected = b64u(hmac(body)); } catch { return null; }

  // Timing-safe HMAC verification (prevents timing side-channels regardless of sig length)
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  const dummyBuf = Buffer.alloc(expBuf.length);
  const equalLen = sigBuf.length === expBuf.length;
  try {
    const match = crypto.timingSafeEqual(equalLen ? sigBuf : dummyBuf, expBuf);
    if (!equalLen || !match) return null;
  } catch { return null; }

  let obj;
  try { obj = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")); } catch { return null; }
  if (!obj || typeof obj !== "object") return null;
  if (obj.exp && Date.now() > obj.exp) return null;
  return { userId: obj.uid, role: obj.role };
}

// Bir Request/Headers'tan oturumu çöz. { userId, role } | null
export function getSession(req) {
  try {
    const raw = req && req.headers && typeof req.headers.get === "function"
      ? req.headers.get("cookie")
      : (req && req.headers && req.headers.cookie) || "";
    if (!raw) return null;
    const jar = parseCookie(raw);
    return verifyToken(jar[COOKIE]);
  } catch { return null; }
}

// Set-Cookie değeri üret (route handler'ı response header'ına ekler).
export function sessionCookie(userId, role) {
  const token = sign({ uid: userId, role, exp: Date.now() + MAXAGE_S * 1000 });
  return serializeCookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAXAGE_S,
  });
}

export function clearCookie() {
  return serializeCookie(COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}
