import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { GET as listGET, POST as createPOST } from "@/app/api/presentations/route";
import { GET as oneGET, PATCH as onePATCH, DELETE as oneDELETE } from "@/app/api/presentations/[id]/route";
import { GET as exportGET } from "@/app/api/presentations/[id]/export/route";
import { POST as dupPOST } from "@/app/api/presentations/[id]/duplicate/route";
import { POST as livePOST } from "@/app/api/live/route";
import { GET as joinGET } from "@/app/api/live/join/[code]/route";
import { completeSetupFixture, makeUser, params, readBody, req, resetDb } from "../helpers";

async function create(cookie: string, template = "http-security-101") {
  const res = await createPOST(req("/api/presentations", { cookie, body: { template } }), undefined);
  expect(res.status).toBe(201);
  return (await readBody(res)).id as string;
}
const get = (cookie: string, id: string) => oneGET(req(`/api/presentations/${id}`, { cookie }), params({ id }));
const patch = (cookie: string, id: string, body: unknown) => onePATCH(req(`/api/presentations/${id}`, { method: "PATCH", cookie, body }), params({ id }));

describe("sunumlar: sahiplik ve yetki (IDOR/BOLA)", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });

  it("öğrenci sunum API'lerini kullanamaz", async () => {
    const stu = await makeUser();
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const id = await create(inst.cookie);
    expect((await listGET(req("/api/presentations", { cookie: stu.cookie }), undefined)).status).toBe(403);
    expect((await createPOST(req("/api/presentations", { cookie: stu.cookie, body: { template: "http-security-101" } }), undefined)).status).toBe(403);
    expect((await get(stu.cookie, id)).status).toBe(403);
    expect((await exportGET(req(`/api/presentations/${id}/export`, { cookie: stu.cookie }), params({ id }))).status).toBe(403);
    expect((await livePOST(req("/api/live", { cookie: stu.cookie, body: { presentationId: id } }), undefined)).status).toBe(403);
  });

  it("şablondan oluşturma: sürüm 1, slaytlar ve adım sayıları yazılır, sahip eğitmendir", async () => {
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const id = await create(inst.cookie);
    const p = await readBody(await get(inst.cookie, id));
    expect(p.version).toBe(1);
    expect(p.status).toBe("DRAFT");
    expect(p.ownerId).toBe(inst.user.id);
    expect(p.deck.slides.length).toBe(10);
    expect(p.deck.slides[2].steps).toBeGreaterThan(1); // animasyonlu slayt
    expect(p.deck.slides[0].notes).toMatch(/tanıt/); // eğitmen notları sahibine görünür
  });

  it("başka eğitmenin TASLAĞI görünmez (404); yayınlanınca görünür ama düzenlenemez", async () => {
    const a = await makeUser({ role: "INSTRUCTOR" });
    const b = await makeUser({ role: "INSTRUCTOR" });
    const id = await create(a.cookie);

    expect((await get(b.cookie, id)).status).toBe(404);
    expect((await readBody(await listGET(req("/api/presentations", { cookie: b.cookie }), undefined))).items).toHaveLength(0);
    expect((await patch(b.cookie, id, { status: "PUBLISHED" })).status).toBe(404);
    expect((await livePOST(req("/api/live", { cookie: b.cookie, body: { presentationId: id } }), undefined)).status).toBe(404);

    expect((await patch(a.cookie, id, { status: "PUBLISHED" })).status).toBe(200);
    expect((await get(b.cookie, id)).status).toBe(200);
    expect((await patch(b.cookie, id, { status: "DRAFT" })).status).toBe(403);
    expect((await oneDELETE(req(`/api/presentations/${id}`, { method: "DELETE", cookie: b.cookie }), params({ id }))).status).toBe(403);
    // ama kopyalayıp kendi sunumu yapabilir ve canlı başlatabilir
    const dup = await dupPOST(req(`/api/presentations/${id}/duplicate`, { method: "POST", cookie: b.cookie }), params({ id }));
    expect(dup.status).toBe(201);
    const dupId = (await readBody(dup)).id;
    expect((await db.presentation.findUniqueOrThrow({ where: { id: dupId } })).ownerId).toBe(b.user.id);
    expect((await livePOST(req("/api/live", { cookie: b.cookie, body: { presentationId: id } }), undefined)).status).toBe(201);
  });

  it("ADMIN herkesin sunumunu düzenleyebilir; arşivlenen sunum listeden ve erişimden çıkar", async () => {
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const admin = await makeUser({ role: "ADMIN" });
    const id = await create(inst.cookie);
    expect((await patch(admin.cookie, id, { status: "PUBLISHED" })).status).toBe(200);
    expect((await oneDELETE(req(`/api/presentations/${id}`, { method: "DELETE", cookie: admin.cookie }), params({ id }))).status).toBe(200);
    expect((await get(inst.cookie, id)).status).toBe(404);
    expect(await db.auditLog.count({ where: { action: "presentation.archive", targetId: id } })).toBe(1);
  });

  it("içe aktarma doğrulanır; içerik değişimi yeni sürüm oluşturur, eskisi korunur", async () => {
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const bad = await createPOST(req("/api/presentations", { cookie: inst.cookie, body: { deck: { title: "X", slides: [{ title: "S", blocks: [{ type: "html", html: "<script>" }] }] } } }), undefined);
    expect(bad.status).toBe(400);
    expect((await readBody(bad)).error.code).toBe("INVALID_DECK");

    const deck = { title: "Kendi dersim", slides: [{ title: "Giriş", blocks: [{ type: "bullets", reveal: true, items: ["a", "b"] }], notes: "gizli not" }] };
    const ok = await createPOST(req("/api/presentations", { cookie: inst.cookie, body: { deck } }), undefined);
    expect(ok.status).toBe(201);
    const id = (await readBody(ok)).id;

    const exp = await exportGET(req(`/api/presentations/${id}/export`, { cookie: inst.cookie }), params({ id }));
    expect(exp.headers.get("content-disposition")).toMatch(/attachment; filename="Kendi-dersim\.ordek-deck\.json"/);
    const exported = await readBody(exp);
    expect(exported.slides[0].notes).toBe("gizli not");

    expect((await patch(inst.cookie, id, { content: { ...deck, slides: [...deck.slides, { title: "Yeni", blocks: [] }] } })).status).toBe(200);
    const after = await readBody(await get(inst.cookie, id));
    expect(after.version).toBe(2);
    expect(after.deck.slides).toHaveLength(2);
    expect(await db.presentationVersion.count({ where: { presentationId: id } })).toBe(2);
  });

  it("canlı katılımda eğitmen notları öğrenciye GÖNDERİLMEZ, eğitmene gönderilir", async () => {
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const stu = await makeUser();
    const id = await create(inst.cookie);
    const live = await readBody(await livePOST(req("/api/live", { cookie: inst.cookie, body: { presentationId: id } }), undefined));
    expect(live.code).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);

    const asStudent = await readBody(await joinGET(req(`/api/live/join/${live.code}`, { cookie: stu.cookie }), params({ code: live.code })));
    expect(asStudent.isHost).toBe(false);
    expect(JSON.stringify(asStudent)).not.toContain("notes");
    expect(JSON.stringify(asStudent)).not.toMatch(/tanıt/);

    const asHost = await readBody(await joinGET(req(`/api/live/join/${live.code.toLowerCase()}`, { cookie: inst.cookie }), params({ code: live.code.toLowerCase() })));
    expect(asHost.isHost).toBe(true);
    expect(asHost.deck.slides[0].notes).toMatch(/tanıt/);

    expect((await joinGET(req("/api/live/join/ZZZZZZ", { cookie: stu.cookie }), params({ code: "ZZZZZZ" }))).status).toBe(404);
    expect((await joinGET(req(`/api/live/join/${live.code}`), params({ code: live.code }))).status).toBe(401);
  });
});
