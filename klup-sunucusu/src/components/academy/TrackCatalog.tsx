"use client";
// Akademi kataloğu: konu, seviye, süre ve içerik türü filtreleri. Seçimler URL'de tutulur (paylaşılabilir),
// seçili filtreler üstte kaldırılabilir etiketlerle görünür.
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Skull } from "lucide-react";
import { ProgressBar } from "./Progress";
import { FilterChips } from "@/components/ui/FilterChips";
import { EmptyState } from "@/components/ui/states";
import { useT } from "@/i18n/client";

export type CatalogTrack = {
  key: string; code: string; kind: "PROGRAM" | "CORE" | "SPECIALIZATION"; title: string; summary: string;
  villain: { ad: string; bolum?: string | null } | null; portrait: string | null; cover: string | null;
  lessons: number; completed: number; minutes: number; skills: string[]; kinds: string[]; labs: number;
};
type Opt = { value: string; label: string };
const LEVELS: Opt[] = [{ value: "CORE", label: "Temel" }, { value: "SPECIALIZATION", label: "Uzmanlık" }];
const DURATIONS: Opt[] = [{ value: "short", label: "1 saatten kısa" }, { value: "mid", label: "1–3 saat" }, { value: "long", label: "3 saatten uzun" }];
const KINDS: Opt[] = [{ value: "LESSON", label: "Ders" }, { value: "PRACTICE", label: "Uygulama" }, { value: "QUIZ", label: "Quiz" }, { value: "LAB", label: "Lab / atölye" }];
const fits = (t: CatalogTrack, k: string, v: string) =>
  k === "topic" ? t.skills.includes(v)
  : k === "level" ? t.kind === v
  : k === "time" ? (v === "short" ? t.minutes < 60 : v === "mid" ? t.minutes >= 60 && t.minutes <= 180 : t.minutes > 180)
  : k === "type" ? (v === "LAB" ? t.labs > 0 : t.kinds.includes(v))
  : true;

function Card({ t }: { t: CatalogTrack }) {
  const tl = useT();
  const soon = t.kind === "SPECIALIZATION" && t.lessons <= 1;
  const done = t.lessons > 0 && t.completed >= t.lessons;
  return (
    <Link href={`/academy/${t.key}`} className={`track-card card${done ? " is-done" : ""}${t.cover ? " has-cover" : ""}`}>
      {t.cover ? (
        // eslint-disable-next-line @next/next/no-img-element -- kendi API'mizden, optimizasyon kapalı
        <div className="cover track-cover" aria-hidden><img src={t.cover} alt="" loading="lazy" /></div>
      ) : (
        <div className="track-portrait" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element -- kendi API'mizden, optimizasyon kapalı */}
          {t.portrait ? <img src={t.portrait} alt="" loading="lazy" /> : <Skull size={28} />}
        </div>
      )}
      <div className="track-info">
        <div className="row" style={{ gap: 8 }}>
          <span className="track-code">{t.code}</span>
          {done && <span className="stamp stamp-ok">{tl("Dosya kapandı")}</span>}
          {soon && <span className="badge">{tl("Yakında")}</span>}
        </div>
        <h3 className="track-title">{t.title}</h3>
        {t.villain && <div className="tiny faint">🕴️ {t.villain.ad}{t.villain.bolum ? ` · “${t.villain.bolum}”` : ""}</div>}
        <ProgressBar value={t.completed} max={t.lessons} label={tl("{title} ilerlemesi", { title: t.title })} />
        <div className="tiny faint">{tl("{completed}/{lessons} ders", { completed: t.completed, lessons: t.lessons })}{t.labs ? tl(" · {labs} lab", { labs: t.labs }) : ""}{" "}{tl("· ~{minutes} dk", { minutes: t.minutes })}</div>
      </div>
    </Link>
  );
}

export function TrackCatalog({ tracks, topics }: { tracks: CatalogTrack[]; topics: Opt[] }) {
  const tl = useT();
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const groups: [string, string, Opt[]][] = [["topic", tl("Konu"), topics], ["level", tl("Seviye"), LEVELS.map((o) => ({ ...o, label: tl(o.label) }))], ["time", tl("Süre"), DURATIONS.map((o) => ({ ...o, label: tl(o.label) }))], ["type", tl("İçerik türü"), KINDS.map((o) => ({ ...o, label: tl(o.label) }))]];
  const active = groups.flatMap(([k]) => (params.get(k) ? [[k, params.get(k)!] as const] : []));
  const shown = useMemo(() => tracks.filter((t) => active.every(([k, v]) => fits(t, k, v))), [tracks, active]);
  function set(k: string, v: string) {
    const p = new URLSearchParams(params.toString());
    if (v) p.set(k, v); else p.delete(k);
    router.replace(`${path}${p.size ? `?${p}` : ""}`, { scroll: false });
  }
  const chips = active.map(([k, v]) => ({ key: k, label: groups.find((g) => g[0] === k)![2].find((o) => o.value === v)?.label ?? v }));
  const core = shown.filter((t) => t.kind === "CORE"), spec = shown.filter((t) => t.kind === "SPECIALIZATION");
  return (
    <div className="stack">
      <div className="catalog-filters" role="group" aria-label={tl("Katalog filtreleri")}>
        {groups.map(([k, label, opts]) => (
          <label key={k} className="field">
            <span className="tiny faint">{label}</span>
            <select className="select" value={params.get(k) ?? ""} onChange={(e) => set(k, e.target.value)}>
              <option value="">{tl("Tümü")}</option>
              {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        ))}
      </div>
      <div className="row-between">
        <FilterChips chips={chips} onRemove={(k) => set(k, "")} onClear={() => router.replace(path, { scroll: false })} />
        <span className="tiny faint" role="status">{tl("{length} yol", { length: shown.length })}</span>
      </div>
      {!shown.length && <EmptyState duck="search" title={tl("Bu filtrelerle eşleşen yol yok")} text={tl("Bir filtreyi kaldırarak yeniden dene.")} action={{ label: tl("Filtreleri temizle"), onClick: () => router.replace(path, { scroll: false }) }} />}
      {core.length > 0 && (
        <section aria-labelledby="s1-h" className="stack-sm">
          <h2 id="s1-h" className="section-title">{tl("Sezon 1 · Temel modüller")}</h2>
          <div className="track-grid">{core.map((t) => <Card key={t.key} t={t} />)}</div>
        </section>
      )}
      {spec.length > 0 && (
        <section aria-labelledby="s2-h" className="stack-sm">
          <h2 id="s2-h" className="section-title">{tl("Sezon 2 · Uzmanlık yolları")}</h2>
          <div className="track-grid">{spec.map((t) => <Card key={t.key} t={t} />)}</div>
        </section>
      )}
    </div>
  );
}
