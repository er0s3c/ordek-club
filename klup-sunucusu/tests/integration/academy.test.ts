import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { importAcademy } from "@/server/academy/importer";
import { openLesson } from "@/server/academy/service";
import { POST as completePOST } from "@/app/api/academy/lessons/[slug]/complete/route";
import { POST as quizPOST } from "@/app/api/academy/lessons/[slug]/quiz/route";
import { GET as imageGET } from "@/app/api/academy/images/[name]/route";
import { GET as adminGET, POST as adminPOST } from "@/app/api/admin/academy/route";
import { completeSetupFixture, makeUser, params, readBody, req, resetDb } from "../helpers";

// Küçük, kendi içinde tutarlı bir içerik klasörü: 1 yol, 2 ders + 1 quiz.
function fixture(opts: { withSecond?: boolean } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "academy-fx-"));
  fs.mkdirSync(path.join(dir, "t1"));
  fs.writeFileSync(path.join(dir, "akademi.yaml"), "yollar:\n  - { anahtar: t1, kod: T1, klasor: t1, tur: temel, baslik: Deneme yolu }\n");
  fs.writeFileSync(path.join(dir, "t1", "01-giris.md"), "---\nid: t1-01\ntur: ders\nbaslik: Giriş\nsure: 5\nhedefler: [Bir şey öğrenmek]\n---\n# Giriş\n\nMetin. [Sonraki](02-ikinci.md)\n");
  if (opts.withSecond !== false)
    fs.writeFileSync(path.join(dir, "t1", "02-ikinci.md"), "---\nid: t1-02\ntur: ders\nbaslik: İkinci\nsure: 5\n---\n# İkinci\n\nMetin.\n");
  fs.writeFileSync(
    path.join(dir, "t1", "03-quiz.md"),
    "---\nid: t1-03\ntur: quiz\nbaslik: Quiz\nsure: 3\ngecme: 70\nsorular:\n" +
      "  - { soru: Bir, tur: coktan, secenekler: [a, b, c], dogru: 2, aciklama: Çünkü c. }\n" +
      "  - { soru: İki, tur: dogru-yanlis, dogru: true, aciklama: Doğru. }\n---\n# Quiz\n",
  );
  return dir;
}

const complete = (cookie: string, slug: string, origin?: string | null) =>
  completePOST(req(`/api/academy/lessons/${slug}/complete`, { method: "POST", cookie, origin }), params({ slug }));
const quiz = (cookie: string, slug: string, answers: unknown[]) => quizPOST(req(`/api/academy/lessons/${slug}/quiz`, { cookie, body: { answers } }), params({ slug }));
const progressOf = (userId: string, slug: string) => db.lessonProgress.findFirst({ where: { userId, lesson: { slug } } });

// Dersi açar ve okuma süresini doldurmuş sayar (tamamlama en az MIN_READ_MS sonra kabul edilir).
async function ready(u: { user: { id: string } }, slug: string) {
  await openLesson({ id: u.user.id, role: "STUDENT", status: "ACTIVE" }, slug);
  await db.lessonProgress.updateMany({ where: { userId: u.user.id, lesson: { slug } }, data: { startedAt: new Date(Date.now() - 60_000) } });
}

describe("akademi: içe aktarma", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });

  it("içe aktarır, tekrarında değişiklik yoktur, kaldırılan ders arşivlenir ama ilerleme korunur", async () => {
    const dir = fixture();
    const first = await importAcademy({ dir });
    expect(first).toMatchObject({ applied: true, tracks: 1, lessons: 3, created: 3 });
    expect((await db.lesson.findUniqueOrThrow({ where: { slug: "t1-01" } })).body).toContain("](/academy/lesson/t1-02)");
    expect((await importAcademy({ dir })).unchanged).toBe(3);

    const stu = await makeUser();
    await ready(stu, "t1-02");
    expect((await complete(stu.cookie, "t1-02")).status).toBe(200);

    const removed = await importAcademy({ dir: fixture({ withSecond: false }) });
    expect(removed.archived).toBe(1);
    expect((await db.lesson.findUniqueOrThrow({ where: { slug: "t1-02" } })).archivedAt).not.toBeNull();
    expect(await progressOf(stu.user.id, "t1-02")).not.toBeNull(); // ilerleme silinmedi
    expect((await complete(stu.cookie, "t1-02")).status).toBe(404); // arşivlenmiş ders görünmez

    expect((await importAcademy({ dir })).updated).toBeGreaterThan(0); // geri gelince arşivden çıkar
    expect((await db.lesson.findUniqueOrThrow({ where: { slug: "t1-02" } })).archivedAt).toBeNull();
  });

  it("hatalı içerik hiç uygulanmaz", async () => {
    const dir = fixture();
    fs.writeFileSync(path.join(dir, "t1", "04-bozuk.md"), "front-matter yok\n");
    const s = await importAcademy({ dir });
    expect(s.applied).toBe(false);
    expect(s.problems.length).toBeGreaterThan(0);
    expect(await db.lesson.count()).toBe(0);
  });

  it("gerçek akademi içeriği hatasız içe aktarılır", async () => {
    const s = await importAcademy({ dir: path.resolve(__dirname, "../../content/academy") });
    expect(s.problems).toEqual([]);
    expect(s.applied).toBe(true);
    expect(s.lessons).toBeGreaterThan(100);
  });
});

