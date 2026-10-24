import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { importAcademy } from "@/server/academy/importer";
import { openLesson } from "@/server/academy/service";
import { award, backfillXp, onLiveSessionEnded, XP_TX } from "@/server/xp/engine";
import { evaluateBadges } from "@/server/xp/badges";
import { ensureArchived, monthlyBoard, overallBoard } from "@/server/xp/leaderboard";
import { publicProfile } from "@/server/xp/profile";
import { ensureGamificationDefaults } from "@/server/xp/defaults";
import { createFromTemplate } from "@/server/presentations";
import { dayKey, monthRange, periodOf, shiftPeriod } from "@/server/xp/time";
import { POST as completePOST } from "@/app/api/academy/lessons/[slug]/complete/route";
import { POST as quizPOST } from "@/app/api/academy/lessons/[slug]/quiz/route";
import { PATCH as rulesPATCH } from "@/app/api/admin/xp/rules/route";
import { PUT as levelsPUT } from "@/app/api/admin/xp/levels/route";
import { POST as adjustPOST } from "@/app/api/admin/xp/adjust/route";
import { POST as reversePOST } from "@/app/api/admin/xp/transactions/[id]/reverse/route";
import { POST as badgePOST } from "@/app/api/admin/badges/route";
import { POST as awardPOST, DELETE as awardDELETE } from "@/app/api/admin/badges/[id]/award/route";
import { completeSetupFixture, makeUser, params, readBody, req, resetDb } from "../helpers";

// 1 yol: 3 ders + 1 quiz (yol ödülü için en az 3 ders gerekir).
function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "xp-fx-"));
  fs.mkdirSync(path.join(dir, "t1"));
  fs.writeFileSync(path.join(dir, "akademi.yaml"), "yollar:\n  - { anahtar: t1, kod: T1, klasor: t1, tur: temel, baslik: Deneme }\n");
  for (const n of [1, 2, 3]) fs.writeFileSync(path.join(dir, "t1", `0${n}-d.md`), `---\nid: t1-0${n}\ntur: ders\nbaslik: Ders ${n}\nsure: 5\n---\n# Ders ${n}\n`);
  fs.writeFileSync(
    path.join(dir, "t1", "04-q.md"),
    "---\nid: t1-04\ntur: quiz\nbaslik: Quiz\nsure: 3\ngecme: 70\nsorular:\n  - { soru: S, tur: dogru-yanlis, dogru: true, aciklama: A }\n---\n# Quiz\n",
  );
  return dir;
}

type U = Awaited<ReturnType<typeof makeUser>>;
const actorOf = (u: U) => ({ id: u.user.id, role: u.user.role, status: u.user.status });
async function finish(u: U, slug: string) {
  await openLesson(actorOf(u), slug);
  await db.lessonProgress.updateMany({ where: { userId: u.user.id, lesson: { slug } }, data: { startedAt: new Date(Date.now() - 60_000) } });
  return completePOST(req(`/api/academy/lessons/${slug}/complete`, { method: "POST", cookie: u.cookie }), params({ slug }));
}
const quiz = (u: U, answers: unknown[], extra: Record<string, unknown> = {}) =>
  quizPOST(req("/api/academy/lessons/t1-04/quiz", { cookie: u.cookie, body: { answers, ...extra } }), params({ slug: "t1-04" }));
const total = async (userId: string) => (await db.xpTransaction.aggregate({ where: { userId }, _sum: { amount: true } }))._sum.amount ?? 0;

