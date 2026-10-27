"use client";
// Pyodide çalışanını yöneten kanca: ilk çalıştırmada açılır, 12 saniyeyi aşan (ör. sonsuz döngü) çalıştırmada
// çalışan sonlandırılıp bir sonrakinde yeniden kurulur.
import { useCallback, useEffect, useRef, useState } from "react";

export type PyResult = { ok: boolean; out: string; error?: string };
const LIMIT_MS = 12_000;

export function usePython() {
  const worker = useRef<Worker | null>(null);
  const seq = useRef(0);
  const [running, setRunning] = useState(false);

  useEffect(() => () => worker.current?.terminate(), []);

  const run = useCallback((code: string) => new Promise<PyResult>((resolve) => {
    // Pyodide modül çalışanı ister; çalışan paketlenmeden /vendor altından sunulur (scripts/pyodide-worker.mjs).
    worker.current ??= new Worker("/vendor/pyodide/worker.mjs", { type: "module" });
    const w = worker.current;
    const id = ++seq.current;
    setRunning(true);
    const done = (r: PyResult) => { clearTimeout(timer); w.removeEventListener("message", onMsg); w.removeEventListener("error", onErr); setRunning(false); resolve(r); };
    const onMsg = (e: MessageEvent<PyResult & { id: number }>) => { if (e.data.id === id) done(e.data); };
    const onErr = () => { w.terminate(); worker.current = null; done({ ok: false, out: "", error: "Python çalışma ortamı başlatılamadı." }); };
    const timer = setTimeout(() => { w.terminate(); worker.current = null; done({ ok: false, out: "", error: "Süre doldu (12 sn). Kodda sonsuz döngü olabilir." }); }, LIMIT_MS);
    w.addEventListener("message", onMsg);
    w.addEventListener("error", onErr);
    w.postMessage({ id, code });
  }), []);

  return { run, running };
}
