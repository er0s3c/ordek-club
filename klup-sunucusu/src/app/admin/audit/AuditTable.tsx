"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { useMessages } from "@/components/providers";
import { formatDateTime } from "@/components/ui/format";
import { AUDIT_ACTION_PREFIXES, actionLabel } from "@/components/admin/audit-labels";
import { api } from "@/lib/api-client";
import { useT } from "@/i18n/client";

type Row = {
  id: string; action: string; targetType: string | null; targetId: string | null; meta: unknown; ip: string | null; createdAt: string;
  actor: { id: string; username: string } | null;
};
type Res = { total: number; page: number; pageSize: number; items: Row[] };

const PREFIX_LABEL: Record<string, string> = { auth: "Kimlik", member: "Üyelik", invitation: "Davet", settings: "Ayarlar", setup: "Kurulum", academy: "Akademi", xp: "XP", badge: "Rozet", leaderboard: "Liderlik" };

export function AuditTable({ timezone }: { timezone: string }) {
  const t = useT();
  const m = useMessages();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const action = sp.get("action") ?? "";
  const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);
  const [data, setData] = useState<Res | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    const params = new URLSearchParams({ page: String(page) });
    if (action) params.set("action", action);
    setData(null);
    api<Res>(`/api/admin/audit?${params}`, { signal: ac.signal })
      .then((d) => { setData(d); setError(null); })
      .catch((e) => { if (e.name !== "AbortError") setError(e.message); });
    return () => ac.abort();
  }, [action, page]);

  const go = (next: Record<string, string>) => {
    const p = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    router.replace(`${pathname}?${p}`);
  };
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <section className="card">
      <div className="card-h">
        <div className="row" role="group" aria-label={t("Kategori filtresi")}>
          <button className={`btn btn-sm ${action ? "btn-ghost" : ""}`} aria-pressed={!action} onClick={() => go({ action: "", page: "" })}>{m.common.all}</button>
          {AUDIT_ACTION_PREFIXES.map((p) => (
            <button key={p} className={`btn btn-sm ${action === p ? "" : "btn-ghost"}`} aria-pressed={action === p} onClick={() => go({ action: p, page: "" })}>{t(PREFIX_LABEL[p] ?? p)}</button>
          ))}
        </div>
      </div>
      <div className="card-b flush">
        {error ? (
          <div className="empty"><div className="alert alert-error" style={{ display: "inline-flex" }}>{error}</div></div>
        ) : !data ? (
          <div className="stack" style={{ padding: 18 }} aria-busy="true">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 28 }} />)}</div>
        ) : data.items.length === 0 ? (
          <div className="empty"><ScrollText size={28} aria-hidden /><div>{t("Kayıt yok.")}</div></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>{t("Zaman")}</th><th>{t("Eylem")}</th><th>{t("Kim")}</th><th>{t("Hedef")}</th><th>{t("Ayrıntı")}</th><th>IP</th></tr></thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id}>
                    <td className="tiny faint mono" style={{ whiteSpace: "nowrap" }}>{formatDateTime(r.createdAt, timezone, t.intl)}</td>
                    <td>{actionLabel(r.action)}<div className="tiny faint mono">{r.action}</div></td>
                    <td className="small">{r.actor ? `@${r.actor.username}` : "—"}</td>
                    <td className="tiny faint mono">{r.targetType ? `${r.targetType}:${r.targetId ?? ""}` : "—"}</td>
                    <td className="tiny mono" style={{ maxWidth: 340, wordBreak: "break-word" }}>{r.meta ? JSON.stringify(r.meta) : ""}</td>
                    <td className="tiny faint mono">{r.ip ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {data && data.total > 0 && (
        <div className="pager">
          <span>{t("{total} kayıt · {page} {page1}/{pages}", { total: data.total, page: m.common.page, page1: page, pages })}</span>
          <div className="row">
            <button className="btn btn-sm" disabled={page <= 1} onClick={() => go({ page: String(page - 1) })}>{m.common.previous}</button>
            <button className="btn btn-sm" disabled={page >= pages} onClick={() => go({ page: String(page + 1) })}>{m.common.next}</button>
          </div>
        </div>
      )}
    </section>
  );
}