describe("XP: kazanım kuralları", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
    await importAcademy({ dir: fixture() });
  });

  it("ders tamamlama bir kez XP verir; ilk ders rozeti gelir", async () => {
    const stu = await makeUser();
    const r = await readBody(await finish(stu, "t1-01"));
    expect(r).toMatchObject({ xp: 40, badges: ["İlk Ders"] });
    expect(await readBody(await finish(stu, "t1-01"))).toMatchObject({ xp: 0, badges: [] });
    expect(await total(stu.user.id)).toBe(40);
  });

  it("quiz: kalınca XP yok, geçince bir kez; tekrarlar XP üretmez; istemcinin gönderdiği XP yok sayılır", async () => {
    const stu = await makeUser();
    expect(await readBody(await quiz(stu, [false]))).toMatchObject({ passed: false, xp: 0 });
    expect(await readBody(await quiz(stu, [true], { xp: 99_999, amount: 99_999 }))).toMatchObject({ passed: true, xp: 30, badges: ["İlk Quiz"] });
    for (let i = 0; i < 3; i++) expect((await readBody(await quiz(stu, [true]))).xp).toBe(0);
    expect(await total(stu.user.id)).toBe(30);
  });

  it("yolun bütün dersleri bitince yol ödülü (bir kez)", async () => {
    const stu = await makeUser();
    for (const s of ["t1-01", "t1-02", "t1-03"]) await finish(stu, s);
    const r = await readBody(await quiz(stu, [true]));
    expect(r.xp).toBe(30 + 200);
    expect(await total(stu.user.id)).toBe(3 * 40 + 30 + 200);
    expect(await db.xpTransaction.count({ where: { userId: stu.user.id, source: "TRACK" } })).toBe(1);
  });

  it("kapatılan kural XP vermez; değişen miktar yalnız sonraki ödüllere uygulanır", async () => {
    const admin = await makeUser({ role: "ADMIN" });
    const stu = await makeUser();
    await finish(stu, "t1-01");
    const patch = (rules: unknown) => rulesPATCH(req("/api/admin/xp/rules", { method: "PATCH", cookie: admin.cookie, body: { rules } }), undefined);
    expect((await patch([{ key: "lesson.complete", amount: 0, enabled: false }])).status).toBe(200);
    await finish(stu, "t1-02");
    expect((await patch([{ key: "lesson.complete", amount: 55, enabled: true }])).status).toBe(200);
    await finish(stu, "t1-03");
    expect((await db.xpTransaction.findMany({ where: { userId: stu.user.id }, orderBy: { createdAt: "asc" } })).map((t) => t.amount)).toEqual([40, 55]);
    expect((await patch([{ key: "yok.boyle", amount: 1, enabled: true }])).status).toBe(400);
  });

  it("aynı ödül anahtarı eşzamanlı yazılsa bile tek kayıt oluşur", async () => {
    const stu = await makeUser();
    await ensureGamificationDefaults();
    const once = () => db.$transaction((tx) => award(tx, { userId: stu.user.id, ruleKey: "quiz.pass", key: `race:${stu.user.id}`, source: "QUIZ" }), XP_TX);
    const results = await Promise.all([once(), once(), once(), once()]);
    expect(results.filter((n) => n > 0)).toHaveLength(1);
    expect(await db.xpTransaction.count({ where: { idempotencyKey: `race:${stu.user.id}` } })).toBe(1);
  });

  it("geçmiş ilerleme telafisi (xp-backfill) bir kez XP verir, tekrarında hiçbir şey yazmaz", async () => {
    const stu = await makeUser();
    const [l1, q] = await Promise.all([db.lesson.findUniqueOrThrow({ where: { slug: "t1-01" } }), db.lesson.findUniqueOrThrow({ where: { slug: "t1-04" } })]);
    await db.lessonProgress.createMany({ data: [{ userId: stu.user.id, lessonId: l1.id, status: "COMPLETED" }, { userId: stu.user.id, lessonId: q.id, status: "COMPLETED" }] });
    await db.quizAttempt.create({ data: { userId: stu.user.id, lessonId: q.id, answers: [true], correct: 1, total: 1, score: 100, passed: true } });
    expect(await backfillXp()).toEqual({ users: 1, xp: 70 });
    expect(await backfillXp()).toEqual({ users: 0, xp: 0 });
  });

  it("canlı ders: en az 10 dakika kalana bir kez katılım XP'si", async () => {
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const [a, b] = [await makeUser(), await makeUser()];
    const p = await createFromTemplate(actorOf(inst), "http-security-101", "10.0.0.1");
    const version = await db.presentation.findUniqueOrThrow({ where: { id: p.id }, select: { currentVersionId: true } });
    const s = await db.liveSession.create({ data: { code: "XPTEST", title: "Canlı", versionId: version.currentVersionId!, hostId: inst.user.id, status: "ENDED", state: {} } });
    await db.sessionParticipant.createMany({ data: [{ sessionId: s.id, userId: a.user.id, connectedMs: 11 * 60_000 }, { sessionId: s.id, userId: b.user.id, connectedMs: 4 * 60_000 }] });
    expect(await onLiveSessionEnded(s.id)).toEqual([a.user.id]);
    expect(await onLiveSessionEnded(s.id)).toEqual([]);
    expect(await total(a.user.id)).toBe(25);
    expect(await total(b.user.id)).toBe(0);
  });
});

