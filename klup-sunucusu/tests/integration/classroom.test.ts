import fs from "node:fs/promises";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { env } from "@/server/env";
import { invalidateSettings } from "@/server/settings";
import {
  bulkApprove, createAssignment, getAssignmentForStudent, listAssignmentsForStudent, openTaskCount, pendingReviewCount,
  reviewSubmission, setAssignmentStatus, submitAssignment, type AssignmentInput, assignmentInputSchema,
} from "@/server/classroom/assignments";
import { createAnnouncement, listAnnouncements } from "@/server/classroom/announcements";
import { listNotifications, markRead, unreadCount } from "@/server/classroom/notifications";
import { listLibrary, openFile, uploadLibraryFile } from "@/server/files/service";
import { POST as submitRoute } from "@/app/api/tasks/[id]/submit/route";
import { GET as fileGet } from "@/app/api/files/[id]/route";
import { POST as filesPost } from "@/app/api/files/route";
import { POST as reviewRoute } from "@/app/api/teach/submissions/[id]/review/route";
import { completeSetupFixture, makeUser, ORIGIN, params, readBody, req, resetDb } from "../helpers";

type U = Awaited<ReturnType<typeof makeUser>>;
const A = (u: U) => ({ id: u.user.id, role: u.user.role, status: u.user.status });
const input = (o: Partial<AssignmentInput> & Record<string, unknown> = {}) => assignmentInputSchema.parse({ title: "PCAP incele", description: "lab.pcap dosyasını incele", ...o });
const file = (name: string, content: string | Uint8Array) => new File([typeof content === "string" ? new TextEncoder().encode(content) : new Uint8Array(content)], name);
const xpOf = async (userId: string) => (await db.xpTransaction.aggregate({ where: { userId }, _sum: { amount: true } }))._sum.amount ?? 0;
const codeOf = (p: Promise<unknown>) => p.then(() => null, (e: { code?: string }) => e.code);

// Tarayıcı gibi multipart istek (Content-Length dahil).
async function multipart(url: string, cookie: string, form: FormData) {
  const r = new Response(form);
  const buf = new Uint8Array(await r.arrayBuffer());
  return new Request(ORIGIN + url, {
    method: "POST",
    body: buf,
    headers: { host: "club.test", origin: ORIGIN, cookie, "x-club-remote-addr": "10.0.0.1", "content-type": r.headers.get("content-type")!, "content-length": String(buf.length) },
  });
}

async function world() {
  const inst = await makeUser({ role: "INSTRUCTOR" });
  const inst2 = await makeUser({ role: "INSTRUCTOR" });
  const s1 = await makeUser();
  const s2 = await makeUser();
  return { inst, inst2, s1, s2 };
}

async function published(inst: U, o: Partial<AssignmentInput> & Record<string, unknown> = {}) {
  const a = await createAssignment(A(inst), input(o), "10.0.0.1");
  await setAssignmentStatus(A(inst), a.id, "PUBLISHED", "10.0.0.1");
  return a;
}

