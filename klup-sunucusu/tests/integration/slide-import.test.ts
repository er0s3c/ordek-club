import http from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import JSZip from "jszip";
import { db } from "@/server/db";
import { env } from "@/server/env";
import { POST as importPost } from "@/app/api/presentations/import/route";
import { POST as pagePost } from "@/app/api/presentations/import/pages/route";
import { POST as convertPost } from "@/app/api/presentations/import/convert/route";
import { createPresentation, getStudio, parseDeck } from "@/server/presentations";
import { ORIGIN, completeSetupFixture, makeUser, readBody, req, resetDb } from "../helpers";

type U = Awaited<ReturnType<typeof makeUser>>;
const A = (u: U) => ({ id: u.user.id, role: u.user.role, status: u.user.status });
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]);

// Tarayıcının gönderdiği gibi multipart istek (Content-Length dahil).
async function multipart(path: string, cookie: string, file: { name: string; data: Uint8Array<ArrayBuffer> }) {
  const form = new FormData();
  form.set("file", new Blob([file.data]), file.name);
  const encoded = new Response(form);
  const body = new Uint8Array(await encoded.arrayBuffer());
  return new Request(ORIGIN + path, {
    method: "POST",
    body,
    headers: { host: "club.test", origin: ORIGIN, cookie, "x-club-remote-addr": "10.0.0.1", "content-type": encoded.headers.get("content-type")!, "content-length": String(body.length) },
  });
}

async function uploadPage(u: U, name = "slayt-001.png") {
  const res = await pagePost(await multipart("/api/presentations/import/pages", u.cookie, { name, data: PNG }), {});
  expect(res.status).toBe(201);
  return (await readBody(res)).id as string;
}

async function samplePptx() {
  const z = new JSZip();
  const rel = (id: string, type: string, target: string) => `<Relationship Id="${id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/${type}" Target="${target}"/>`;
  z.file("[Content_Types].xml", "<Types/>");
  z.file("ppt/presentation.xml", `<p:presentation><p:sldIdLst><p:sldId id="256" r:id="rId2"/></p:sldIdLst></p:presentation>`);
  z.file("ppt/_rels/presentation.xml.rels", `<Relationships>${rel("rId2", "slide", "slides/slide1.xml")}</Relationships>`);
  z.file("ppt/slides/slide1.xml", "<p:sld/>");
  z.file("ppt/slides/_rels/slide1.xml.rels", `<Relationships>${rel("rId1", "notesSlide", "../notesSlides/notesSlide1.xml")}</Relationships>`);
  z.file("ppt/notesSlides/notesSlide1.xml", `<p:notes><p:sp><p:nvPr><p:ph type="body"/></p:nvPr><a:p><a:r><a:t>Konuşmacı notu</a:t></a:r></a:p></p:sp></p:notes>`);
  return new Uint8Array(await z.generateAsync({ type: "uint8array" }));
}

