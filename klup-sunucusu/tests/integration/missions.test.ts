import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { importAcademy } from "@/server/academy/importer";
import { completeLesson, continueTarget, firstMission, openLesson } from "@/server/academy/service";
import { POST as checkPOST } from "@/app/api/academy/lessons/[slug]/missions/[id]/check/route";
import { POST as donePOST } from "@/app/api/academy/lessons/[slug]/missions/[id]/complete/route";
import { ensureGamificationDefaults } from "@/server/xp/defaults";
import { createPresentation, parseDeck } from "@/server/presentations";
import { completeSetupFixture, makeUser, params, readBody, req, resetDb } from "../helpers";

// docs/design-council/07 §7.2 — görev uç noktaları, XP ve ilerleme (I1–I4, I7, I8) + continueTarget (U5).
const MISSION = `gorevler:
  - id: burs
    baslik: Sahte burs
    kanca: { saat: "23:47", metin: Bir mesaj geldi. }
    posta: { gonderen: Burs Ofisi, adres: burs@kuzeyada-burslar.example, saat: "23:47", konu: Onay, govde: Giriş yap., resmi: kuzeyada.edu.example }
    adimlar:
      - tur: sec
        baslik: Ne yapsın?
        soru: İlk hamle?
        secenekler:
          - { metin: Bağlantıya dokun, sahne: giris, geri: Simülasyon. }
          - { metin: Göndereni incele, dogru: true, geri: Sen yakaladın. }
        ipuclari: [Adrese bak., Harf harf.]
        cozum: "Birlikte bakalım: adres farklı."
      - tur: kanit
        baslik: Kanıt
        soru: En güçlü işaret?
        tek: true
        secenekler:
          - { metin: Adres farklı, cekirdek: true }
          - { metin: Merhaba diyor, geri: Selam kanıt değil. }
          - { metin: Büyük harf, geri: Büyük harf kanıt değil. }
        dogru_geri: Adres en güçlü kanıt.
        eksik: Bu tek başına kanıt değil.
        cozum: "Birlikte bakalım."
    kapanis: { ifsa: Tevfik., kurallar: [Bir, İki, Üç] }`;

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mission-fx-"));
  fs.mkdirSync(path.join(dir, "p"));
  fs.mkdirSync(path.join(dir, "t1"));
  fs.writeFileSync(path.join(dir, "akademi.yaml"), "yollar:\n  - { anahtar: p, kod: P, klasor: p, tur: program, baslik: Tanıtım }\n  - { anahtar: t1, kod: T1, klasor: t1, tur: temel, baslik: Temel }\n");
  fs.writeFileSync(path.join(dir, "p", "01-hosgeldin.md"), "---\nid: p-01\ntur: bilgi\nbaslik: Hoş geldin\nsure: 2\n---\n# Hoş geldin\n\nMetin.\n");
  fs.writeFileSync(path.join(dir, "t1", "01-gorev.md"), `---\nid: t1-01\ntur: uygulama\nbaslik: Görev\nsure: 3\nhedefler: [Göndereni kontrol ederim]\n${MISSION}\n---\n# Görev\n\n::gorev[burs]\n`);
  fs.writeFileSync(path.join(dir, "t1", "02-ders.md"), "---\nid: t1-02\ntur: ders\nbaslik: Ders\nsure: 5\n---\n# Ders\n\nMetin.\n");
  return dir;
}

type U = Awaited<ReturnType<typeof makeUser>>;
const A = (u: U) => ({ id: u.user.id, role: u.user.role, status: u.user.status });
const check = (u: U, step: number, answer: unknown, hints = 0) =>
  checkPOST(req("/api/academy/lessons/t1-01/missions/burs/check", { cookie: u.cookie, body: { step, answer, hints } }), params({ slug: "t1-01", id: "burs" }));
const done = (u: U, answers: unknown[], hints = 0) =>
  donePOST(req("/api/academy/lessons/t1-01/missions/burs/complete", { cookie: u.cookie, body: { answers, hints } }), params({ slug: "t1-01", id: "burs" }));
const xpRows = (userId: string) => db.xpTransaction.findMany({ where: { userId, ruleKey: "mission.complete" } });