describe("görevler ve teslimler", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });

  it("taslak görünmez; yayınlanınca hedeflere bildirim gider; SEÇİLİ görev hedef dışına 404", async () => {
    const { inst, s1, s2 } = await world();
    const draft = await createAssignment(A(inst), input(), "10.0.0.1");
    expect(await listAssignmentsForStudent(A(s1))).toHaveLength(0);
    expect(await codeOf(getAssignmentForStudent(A(s1), draft.id))).toBe("NOT_FOUND");
    await setAssignmentStatus(A(inst), draft.id, "PUBLISHED", "10.0.0.1");
    expect((await listNotifications(A(s1))).map((n) => n.type)).toEqual(["ASSIGNMENT"]);
    expect(await openTaskCount(A(s1))).toBe(1);

    const only = await published(inst, { title: "Yalnız Ali", audience: "SELECTED", targetUsernames: [s1.user.username] });
    expect((await getAssignmentForStudent(A(s1), only.id)).title).toBe("Yalnız Ali");
    expect(await codeOf(getAssignmentForStudent(A(s2), only.id))).toBe("NOT_FOUND");
    expect(await codeOf(submitAssignment(A(s2), only.id, { text: "x", files: [] }, "ip"))).toBe("NOT_FOUND");
    expect((await listNotifications(A(s2))).filter((n) => n.link === `/tasks/${only.id}`)).toHaveLength(0);
  });

  it("rubrik toplamı en yüksek puana eşit olmalı; metin/dosya ikisi birden kapatılamaz", () => {
    expect(assignmentInputSchema.safeParse({ title: "abc", maxScore: 10, rubric: [{ criterion: "a", points: 4 }] }).success).toBe(false);
    expect(assignmentInputSchema.safeParse({ title: "abc", requireText: false, requireFile: false }).success).toBe(false);
    expect(assignmentInputSchema.safeParse({ title: "abc", audience: "SELECTED" }).success).toBe(false);
  });

  it("teslim → düzeltme → yeniden teslim → onay: XP yalnız onayda ve bir kez; onaydan sonra kilitli", async () => {
    const { inst, inst2, s1 } = await world();
    const a = await published(inst, { maxScore: 10, rubric: [{ criterion: "Bulgu", points: 6 }, { criterion: "Rapor", points: 4 }] });
    const form = new FormData();
    form.set("text", "3 şüpheli bağlantı buldum");
    form.append("files", file("bulgular.log", "10.0.0.5 -> 203.0.113.9:4444"));
    const res = await submitRoute(await multipart(`/api/tasks/${a.id}/submit`, s1.cookie, form), params({ id: a.id }));
    expect(res.status).toBe(201);
    expect(await xpOf(s1.user.id)).toBe(0); // teslim XP vermez
    const sub = await db.submission.findUniqueOrThrow({ where: { assignmentId_userId: { assignmentId: a.id, userId: s1.user.id } }, include: { files: true } });
    expect(sub.files).toHaveLength(1);
    expect(await pendingReviewCount(A(inst))).toBe(1);
    expect(await pendingReviewCount(A(inst2))).toBe(0);
    expect((await listNotifications(A(inst))).some((n) => n.type === "SUBMISSION")).toBe(true);

    // Başka eğitmen değerlendiremez
    expect(await codeOf(reviewSubmission(A(inst2), sub.id, { decision: "APPROVE", feedback: "" }, "ip"))).toBe("FORBIDDEN");
    // Düzeltme isterken geri bildirim zorunlu
    expect(await codeOf(reviewSubmission(A(inst), sub.id, { decision: "RETURN", feedback: "" }, "ip"))).toBe("FEEDBACK_REQUIRED");
    await reviewSubmission(A(inst), sub.id, { decision: "RETURN", feedback: "Rapor eksik" }, "ip");
    await submitAssignment(A(s1), a.id, { text: "Rapor eklendi", files: [] }, "ip");
    expect((await db.submission.findUniqueOrThrow({ where: { id: sub.id } })).attempts).toBe(2);

    // Rubrik puanı sınır dışı → hata; doğru puanla onay
    expect(await codeOf(reviewSubmission(A(inst), sub.id, { decision: "APPROVE", rubricScores: [7, 4], feedback: "" }, "ip"))).toBe("RUBRIC_RANGE");
    const r = await reviewSubmission(A(inst), sub.id, { decision: "APPROVE", rubricScores: [5, 4], feedback: "İyi iş" }, "ip");
    expect(r.xp).toBe(120);
    expect((await db.submission.findUniqueOrThrow({ where: { id: sub.id } })).score).toBe(9);
    expect(await xpOf(s1.user.id)).toBe(120);
    expect(await codeOf(reviewSubmission(A(inst), sub.id, { decision: "APPROVE", feedback: "" }, "ip"))).toBe("NOT_PENDING");
    expect(await codeOf(submitAssignment(A(s1), a.id, { text: "değiştir", files: [] }, "ip"))).toBe("LOCKED");
    expect(await xpOf(s1.user.id)).toBe(120);
    expect((await listNotifications(A(s1))).some((n) => n.type === "REVIEW" && n.title.includes("+120 XP"))).toBe(true);
  });

  it("değerlendirme rotası: öğrenci 403; özel XP miktarı kullanılır", async () => {
    const { inst, s1 } = await world();
    const a = await published(inst, { xpAmount: 77 });
    const sub = await submitAssignment(A(s1), a.id, { text: "tamam", files: [] }, "ip");
    const deny = await reviewRoute(req(`/api/teach/submissions/${sub.id}/review`, { cookie: s1.cookie, body: { decision: "APPROVE" } }), params({ id: sub.id }));
    expect(deny.status).toBe(403);
    const ok = await reviewRoute(req(`/api/teach/submissions/${sub.id}/review`, { cookie: inst.cookie, body: { decision: "APPROVE" } }), params({ id: sub.id }));
    expect((await readBody(ok)).xp).toBe(77);
  });

  it("son teslim: geç teslim kapalıysa reddedilir, açıksa 'geç' işaretlenir", async () => {
    const { inst, s1 } = await world();
    const past = new Date(Date.now() - 60_000);
    const startsAt = new Date(Date.now() - 3_600_000);
    const strict = await published(inst, { startsAt, dueAt: past });
    expect(await codeOf(submitAssignment(A(s1), strict.id, { text: "geç", files: [] }, "ip"))).toBe("PAST_DUE");
    const lenient = await published(inst, { startsAt, dueAt: past, allowLate: true });
    expect((await submitAssignment(A(s1), lenient.id, { text: "geç", files: [] }, "ip")).late).toBe(true);
    await setAssignmentStatus(A(inst), lenient.id, "CLOSED", "ip");
    expect(await codeOf(submitAssignment(A(s1), lenient.id, { text: "yine", files: [] }, "ip"))).toBe("CLOSED");
  });

  it("toplu onay: yalnız bekleyenler, her öğrenciye bir kez XP", async () => {
    const { inst, s1, s2 } = await world();
    const a = await published(inst);
    const x = await submitAssignment(A(s1), a.id, { text: "a", files: [] }, "ip");
    const y = await submitAssignment(A(s2), a.id, { text: "b", files: [] }, "ip");
    const r = await bulkApprove(A(inst), a.id, [x.id, y.id, "yok"], "", "ip");
    expect(r).toEqual({ approved: 2, skipped: 1 });
    const again = await bulkApprove(A(inst), a.id, [x.id], "", "ip");
    expect(again.approved).toBe(0);
    expect(await xpOf(s1.user.id)).toBe(120);
    expect(await xpOf(s2.user.id)).toBe(120);
  });
});

