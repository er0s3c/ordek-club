// Makine "canlı tut" — idle reaper'ı sıfırlar. Öğrenci paneli, üzerinde çalıştığı
// makinenin token'ı için periyodik/elle çağırır; touch(token) son-görülme'yi günceller.
import { touch, listMachines } from "@/lib/docker";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const safeLabel = (s) => String(s || "").replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 64);

export async function POST(req) {
  let body = {}; try { body = await req.json(); } catch {}
  const token = String(body.token || "");
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(token)) return Response.json({ ok: false, error: "gecersiz token" }, { status: 400 });

  if (process.env.LAB_MODE === "class") {
    const sess = getSession(req);
    if (!sess) return Response.json({ ok: false, error: "yetkisiz" }, { status: 401 });

    // Sınıf modunda öğrenci yalnız kendi makinesini canlı tutabilir
    if (sess.role === "student") {
      const machines = await listMachines();
      const m = machines.find((x) => x.token === token);
      if (!m || (m.studentId && m.studentId !== safeLabel(sess.userId))) {
        return Response.json({ ok: false, error: "bu makine sana ait değil" }, { status: 403 });
      }
    }
  }

  touch(token);
  return Response.json({ ok: true, token, ts: Date.now() });
}
