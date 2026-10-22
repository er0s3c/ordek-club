// Görsel türünü dosya İÇERİĞİNDEN (magic byte) belirler; istemcinin bildirdiği MIME'a/uzantıya güvenilmez.
// SVG kasıtlı olarak desteklenmez (betik içerebilir → XSS).
export type ImageKind = { mime: "image/png" | "image/jpeg" | "image/webp"; ext: "png" | "jpg" | "webp" };

export function sniffImage(buf: Uint8Array): ImageKind | null {
  const b = (i: number) => buf[i] ?? -1;
  if (buf.length >= 8 && b(0) === 0x89 && b(1) === 0x50 && b(2) === 0x4e && b(3) === 0x47 && b(4) === 0x0d && b(5) === 0x0a && b(6) === 0x1a && b(7) === 0x0a) {
    return { mime: "image/png", ext: "png" };
  }
  if (buf.length >= 3 && b(0) === 0xff && b(1) === 0xd8 && b(2) === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (
    buf.length >= 12 &&
    b(0) === 0x52 && b(1) === 0x49 && b(2) === 0x46 && b(3) === 0x46 && // RIFF
    b(8) === 0x57 && b(9) === 0x45 && b(10) === 0x42 && b(11) === 0x50 // WEBP
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}