describe("dosyalar", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });

  it("teslim dosyası yalnız sahibine ve personele açık; indirme güvenli başlıklarla", async () => {
    const { inst, s1, s2 } = await world();
    const a = await published(inst);
    await submitAssignment(A(s1), a.id, { text: "ek", files: [file("not.txt", "gizli bulgu")] }, "ip");
    const f = await db.fileAsset.findFirstOrThrow({ where: { scope: "SUBMISSION" } });
    expect(await codeOf(openFile(A(s2), f.id))).toBe("NOT_FOUND");
    expect((await openFile(A(inst), f.id)).data.toString()).toBe("gizli bulgu");
    const res = await fileGet(req(`/api/files/${f.id}`, { cookie: s1.cookie }), params({ id: f.id }));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-disposition")).toMatch(/^attachment;/);
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("content-security-policy")).toContain("sandbox");
    expect(await res.text()).toBe("gizli bulgu");
    const other = await fileGet(req(`/api/files/${f.id}`, { cookie: s2.cookie }), params({ id: f.id }));
    expect(other.status).toBe(404);
    // Kütüphanede teslim dosyaları listelenmez
    expect((await listLibrary(A(inst))).some((x) => x.id === f.id)).toBe(false);
  });

  it("kılık değiştirmiş çalıştırılabilir dosya reddedilir; diskte iz kalmaz", async () => {
    const { inst } = await world();
    const before = await fs.readdir(path.join(env().storageDir, "files"), { recursive: true }).catch(() => [] as string[]);
    const form = new FormData();
    form.set("scope", "CLUB");
    form.set("file", file("ders-notu.pdf", new Uint8Array([0x4d, 0x5a, 0x90, 0, 3, 0])));
    const res = await filesPost(await multipart("/api/files", inst.cookie, form), undefined);
    expect(res.status).toBe(400);
    expect((await readBody(res)).error.code).toBe("UNSUPPORTED_CONTENT");
    expect(await db.fileAsset.count()).toBe(0);
    const after = await fs.readdir(path.join(env().storageDir, "files"), { recursive: true }).catch(() => [] as string[]);
    expect(after.length).toBe(before.length);
  });

  it("öğrenci kütüphaneye yükleyemez; kapsamlar: kulüp herkese, seçili üyeler yalnız onlara, görev eki görevi görenlere", async () => {
    const { inst, s1, s2 } = await world();
    const form = new FormData();
    form.set("scope", "CLUB");
    form.set("file", file("a.txt", "a"));
    expect((await filesPost(await multipart("/api/files", s1.cookie, form), undefined)).status).toBe(403);

    await uploadLibraryFile(A(inst), file("herkes.txt", "x"), { scope: "CLUB" }, "", "ip");
    await uploadLibraryFile(A(inst), file("ali.txt", "x"), { scope: "USERS", userIds: [s1.user.id] }, "", "ip");
    const draft = await createAssignment(A(inst), input(), "ip");
    await uploadLibraryFile(A(inst), file("ek.txt", "x"), { scope: "ASSIGNMENT", assignmentId: draft.id }, "", "ip");
    const names = async (u: U) => (await listLibrary(A(u))).map((f) => f.name).sort();
    expect(await names(s1)).toEqual(["ali.txt", "herkes.txt"]);
    expect(await names(s2)).toEqual(["herkes.txt"]);
    const ek = await db.fileAsset.findFirstOrThrow({ where: { name: "ek.txt" } });
    expect(await codeOf(openFile(A(s2), ek.id))).toBe("NOT_FOUND"); // görev taslak
    await setAssignmentStatus(A(inst), draft.id, "PUBLISHED", "ip");
    expect((await openFile(A(s2), ek.id)).file.name).toBe("ek.txt");
  });

  it("öğrenci kotası aşılınca yükleme reddedilir", async () => {
    const { inst, s1 } = await world();
    await db.clubSettings.update({ where: { id: 1 }, data: { userQuotaMb: 1 } });
    invalidateSettings();
    const a = await published(inst);
    const big = "x".repeat(700 * 1024);
    await submitAssignment(A(s1), a.id, { text: "1", files: [file("a.log", big)] }, "ip");
    await reviewSubmission(A(inst), (await db.submission.findFirstOrThrow()).id, { decision: "RETURN", feedback: "tekrar" }, "ip");
    expect(await codeOf(submitAssignment(A(s1), a.id, { text: "2", files: [file("b.log", big)] }, "ip"))).toBe("QUOTA_USER");
    expect(await db.fileAsset.count()).toBe(1);
  });
});

