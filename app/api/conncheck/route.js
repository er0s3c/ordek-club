// Bağlantı Testi API — öğrenci kendi Kali VM'inden laba erişebiliyor mu?
//  POST {action:"start"}                         → hafif hedef başlat (bridge), bağlantı bilgisi döner
//  POST {action:"verify", machineToken, value}   → Kali'den alınan token'ı doğrula → {ok}
//  POST {action:"stop", id}                       → hedefi durdur
//  ⚠ Beklenen token SUNUCU-ONLY (HMAC, lib/docker.js verifyConn); istemciye GÖNDERİLMEZ.
import { startConnCheck, verifyConn, stopMachine, listMachines, friendlyDockerError } from "@/lib/docker";
import { getSession } from "@/lib/session";
import { getUserById } from "@/lib/accounts";

export const dynamic = "force-dynamic";

const safeLabel = (s) => String(s || "").replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 64);

function dockerErr(e) {
  const friendly = friendlyDockerError(e);
  if (friendly) return Response.json({ error: "docker", message: friendly, detail: String((e && e.stderr) || (e && e.message) || e) }, { status: 400 });
  return Response.json(
    { error: "docker calistirilamadi (panel docker.sock erisimine sahip mi?)", detail: String((e && e.stderr) || (e && e.message) || e) },
    { status: 500 }
  );
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const action = body.action || "start";

  let sess = null;
  if (process.env.LAB_MODE === "class") {
    sess = getSession(req);
    if (!sess) return Response.json({ error: "yetkisiz" }, { status: 401 });
  }

  if (action === "verify") {
    return Response.json({ ok: verifyConn(body.machineToken, body.value) });
  }

  if (action === "stop") {
    if (!body.id) return Response.json({ error: "id gerekli" }, { status: 400 });
    if (process.env.LAB_MODE === "class" && sess && sess.role === "student") {
      const machines = await listMachines();
      const m = machines.find((x) => x.id === body.id || (x.id && body.id && x.id.startsWith(body.id)));
      if (!m || (m.studentId && m.studentId !== safeLabel(sess.userId))) {
        return Response.json({ error: "bu makine sana ait değil" }, { status: 403 });
      }
    }
    try { return Response.json(await stopMachine(body.id)); }
    catch (e) { return dockerErr(e); }
  }

  // start (varsayılan)
  const studentId = sess && sess.role === "student" ? sess.userId : null;
  const studentName = studentId ? (getUserById(studentId) || {}).username || studentId : null;
  try {
    return Response.json(await startConnCheck({ studentId, studentName }));
  } catch (e) {
    if (e && e.full) return Response.json({ error: "full", message: e.userMessage }, { status: 429 });
    return dockerErr(e);
  }
}
