"use client";
import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ChevronRight, LayoutGrid, Share2 } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { EmptyState } from "@/components/ui/states";
import { useT } from "@/i18n/client";

export type SkillCard = { key: string; tr: string; en: string; done: number; total: number; evidence: { kind: string; title: string; href: string; at: string | null }[]; todo: { title: string; href: string }[]; diagnostic: string | null };

const SkillGraph = dynamic(() => import("./SkillGraph").then((m) => m.SkillGraph), { ssr: false, loading: () => <div className="skeleton skill-graph-canvas" /> });

export function SkillMap({ cards }: { cards: SkillCard[] }) {
  const tl = useT();
  const [open, setOpen] = useState<SkillCard | null>(null);
  const [view, setView] = useState<"cards" | "graph">("cards");
  return (
    <>
      <div className="seg" role="group" aria-label={tl("Görünüm")} style={{ alignSelf: "flex-start" }}>
        <button type="button" aria-pressed={view === "cards"} onClick={() => setView("cards")}><LayoutGrid size={14} aria-hidden />{" "}{tl("Kartlar")}</button>
        <button type="button" aria-pressed={view === "graph"} onClick={() => setView("graph")}><Share2 size={14} aria-hidden />{" "}{tl("Beceri ağı")}</button>
      </div>
      {view === "graph" ? <SkillGraph cards={cards} onSkill={setOpen} /> : <div className="grid-2">
        {cards.map((s) => (
          <button key={s.key} type="button" className="card card-b stack skill-card" onClick={() => setOpen(s)} aria-haspopup="dialog">
            <div className="eyebrow">{s.en}</div>
            <h2>{s.tr}</h2>
            {s.total ? (
              <>
                <div className="bar" role="img" aria-label={`${s.tr}: ${s.done}/${s.total}`}><span style={{ width: `${Math.round((s.done / s.total) * 100)}%` }} /></div>
                <span className="small">{tl("{done}/{total} ders · {length} kanıt", { done: s.done, total: s.total, length: s.evidence.length })}</span>
              </>
            ) : <span className="small muted">{tl("Bu beceri için etiketlenmiş içerik henüz yayımlanmadı.")}</span>}
            {s.diagnostic && <span className="tiny faint">{tl("Tanılama: {diagnostic}", { diagnostic: s.diagnostic })}</span>}
            <span className="small skill-more">{tl("Dayanağı gör")}{" "}<ChevronRight size={14} aria-hidden /></span>
          </button>
        ))}
      </div>}
      <Drawer open={!!open} onClose={() => setOpen(null)} title={open ? tl("{tr} · kanıtlar", { tr: open.tr }) : ""}>
        {open && (
          <div className="stack">
            {open.evidence.length ? (
              <ul className="timeline">
                {open.evidence.map((e, i) => <li key={i}><time>{e.at ? new Date(e.at).toLocaleDateString(tl.intl) : "—"}</time><span><span className="tiny faint">{tl(e.kind)}</span><br /><Link href={e.href}>{e.title}</Link></span></li>)}
              </ul>
            ) : <EmptyState duck="search" title={tl("Henüz kanıt yok")} text={tl("Bu beceriyle etiketli bir ders, lab ya da görev tamamladığında burada görünür.")} />}
            {open.todo.length > 0 && <><div className="eyebrow">{tl("Sıradaki adımlar")}</div><ul className="list-tight">{open.todo.map((t) => <li key={t.href}><Link href={t.href}>{t.title}</Link></li>)}</ul></>}
          </div>
        )}
      </Drawer>
    </>
  );
}
