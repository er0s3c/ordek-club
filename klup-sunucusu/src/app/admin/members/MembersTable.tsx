"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Check, Search, UserX, Users } from "lucide-react";
import type { MemberStatus, Role } from "@prisma/client";
import { useMessages, useToast } from "@/components/providers";
import { RoleBadge, StatusBadge } from "@/components/ui/badges";
import { formatDateTime } from "@/components/ui/format";
import { api } from "@/lib/api-client";
import { useT } from "@/i18n/client";

type Member = {
  id: string; username: string; displayName: string; email: string; role: Role; status: MemberStatus;
  studentNumber: string | null; department: string | null; createdAt: string; joinedAt: string | null; lastLoginAt: string | null;
};
type ListResponse = { total: number; page: number; pageSize: number; items: Member[] };

const STATUSES: MemberStatus[] = ["PENDING", "ACTIVE", "DISABLED", "REJECTED"];
const ROLES: Role[] = ["OWNER", "ADMIN", "INSTRUCTOR", "STUDENT"];

export function MembersTable({ timezone }: { timezone: string }) {
  const t = useT();
  const m = useMessages();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const status = sp.get("status") ?? "";
  const role = sp.get("role") ?? "";
  const page = Math.max(1, Number(sp.get("page") ?? 1) || 1);

  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState(q);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setError(null);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      if (role) params.set("role", role);
      params.set("page", String(page));
      try {
        setData(await api<ListResponse>(`/api/admin/members?${params}`, { signal }));
      } catch (e) {
        if ((e as Error).name !== "AbortError") setError((e as Error).message);
      }
    },
    [q, status, role, page],
  );

  useEffect(() => {
    const ac = new AbortController();
    void load(ac.signal);
    return () => ac.abort();
  }, [load]);

  function setParam(updates: Record<string, string>) {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    if (!("page" in updates)) params.delete("page");
    router.replace(`${pathname}?${params}`);
  }

  async function quick(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      await api(`/api/admin/members/${encodeURIComponent(id)}`, { method: "PATCH", body: { action } });
      toast("ok", action === "approve" ? t("Üyelik onaylandı.") : t("Başvuru reddedildi."));
      await load();
      router.refresh(); // menüdeki bekleyen sayacı
    } catch (e) {
      toast("error", (e as Error).message);
    }
    setBusyId(null);
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <section className="card">
      <div className="card-h" style={{ flexWrap: "wrap" }}>
        <form
          className="row"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setParam({ q: search.trim() });
          }}
        >
          <label htmlFor="member-q" className="sr-only">{t("Üye ara")}</label>
          <input id="member-q" className="input" style={{ width: 240 }} placeholder={t("Ad, kullanıcı adı, e-posta, no…")} value={search} onChange={(e) => setSearch(e.target.value)} maxLength={100} />
          <button className="btn btn-sm"><Search size={15} aria-hidden /> {m.common.search}</button>
        </form>
        <div className="row">
          <label htmlFor="f-status" className="sr-only">{t("Durum")}</label>
          <select id="f-status" className="select" style={{ width: 170, height: 34, padding: "4px 34px 4px 10px" }} value={status} onChange={(e) => setParam({ status: e.target.value })}>
            <option value="">{t("Durum: {all}", { all: m.common.all })}</option>
            {STATUSES.map((s) => <option key={s} value={s}>{m.statuses[s]}</option>)}
          </select>
          <label htmlFor="f-role" className="sr-only">{t("Rol")}</label>
          <select id="f-role" className="select" style={{ width: 150, height: 34, padding: "4px 34px 4px 10px" }} value={role} onChange={(e) => setParam({ role: e.target.value })}>
            <option value="">{t("Rol: {all}", { all: m.common.all })}</option>
            {ROLES.map((r) => <option key={r} value={r}>{m.roles[r]}</option>)}
          </select>
        </div>
      </div>
      <div className="card-b flush">
        {error ? (
          <div className="empty">
            <div className="alert alert-error" style={{ display: "inline-flex" }}>{error}</div>
            <div style={{ marginTop: 12 }}><button className="btn btn-sm" onClick={() => load()}>{m.common.retry}</button></div>
          </div>
        ) : !data ? (
          <div className="stack" style={{ padding: 18 }} aria-busy="true" aria-label={m.common.loading}>
            {Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton" style={{ height: 34 }} />)}
          </div>
        ) : data.items.length === 0 ? (
          <div className="empty"><Users size={28} aria-hidden /><div>{t("Bu filtrelere uyan üye yok.")}</div></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>{t("Üye")}</th><th>{t("Rol")}</th><th>{t("Durum")}</th><th>{t("Bölüm / No")}</th><th>{t("Kayıt")}</th><th>{t("Son giriş")}</th><th><span className="sr-only">{t("İşlemler")}</span></th></tr>
              </thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <Link href={`/admin/members/${u.id}`} style={{ fontWeight: 550 }}>{u.displayName}</Link>
                      <div className="tiny faint mono">@{u.username} · {u.email}</div>
                    </td>
                    <td><RoleBadge role={u.role} /></td>
                    <td><StatusBadge status={u.status} /></td>
                    <td className="small muted">{[u.department, u.studentNumber].filter(Boolean).join(" · ") || "—"}</td>
                    <td className="tiny faint">{formatDateTime(u.createdAt, timezone, t.intl)}</td>
                    <td className="tiny faint">{u.lastLoginAt ? formatDateTime(u.lastLoginAt, timezone, t.intl) : m.common.never}</td>
                    <td style={{ textAlign: "right" }}>
                      {u.status === "PENDING" && (
                        <div className="row" style={{ justifyContent: "flex-end", gap: 6, flexWrap: "nowrap" }}>
                          <button className="btn btn-sm btn-primary" disabled={busyId === u.id} onClick={() => quick(u.id, "approve")} aria-label={t("{displayName} başvurusunu onayla", { displayName: u.displayName })}>
                            <Check size={14} aria-hidden />{" "}{t("Onayla")}
                          </button>
                          <button className="btn btn-sm btn-danger" disabled={busyId === u.id} onClick={() => quick(u.id, "reject")} aria-label={t("{displayName} başvurusunu reddet", { displayName: u.displayName })}>
                            <UserX size={14} aria-hidden />{" "}{t("Reddet")}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {data && data.total > 0 && (
        <div className="pager">
          <span>{t("{total} üye · {page} {page1}/{pages}", { total: data.total, page: m.common.page, page1: page, pages })}</span>
          <div className="row">
            <button className="btn btn-sm" disabled={page <= 1} onClick={() => setParam({ page: String(page - 1) })}>{m.common.previous}</button>
            <button className="btn btn-sm" disabled={page >= pages} onClick={() => setParam({ page: String(page + 1) })}>{m.common.next}</button>
          </div>
        </div>
      )}
    </section>
  );
}
