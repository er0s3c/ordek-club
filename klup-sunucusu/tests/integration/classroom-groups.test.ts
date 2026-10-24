import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import {
  assignmentInputSchema, createAssignment, getAssignmentForStudent, listAssignmentsForStudent, openTaskCount,
  reviewSubmission, setAssignmentStatus, submitAssignment, updateAssignment,
} from "@/server/classroom/assignments";
import { archiveGroup, createGroup, getGroup, groupInputSchema, joinEvent, listGroups, setGroupMembers } from "@/server/classroom/groups";
import { listNotifications } from "@/server/classroom/notifications";
import { listLibrary, openFile, uploadLibraryFile } from "@/server/files/service";
import { publicQuiz } from "@/server/classroom/autograde";
import { completeSetupFixture, makeUser, resetDb } from "../helpers";

type U = Awaited<ReturnType<typeof makeUser>>;
const A = (u: U) => ({ id: u.user.id, role: u.user.role, status: u.user.status });
const codeOf = (p: Promise<unknown>) => p.then(() => null, (e: { code?: string }) => e.code);
const xpOf = async (userId: string) => (await db.xpTransaction.aggregate({ where: { userId }, _sum: { amount: true } }))._sum.amount ?? 0;
const file = (name: string, s: string) => new File([new TextEncoder().encode(s)], name);
const task = (o: Record<string, unknown>) => assignmentInputSchema.parse({ title: "Görev", description: "x", ...o });

async function world() {
  const inst = await makeUser({ role: "INSTRUCTOR" });
  const [s1, s2, s3, s4] = await Promise.all([makeUser(), makeUser(), makeUser(), makeUser()]);
  return { inst, s1, s2, s3, s4 };
}

async function published(inst: U, o: Record<string, unknown>) {
  const a = await createAssignment(A(inst), task(o), "ip");
  await setAssignmentStatus(A(inst), a.id, "PUBLISHED", "ip");
  return a;
}

describe("sınıflar ve etkinlikler", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });

  it("sınıfa hedeflenen görev ve dosya yalnız üyelere; arşivlenince görünmez", async () => {
    const { inst, s1, s2 } = await world();
    const g = await createGroup(A(inst), groupInputSchema.parse({ name: "Başlangıç A" }), "ip");
    await setGroupMembers(A(inst), g.id, [s1.user.username], "ip");
    const a = await published(inst, { audience: "GROUP", groupId: g.id });
    expect((await getAssignmentForStudent(A(s1), a.id)).group?.name).toBe("Başlangıç A");
    expect(await codeOf(getAssignmentForStudent(A(s2), a.id))).toBe("NOT_FOUND");
    expect((await listNotifications(A(s1))).length).toBe(1);
    expect(await listNotifications(A(s2))).toHaveLength(0);
    expect(await openTaskCount(A(s1))).toBe(1);
    expect(await openTaskCount(A(s2))).toBe(0);

    const f = await uploadLibraryFile(A(inst), file("not.txt", "sınıf notu"), { scope: "GROUP", groupId: g.id }, "", "ip");
    expect((await listLibrary(A(s1))).map((x) => x.name)).toEqual(["not.txt"]);
    expect(await listLibrary(A(s2))).toHaveLength(0);
    expect(await codeOf(openFile(A(s2), f.id))).toBe("NOT_FOUND");

    // Öğrenci sınıf üye listesini göremez; grubu yalnız üyeyse görür
    const seen = await getGroup(A(s1), g.id);
    expect(seen.members.map((m) => m.userId)).toEqual([s1.user.id]);
    expect(await codeOf(getGroup(A(s2), g.id))).toBe("NOT_FOUND");

    await archiveGroup(A(inst), g.id, "ip");
    expect(await listAssignmentsForStudent(A(s1))).toHaveLength(0);
    expect(await codeOf(openFile(A(s1), f.id))).toBe("NOT_FOUND");
  });

  it("sınıfa yalnız aktif öğrenciler eklenir; sınıfa öğrenci kendisi katılamaz", async () => {
    const { inst, s1 } = await world();
    const g = await createGroup(A(inst), groupInputSchema.parse({ name: "Grup B" }), "ip");
    expect(await codeOf(setGroupMembers(A(inst), g.id, [inst.user.username], "ip"))).toBe("BAD_MEMBERS");
    expect(await codeOf(joinEvent(A(s1), g.id))).toBe("NOT_FOUND");
    expect(groupInputSchema.safeParse({ name: "C", kind: "CLASS", selfJoin: true }).success).toBe(false);
    expect(await codeOf(createGroup(A(s1), groupInputSchema.parse({ name: "Sahte" }), "ip"))).toBe("FORBIDDEN");
  });

  it("etkinlik kaydı: kapasite eşzamanlı isteklerde aşılmaz; biten etkinliğe kayıt yok", async () => {
    const { inst, s1, s2, s3, s4 } = await world();
    const ev = await createGroup(A(inst), groupInputSchema.parse({ kind: "EVENT", name: "CTF gecesi", selfJoin: true, capacity: 2 }), "ip");
    expect((await listGroups(A(s1))).map((g) => g.name)).toEqual(["CTF gecesi"]);
    const r = await Promise.all([s1, s2, s3, s4].map((s) => codeOf(joinEvent(A(s), ev.id))));
    expect(r.filter((x) => x === null)).toHaveLength(2);
    expect(r.filter((x) => x === "FULL")).toHaveLength(2);
    expect(await db.classGroupMember.count({ where: { groupId: ev.id } })).toBe(2);

    const past = await createGroup(A(inst), groupInputSchema.parse({ kind: "EVENT", name: "Eski", selfJoin: true, startsAt: new Date(Date.now() - 7200_000), endsAt: new Date(Date.now() - 3600_000) }), "ip");
    expect(await codeOf(joinEvent(A(s1), past.id))).toBe("ENDED");
    expect((await listGroups(A(s1))).map((g) => g.name)).toEqual(["CTF gecesi"]); // biten etkinlik listelenmez
  });
});

