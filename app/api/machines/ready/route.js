// Makine hazır mı? Panel, iç ağdan hedefe (ordek-m-<token>:3000) sunucu-taraflı yoklama yapar.
// (Öğrenci tarayıcısı makineye doğrudan erişemez; bu yüzden hazırlık panelden kontrol edilir.)
import { resolveTarget } from "@/lib/docker";
import { TOKEN_RE } from "@/lib/target-cookie";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const safeLabel = (s) => String(s || "").replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 64);

export async function GET(req) {
  let sess = null;
  if (process.env.LAB_MODE === "class") {
    sess = getSession(req);
    if (!sess) return Response.json({ ready: false, error: "yetkisiz" }, { status: 401 });
  }

  const token = new URL(req.url).searchParams.get("token") || "";
  if (!TOKEN_RE.test(token)) return Response.json({ ready: false, error: "gecersiz token" }, { status: 400 });
  let info;
  try { info = await resolveTarget(token); } catch { return Response.json({ ready: false }); }
  if (!info || !info.target) return Response.json({ ready: false, gone: true });

  // Sınıf modunda öğrenci yalnızca kendi makinesinin durumunu yoklayabilir (IDOR koruması).
  if (process.env.LAB_MODE === "class" && sess && sess.role === "student") {
    if (info.ownerId && info.ownerId !== safeLabel(sess.userId)) {
      return Response.json({ ready: false, error: "bu makine sana ait değil" }, { status: 403 });
    }
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3500);
    // Herhangi bir HTTP yanıtı (derleme sırasında 500 dahi) = ağ erişilebilir → hazır.
    await fetch(info.target + "/", { signal: ctrl.signal, redirect: "manual" }).catch((e) => { throw e; });
    clearTimeout(t);
    return Response.json({ ready: true });
  } catch {
    return Response.json({ ready: false });
  }
}
