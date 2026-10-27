"use client";
// Monaco kod düzenleyicisi. Önceden paketlenmiş AMD sürümü /vendor/monaco altından yüklenir (CDN yok, CSP 'self');
// dil çalışanları blob: Worker olarak açılır. Yüklenene kadar düz textarea gösterilir, böylece düzenleme hiç beklemez.
import { useEffect, useRef, useState } from "react";
import type * as MonacoNS from "monaco-editor";
import { useT } from "@/i18n/client";

type Monaco = typeof MonacoNS;
type AmdRequire = ((deps: string[], ok: () => void, fail: (e: unknown) => void) => void) & { config: (c: object) => void };
declare global { interface Window { monaco?: Monaco } }

let loading: Promise<Monaco> | null = null;
function loadMonaco(): Promise<Monaco> {
  if (window.monaco) return Promise.resolve(window.monaco);
  loading ??= new Promise<Monaco>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "/vendor/monaco/vs/loader.js";
    s.async = true;
    s.onload = () => {
      const req = (window as unknown as { require: AmdRequire }).require;
      req.config({ paths: { vs: "/vendor/monaco/vs" }, "vs/nls": { availableLanguages: {} } });
      req(["vs/editor/editor.main"], () => {
        const m = window.monaco!;
        m.editor.defineTheme("club-dark", {
          base: "vs-dark", inherit: true, rules: [],
          colors: { "editor.background": "#120d1f", "editor.lineHighlightBackground": "#1d1730", "editorLineNumber.foreground": "#6b6578", "editor.selectionBackground": "#5c1fe266" },
        });
        resolve(m);
      }, reject);
    };
    s.onerror = () => { loading = null; reject(new Error("Kod düzenleyici yüklenemedi.")); };
    document.head.appendChild(s);
  });
  return loading;
}

export function CodeEditor({ value, onChange, language = "plaintext", height = 280, readOnly = false, ariaLabel }: { value: string; onChange?: (v: string) => void; language?: string; height?: number; readOnly?: boolean; ariaLabel?: string }) {
  const t = useT();
  ariaLabel ??= t("Kod düzenleyici");
  const host = useRef<HTMLDivElement>(null);
  const editor = useRef<MonacoNS.editor.IStandaloneCodeEditor | null>(null);
  const change = useRef(onChange);
  change.current = onChange;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    loadMonaco().then((m) => {
      if (!live || !host.current) return;
      const ed = m.editor.create(host.current, {
        value, language, readOnly, theme: "club-dark", automaticLayout: true, minimap: { enabled: false }, fontSize: 14, lineHeight: 22,
        fontFamily: "JetBrains Mono, ui-monospace, monospace", scrollBeyondLastLine: false, tabSize: 4, renderLineHighlight: "line",
        ariaLabel, accessibilitySupport: "auto", wordWrap: "on", padding: { top: 10, bottom: 10 },
      });
      ed.onDidChangeModelContent(() => change.current?.(ed.getValue()));
      editor.current = ed;
      setReady(true);
    }, () => live && setFailed(true));
    return () => { live = false; editor.current?.getModel()?.dispose(); editor.current?.dispose(); editor.current = null; };
    // Düzenleyici bir kez kurulur; değer ve dil aşağıdaki etkilerle eşitlenir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { const ed = editor.current; if (ed && ed.getValue() !== value) ed.setValue(value); }, [value]);
  useEffect(() => { const m = window.monaco, model = editor.current?.getModel(); if (m && model) m.editor.setModelLanguage(model, language); }, [language, ready]);
  useEffect(() => { editor.current?.updateOptions({ readOnly }); }, [readOnly]);

  return (
    <div className="code-editor" style={{ height }}>
      <div ref={host} className="code-editor-host" hidden={!ready} />
      {!ready && (
        <textarea className="textarea mono code-editor-fallback" aria-label={ariaLabel} spellCheck={false} readOnly={readOnly} value={value}
          onChange={(e) => onChange?.(e.target.value)} placeholder={failed ? "" : t("Düzenleyici yükleniyor…")} />
      )}
    </div>
  );
}