describe("takım görevleri", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });

  it("takım başına tek teslim; takım arkadaşı görür ve günceller; onayda XP herkese bir kez", async () => {
    const { inst, s1, s2, s3, s4 } = await world();
    const a = await published(inst, {
      teamMode: true,
      teams: [{ name: "Kırmızı", usernames: [s1.user.username, s2.user.username] }, { name: "Mavi", usernames: [s3.user.username] }],
    });
    expect(await codeOf(getAssignmentForStudent(A(s4), a.id))).toBe("NOT_FOUND");
    await submitAssignment(A(s1), a.id, { text: "ilk taslak", files: [file("bulgu.txt", "takım bulgusu")] }, "ip");
    const view2 = await getAssignmentForStudent(A(s2), a.id);
    expect(view2.myTeam?.name).toBe("Kırmızı");
    expect(view2.mine?.text).toBe("ilk taslak");
    expect(await openTaskCount(A(s2))).toBe(0); // takım teslim etti
    const fid = view2.mine!.files[0]!.id;
    expect((await openFile(A(s2), fid)).data.toString()).toBe("takım bulgusu");
    expect(await codeOf(openFile(A(s3), fid))).toBe("NOT_FOUND");
    expect((await getAssignmentForStudent(A(s3), a.id)).mine).toBeNull();

    await submitAssignment(A(s2), a.id, { text: "son hali", files: [] }, "ip");
    expect(await db.submission.count({ where: { assignmentId: a.id } })).toBe(1);
    const sub = await db.submission.findFirstOrThrow({ where: { assignmentId: a.id } });
    expect(sub.text).toBe("son hali");
    const r = await reviewSubmission(A(inst), sub.id, { decision: "APPROVE", feedback: "" }, "ip");
    expect(r.userIds.sort()).toEqual([s1.user.id, s2.user.id].sort());
    expect(await xpOf(s1.user.id)).toBe(120);
    expect(await xpOf(s2.user.id)).toBe(120);
    expect(await xpOf(s3.user.id)).toBe(0);
    expect((await listNotifications(A(s2))).some((n) => n.type === "REVIEW")).toBe(true);
    expect(await codeOf(submitAssignment(A(s1), a.id, { text: "değiştir", files: [] }, "ip"))).toBe("LOCKED");
  });

  it("takım tanımı doğrulanır; teslimden sonra takımlar değişmez", async () => {
    const { inst, s1, s2 } = await world();
    expect(assignmentInputSchema.safeParse({ title: "abc", teamMode: true, teams: [] }).success).toBe(false);
    expect(assignmentInputSchema.safeParse({ title: "abc", teamMode: true, teams: [{ name: "A", usernames: ["x"] }, { name: "B", usernames: ["x"] }] }).success).toBe(false);
    const input = task({ teamMode: true, teams: [{ name: "A", usernames: [s1.user.username] }] });
    const a = await createAssignment(A(inst), input, "ip");
    await setAssignmentStatus(A(inst), a.id, "PUBLISHED", "ip");
    await submitAssignment(A(s1), a.id, { text: "x", files: [] }, "ip");
    const changed = task({ teamMode: true, teams: [{ name: "A", usernames: [s1.user.username, s2.user.username] }] });
    expect(await codeOf(updateAssignment(A(inst), a.id, changed, "ip"))).toBe("HAS_SUBMISSIONS");
    expect(await codeOf(updateAssignment(A(inst), a.id, task({ title: "Yeni ad", teamMode: true, teams: [{ name: "A", usernames: [s1.user.username] }] }), "ip"))).toBeNull();
  });
});

