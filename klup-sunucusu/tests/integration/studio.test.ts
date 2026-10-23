import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@/server/db";
import {
  createFromTemplate, createPresentation, exportDeck, getStudio, parseDeck, publishDraft, restoreVersion, saveDraft, updatePresentation, userTemplates,
} from "@/server/presentations";
import { uploadLibraryFile } from "@/server/files/service";
import { GET as fileGet } from "@/app/api/files/[id]/route";
import { PUT as draftPut } from "@/app/api/presentations/[id]/draft/route";
import { completeSetupFixture, makeUser, params, req, resetDb } from "../helpers";

type U = Awaited<ReturnType<typeof makeUser>>;
const A = (u: U) => ({ id: u.user.id, role: u.user.role, status: u.user.status });
const codeOf = (p: Promise<unknown>) => p.then(() => null, (e: { code?: string }) => e.code);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]);
const deck = (title = "Studio testi") => parseDeck({ title, slides: [{ title: "Giriş", blocks: [{ type: "text", text: "merhaba" }] }] });

describe("Club Studio", () => {
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });

  it("otomatik kayıt sürüm oluşturmaz; geçersiz taslak kaydedilir ama yayınlanamaz; yayın yeni sürüm açar ve taslağı temizler", async () => {
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const p = await createPresentation(A(inst), deck(), "ip");
    const bad = { title: "", slides: [{ title: "Boş", blocks: [{ type: "text", text: "x" }] }] };
    const r = await saveDraft(A(inst), p.id, bad);
    expect(r.issues.map((i) => i.path)).toContain("title");
    expect(await db.presentationVersion.count({ where: { presentationId: p.id } })).toBe(1);
    expect(await codeOf(publishDraft(A(inst), p.id, "ip"))).toBe("INVALID_DECK");

    const good = { ...deck("Yeni ad"), slides: [...deck().slides, { title: "İkinci", layout: "default", blocks: [{ type: "callout", tone: "warn", text: "dikkat" }], notes: "" }] };
    expect((await saveDraft(A(inst), p.id, good)).issues).toEqual([]);
    const st = await getStudio(A(inst), p.id);
    expect(st.hasDraft).toBe(true);
    expect((st.deck as { title: string }).title).toBe("Yeni ad");
    expect((await publishDraft(A(inst), p.id, "ip")).version).toBe(2);
    const after = await db.presentation.findUniqueOrThrow({ where: { id: p.id } });
    expect(after.draft).toBeNull();
    expect(after.title).toBe("Yeni ad");
    expect((await exportDeck(A(inst), p.id)).slides).toHaveLength(2);

    // Eski sürüm taslağa yüklenir, geçmiş korunur
    const v1 = await db.presentationVersion.findFirstOrThrow({ where: { presentationId: p.id, number: 1 } });
    expect((await restoreVersion(A(inst), p.id, v1.id)).slides).toHaveLength(1);
    expect((await publishDraft(A(inst), p.id, "ip")).version).toBe(3);
  });

  it("yalnız sahibi ve yönetici düzenler; öğrenci ve başka eğitmen 403/404", async () => {
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const other = await makeUser({ role: "INSTRUCTOR" });
    const stu = await makeUser();
    const p = await createPresentation(A(inst), deck(), "ip");
    expect(await codeOf(saveDraft(A(other), p.id, deck()))).toBe("NOT_FOUND"); // taslak sunum diğerine görünmez
    await updatePresentation(A(inst), p.id, { status: "PUBLISHED" }, "ip");
    expect(await codeOf(saveDraft(A(other), p.id, deck()))).toBe("FORBIDDEN");
    const res = await draftPut(req(`/api/presentations/${p.id}/draft`, { method: "PUT", cookie: stu.cookie, body: { content: deck() } }), params({ id: p.id }));
    expect(res.status).toBe(403);
    const big = { title: "x".repeat(10), slides: [{ title: "a", blocks: [], notes: "y".repeat(600_000) }] };
    expect(await codeOf(saveDraft(A(inst), p.id, big))).toBe("TOO_LARGE");
  });

  it("görsel blok yalnız kulübe yüklenmiş görsele başvurabilir; görsel satır içi sunulur, diğer dosyalar indirilir", async () => {
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const stu = await makeUser();
    const p = await createPresentation(A(inst), deck(), "ip");
    expect(await codeOf(uploadLibraryFile(A(inst), new File([new TextEncoder().encode("metin")], "a.txt"), { scope: "MEDIA" }, "", "ip"))).toBe("NOT_IMAGE");
    const img = await uploadLibraryFile(A(inst), new File([PNG], "topoloji.png"), { scope: "MEDIA" }, "", "ip");
    const sub = await uploadLibraryFile(A(inst), new File([new TextEncoder().encode("rapor")], "rapor.txt"), { scope: "CLUB" }, "", "ip");

    const withImg = (fileId: string) => ({ title: "Görselli", slides: [{ title: "Ağ", blocks: [{ type: "image", fileId, alt: "Ağ şeması" }] }] });
    await saveDraft(A(inst), p.id, withImg("cnotarealfileid0000000000"));
    expect(await codeOf(publishDraft(A(inst), p.id, "ip"))).toBe("BAD_MEDIA");
    await saveDraft(A(inst), p.id, withImg(sub.id));
    expect(await codeOf(publishDraft(A(inst), p.id, "ip"))).toBe("BAD_MEDIA"); // görsel değil
    await saveDraft(A(inst), p.id, withImg(img.id));
    expect((await publishDraft(A(inst), p.id, "ip")).version).toBe(2);

    const inline = await fileGet(req(`/api/files/${img.id}?inline=1`, { cookie: stu.cookie }), params({ id: img.id }));
    expect(inline.status).toBe(200);
    expect(inline.headers.get("content-disposition")).toMatch(/^inline;/);
    expect(inline.headers.get("content-type")).toBe("image/png");
    const txt = await fileGet(req(`/api/files/${sub.id}?inline=1`, { cookie: stu.cookie }), params({ id: sub.id }));
    expect(txt.headers.get("content-disposition")).toMatch(/^attachment;/);
    // Sunum görselleri kütüphanede listelenmez
    expect(await db.fileAsset.count({ where: { scope: "MEDIA" } })).toBe(1);
  });

  it("şablon olarak paylaşma: yayınlanmış şablon diğer eğitmenlere görünür ve kopyalanır", async () => {
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const other = await makeUser({ role: "INSTRUCTOR" });
    const p = await createPresentation(A(inst), deck("Paylaşılan ders"), "ip");
    await updatePresentation(A(inst), p.id, { isTemplate: true }, "ip");
    expect(await userTemplates(A(other))).toHaveLength(0); // henüz taslak
    expect(await codeOf(createFromTemplate(A(other), `user:${p.id}`, "ip"))).toBe("NOT_FOUND");
    await updatePresentation(A(inst), p.id, { status: "PUBLISHED" }, "ip");
    const list = await userTemplates(A(other));
    expect(list.map((t) => t.title)).toEqual(["Paylaşılan ders"]);
    const copy = await createFromTemplate(A(other), list[0]!.key, "ip");
    expect(copy.ownerId).toBe(other.user.id);
    expect(copy.templateKey).toBe(`user:${p.id}`);
  });
});
