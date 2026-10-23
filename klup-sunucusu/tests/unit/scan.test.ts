import net from "node:net";
import zlib from "node:zlib";
import { afterEach, describe, expect, it } from "vitest";
import { clamScan, inspectZip } from "@/server/files/scan";

type Entry = { name: string; data: Buffer; deflate?: boolean; encrypted?: boolean; fakeSize?: number };

// Test için küçük ZIP üreticisi (CRC denetlenmediği için 0 yazılır).
function makeZip(entries: Entry[]): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name, "utf8");
    const body = e.deflate ? zlib.deflateRawSync(e.data) : e.data;
    const flags = 0x800 | (e.encrypted ? 1 : 0);
    const method = e.deflate ? 8 : 0;
    const usize = e.fakeSize ?? e.data.length;
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0);
    lh.writeUInt16LE(20, 4);
    lh.writeUInt16LE(flags, 6);
    lh.writeUInt16LE(method, 8);
    lh.writeUInt32LE(body.length, 18);
    lh.writeUInt32LE(usize, 22);
    lh.writeUInt16LE(name.length, 26);
    locals.push(lh, name, body);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0);
    ch.writeUInt16LE(20, 4);
    ch.writeUInt16LE(20, 6);
    ch.writeUInt16LE(flags, 8);
    ch.writeUInt16LE(method, 10);
    ch.writeUInt32LE(body.length, 20);
    ch.writeUInt32LE(usize, 24);
    ch.writeUInt16LE(name.length, 28);
    ch.writeUInt32LE(offset, 42);
    centrals.push(ch, name);
    offset += 30 + name.length + body.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, eocd]);
}

const txt = (s: string) => Buffer.from(s, "utf8");
const codeOf = (fn: () => unknown) => {
  try {
    fn();
    return null;
  } catch (e) {
    return (e as { code?: string }).code;
  }
};

describe("ZIP denetimi", () => {
  it("temiz arşivi kabul eder (klasör, saklanmış ve sıkıştırılmış öğeler)", () => {
    const z = makeZip([{ name: "lab/", data: Buffer.alloc(0) }, { name: "lab/auth.log", data: txt("Failed password\n".repeat(200)), deflate: true }, { name: "lab/notlar.md", data: txt("# not") }]);
    expect(inspectZip(z)).toMatchObject({ entries: 3 });
  });

  it("çalıştırılabilir öğeyi adından ve içeriğinden yakalar", () => {
    expect(codeOf(() => inspectZip(makeZip([{ name: "setup.exe", data: txt("x") }])))).toBe("ZIP_EXECUTABLE");
    expect(codeOf(() => inspectZip(makeZip([{ name: "fatura.LNK", data: txt("x") }])))).toBe("ZIP_EXECUTABLE");
    const mz = Buffer.concat([Buffer.from([0x4d, 0x5a, 0x90, 0]), Buffer.alloc(500)]);
    expect(codeOf(() => inspectZip(makeZip([{ name: "rapor.txt", data: mz, deflate: true }])))).toBe("ZIP_EXECUTABLE");
    expect(codeOf(() => inspectZip(makeZip([{ name: "resim.png", data: Buffer.from([0x7f, 0x45, 0x4c, 0x46, 2, 1]) }])))).toBe("ZIP_EXECUTABLE");
  });

  it("iç içe arşiv, yol geçişi ve şifreli öğe reddedilir", () => {
    expect(codeOf(() => inspectZip(makeZip([{ name: "ic.zip", data: txt("x") }])))).toBe("ZIP_NESTED");
    expect(codeOf(() => inspectZip(makeZip([{ name: "veri.bin", data: Buffer.from([0x50, 0x4b, 0x03, 0x04, 0]) }])))).toBe("ZIP_NESTED");
    expect(codeOf(() => inspectZip(makeZip([{ name: "../../etc/cron.d/x", data: txt("x") }])))).toBe("ZIP_PATH");
    expect(codeOf(() => inspectZip(makeZip([{ name: "a\\..\\..\\b.txt", data: txt("x") }])))).toBe("ZIP_PATH");
    expect(codeOf(() => inspectZip(makeZip([{ name: "/abs.txt", data: txt("x") }])))).toBe("ZIP_PATH");
    expect(codeOf(() => inspectZip(makeZip([{ name: "gizli.txt", data: txt("x"), encrypted: true }])))).toBe("ZIP_ENCRYPTED");
  });

  it("sıkıştırma bombası ve bozuk yapı reddedilir", () => {
    expect(codeOf(() => inspectZip(makeZip([{ name: "a.log", data: txt("a"), fakeSize: 600 * 1024 * 1024 }])))).toBe("ZIP_BOMB");
    const ratio = makeZip([{ name: "b.log", data: Buffer.alloc(200_000), deflate: true, fakeSize: 50 * 1024 * 1024 }]);
    expect(codeOf(() => inspectZip(ratio))).toBe("ZIP_BOMB");
    expect(codeOf(() => inspectZip(Buffer.from([0x50, 0x4b, 0x03, 0x04, 1, 2, 3])))).toBe("ZIP_CORRUPT");
  });
});

describe("ClamAV (clamd INSTREAM)", () => {
  let server: net.Server | null = null;
  afterEach(() => new Promise<void>((r) => (server ? server.close(() => r()) : r())));

  // Sahte clamd: komutu ve parçalı akışı protokole göre çözer, toplam baytı kaydeder.
  function fakeClamd(reply: (data: Buffer) => string) {
    return new Promise<number>((resolve) => {
      server = net.createServer((sock) => {
        let buf = Buffer.alloc(0);
        sock.on("data", (d) => {
          buf = Buffer.concat([buf, d]);
          const cmd = "zINSTREAM\0";
          if (buf.length < cmd.length) return;
          let p = cmd.length;
          const parts: Buffer[] = [];
          while (p + 4 <= buf.length) {
            const n = buf.readUInt32BE(p);
            if (n === 0) {
              sock.end(reply(Buffer.concat(parts)) + "\0");
              return;
            }
            if (p + 4 + n > buf.length) return;
            parts.push(buf.subarray(p + 4, p + 4 + n));
            p += 4 + n;
          }
        });
      });
      server.listen(0, "127.0.0.1", () => resolve((server!.address() as net.AddressInfo).port));
    });
  }

  it("temiz dosya ve imza bulunan dosya; büyük dosya parçalı gönderilir", async () => {
    let seen = 0;
    const port = await fakeClamd((d) => {
      seen = d.length;
      return d.includes(Buffer.from("EICAR-TEST")) ? "stream: Eicar-Signature FOUND" : "stream: OK";
    });
    const big = Buffer.alloc(300 * 1024, 0x41);
    expect(await clamScan(big, "127.0.0.1", port)).toEqual({ clean: true, signature: null });
    expect(seen).toBe(big.length);
    expect(await clamScan(Buffer.from("xxEICAR-TESTxx"), "127.0.0.1", port)).toEqual({ clean: false, signature: "Eicar-Signature" });
  });

  it("ulaşılamayan ya da anlamsız yanıt veren tarayıcı hata verir", async () => {
    await expect(clamScan(Buffer.from("a"), "127.0.0.1", 1, 2000)).rejects.toThrow();
    const port = await fakeClamd(() => "beklenmedik");
    await expect(clamScan(Buffer.from("a"), "127.0.0.1", port)).rejects.toThrow(/anlaşılamadı/);
  });
});
