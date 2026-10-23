import { describe, expect, it } from "vitest";
import { cleanFileName, sniffFile, validateUpload } from "@/server/files/store";

const bytes = (...b: number[]) => new Uint8Array(b);
const text = (s: string) => new TextEncoder().encode(s);
const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0);
const code = (fn: () => unknown) => {
  try {
    fn();
    return null;
  } catch (e) {
    return (e as { code?: string }).code;
  }
};

describe("dosya içerik doğrulaması", () => {
  it("içerikten türü bulur: pdf, png, zip, pcap, pcapng, metin", () => {
    expect(sniffFile(text("%PDF-1.7\n"))?.kind).toBe("pdf");
    expect(sniffFile(PNG)?.kind).toBe("image");
    expect(sniffFile(bytes(0x50, 0x4b, 0x03, 0x04, 1, 2))?.kind).toBe("zip");
    expect(sniffFile(bytes(0xd4, 0xc3, 0xb2, 0xa1, 2, 0, 4, 0))?.kind).toBe("pcap");
    expect(sniffFile(bytes(0x0a, 0x0d, 0x0d, 0x0a, 0, 0))?.kind).toBe("pcap");
    expect(sniffFile(text("Oct 23 04:12:01 sshd[1]: Failed password\nğüşiöç"))?.kind).toBe("text");
  });

  it("çalıştırılabilir ve ikili içerik reddedilir (uzantı ne olursa olsun)", () => {
    expect(sniffFile(bytes(0x4d, 0x5a, 0x90, 0x00))).toBeNull(); // PE
    expect(sniffFile(bytes(0x7f, 0x45, 0x4c, 0x46, 2))).toBeNull(); // ELF
    expect(sniffFile(bytes(0xca, 0xfe, 0xba, 0xbe))).toBeNull(); // Mach-O fat / class
    expect(sniffFile(bytes(0x41, 0x00, 0x42))).toBeNull(); // NUL içeren
    expect(sniffFile(bytes(0xff, 0xfe, 0x41))).toBeNull(); // geçersiz UTF-8
    expect(code(() => validateUpload("notlar.txt", bytes(0x4d, 0x5a, 0x90, 0x00)))).toBe("UNSUPPORTED_CONTENT");
  });

  it("uzantı izin listesi ve uzantı/içerik uyumu", () => {
    expect(code(() => validateUpload("kurulum.exe", text("x")))).toBe("UNSUPPORTED_TYPE");
    expect(code(() => validateUpload("sayfa.html", text("<script>alert(1)</script>")))).toBe("UNSUPPORTED_TYPE");
    expect(code(() => validateUpload("cizim.svg", text("<svg onload=alert(1)>")))).toBe("UNSUPPORTED_TYPE");
    expect(code(() => validateUpload("rapor.pdf", PNG))).toBe("TYPE_MISMATCH");
    expect(code(() => validateUpload("ekran.png", text("%PDF-1.4")))).toBe("TYPE_MISMATCH");
    expect(validateUpload("EKRAN.PNG", PNG).mime).toBe("image/png");
    expect(validateUpload("auth.log", text("ok")).mime).toBe("text/plain; charset=utf-8");
  });

  it("dosya adı temizlenir: yol, kontrol ve yön karakterleri atılır, uzunluk sınırlanır", () => {
    expect(cleanFileName("../../etc/passwd")).toBe("passwd");
    expect(cleanFileName("C:\\Users\\a\\rapor.pdf")).toBe("rapor.pdf");
    expect(cleanFileName("fatura\u202Efdp.exe")).toBe("faturafdp.exe");
    expect(cleanFileName("  ...gizli.txt  ")).toBe("gizli.txt");
    expect(cleanFileName("\u0000\u0001")).toBe("dosya");
    const long = cleanFileName("a".repeat(300) + ".pcap");
    expect(long.length).toBe(120);
    expect(long.endsWith(".pcap")).toBe(true);
  });
});