describe("akademi: öğrenci ilerlemesi ve quiz", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
    await importAcademy({ dir: fixture() });
  });

  it("ders açmak STARTED, tamamlamak COMPLETED yazar; tamamlanan ders geri düşmez", async () => {
    const stu = await makeUser();
    const actor = { id: stu.user.id, role: stu.user.role, status: stu.user.status };
    const l = await openLesson(actor, "t1-01");
    expect(l.status).toBe("STARTED");
    expect(l.next?.slug).toBe("t1-02");
    expect(await readBody(await complete(stu.cookie, "t1-01"))).toMatchObject({ error: { code: "TOO_FAST" } });
    await ready(stu, "t1-01");
    expect((await complete(stu.cookie, "t1-01")).status).toBe(200);
    expect((await openLesson(actor, "t1-01")).status).toBe("COMPLETED");
  });

  it("quiz: cevaplar istemciye gitmez; yanlışta geçmez, doğruda tamamlanır; geçilen quiz düşük puanla geri düşmez", async () => {
    const stu = await makeUser();
    const actor = { id: stu.user.id, role: stu.user.role, status: stu.user.status };
    const view = await openLesson(actor, "t1-03");
    expect(JSON.stringify(view.questions)).not.toMatch(/answer|Çünkü/);

    const wrong = await readBody(await quiz(stu.cookie, "t1-03", [0, false]));
    expect(wrong).toMatchObject({ passed: false, score: 0 });
    expect(wrong.results[0].explanation).toBe("Çünkü c.");
    expect((await progressOf(stu.user.id, "t1-03"))!.status).toBe("STARTED");

    expect(await readBody(await quiz(stu.cookie, "t1-03", [2, true]))).toMatchObject({ passed: true, score: 100 });
    expect((await progressOf(stu.user.id, "t1-03"))!.status).toBe("COMPLETED");

    await quiz(stu.cookie, "t1-03", [0, false]);
    expect((await progressOf(stu.user.id, "t1-03"))!.status).toBe("COMPLETED");
    expect(await db.quizAttempt.count({ where: { userId: stu.user.id } })).toBe(3);
  });

  it("geçersiz istekler: eksik cevap, quiz'i elle tamamlama, quiz olmayan sayfaya cevap, bilinmeyen ders", async () => {
    const stu = await makeUser();
    expect((await quiz(stu.cookie, "t1-03", [2])).status).toBe(400);
    expect((await quiz(stu.cookie, "t1-03", ["c", true])).status).toBe(400);
    expect((await complete(stu.cookie, "t1-03")).status).toBe(400);
    expect((await quiz(stu.cookie, "t1-01", [0, true])).status).toBe(400);
    expect((await complete(stu.cookie, "yok-99")).status).toBe(404);
    expect(await readBody(await complete(stu.cookie, "t1-02"))).toMatchObject({ error: { code: "NOT_OPENED" } });
    expect((await complete(stu.cookie, "../../x")).status).toBe(400);
  });

  it("ilerleme kişiseldir: bir öğrencinin tamamladığı ders diğerinde görünmez", async () => {
    const a = await makeUser();
    const b = await makeUser();
    await ready(a, "t1-01");
    await complete(a.cookie, "t1-01");
    expect((await openLesson({ id: b.user.id, role: "STUDENT", status: "ACTIVE" }, "t1-01")).status).toBe("STARTED");
  });
});

describe("akademi: yetki ve CSRF", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
    await importAcademy({ dir: fixture() });
  });

  it("giriş yapmamış kullanıcı ders tamamlayamaz ve görsel alamaz", async () => {
    expect((await complete("", "t1-01")).status).toBe(401);
    expect((await imageGET(req("/api/academy/images/karakter-tevfik.webp"), params({ name: "karakter-tevfik.webp" }))).status).toBe(401);
  });

  it("görsel adı katı kalıpla doğrulanır (yol geçişi yok)", async () => {
    const stu = await makeUser();
    for (const name of ["../akademi.yaml", "..%2Fkarakterler.yaml", "x.svg", "yok-boyle-bir-gorsel.webp"]) {
      expect((await imageGET(req(`/api/academy/images/${name}`, { cookie: stu.cookie }), params({ name }))).status).toBe(404);
    }
  });

  it("Origin'siz durum değiştiren istek reddedilir", async () => {
    const stu = await makeUser();
    expect((await complete(stu.cookie, "t1-01", null)).status).toBe(403);
    expect((await complete(stu.cookie, "t1-01", "https://evil.example")).status).toBe(403);
  });

  it("içe aktarma ve istatistik yalnız OWNER/ADMIN", async () => {
    const stu = await makeUser();
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const admin = await makeUser({ role: "ADMIN" });
    for (const u of [stu, inst]) {
      expect((await adminPOST(req("/api/admin/academy", { method: "POST", cookie: u.cookie }), undefined)).status).toBe(403);
      expect((await adminGET(req("/api/admin/academy", { cookie: u.cookie }), undefined)).status).toBe(403);
    }
    const stats = await readBody(await adminGET(req("/api/admin/academy", { cookie: admin.cookie }), undefined));
    expect(stats.tracks[0]).toMatchObject({ key: "t1", lessons: 3 });
  });
});