describe("otomatik puanlanan görev", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });

  const quiz = [
    { kind: "choice", text: "SSH?", options: ["21", "22"], answer: 1, explanation: "SSH 22/tcp" },
    { kind: "short", text: "Port?", accepted: ["4444"] },
  ];

  it("cevap anahtarı öğrenciye gitmez; geçemeyen tekrar dener, hakkı bitince reddedilir; geçen onay + XP alır", async () => {
    const { inst, s1, s2 } = await world();
    const a = await published(inst, { kind: "QUIZ", quiz, passPercent: 100, maxAttempts: 2, maxScore: 10 });
    const view = await getAssignmentForStudent(A(s1), a.id);
    expect(JSON.stringify(view)).not.toMatch(/4444|"answer"|accepted/);
    expect(view.quiz).toEqual(publicQuiz(quiz as never, a.id));

    const r1 = await submitAssignment(A(s1), a.id, { text: "", files: [], answers: [1, "1337"] }, "ip");
    expect(r1).toMatchObject({ status: "RETURNED", score: 5 });
    expect(r1.feedback).toContain("1/2");
    const r2 = await submitAssignment(A(s1), a.id, { text: "", files: [], answers: [0, "1337"] }, "ip");
    expect(r2).toMatchObject({ status: "REJECTED", attempts: 2, score: 0 });
    expect(await codeOf(submitAssignment(A(s1), a.id, { text: "", files: [], answers: [1, "4444"] }, "ip"))).toBe("LOCKED");
    expect(await xpOf(s1.user.id)).toBe(0);
    // Sonuç kesinleşince açıklamalar görünür (doğru cevap metni değil)
    expect((await getAssignmentForStudent(A(s1), a.id)).quizReview).toEqual([{ ok: false, explanation: "SSH 22/tcp" }, { ok: false, explanation: "" }]);

    const ok = await submitAssignment(A(s2), a.id, { text: "", files: [], answers: [1, " 4444 "] }, "ip");
    expect(ok).toMatchObject({ status: "APPROVED", score: 10, xp: 120 });
    expect(await xpOf(s2.user.id)).toBe(120);
    expect(await codeOf(submitAssignment(A(s2), a.id, { text: "", files: [], answers: [1, "4444"] }, "ip"))).toBe("LOCKED");
    expect(await db.submission.count({ where: { assignmentId: a.id, status: "SUBMITTED" } })).toBe(0); // eğitmen kuyruğuna düşmez
  });

  it("geçersiz cevap biçimi ve dosya reddedilir; teslimden sonra sorular değişmez", async () => {
    const { inst, s1 } = await world();
    const a = await published(inst, { kind: "QUIZ", quiz });
    expect(await codeOf(submitAssignment(A(s1), a.id, { text: "", files: [], answers: "1,2" }, "ip"))).toBe("BAD_ANSWERS");
    expect(await codeOf(submitAssignment(A(s1), a.id, { text: "", files: [], answers: [1] }, "ip"))).toBe("ANSWER_COUNT");
    expect(await codeOf(submitAssignment(A(s1), a.id, { text: "", files: [file("a.txt", "x")], answers: [1, "x"] }, "ip"))).toBe("NO_FILES");
    await submitAssignment(A(s1), a.id, { text: "", files: [], answers: [0, "x"] }, "ip");
    const changed = task({ kind: "QUIZ", quiz: [{ ...quiz[0], answer: 0 }, quiz[1]] });
    expect(await codeOf(updateAssignment(A(inst), a.id, changed, "ip"))).toBe("HAS_SUBMISSIONS");
    expect(assignmentInputSchema.safeParse({ title: "abc", kind: "QUIZ", quiz: [] }).success).toBe(false);
    expect(assignmentInputSchema.safeParse({ title: "abc", kind: "QUIZ", quiz, teamMode: true, teams: [{ name: "A", usernames: ["x"] }] }).success).toBe(false);
  });
});
