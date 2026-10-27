"use client";
// Birleşik arama / komut paleti: Ctrl+K (⌘K) ya da üst menüdeki arama düğmesi açar.
// Boş sorguda sayfa kısayolları; yazınca /api/search sonuçları. Ok tuşları + Enter, Esc kapatır.
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ClipboardList, CornerDownLeft, FlaskConical, Languages, Megaphone, Navigation, ScrollText, Search, Shield } from "lucide-react";
import { api } from "@/lib/api-client";
import { fold } from "@/lib/text";
import { animate } from "motion/mini";
import { useClubReducedMotion } from "@/components/motion/MotionProvider";
import { motionTokens } from "@/lib/motion-tokens";
import { useT } from "@/i18n/client";

type Hit = { kind: "lesson" | "term" | "task" | "announcement" | "lab" | "page" | "comic" | "character"; id: string; title: string; detail: string; href: string };
const KIND = {
  page: ["Sayfalar", Navigation],
  lesson: ["Dersler", BookOpen],
  term: ["Terimler", Languages],
  task: ["Görevler", ClipboardList],
  announcement: ["Duyurular", Megaphone],
  lab: ["Lablar ve atölyeler", FlaskConical],
  comic: ["Gölge Ağ · çizgi roman", ScrollText],
  character: ["Gölge Ağ · karakterler", Shield],
} as const;

export function CommandPalette({ open, onClose, pages }: { open: boolean; onClose: () => void; pages: { href: string; label: string }[] }) {
  const tl = useT();
  const router = useRouter();
  const dlg = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const reduced = useClubReducedMotion();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sel, setSel] = useState(0);

  useEffect(() => {
    const d = dlg.current;
    const panel = content.current;
    if (!d || !panel) return;
    if (open) {
      if (!d.open) {
        panel.style.transform = reduced ? "none" : "translateY(-8px) scale(.985)";
        panel.style.opacity = reduced ? "1" : ".5";
        d.showModal(); setQ(""); setHits([]); setSel(0);
      }
      if (!panel.contains(document.activeElement)) input.current?.focus();
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const animation = animate(panel, { opacity: 1, transform: "none" }, { duration: reduced ? 0 : motionTokens.panel, ease: motionTokens.ease });
      return () => { animation.stop(); document.body.style.overflow = previous; };
    }
    if (!d.open) return;
    let cancelled = false;
    const animation = animate(panel, { opacity: 0, transform: "translateY(-4px) scale(.99)" }, { duration: reduced ? 0 : motionTokens.exit });
    void animation.then(() => { if (!cancelled) d.close(); });
    return () => { cancelled = true; animation.stop(); };
  }, [open, reduced]);

  useEffect(() => {
    if (fold(q).trim().length < 2) { setHits([]); setErr(""); return; }
    const ctl = new AbortController();
    const t = setTimeout(() => {
      setBusy(true);
      api<{ hits: Hit[] }>(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctl.signal })
        .then((r) => { setHits(r.hits); setErr(""); setSel(0); })
        .catch((e) => { if ((e as Error).name !== "AbortError") setErr((e as Error).message); })
        .finally(() => setBusy(false));
    }, 180);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q]);

  const pageHits = useMemo<Hit[]>(() => {
    const n = fold(q).trim();
    return pages.filter((p) => !n || fold(p.label).includes(n)).slice(0, n ? 4 : 8).map((p) => ({ kind: "page", id: p.href, title: p.label, detail: p.href, href: p.href }));
  }, [q, pages]);
  const all = [...pageHits, ...hits];

  function go(h: Hit | undefined) {
    if (!h) return;
    onClose();
    router.push(h.href);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(all.length - 1, s + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); go(all[sel]); }
  }

  let lastKind = "";
  return (
    <dialog ref={dlg} className="modal palette" aria-label={tl("Ara")} onCancel={event => { event.preventDefault(); onClose(); }} onMouseDown={(e) => { if (e.target === dlg.current) onClose(); }}>
      <div ref={content} inert={!open} className="palette-in">
        <div className="palette-q">
          <Search size={18} aria-hidden />
          <input
            ref={input}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={all[sel] ? `ph-${sel}` : undefined}
            aria-label={tl("Ders, terim, görev, duyuru veya lab ara")}
            placeholder={tl("Ders, terim, görev, duyuru veya lab ara…")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
          />
          {busy && <span className="spinner" aria-hidden />}
        </div>
        <ul id="palette-list" role="listbox" className="palette-list" aria-label={tl("Sonuçlar")}>
          {all.map((h, i) => {
            const [group0, Icon] = KIND[h.kind];
            const group = tl(group0);
            const head = group !== lastKind ? <li role="presentation" className="palette-group">{group}</li> : null;
            lastKind = group;
            return (
              <Fragment key={`${h.kind}-${h.id}-${i}`}>
                {head}
                <li id={`ph-${i}`} role="option" aria-selected={i === sel} className="palette-item" onMouseEnter={() => setSel(i)} onClick={() => go(h)}>
                  <Icon size={16} aria-hidden />
                  <span className="stack-sm" style={{ gap: 0, minWidth: 0 }}>
                    <span>{h.title}</span>
                    <span className="tiny faint" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.detail}</span>
                  </span>
                </li>
              </Fragment>
            );
          })}
          {fold(q).trim().length >= 2 && !busy && !hits.length && !err && <li className="palette-group" role="presentation">{tl("“{q}” için sonuç yok. Daha kısa ya da farklı bir kelime dene.", { q })}</li>}
          {err && <li className="palette-group" role="alert">{err}</li>}
        </ul>
        <div className="palette-foot" aria-hidden>
          <span><kbd>↑</kbd> <kbd>↓</kbd>{" "}{tl("seç")}</span>
          <span><kbd><CornerDownLeft size={10} /></kbd>{" "}{tl("aç")}</span>
          <span><kbd>Esc</kbd>{" "}{tl("kapat")}</span>
          <span><kbd>?</kbd>{" "}{tl("kısayollar")}</span>
        </div>
      </div>
    </dialog>
  );
}