describe("XP: yönetici düzeltmeleri", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
    await importAcademy({ dir: fixture() });
  });

  it("elle düzeltme gerekçe ister, ayrı kayıt ve audit bırakır; öğrenci ve eğitmen yapamaz", async () => {
    const admin = await makeUser({ role: "ADMIN" });
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const stu = await makeUser();
    const adjust = (cookie: string, body: unknown) => adjustPOST(req("/api/admin/xp/adjust", { cookie, body }), undefined);
    expect((await adjust(stu.cookie, { username: stu.user.username, amount: 500, reason: "kendime puan" })).status).toBe(403);
    expect((await adjust(inst.cookie, { username: stu.user.username, amount: 500, reason: "öğrenciye puan" })).status).toBe(403);
    expect((await adjust(admin.cookie, { username: stu.user.username, amount: 100, reason: "" })).status).toBe(400);
    expect((await adjust(admin.cookie, { username: stu.user.username, amount: 100, reason: "Etkinlik birinciliği" })).status).toBe(201);
    expect((await adjust(admin.cookie, { username: stu.user.username, amount: -30, reason: "Hatalı ödül düzeltmesi" })).status).toBe(201);
    expect(await total(stu.user.id)).toBe(70);
    expect(await db.auditLog.count({ where: { action: "xp.adjust", targetId: stu.user.id } })).toBe(2);
  });

  it("geri alma karşı kayıt yazar, bir işlem yalnız bir kez geri alınır", async () => {
    const admin = await makeUser({ role: "ADMIN" });
    const stu = await makeUser();
    await finish(stu, "t1-01");
    const t = await db.xpTransaction.findFirstOrThrow({ where: { userId: stu.user.id } });
    const reverse = (id: string, reason = "Kopya içerik tespit edildi") => reversePOST(req(`/api/admin/xp/transactions/${id}/reverse`, { cookie: admin.cookie, body: { reason } }), params({ id }));
    expect((await reverse(t.id, "kısa")).status).toBe(400);
    const r = await readBody(await reverse(t.id));
    expect(await total(stu.user.id)).toBe(0);
    expect((await reverse(t.id)).status).toBe(409);
    expect((await reverse(r.id)).status).toBe(400);
    expect(await db.xpTransaction.count({ where: { userId: stu.user.id } })).toBe(2); // asıl kayıt silinmedi
  });

  it("seviye eşikleri artan olmalı", async () => {
    const admin = await makeUser({ role: "ADMIN" });
    const put = (levels: unknown) => levelsPUT(req("/api/admin/xp/levels", { method: "PUT", cookie: admin.cookie, body: { levels } }), undefined);
    expect((await put([{ number: 1, minXp: 0, title: "A" }, { number: 2, minXp: 0, title: "B" }])).status).toBe(400);
    expect((await put([{ number: 1, minXp: 10, title: "A" }, { number: 2, minXp: 50, title: "B" }])).status).toBe(400);
    expect((await put([{ number: 1, minXp: 0, title: "A" }, { number: 2, minXp: 50, title: "B" }])).status).toBe(200);
    expect(await db.level.count()).toBe(2);
  });
});

describe("liderlik tabloları", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
    await ensureGamificationDefaults();
  });

  const give = (userId: string, amount: number, createdAt = new Date(), key = `t:${Math.random()}`) =>
    db.xpTransaction.create({ data: { userId, amount, source: "MANUAL", idempotencyKey: key, createdAt } });

  it("yalnız öğrenciler sıralanır; aylık tablo yalnız bu ayı, genel tablo her şeyi sayar", async () => {
    const [a, b] = [await makeUser({ username: "aaa" }), await makeUser({ username: "bbb" })];
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const lastMonth = new Date(Date.now() - 40 * 86_400_000);
    await give(a.user.id, 100);
    await give(b.user.id, 300, lastMonth);
    await give(b.user.id, 50);
    await give(inst.user.id, 10_000);
    const month = await monthlyBoard();
    expect(month.rows.map((r) => [r.username, r.xp, r.rank])).toEqual([["aaa", 100, 1], ["bbb", 50, 2]]);
    const all = await overallBoard();
    expect(all.map((r) => [r.username, r.xp])).toEqual([["bbb", 350], ["aaa", 100]]);
    expect(all.find((r) => r.username === "bbb")!.level.number).toBe(2); // 350 XP → İz Sürücü
  });

  it("biten ay bir kez arşivlenir, birinciye ay şampiyonu rozeti verilir; sonraki düzeltme arşivi değiştirmez", async () => {
    const { timezone } = await db.clubSettings.findUniqueOrThrow({ where: { id: 1 } });
    const prev = shiftPeriod(periodOf(new Date(), timezone), -1);
    const inPrev = new Date(monthRange(prev, timezone).start.getTime() + 86_400_000);
    const [a, b] = [await makeUser({ username: "kazanan" }), await makeUser({ username: "ikinci" })];
    await give(a.user.id, 500, inPrev);
    await give(b.user.id, 200, inPrev);
    expect(await ensureArchived()).toEqual([prev]);
    expect(await ensureArchived()).toEqual([]);
    const entries = await db.leaderboardEntry.findMany({ where: { period: prev }, orderBy: { rank: "asc" } });
    expect(entries.map((e) => [e.userId, e.rank, e.xp])).toEqual([[a.user.id, 1, 500], [b.user.id, 2, 200]]);
    const champ = await db.badge.findUniqueOrThrow({ where: { key: "monthly-champion" } });
    expect(await db.userBadge.count({ where: { badgeId: champ.id } })).toBe(1);
    await give(b.user.id, 1000, inPrev);
    expect((await db.leaderboardEntry.findFirstOrThrow({ where: { period: prev, userId: b.user.id } })).xp).toBe(200);
  });
});

