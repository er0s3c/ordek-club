#!/usr/bin/env node
// ============================================================================
//  Canlı sunucuya karşı HTTP smoke / uçtan uca testi (Faz 1 akışı).
//    node scripts/smoke.mjs http://localhost:3100
//    SETUP_TOKEN=XXXX node scripts/smoke.mjs http://localhost:3100   # boş kurulumda tam akış
//  Yalnızca test/yeni kurulumlarda çalıştırın: test kullanıcıları oluşturur.
// ============================================================================
const base = (process.argv[2] ?? "http://localhost:3100").replace(/\/$/, "");
const origin = new URL(base).origin;
let failures = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? "  ✔" : "  ✘"} ${msg}`);
  if (!cond) failures++;
};

async function call(path, { method = "GET", body, cookie, headers = {} } = {}) {
  const h = { ...headers };
  if (method !== "GET") h.origin ??= origin;
  if (body !== undefined) h["content-type"] = "application/json";
  if (cookie) h.cookie = cookie;
  const res = await fetch(base + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body), redirect: "manual" });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* HTML */ }
  const sc = res.headers.get("set-cookie");
  return { status: res.status, json, headers: res.headers, cookie: sc?.match(/club_session=[^;]+/)?.[0] ?? null };
}

const rnd = Math.random().toString(36).slice(2, 7);

console.log(`Ördek Club smoke testi → ${base}\n`);
console.log("Genel:");
const health = await call("/api/health");
ok(health.status === 200 && health.json?.database === "ok", `sağlık kontrolü (${health.status})`);
const setupState = await call("/api/setup");
ok(setupState.status === 200, `kurulum durumu: ${setupState.json?.setupComplete ? "tamamlanmış" : "bekliyor"}`);
const page = await fetch(base + "/login", { redirect: "manual" });
ok(/nonce-/.test(page.headers.get("content-security-policy") ?? ""), "sayfalarda nonce'lu CSP");
ok(page.headers.get("x-frame-options") === "DENY", "X-Frame-Options: DENY");
ok(!page.headers.get("x-powered-by"), "X-Powered-By gizli");
ok((await call("/api/admin/stats")).status === 401 || !setupState.json?.setupComplete, "oturumsuz admin API → 401");
ok((await call("/api/auth/logout", { method: "POST", headers: { origin: "https://evil.example" } })).status === 403, "yabancı Origin → 403 (CSRF)");

if (!setupState.json?.setupComplete) {
  const token = process.env.SETUP_TOKEN;
  if (!token) {
    console.log("\nKurulum bekliyor; tam akış için SETUP_TOKEN ortam değişkenini verin.");
  } else {
    console.log("\nUçtan uca akış:");
    const ownerPw = `smoke-owner-${rnd}-pass`;
    const bad = await call("/api/setup", { method: "POST", body: { token: "WRONG-TOKEN-0000", club: { clubName: "Yanlış Anahtar", appUrl: base }, owner: { username: `bad${rnd}`, email: `bad${rnd}@smoke.test`, displayName: "Yanlış Anahtar", password: ownerPw } } });
    ok(bad.status === 403, "yanlış kurulum anahtarı reddedildi");
    const setup = await call("/api/setup", {
      method: "POST",
      body: {
        token,
        club: { clubName: "Smoke Kulübü", universityName: "Test Üniv.", appUrl: base, timezone: "Europe/Istanbul", registrationPolicy: "APPROVAL" },
        owner: { username: `owner${rnd}`, email: `owner${rnd}@smoke.test`, displayName: "Smoke Kurucu", password: ownerPw },
      },
    });
    ok(setup.status === 201 && !!setup.cookie, "1. kurucu kurulumu tamamladı");
    const owner = setup.cookie;

    const inv = await call("/api/admin/invitations", { method: "POST", cookie: owner, body: { label: "smoke", role: "STUDENT", autoApprove: false, maxUses: 5, expiresInDays: 1 } });
    ok(inv.status === 201 && /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(inv.json?.code ?? ""), "davet kodu oluşturuldu");

    const stuPw = `smoke-student-${rnd}-pw`;
    const reg = await call("/api/auth/register", { method: "POST", body: { username: `stu${rnd}`, email: `stu${rnd}@smoke.test`, displayName: "Smoke Öğrenci", password: stuPw, invitationCode: inv.json?.code, role: "OWNER" } });
    ok(reg.status === 201 && reg.json?.status === "PENDING", "2. öğrenci başvurdu (PENDING, rol enjeksiyonu yok sayıldı)");
    ok((await call("/api/auth/login", { method: "POST", body: { login: `stu${rnd}`, password: stuPw } })).status === 403, "onaysız öğrenci giriş yapamıyor");

    const list = await call(`/api/admin/members?status=PENDING&q=stu${rnd}`, { cookie: owner });
    const stu = list.json?.items?.[0];
    ok(stu?.role === "STUDENT", "3. admin bekleyen başvuruyu görüyor (rol STUDENT)");
    ok((await call(`/api/admin/members/${stu?.id}`, { method: "PATCH", cookie: owner, body: { action: "approve" } })).status === 200, "admin üyeliği onayladı");

    const login = await call("/api/auth/login", { method: "POST", body: { login: `stu${rnd}`, password: stuPw } });
    ok(login.status === 200 && !!login.cookie, "onaylı öğrenci giriş yaptı");
    const me = await call("/api/auth/me", { cookie: login.cookie });
    ok(me.json?.user?.role === "STUDENT" && me.json?.user?.status === "ACTIVE", "öğrenci oturumu aktif");
    ok((await call("/api/admin/stats", { cookie: login.cookie })).status === 403, "öğrenci admin API'sine erişemiyor (403)");
    ok((await call(`/api/admin/members/${stu?.id}`, { method: "PATCH", cookie: login.cookie, body: { action: "role", role: "ADMIN" } })).status === 403, "öğrenci kendini yükseltemiyor (403)");

    const audit = await call("/api/admin/audit?action=member", { cookie: owner });
    ok((audit.json?.items ?? []).some((r) => r.action === "member.approve"), "onay denetim kaydında");

    // ── Faz 2: sunum + canlı ders ────────────────────────────────────────────
    console.log("\nCanlı ders (Faz 2):");
    const stuCookie = login.cookie;
    const pres = await call("/api/presentations", { method: "POST", cookie: owner, body: { template: "http-security-101" } });
    ok(pres.status === 201, "4. eğitmen şablondan sunum oluşturdu");
    ok((await call("/api/presentations", { cookie: stuCookie })).status === 403, "öğrenci sunum API'sine erişemiyor (403)");
    const started = await call("/api/live", { method: "POST", cookie: owner, body: { presentationId: pres.json?.id } });
    ok(started.status === 201 && /^[A-Z0-9]{6}$/.test(started.json?.code ?? ""), `5. canlı ders başladı (kod ${started.json?.code})`);
    const code = started.json?.code;
    const join = await call(`/api/live/join/${code}`, { cookie: stuCookie });
    ok(join.status === 200 && !JSON.stringify(join.json).includes("\"notes\""), "6. öğrenci katıldı; eğitmen notları gönderilmedi");

    const { default: WebSocket } = await import("ws");
    const wsBase = base.replace(/^http/, "ws");
    const connect = (cookie, wsOrigin = origin) =>
      new Promise((resolve) => {
        const msgs = [];
        const ws = new WebSocket(`${wsBase}/ws/live?code=${code}`, { headers: { ...(cookie ? { cookie } : {}), origin: wsOrigin } });
        ws.on("message", (d) => msgs.push(JSON.parse(String(d))));
        ws.on("open", () => resolve({ ws, msgs }));
        ws.on("unexpected-response", (_q, r) => resolve({ status: r.statusCode }));
        ws.on("error", () => {});
      });
    const until = async (msgs, pred, ms = 3000) => {
      const t0 = Date.now();
      while (Date.now() - t0 < ms) {
        const m = msgs.find(pred);
        if (m) return m;
        await new Promise((r) => setTimeout(r, 50));
      }
      return null;
    };
    ok((await connect(null)).status === 401, "oturumsuz WebSocket → 401");
    ok((await connect(stuCookie, "https://evil.example")).status === 403, "yabancı Origin'den WebSocket → 403 (CSWSH)");
    const hostWs = await connect(owner);
    const stuWs = await connect(stuCookie);
    ok(Boolean(hostWs.ws && stuWs.ws), "eğitmen ve öğrenci WebSocket ile bağlandı");
    const s0 = await until(stuWs.msgs, (m) => m.t === "state");
    hostWs.ws.send(JSON.stringify({ t: "control", c: { action: "next" } }));
    const s1 = await until(stuWs.msgs, (m) => m.t === "state" && m.v === (s0?.v ?? -9) + 1);
    ok(s1?.state?.slide === 1, "7–8. eğitmen slaytı değiştirdi → öğrenci ekranı senkronize oldu");
    stuWs.ws.send(JSON.stringify({ t: "control", c: { action: "goto", slide: 9 } }));
    ok(Boolean(await until(stuWs.msgs, (m) => m.t === "error" && m.code === "FORBIDDEN")), "öğrenci akışı değiştiremiyor (FORBIDDEN)");
    stuWs.ws.send(JSON.stringify({ t: "question", text: "smoke sorusu" }));
    ok(Boolean(await until(hostWs.msgs, (m) => m.t === "questions" && m.items.length === 1)), "öğrencinin sorusu eğitmene ulaştı");
    const ended = await call(`/api/live/${started.json?.id}/end`, { method: "POST", cookie: owner });
    ok(ended.status === 200 && Boolean(await until(stuWs.msgs, (m) => m.t === "ended")), "ders bitirildi → öğrenciye bildirildi");
    const summary = await call(`/api/live/${started.json?.id}/summary`, { cookie: owner });
    ok(summary.json?.participants?.length === 2 && summary.json?.questions?.length === 1, "ders özeti: 2 katılımcı, 1 soru");
    hostWs.ws.close();
    stuWs.ws.close();

    ok((await call("/api/auth/logout", { method: "POST", cookie: login.cookie })).status === 200 && (await call("/api/auth/me", { cookie: login.cookie })).status === 401, "çıkış oturumu sunucuda geçersiz kıldı");
  }
}

console.log(failures ? `\n✘ ${failures} kontrol başarısız.` : "\n✔ Tüm kontroller başarılı.");
process.exit(failures ? 1 : 0);
