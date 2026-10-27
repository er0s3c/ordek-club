// Tarayıcıda çalışan kütüphanelerin WASM, yazı tipi ve çalışma zamanı dosyalarını public/vendor altına kopyalar.
// Böylece hiçbir dış CDN'e istek gitmez (CSP 'self'); dosyalar sürümüyle birlikte gelir, depoya eklenmez.
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, "../public/vendor");
// Bazı paketler package.json'u "exports" ile dışarı açmaz; node_modules içindeki klasör doğrudan bulunur.
const pkg = (name) => path.join(path.dirname(require.resolve("pyodide/package.json")), "..", ...name.split("/"));

async function copy(from, to, files) {
  await fs.mkdir(to, { recursive: true });
  for (const f of files) await fs.cp(path.join(from, f), path.join(to, f), { recursive: true });
}

// Pyodide: güvenli kod atölyesinde Python testleri öğrencinin tarayıcısında çalışır.
await copy(pkg("pyodide"), path.join(root, "pyodide"), ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip", "pyodide-lock.json"]);
await fs.copyFile(path.resolve(import.meta.dirname, "pyodide-worker.mjs"), path.join(root, "pyodide", "worker.mjs"));
// v86: tarayıcı içi Linux labı (BIOS ve disk görüntüsü yönetici tarafından public/vendor/v86-images altına eklenir).
await copy(path.join(pkg("v86"), "build"), path.join(root, "v86"), ["libv86.mjs", "v86.wasm"]);
// Excalidraw yazı tipleri (varsayılan CDN yerine).
await copy(path.join(pkg("@excalidraw/excalidraw"), "dist", "prod"), path.join(root, "excalidraw"), ["fonts"]);
// dotLottie oynatıcısının WASM'ı (varsayılan CDN yerine).
await copy(path.join(pkg("@lottiefiles/dotlottie-web"), "dist"), path.join(root, "dotlottie"), ["dotlottie-player.wasm"]);
// Monaco: önceden paketlenmiş AMD sürümü (CSS ve dil dosyaları dahil, ~25 MB); sürüm değişmedikçe yeniden kopyalanmaz.
const monacoVersion = JSON.parse(await fs.readFile(path.join(pkg("monaco-editor"), "package.json"), "utf8")).version;
const stamp = path.join(root, "monaco", ".version");
if ((await fs.readFile(stamp, "utf8").catch(() => "")) !== monacoVersion) {
  await fs.rm(path.join(root, "monaco"), { recursive: true, force: true });
  await copy(path.join(pkg("monaco-editor"), "min"), path.join(root, "monaco"), ["vs"]);
  await fs.writeFile(stamp, monacoVersion);
}
console.log("Vendor assets copied to public/vendor (pyodide, v86, excalidraw, dotlottie, monaco).");