describe("mini görev", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
    await importAcademy({ dir: fixture() });
  });

  it("I1: ders yanıtında ve adım geri bildiriminde cevap anahtarı yoktur", async () => {
    const stu = await makeUser();
    const l = await openLesson(A(stu), "t1-01");
    const json = JSON.stringify(l);
    for (const secret of ['"dogru"', '"cekirdek"', "Sen yakaladın", "Birlikte bakalım", "Tevfik"]) expect(json).not.toContain(secret);
    expect(l.missions[0]).toMatchObject({ id: "burs", solved: false, closing: null });
    const wrong = await readBody(await check(stu, 0, 0));
    expect(wrong).toMatchObject({ correct: false, scene: "giris", solution: null });
    expect(JSON.stringify(wrong)).not.toContain("Göndereni incele");
  });

  it("I4 + ders kilidi: görev çözülmeden ne görev ne ders tamamlanır", async () => {
    const stu = await makeUser();
    await openLesson(A(stu), "t1-01");
    const r = await done(stu, [0, 1]);
    expect(r.status).toBe(400);
    expect(await readBody(r)).toMatchObject({ error: { code: "MISSION_PENDING" } });
    await expect(completeLesson(A(stu), "t1-01")).rejects.toMatchObject({ code: "MISSION_PENDING" });
  });

  it("I2 + I7: 2 yanlıştan sonra çözümlü örnek; doğru tamamlama dersi bitirir, XP bir kez yazılır; firstTry/ipucu kaydedilir", async () => {
    const stu = await makeUser();
    await openLesson(A(stu), "t1-01");
    expect((await readBody(await check(stu, 0, 0))).solution).toBeNull();
    expect((await readBody(await check(stu, 0, 0))).solution).toContain("adres farklı");
    expect((await readBody(await check(stu, 0, 1, 1))).correct).toBe(true);
    expect((await readBody(await check(stu, 1, 1, 1))).feedback).toBe("Selam kanıt değil.");
    expect((await readBody(await check(stu, 1, 0, 1))).correct).toBe(true);

    const first = await readBody(await done(stu, [1, 0], 1));
    expect(first).toMatchObject({ xp: 60, alreadySolved: false, firstTry: false, lessonDone: true });
    expect(first.closing.reveal).toBe("Tevfik.");
    const again = await readBody(await done(stu, [1, 0], 1));
    expect(again).toMatchObject({ xp: 0, alreadySolved: true });
    expect(await xpRows(stu.user.id)).toHaveLength(1);
    expect((await db.lessonProgress.findFirstOrThrow({ where: { userId: stu.user.id, lesson: { slug: "t1-01" } } })).status).toBe("COMPLETED");
    // Görevli derste ayrıca okuma XP'si (lesson.complete) yok
    expect(await db.xpTransaction.count({ where: { userId: stu.user.id, ruleKey: "lesson.complete" } })).toBe(0);
    const attempts = await db.missionAttempt.findMany({ where: { userId: stu.user.id }, orderBy: { createdAt: "asc" } });
    expect(attempts.filter((a) => !a.correct)).toHaveLength(3);
    expect(attempts.at(-1)).toMatchObject({ step: null, correct: true, hintsUsed: 1 });
    // Çözüldükten sonra kapanış istemciye gider
    expect((await openLesson(A(stu), "t1-01")).missions[0]).toMatchObject({ solved: true, closing: { reveal: "Tevfik." } });
  });

  it("I3: mission.complete kuralı kapalıyken görev çözülür, ders tamamlanır, XP 0", async () => {
    await ensureGamificationDefaults();
    await db.xpRewardRule.update({ where: { key: "mission.complete" }, data: { enabled: false } });
    const stu = await makeUser();
    await openLesson(A(stu), "t1-01");
    expect(await readBody(await done(stu, [1, 0]))).toMatchObject({ xp: 0, lessonDone: true, firstTry: true });
    expect((await db.lessonProgress.findFirstOrThrow({ where: { userId: stu.user.id, lesson: { slug: "t1-01" } } })).status).toBe("COMPLETED");
  });

  it("U5 + ilk görev: PROGRAM yolu 'devam et' hedefi olmaz (STARTED dalı dahil)", async () => {
    const stu = await makeUser();
    await openLesson(A(stu), "p-01"); // broşür sayfası açıldı → STARTED
    expect((await continueTarget(A(stu)))?.slug).toBe("t1-01");
    expect(await firstMission(A(stu))).toBeNull(); // sabit ilk görev (m01-05) bu içerikte yok → panel continueTarget'a düşer
  });

  it("I8: sunum mission bloğu yalnız var olan ders/göreve başvurabilir", async () => {
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const ok = parseDeck({ title: "Görevli ders", slides: [{ title: "Görev", blocks: [{ type: "mission", lesson: "t1-01", mission: "burs", title: "T1 · Sahte burs" }] }] });
    await expect(createPresentation(A(inst), ok, "ip")).resolves.toBeTruthy();
    const bad = parseDeck({ title: "Kötü", slides: [{ title: "Görev", blocks: [{ type: "mission", lesson: "t1-01", mission: "yok" }] }] });
    await expect(createPresentation(A(inst), bad, "ip")).rejects.toMatchObject({ code: "BAD_MISSION" });
  });
});