describe("duyurular ve bildirimler", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });

  it("personel duyurusu öğrenciye görünmez; herkese duyuru bildirim üretir; öğrenci duyuru yazamaz", async () => {
    const { inst, inst2, s1 } = await world();
    await createAnnouncement(A(inst), { title: "Eğitmen toplantısı", body: "", audience: "STAFF", pinned: false, expiresAt: null }, "ip");
    await createAnnouncement(A(inst), { title: "Cuma CTF var", body: "**Saat** 18:00", audience: "ALL", pinned: true, expiresAt: null }, "ip");
    await createAnnouncement(A(inst), { title: "Eski duyuru", body: "", audience: "ALL", pinned: false, expiresAt: new Date(Date.now() - 1000) }, "ip");
    expect((await listAnnouncements(A(s1))).map((a) => a.title)).toEqual(["Cuma CTF var"]);
    expect((await listAnnouncements(A(inst2))).map((a) => a.title)).toContain("Eğitmen toplantısı");
    const n = await listNotifications(A(s1));
    expect(n.map((x) => x.title)).toEqual(["Eski duyuru", "Cuma CTF var"]);
    expect(n[1]!.body).toBe("Saat 18:00");
    expect(await unreadCount(inst.user.id)).toBe(0); // yazara bildirim gitmez
    expect(await codeOf(createAnnouncement(A(s1), { title: "Sahte", body: "", audience: "ALL", pinned: false, expiresAt: null }, "ip"))).toBe("FORBIDDEN");
  });

  it("kişi yalnız kendi bildirimlerini okundu yapabilir", async () => {
    const { inst, s1, s2 } = await world();
    await createAnnouncement(A(inst), { title: "Duyuru", body: "", audience: "ALL", pinned: false, expiresAt: null }, "ip");
    const theirs = (await listNotifications(A(s2)))[0]!;
    expect(await markRead(A(s1), [theirs.id])).toBe(0);
    expect(await unreadCount(s2.user.id)).toBe(1);
    expect(await markRead(A(s1), "all")).toBe(1);
    expect(await unreadCount(s1.user.id)).toBe(0);
    expect(await unreadCount(s2.user.id)).toBe(1);
  });
});
