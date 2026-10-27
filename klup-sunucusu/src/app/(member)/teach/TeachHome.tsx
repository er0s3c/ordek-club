"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FileUp, LayoutTemplate, Play, Presentation, Radio } from "lucide-react";
import { useToast } from "@/components/providers";
import { formatDateTime } from "@/components/ui/format";
import { api } from "@/lib/api-client";
import { ImportDeck } from "@/components/presentation/ImportDeck";
import { useT } from "@/i18n/client";

type Item = { id: string; title: string; description: string; status: string; canEdit: boolean; owner: string; mine: boolean; slides: number; version: number; updatedAt: string };
type Sess = { id: string; code: string; title: string; status: string; startedAt: string; participants: number };
type Tpl = { key: string; title: string; description: string; slideCount: number };

const STATUS: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "Taslak", cls: "badge badge-amber" },
  PUBLISHED: { label: "Yayında", cls: "badge badge-lime" },
};

export function TeachHome({ items, sessions, templates, timezone, converterEnabled }: { items: Item[]; sessions: Sess[]; templates: Tpl[]; timezone: string; converterEnabled: boolean }) {
  const tl = useT();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);

  async function fromTemplate(key: string) {
    setBusy(key);
    try {
      const r = await api<{ id: string }>("/api/presentations", { body: { template: key } });
      toast("ok", tl("Şablondan sunum oluşturuldu."));
      router.push(`/teach/presentations/${r.id}`);
    } catch (e) {
      toast("error", (e as Error).message);
      setBusy(null);
    }
  }

  async function importFile(f: File) {
    if (f.size > 500 * 1024) return toast("error", tl("Dosya en fazla 500 KB olabilir."));
    let deck: unknown;
    try {
      deck = JSON.parse(await f.text());
    } catch {
      return toast("error", tl("Dosya geçerli bir JSON değil."));
    }
    setBusy("import");
    try {
      const r = await api<{ id: string }>("/api/presentations", { body: { deck } });
      toast("ok", tl("Sunum içe aktarıldı."));
      router.push(`/teach/presentations/${r.id}`);
    } catch (e) {
      toast("error", (e as Error).message);
      setBusy(null);
    }
    if (file.current) file.current.value = "";
  }

  async function startLive(id: string) {
    setBusy(`live:${id}`);
    try {
      const r = await api<{ id: string; code: string }>("/api/live", { body: { presentationId: id } });
      router.push(`/teach/live/${r.id}`);
    } catch (e) {
      toast("error", (e as Error).message);
      setBusy(null);
    }
  }

  const active = sessions.filter((s) => s.status === "ACTIVE");

  return (
    <div className="stack">
      {active.length > 0 && (
        <div className="alert alert-ok">
          <Radio size={18} aria-hidden />
          <div className="row" style={{ flex: 1 }}>
            <span>{tl("Devam eden canlı dersin var:")}</span>
            {active.map((s) => <Link key={s.id} className="btn btn-sm btn-primary" href={`/teach/live/${s.id}`}>{s.title} · {s.code}</Link>)}
          </div>
        </div>
      )}

      <section className="card" aria-labelledby="tpl-h">
        <div className="card-h">
          <h2 id="tpl-h">{tl("Yeni sunum")}</h2>
          <div className="row">
            <input ref={file} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
            <ImportDeck converterEnabled={converterEnabled} />
            <button className="btn btn-sm" onClick={() => file.current?.click()} disabled={busy !== null}><FileUp size={15} aria-hidden />{" "}{tl("JSON içe aktar")}</button>
          </div>
        </div>
        <div className="card-b grid-2">
          {templates.map((t) => (
            <div key={t.key} className="card" style={{ background: "var(--bg-inset)" }}>
              <div className="card-b stack-sm">
                <div className="row"><LayoutTemplate size={18} color="var(--gold)" aria-hidden /><strong>{t.title}</strong><span className="badge">{tl("{slideCount} slayt", { slideCount: t.slideCount })}</span></div>
                <p className="small muted" style={{ margin: 0 }}>{t.description}</p>
                <div><button className="btn btn-sm" onClick={() => fromTemplate(t.key)} disabled={busy !== null}>{busy === t.key && <span className="spinner" aria-hidden />}{" "}{tl("Bu şablondan oluştur")}</button></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="mine-h">
        <div className="card-h"><h2 id="mine-h">{tl("Sunumlar")}</h2><span className="tiny faint">{tl("Kendi sunumların + yayınlanmış olanlar")}</span></div>
        <div className="card-b flush">
          {items.length === 0 ? (
            <div className="empty"><Presentation size={28} aria-hidden /><div>{tl("Henüz sunum yok. Bir şablonla başla.")}</div></div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>{tl("Sunum")}</th><th>{tl("Durum")}</th><th>{tl("Sahibi")}</th><th className="num">{tl("Slayt")}</th><th>{tl("Güncelleme")}</th><th><span className="sr-only">{tl("İşlemler")}</span></th></tr></thead>
                <tbody>
                  {items.map((p) => (
                    <tr key={p.id}>
                      <td><Link href={`/teach/presentations/${p.id}`} style={{ fontWeight: 550 }}>{p.title}</Link><div className="tiny faint">{tl("v{version}", { version: p.version })}{p.description ? ` · ${p.description.slice(0, 80)}` : ""}</div></td>
                      <td><span className={STATUS[p.status]?.cls ?? "badge"}>{tl(STATUS[p.status]?.label ?? p.status)}</span></td>
                      <td className="small">{p.mine ? tl("Sen") : p.owner}</td>
                      <td className="num">{p.slides}</td>
                      <td className="tiny faint">{formatDateTime(p.updatedAt, timezone, tl.intl)}</td>
                      <td style={{ textAlign: "right" }}>
                        <button className="btn btn-sm btn-primary" onClick={() => startLive(p.id)} disabled={busy !== null} aria-label={tl("{title} için canlı ders başlat", { title: p.title })}>
                          {busy === `live:${p.id}` ? <span className="spinner" aria-hidden /> : <Play size={14} aria-hidden />}{" "}{tl("Canlı başlat")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="card" aria-labelledby="sess-h">
        <div className="card-h"><h2 id="sess-h">{tl("Son canlı dersler")}</h2></div>
        <div className="card-b flush">
          {sessions.length === 0 ? <div className="empty">{tl("Henüz canlı ders yapılmadı.")}</div> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>{tl("Ders")}</th><th>{tl("Kod")}</th><th>{tl("Başlangıç")}</th><th className="num">{tl("Katılımcı")}</th><th>{tl("Durum")}</th></tr></thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td><Link href={s.status === "ACTIVE" ? `/teach/live/${s.id}` : `/teach/sessions/${s.id}`}>{s.title}</Link></td>
                      <td className="mono small">{s.code}</td>
                      <td className="tiny faint">{formatDateTime(s.startedAt, timezone, tl.intl)}</td>
                      <td className="num">{s.participants}</td>
                      <td>{s.status === "ACTIVE" ? <span className="badge badge-lime">{tl("● Canlı")}</span> : <span className="badge">{tl("Bitti")}</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
