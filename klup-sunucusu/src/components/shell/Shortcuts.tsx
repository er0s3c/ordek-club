"use client";
// Klavye kısayolları: Ctrl/⌘+K arama, ? yardım paneli, "g" ardından harf ile sayfa geçişi.
// Yazı alanlarında tek harfli kısayollar çalışmaz.
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/i18n/client";

export const GO_KEYS: { key: string; href: string; label: string; staffOnly?: boolean }[] = [
  { key: "h", href: "/dashboard", label: "Ana sayfa" },
  { key: "a", href: "/academy", label: "Akademi" },
  { key: "t", href: "/tasks", label: "Görevler" },
  { key: "w", href: "/academy/workspace", label: "Öğrenme alanım" },
  { key: "n", href: "/notifications", label: "Bildirimler" },
  { key: "e", href: "/teach", label: "Eğitmen paneli", staffOnly: true },
];

const typing = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

export function useShortcuts({ onSearch, onHelp, staff }: { onSearch: () => void; onHelp: () => void; staff: boolean }) {
  const router = useRouter();
  const pendingG = useRef(0);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); onSearch(); return; }
      if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
      if (e.key === "?") { e.preventDefault(); onHelp(); return; }
      if (e.key === "/") { e.preventDefault(); onSearch(); return; }
      if (e.key === "g") { pendingG.current = Date.now(); return; }
      if (Date.now() - pendingG.current < 1200) {
        pendingG.current = 0;
        const hit = GO_KEYS.find((g) => g.key === e.key && (!g.staffOnly || staff));
        if (hit) { e.preventDefault(); router.push(staff && hit.key === "t" ? "/teach/tasks" : hit.href); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onSearch, onHelp, staff, router]);
}

export function ShortcutHelp({ staff }: { staff: boolean }) {
  const t = useT();
  const rows: [string, string][] = [
    ["Ctrl + K  ·  /", t("Ara (ders, terim, görev, duyuru, lab)")],
    ["?", t("Bu paneli aç")],
    ...GO_KEYS.filter((g) => !g.staffOnly || staff).map((g): [string, string] => [`g  ${g.key}`, t(g.label)]),
    ["f", t("Ders sayfasında odak modu")],
    ["[  ·  ]", t("Ders sayfasında önceki / sonraki bölüm")],
    ["Esc", t("Panelleri ve menüleri kapat")],
  ];
  return (
    <dl className="kv">
      {rows.map(([k, v]) => <div key={k} style={{ display: "contents" }}><dt><span className="kbd">{k}</span></dt><dd>{v}</dd></div>)}
    </dl>
  );
}
