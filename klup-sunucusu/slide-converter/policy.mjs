// Dönüştürücü politikası (saf; testlenebilir). Sunucu: server.mjs.
import crypto from "node:crypto";
import path from "node:path";

export const MAX_BYTES = 60 * 1024 * 1024;
export const TIMEOUT_MS = 90_000;
export const MAX_QUEUE = 4; // çalışan 1 iş + bekleyen en fazla 4 iş; fazlası 503
export const TYPES = new Set(["pptx", "ppt"]);

const startsWith = (b, sig) => sig.every((v, i) => b[i] === v);

// İçerik imzası: PPTX = ZIP + [Content_Types].xml + ppt/ öğesi; PPT = OLE CFB + "PowerPoint Document" akışı.
export function detectType(buf) {
  if (!buf || buf.length < 8) return null;
  if (startsWith(buf, [0x50, 0x4b, 0x03, 0x04])) {
    const b = Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
    return b.includes(Buffer.from("[Content_Types].xml")) && b.includes(Buffer.from("ppt/")) ? "pptx" : null;
  }
  if (startsWith(buf, [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])) {
    const b = Buffer.from(buf.buffer, buf.byteOffset, buf.byteLength);
    return b.includes(Buffer.from("PowerPoint Document", "utf16le")) ? "ppt" : null;
  }
  return null;
}

// Gizli anahtar sabit zamanlı karşılaştırılır; boş/kısa anahtar her zaman reddedilir.
export function secretOk(expected, given) {
  if (typeof expected !== "string" || expected.length < 32 || typeof given !== "string") return false;
  const a = crypto.createHash("sha256").update(expected).digest();
  const b = crypto.createHash("sha256").update(given).digest();
  return crypto.timingSafeEqual(a, b);
}

// İsteğin başlıklarını değerlendirir; sorun varsa [durum, mesaj] döner, yoksa null.
export function checkRequest({ method, url, headers }, secret) {
  if (method !== "POST" || url !== "/convert") return [404, "not found"];
  if (!secretOk(secret, headers["x-converter-secret"])) return [401, "unauthorized"];
  if (!TYPES.has(headers["x-file-type"])) return [415, "unsupported type"];
  if ((headers["content-type"] ?? "") !== "application/octet-stream") return [415, "unsupported content type"];
  const len = Number(headers["content-length"]);
  if (!Number.isFinite(len)) return [411, "length required"];
  if (len <= 0) return [400, "empty"];
  if (len > MAX_BYTES) return [413, "too large"];
  return null;
}

// LibreOffice argümanları: her istek kendi geçici profilini kullanır (eşzamanlı/kalıntı durum yok).
export function sofficeArgs(workDir, inputName) {
  const profile = "file://" + path.posix.join(workDir.split(path.sep).join("/"), "profile");
  return [
    `-env:UserInstallation=${profile}`,
    "--headless", "--invisible", "--nologo", "--nodefault", "--nolockcheck", "--norestore", "--nofirststartwizard",
    "--convert-to", "pdf:impress_pdf_Export",
    "--outdir", path.join(workDir, "out"),
    path.join(workDir, inputName),
  ];
}

// Geçici profil: makrolar kapalı (en yüksek güvenlik + yürütme devre dışı), bağlantılar güncellenmez,
// Java ve otomatik güncelleme kapalı. LibreOffice bu dosyayı ilk açılışta okur.
export const REGISTRY_XCU = `<?xml version="1.0" encoding="UTF-8"?>
<oor:items xmlns:oor="http://openoffice.org/2001/registry" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
<item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="MacroSecurityLevel" oor:op="fuse"><value>3</value></prop></item>
<item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="DisableMacrosExecution" oor:op="fuse"><value>true</value></prop></item>
<item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="BlockUntrustedRefererLinks" oor:op="fuse"><value>true</value></prop></item>
<item oor:path="/org.openoffice.Office.Common/Misc"><prop oor:name="UseOpenCL" oor:op="fuse"><value>false</value></prop></item>
<item oor:path="/org.openoffice.Office.Common/Java"><prop oor:name="Enable" oor:op="fuse"><value>false</value></prop></item>
<item oor:path="/org.openoffice.Office.Impress/Content/Update"><prop oor:name="Link" oor:op="fuse"><value>false</value></prop></item>
<item oor:path="/org.openoffice.Office.Jobs/Jobs/org.openoffice.Office.Jobs:Job['UpdateCheck']/Arguments"><prop oor:name="AutoCheckEnabled" oor:op="fuse"><value>false</value></prop></item>
</oor:items>
`;

// Tek eşzamanlılık kuyruğu: aynı anda yalnız bir LibreOffice çalışır; kuyruk doluysa hemen reddedilir.
export function createQueue(maxWaiting = MAX_QUEUE) {
  let tail = Promise.resolve();
  let pending = 0;
  return {
    get size() {
      return pending;
    },
    run(fn) {
      if (pending > maxWaiting) return null; // 1 çalışan + maxWaiting bekleyen
      pending++;
      const job = tail.then(fn);
      tail = job.catch(() => {}).finally(() => pending--);
      return job;
    },
  };
}
