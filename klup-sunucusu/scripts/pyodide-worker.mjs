// Pyodide çalışanı (ES modülü): öğrencinin Python kodunu kendi tarayıcısında, ana iş parçacığını kilitlemeden çalıştırır.
// Pyodide klasik çalışanları desteklemediği için paketlenmez; sync-vendor-assets bu dosyayı
// public/vendor/pyodide/worker.mjs olarak kopyalar ve sayfa onu { type: "module" } ile açar.
let py = null;

self.onmessage = async (e) => {
  const out = [];
  try {
    py ??= import("./pyodide.mjs").then((m) => m.loadPyodide({ indexURL: "/vendor/pyodide/" }));
    const p = await py;
    p.setStdout({ batched: (s) => out.push(s) });
    p.setStderr({ batched: (s) => out.push(s) });
    // Her çalıştırma temiz bir ad alanında yapılır.
    await p.runPythonAsync(e.data.code, { globals: p.globals.get("dict")() });
    self.postMessage({ id: e.data.id, ok: true, out: out.join("\n") });
  } catch (err) {
    // Python hata izinin yalnız son satırları öğrenci için anlamlı.
    const msg = String(err?.message ?? err).trim().split("\n").slice(-4).join("\n");
    self.postMessage({ id: e.data.id, ok: false, out: out.join("\n"), error: msg });
  }
};