describe("rozetler ve profil", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
    await ensureGamificationDefaults();
  });

  it("7 günlük seri rozeti kulüp saat dilimine göre ardışık günlerle kazanılır", async () => {
    const stu = await makeUser();
    const { timezone } = await db.clubSettings.findUniqueOrThrow({ where: { id: 1 } });
    await db.activityDay.createMany({ data: Array.from({ length: 7 }, (_, i) => ({ userId: stu.user.id, day: dayKey(new Date(Date.now() - i * 86_400_000), timezone) })) });
    expect(await evaluateBadges(stu.user.id)).toContain("7 Günlük Seri");
    expect(await evaluateBadges(stu.user.id)).toEqual([]);
  });

  it("Top 10 rozeti yalnız sıralamada 10'dan fazla öğrenci varken verilir", async () => {
    const users = [];
    for (let i = 0; i < 11; i++) users.push(await makeUser());
    await db.xpTransaction.create({ data: { userId: users[0]!.user.id, amount: 500, source: "MANUAL", idempotencyKey: "top-0" } });
    expect(await evaluateBadges(users[0]!.user.id)).not.toContain("Top 10 Club Member"); // tek kişilik sıralama
    await db.xpTransaction.createMany({ data: users.slice(1).map((u, i) => ({ userId: u.user.id, amount: 10 + i, source: "MANUAL" as const, idempotencyKey: `top-${i + 1}` })) });
    expect(await evaluateBadges(users[0]!.user.id)).toContain("Top 10 Club Member");
    expect(await evaluateBadges(users[1]!.user.id)).not.toContain("Top 10 Club Member"); // 11. sırada
  });

  it("yönetici rozet oluşturur, verir, tekrar veremez, geri alır; öğrenci rozet oluşturamaz", async () => {
    const admin = await makeUser({ role: "ADMIN" });
    const stu = await makeUser();
    const body = { name: "CTF Birincisi", description: "Kampüs CTF'inde birinci", icon: "trophy", rule: { type: "manual" } };
    expect((await badgePOST(req("/api/admin/badges", { cookie: stu.cookie, body }), undefined)).status).toBe(403);
    expect((await badgePOST(req("/api/admin/badges", { cookie: admin.cookie, body: { ...body, icon: "<script>" } }), undefined)).status).toBe(400);
    const { id } = await readBody(await badgePOST(req("/api/admin/badges", { cookie: admin.cookie, body }), undefined));
    const give = (method: "POST" | "DELETE") =>
      (method === "POST" ? awardPOST : awardDELETE)(req(`/api/admin/badges/${id}/award`, { method, cookie: admin.cookie, body: { username: stu.user.username, reason: "Bahar CTF" } }), params({ id }));
    expect((await give("POST")).status).toBe(201);
    expect((await give("POST")).status).toBe(409);
    expect(await evaluateBadges(stu.user.id)).not.toContain("CTF Birincisi"); // manuel rozet otomatik verilmez
    expect((await give("DELETE")).status).toBe(200);
    expect(await db.userBadge.count({ where: { userId: stu.user.id, badgeId: id } })).toBe(0);
  });

  it("profil: XP geçmişi yalnız kişinin kendisine ve yöneticiye görünür", async () => {
    const [a, b] = [await makeUser(), await makeUser()];
    const admin = await makeUser({ role: "ADMIN" });
    await db.xpTransaction.create({ data: { userId: a.user.id, amount: 40, source: "LESSON", idempotencyKey: "p1" } });
    expect((await publicProfile(actorOf(a), a.user.username)).history).toHaveLength(1);
    expect((await publicProfile(actorOf(admin), a.user.username)).history).toHaveLength(1);
    const seen = await publicProfile(actorOf(b), a.user.username);
    expect(seen.history).toBeNull();
    expect(JSON.stringify(seen)).not.toContain(a.user.email);
    await db.user.update({ where: { id: a.user.id }, data: { status: "DISABLED" } });
    await expect(publicProfile(actorOf(b), a.user.username)).rejects.toThrow();
  });
});