describe("dosyadan slayt içe aktarma", () => {
  const saved = { url: env().SLIDE_CONVERTER_URL, secret: env().SLIDE_CONVERTER_SECRET };
  beforeEach(async () => {
    await resetDb();
    await completeSetupFixture();
  });
  afterEach(() => {
    env().SLIDE_CONVERTER_URL = saved.url;
    env().SLIDE_CONVERTER_SECRET = saved.secret;
  });

  it("öğrenci sayfa yükleyemez ve içe aktaramaz (403)", async () => {
    const stu = await makeUser();
    expect((await pagePost(await multipart("/api/presentations/import/pages", stu.cookie, { name: "a.png", data: PNG }), {})).status).toBe(403);
    const res = await importPost(req("/api/presentations/import", { cookie: stu.cookie, body: { title: "Deneme", pages: [{ fileId: "c" + "a".repeat(24), text: "", notes: "" }] } }), {});
    expect(res.status).toBe(403);
  });

  it("eğitmen: sayfalar MEDIA görseli olur, her sayfa tek görsel bloklu slayt; metin alt/not olarak taşınır", async () => {
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const a = await uploadPage(inst);
    const b = await uploadPage(inst, "slayt-002.png");
    const f = await db.fileAsset.findUniqueOrThrow({ where: { id: a } });
    expect(f).toMatchObject({ scope: "MEDIA", kind: "image", ownerId: inst.user.id });

    const res = await importPost(
      req("/api/presentations/import", { cookie: inst.cookie, body: { title: "Hafta 3", pages: [{ fileId: a, text: "Port Tarama\nnmap -sV", notes: "Demo yap" }, { fileId: b, text: "", notes: "" }] } }),
      {},
    );
    expect(res.status).toBe(201);
    const { id, slides } = await readBody(res);
    expect(slides).toBe(2);
    const st = await getStudio(A(inst), id);
    const deck = st.deck as ReturnType<typeof parseDeck>;
    expect(deck.title).toBe("Hafta 3");
    expect(deck.slides[0]).toMatchObject({ title: "Port Tarama", blocks: [{ type: "image", fileId: a, alt: "Port Tarama nmap -sV" }] });
    expect(deck.slides[0]!.notes).toContain("Demo yap");
    expect(deck.slides[1]).toMatchObject({ title: "Slayt 2", blocks: [{ type: "image", fileId: b, alt: "Slayt 2" }] });
    expect(await db.auditLog.count({ where: { action: "presentation.import", targetId: id } })).toBe(1);
  });

  it("var olan sunumun taslağına ekler; başkasının sunumuna eklenemez", async () => {
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const other = await makeUser({ role: "INSTRUCTOR" });
    const p = await createPresentation(A(inst), parseDeck({ title: "Mevcut", slides: [{ title: "Giriş", blocks: [{ type: "text", text: "x" }] }] }), "ip");
    const a = await uploadPage(inst);
    const res = await importPost(req("/api/presentations/import", { cookie: inst.cookie, body: { presentationId: p.id, pages: [{ fileId: a, text: "Ek", notes: "" }] } }), {});
    expect(res.status).toBe(200);
    const body = await readBody(res);
    expect(body.deck.slides).toHaveLength(2);
    expect(body.issues).toEqual([]);
    const st = await getStudio(A(inst), p.id);
    expect(st.hasDraft).toBe(true);
    expect((st.deck as { slides: { title: string }[] }).slides.map((s) => s.title)).toEqual(["Giriş", "Ek"]);

    const b = await uploadPage(other);
    const denied = await importPost(req("/api/presentations/import", { cookie: other.cookie, body: { presentationId: p.id, pages: [{ fileId: b, text: "", notes: "" }] } }), {});
    expect(denied.status).toBe(404); // taslak sunum diğer eğitmene görünmez
  });

  it("başkasının, silinmiş ya da görsel olmayan dosyası reddedilir (BAD_MEDIA)", async () => {
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const other = await makeUser({ role: "INSTRUCTOR" });
    const foreign = await uploadPage(other);
    const res = await importPost(req("/api/presentations/import", { cookie: inst.cookie, body: { title: "Çalıntı", pages: [{ fileId: foreign, text: "", notes: "" }] } }), {});
    expect(res.status).toBe(400);
    expect((await readBody(res)).error.code).toBe("BAD_MEDIA");

    const mine = await uploadPage(inst);
    await db.fileAsset.update({ where: { id: mine }, data: { deletedAt: new Date() } });
    const gone = await importPost(req("/api/presentations/import", { cookie: inst.cookie, body: { title: "Silinmiş", pages: [{ fileId: mine, text: "", notes: "" }] } }), {});
    expect((await readBody(gone)).error.code).toBe("BAD_MEDIA");

    const both = await importPost(req("/api/presentations/import", { cookie: inst.cookie, body: { title: "x", presentationId: "y", pages: [{ fileId: mine, text: "", notes: "" }] } }), {});
    expect(both.status).toBe(400);
  });

  it("sayfa uç noktası yalnız görsel kabul eder", async () => {
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const res = await pagePost(await multipart("/api/presentations/import/pages", inst.cookie, { name: "slayt.pdf", data: new TextEncoder().encode("%PDF-1.7\n") }), {});
    expect(res.status).toBe(400);
    expect((await readBody(res)).error.code).toBe("NOT_IMAGE");
  });

  it("dönüştürücü kurulu değilse PPTX dönüştürme 503 CONVERTER_MISSING", async () => {
    env().SLIDE_CONVERTER_URL = "";
    const inst = await makeUser({ role: "INSTRUCTOR" });
    const res = await convertPost(await multipart("/api/presentations/import/convert", inst.cookie, { name: "ders.pptx", data: await samplePptx() }), {});
    expect(res.status).toBe(503);
    const body = await readBody(res);
    expect(body.error.code).toBe("CONVERTER_MISSING");
    expect(body.error.message).toContain("PDF olarak dışa aktarıp");
  });

  it("dönüştürücü: imza doğrulanır, gizli anahtarla iletilir, PDF + konuşmacı notları döner", async () => {
    const seen: { secret?: string; type?: string; size: number }[] = [];
    const fake = http.createServer((rq, rs) => {
      const chunks: Buffer[] = [];
      rq.on("data", (c: Buffer) => chunks.push(c));
      rq.on("end", () => {
        seen.push({ secret: rq.headers["x-converter-secret"] as string, type: rq.headers["x-file-type"] as string, size: Buffer.concat(chunks).length });
        rs.writeHead(200, { "content-type": "application/pdf" });
        rs.end("%PDF-1.7\n% sahte\n");
      });
    });
    await new Promise<void>((r) => fake.listen(0, "127.0.0.1", r));
    try {
      env().SLIDE_CONVERTER_URL = `http://127.0.0.1:${(fake.address() as AddressInfo).port}`;
      env().SLIDE_CONVERTER_SECRET = "k".repeat(40);
      const inst = await makeUser({ role: "INSTRUCTOR" });
      const stu = await makeUser();
      const pptx = await samplePptx();

      expect((await convertPost(await multipart("/api/presentations/import/convert", stu.cookie, { name: "ders.pptx", data: pptx }), {})).status).toBe(403);

      const fakeExt = await convertPost(await multipart("/api/presentations/import/convert", inst.cookie, { name: "ders.pptx", data: new TextEncoder().encode("%PDF-1.7\n") }), {});
      expect(fakeExt.status).toBe(400);
      expect((await readBody(fakeExt)).error.code).toBe("TYPE_MISMATCH");
      const pdfName = await convertPost(await multipart("/api/presentations/import/convert", inst.cookie, { name: "ders.pdf", data: new TextEncoder().encode("%PDF-1.7\n") }), {});
      expect((await readBody(pdfName)).error.code).toBe("UNSUPPORTED_TYPE");
      expect(seen).toHaveLength(0); // reddedilen dosyalar dönüştürücüye hiç gitmez

      const ok = await convertPost(await multipart("/api/presentations/import/convert", inst.cookie, { name: "ders.pptx", data: pptx }), {});
      expect(ok.status).toBe(200);
      expect(ok.headers.get("content-type")).toMatch(/^multipart\/form-data/);
      const out = await ok.formData();
      expect(await (out.get("pdf") as Blob).text()).toMatch(/^%PDF-/);
      expect(JSON.parse(String(out.get("notes")))).toEqual(["Konuşmacı notu"]);
      expect(seen).toEqual([{ secret: "k".repeat(40), type: "pptx", size: pptx.length }]);
      expect(await db.auditLog.count({ where: { action: "presentation.convert", actorId: inst.user.id } })).toBe(1);
    } finally {
      await new Promise((r) => fake.close(r));
    }
  });
});
